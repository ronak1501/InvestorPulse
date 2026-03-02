'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function processMonthlyData(jsonData: any[], fileName: string) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized: No active VRM session found.');

        const userId = user.id;

        const investorsMap = new Map();
        const fundsMap = new Map();

        const monthValue = jsonData[0]?.month || 'Unknown Month';

        jsonData.forEach(row => {
            if (row.investor_id && row.name) {
                investorsMap.set(String(row.investor_id), {
                    user_id: userId,
                    investor_id: String(row.investor_id),
                    name: String(row.name),
                    phone: String(row.phone || ''),
                    city: String(row.city || ''),
                });
            }
            if (row.fund_name && row.nav) {
                fundsMap.set(`${row.fund_name}_${monthValue}`, {
                    fund_name: String(row.fund_name),
                    month: String(row.month || monthValue),
                    nav: Number(row.nav),
                });
            }
        });

        const newInvestors = Array.from(investorsMap.values());
        const newFunds = Array.from(fundsMap.values());

        if (newInvestors.length > 0) {
            const { error: invError } = await supabase.from('investors').upsert(newInvestors, { onConflict: 'user_id, investor_id' });
            if (invError) throw new Error('Failed to upsert investors: ' + invError.message);
        }

        const monthsSet = new Set<string>();
        jsonData.forEach(row => { if (row.month) monthsSet.add(String(row.month)); });
        const monthsToDelete = Array.from(monthsSet);

        if (monthsToDelete.length > 0) {
            await supabase.from('monthly_investments').delete().in('month', monthsToDelete);
            await supabase.from('investor_alerts').delete().in('month', monthsToDelete);
            await supabase.from('fund_nav_history').delete().in('month', monthsToDelete);
        }

        if (newFunds.length > 0) {
            const { error: fundError } = await supabase.from('fund_nav_history').insert(newFunds);
            if (fundError && fundError.code !== '23505') {
                console.warn('Fund Error:', fundError);
            }
        }

        const { data: allFundHistory } = await supabase
            .from('fund_nav_history')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: fundPerformances } = await supabase
            .from('fund_performance')
            .select('*, fund_schemes(scheme_name)');

        const alertsToInsert: any[] = [];
        const monthlyInvestmentsToInsert: any[] = [];

        for (const row of jsonData) {
            if (!row.investor_id) continue;

            const currentSip = Number(row.sip_amount || 0);
            const currentUnits = Number(row.units || 0);
            const currentNav = Number(row.nav || 0);
            const fundName = String(row.fund_name || '');
            const currentMonth = String(row.month || 'Current Month');
            const totalInvestmentRaw = Number(row.total_investment || 0);

            const processedCurrentValue = Number((currentUnits * currentNav).toFixed(2));

            const { data: previousRecords } = await supabase
                .from('monthly_investments')
                .select('*')
                .eq('investor_id', String(row.investor_id))
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            let alertType = null;
            let call_insight = '';
            let prevSip = null;
            let prevUnits = null;
            let prevNav = null;

            if (previousRecords && previousRecords.length > 0) {
                const prev = previousRecords[0];
                prevSip = Number(prev.sip_amount || 0);
                prevUnits = Number(prev.units || 0);
                prevNav = Number(prev.nav || 0);

                if (prevSip > 0 && currentSip === 0) {
                    alertType = 'SIP_STOPPED';
                    call_insight = 'Investor stopped their SIP. Reach out to understand their financial situation or concerns.';
                } else if (currentUnits < prevUnits) {
                    alertType = 'REDEMPTION';
                    call_insight = 'Investor redeemed units. Call to inquire about their liquidity needs.';

                    // Check real Market Intelligence (Fund Performance)
                    let isMarketDown = false;

                    if (fundPerformances && fundPerformances.length > 0) {
                        const matchedPerf = fundPerformances.find(f => f.fund_schemes?.scheme_name === fundName || fundName.includes(f.fund_schemes?.scheme_name));
                        if (matchedPerf && matchedPerf.return_3m < 0) {
                            isMarketDown = true;
                        }
                    } else if (allFundHistory && fundName) {
                        // Fallback logic
                        const historyForFund = allFundHistory
                            .filter(f => f.fund_name === fundName && f.month !== currentMonth)
                            .slice(0, 3);

                        if (historyForFund.length > 0) {
                            const oldestNavInRange = Number(historyForFund[historyForFund.length - 1].nav);
                            if (currentNav < oldestNavInRange) {
                                isMarketDown = true;
                            }
                        }
                    }

                    if (isMarketDown) {
                        alertType = 'PANIC_REDEMPTION';
                        call_insight = 'The fund has experienced short-term NAV decline due to market conditions. Historically such corrections are temporary, and investors who remain invested often benefit when markets recover. Reassure the client.';
                    }

                } else if (currentUnits > prevUnits) {
                    alertType = 'EXISTING_INVESTMENT';
                }
            } else {
                if (currentUnits > 0) {
                    alertType = 'NEW_INVESTMENT';
                }
            }

            monthlyInvestmentsToInsert.push({
                user_id: userId,
                investor_id: String(row.investor_id),
                fund_name: fundName,
                sip_amount: currentSip,
                sip_date: Number(row.sip_date || 1),
                units: currentUnits,
                nav: currentNav,
                total_investment: totalInvestmentRaw,
                current_value: processedCurrentValue,
                month: currentMonth,
                file_name: fileName,
            });

            if (alertType) {
                let pVal = 0;
                let cVal = 0;

                if (alertType === 'SIP_STOPPED' || alertType === 'NEW_INVESTMENT' || alertType === 'EXISTING_INVESTMENT') {
                    pVal = prevSip !== null ? prevSip : 0;
                    cVal = currentSip;
                } else if (alertType === 'REDEMPTION' || alertType === 'PANIC_REDEMPTION') {
                    pVal = prevUnits !== null ? prevUnits : 0;
                    cVal = currentUnits;
                }

                alertsToInsert.push({
                    user_id: userId,
                    investor_id: String(row.investor_id),
                    fund_name: fundName,
                    alert_type: alertType,
                    previous_value: pVal,
                    current_value: cVal,
                    previous_units: prevUnits,
                    current_units: currentUnits,
                    previous_nav: prevNav,
                    current_nav: currentNav,
                    month: currentMonth,
                    call_insight: call_insight,
                });
            }
        }

        if (monthlyInvestmentsToInsert.length > 0) {
            // Chunk inserting to prevent payload too large if realistic
            const chunkSize = 200;
            for (let i = 0; i < monthlyInvestmentsToInsert.length; i += chunkSize) {
                const chunk = monthlyInvestmentsToInsert.slice(i, i + chunkSize);
                const { error: mixError } = await supabase.from('monthly_investments').insert(chunk);
                if (mixError) throw new Error('Failed to insert investments: ' + mixError.message);
            }
        }

        if (alertsToInsert.length > 0) {
            const { error: alertError } = await supabase.from('investor_alerts').insert(alertsToInsert);
            if (alertError) throw new Error('Failed to insert alerts: ' + alertError.message);
        }

        revalidatePath('/dashboard', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Server Action Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getUploadedDataSummary() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, data: [] };

        const { data: investments } = await supabase
            .from('monthly_investments')
            .select('month, file_name, created_at')
            .eq('user_id', user.id);

        if (!investments) return { success: true, data: [] };

        const summaryMap = new Map();
        investments.forEach(inv => {
            if (!summaryMap.has(inv.month)) {
                summaryMap.set(inv.month, {
                    month: inv.month,
                    file_name: inv.file_name,
                    records: 0,
                    created_at: inv.created_at
                });
            }
            summaryMap.get(inv.month).records += 1;
        });

        const summaryArray = Array.from(summaryMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return { success: true, data: summaryArray };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteUploadedMonth(month: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        await supabase.from('monthly_investments').delete().eq('month', month).eq('user_id', user.id);
        await supabase.from('investor_alerts').delete().eq('month', month).eq('user_id', user.id);

        revalidatePath('/dashboard', 'layout');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
