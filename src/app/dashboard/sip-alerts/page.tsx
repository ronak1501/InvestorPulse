import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Bell, ArrowUpRight, Ban, Activity, Calendar } from 'lucide-react';

export default async function SIPAlertsPage() {
    const supabase = await createClient();

    // Fetch alerts for SIPs
    const { data: alerts } = await supabase
        .from('investor_alerts')
        .select(`
            *,
            investors (
                name,
                phone,
                city
            )
        `)
        .eq('alert_type', 'SIP_STOPPED')
        .order('created_at', { ascending: false });

    // Try to get unique uploaded months to determine new/existing investors
    const { data: invData } = await supabase.from('monthly_investments').select('month, investor_id');
    const investorMonths = new Map();
    if (invData) {
        invData.forEach(inv => {
            if (!investorMonths.has(inv.investor_id)) {
                investorMonths.set(inv.investor_id, new Set());
            }
            investorMonths.get(inv.investor_id).add(inv.month);
        });
    }

    // Try to get upcoming SIPs dynamically by date
    const today = new Date().getDate();
    let endDay = today + 5;

    // For simplicity, handle typical days, not edge cases around months
    const { data: upcomingSips } = await supabase
        .from('monthly_investments')
        .select(`
            *,
            investors (
                name,
                phone,
                city
            )
        `)
        .gte('sip_date', today)
        .lte('sip_date', endDay)
        .order('sip_date', { ascending: true });

    return (
        <div className="p-8 lg:p-12 2xl:p-16">
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <Bell className="text-amber-500 w-8 h-8" />
                        SIP Alerts & Tracking
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Monitor newly stopped SIPs and view recent cancelled and missing scheduled deductions.
                    </p>
                </div>
            </header>



            <div className="flex flex-col gap-10">
                {/* Behavioral Alerts */}
                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col w-full">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                        <Activity className="text-indigo-600 w-6 h-6" />
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">SIP Behavior Changes</h3>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        {!alerts || alerts.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 font-medium">No recent SIP changes detected.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-6 py-4 font-bold">Investor Detail</th>
                                        <th className="px-6 py-4 font-bold">Action Alert</th>
                                        <th className="px-6 py-4 font-bold text-right">SIP Amount</th>
                                        <th className="px-6 py-4 font-bold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {alerts.map((alert: any) => {
                                        const investor = alert.investors || {};
                                        return (
                                            <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <Link href={`/dashboard/investors/${alert.investor_id}`} className="font-bold text-slate-900 hover:text-indigo-600">
                                                            {investor.name || alert.investor_id}
                                                        </Link>
                                                        {investorMonths.get(alert.investor_id)?.size > 1 ? (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 text-slate-500 uppercase tracking-wider">Existing</span>
                                                        ) : (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-700 uppercase tracking-wider">New</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-medium block mt-1">{alert.fund_name}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{investor.phone}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider bg-rose-100 text-rose-700`}>
                                                        {alert.alert_type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right font-bold text-slate-700 text-sm align-middle">
                                                    <div className="flex flex-col items-end gap-1">
                                                        {alert.previous_value !== alert.current_value && alert.previous_value !== null && (
                                                            <span className="text-xs text-slate-400 font-medium line-through decoration-slate-300">₹{Number(alert.previous_value).toLocaleString()}</span>
                                                        )}
                                                        <span className={alert.alert_type === 'SIP_STOPPED' ? 'text-rose-600' : 'text-emerald-600'}>
                                                            ₹{Number(alert.current_value).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right align-middle">
                                                    <a href={`tel:${investor.phone}`} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors">
                                                        Call Investor
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Upcoming SIPs */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col max-w-2xl">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <Calendar className="text-amber-500 w-5 h-5" />
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Deductions Info</h3>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        {!upcomingSips || upcomingSips.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 font-medium">No upcoming SIPs scheduled in this window.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-slate-100">
                                    {upcomingSips.map((sip: any) => {
                                        const investor = sip.investors || {};
                                        // Deduplicate investors logically if same multiple times (simplified here)
                                        return (
                                            <tr key={sip.id} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="px-6 py-3">
                                                    <Link href={`/dashboard/investors/${sip.investor_id}`} className="text-sm font-bold text-slate-900 hover:text-indigo-600 block">
                                                        {investor.name || sip.investor_id}
                                                    </Link>
                                                    <span className="text-xs text-slate-400 font-medium inline-block mt-0.5">Fund: {sip.fund_name}</span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100">
                                                        Day {sip.sip_date}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right font-bold text-slate-700 text-sm">
                                                    ₹{Number(sip.sip_amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
