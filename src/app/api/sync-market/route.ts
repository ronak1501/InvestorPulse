import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Get all unique tracked fund names from our database
        const { data: investments, error: investError } = await supabase
            .from('monthly_investments')
            .select('fund_name');

        if (investError) throw new Error('Failed to fetch investments: ' + investError.message);

        const uniqueFundNames = Array.from(new Set(investments.map(i => i.fund_name).filter(Boolean)));

        const syncResults = [];

        for (const rawName of uniqueFundNames) {
            // Check if we already have the scheme registered
            const { data: existingScheme } = await supabase
                .from('fund_schemes')
                .select('*')
                .ilike('scheme_name', `%${rawName}%`)
                .limit(1);

            let schemeCode = null;
            let schemeName = rawName;

            if (existingScheme && existingScheme.length > 0) {
                schemeCode = existingScheme[0].scheme_code;
                schemeName = existingScheme[0].scheme_name;
            } else {
                // Not in DB, search MFAPI
                const searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(rawName)}`);
                const searchData = await searchRes.json();

                if (searchData && searchData.length > 0) {
                    schemeCode = String(searchData[0].schemeCode);
                    schemeName = searchData[0].schemeName;

                    // Register into our DB
                    await supabase.from('fund_schemes').upsert({
                        scheme_code: schemeCode,
                        scheme_name: schemeName,
                        fund_category: 'Equity', // Simplified for demo
                    });
                }
            }

            if (schemeCode) {
                // Fetch Historical NAV
                const navRes = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
                if (navRes.ok) {
                    const navData = await navRes.json();
                    const history = navData.data; // array of { date: "dd-MM-yyyy", nav: "12.34" }

                    if (history && history.length > 0) {
                        const currentNav = parseFloat(history[0].nav);

                        // Upsert latest NAV to fund_nav_history
                        await supabase.from('fund_nav_history').upsert({
                            fund_name: schemeName,
                            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                            scheme_code: schemeCode,
                            date: history[0].date,
                            nav: currentNav
                        }, { onConflict: 'fund_name, month' });

                        // Basic simulated performance logic since MFAPI returns full history 
                        // (we'll grab 30, 90, 365 offset approximations)
                        const nav1m = history.length > 21 ? parseFloat(history[21].nav) : currentNav;
                        const nav3m = history.length > 63 ? parseFloat(history[63].nav) : currentNav;
                        const nav1y = history.length > 250 ? parseFloat(history[250].nav) : currentNav;

                        const ret1m = ((currentNav - nav1m) / nav1m) * 100;
                        const ret3m = ((currentNav - nav3m) / nav3m) * 100;
                        const ret1y = ((currentNav - nav1y) / nav1y) * 100;

                        await supabase.from('fund_performance').upsert({
                            scheme_code: schemeCode,
                            latest_nav: currentNav,
                            return_1m: ret1m.toFixed(2),
                            return_3m: ret3m.toFixed(2),
                            return_1y: ret1y.toFixed(2)
                        });

                        syncResults.push({ fund: schemeName, success: true, currentNav });
                    }
                }
            } else {
                syncResults.push({ fund: rawName, success: false, reason: 'Not found on MFAPI' });
            }
        }

        return NextResponse.json({ success: true, synced: syncResults.length, details: syncResults });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
