import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, ArrowUpRight, Ban, TrendingDown } from 'lucide-react';

export default async function PanicRiskPage() {
    const supabase = await createClient();

    // Fetch alerts for REDEMPTION and SIP_STOPPED
    const { data: alerts } = await supabase
        .from('investor_alerts')
        .select(`
            *,
            investor:investors (
                name,
                phone,
                city
            )
        `)
        .in('alert_type', ['REDEMPTION', 'SIP_STOPPED', 'PANIC_REDEMPTION'])
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 lg:p-12 2xl:p-16">
            <header className="mb-10 relative overflow-hidden rounded-[2rem] bg-[#0A0F2C] border-2 border-indigo-900 shadow-xl p-10 text-white">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-300 text-xs font-bold tracking-widest uppercase mb-4 border border-cyan-400/20 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Core AI Active
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-4">
                            <ShieldAlert className="w-10 h-10 text-cyan-400" />
                            Panic Risk Engine
                        </h1>
                        <p className="mt-3 text-indigo-200/80 max-w-2xl text-lg font-medium leading-relaxed">
                            AI-detected behavioral anomalies indicating potential churn. Review stopped SIPs and major portfolio redemptions to intervene immediately.
                        </p>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                {!alerts || alerts.length === 0 ? (
                    <div className="px-12 py-24 text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                            <ShieldAlert size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Panic Risks Detected</h3>
                        <p className="text-slate-500 font-medium">Your investor base behavior is stable. The AI has not flagged any major redemptions or freshly stopped SIPs.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-8 py-5 font-bold">Investor details</th>
                                    <th className="px-8 py-5 font-bold">Alert Trigger</th>
                                    <th className="px-8 py-5 font-bold text-right">Previous Value</th>
                                    <th className="px-8 py-5 font-bold text-right">Current Value</th>
                                    <th className="px-8 py-5 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {alerts.map((alert: any) => {
                                    const investor = alert.investor || {};
                                    return (
                                        <React.Fragment key={alert.id}>
                                            <tr className="group hover:bg-slate-50/80 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-inner">
                                                            {(investor.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <Link href={`/dashboard/investors/${alert.investor_id}`} className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                                                                {investor.name || alert.investor_id}
                                                            </Link>
                                                            <div className="text-xs text-slate-400 font-medium">{alert.fund_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ring-1 ring-inset ${alert.alert_type === 'REDEMPTION' || alert.alert_type === 'PANIC_REDEMPTION'
                                                        ? 'bg-rose-50 text-rose-700 ring-rose-200'
                                                        : 'bg-orange-50 text-orange-700 ring-orange-200'
                                                        }`}>
                                                        {(alert.alert_type === 'REDEMPTION' || alert.alert_type === 'PANIC_REDEMPTION') ? <TrendingDown size={14} /> : <Ban size={14} />}
                                                        {alert.alert_type.replace('_', ' ')}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-semibold mt-1.5 block">{alert.month} Flag</div>
                                                </td>
                                                <td className="px-8 py-5 text-sm align-middle">
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <span className="font-bold text-slate-900">{Number(alert.previous_units || 0).toFixed(2)} Units</span>
                                                        <span className="text-xs font-medium text-slate-500">NAV: ₹{Number(alert.previous_nav || 0).toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm align-middle">
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <span className="font-bold text-rose-600">{Number(alert.current_units || 0).toFixed(2)} Units</span>
                                                        <span className="text-xs font-medium text-slate-500">NAV: ₹{Number(alert.current_nav || 0).toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right align-middle">
                                                    <a href={`tel:${investor.phone}`} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors">
                                                        Call
                                                    </a>
                                                </td>
                                            </tr>
                                            {alert.call_insight && (
                                                <tr className="bg-slate-50/20 border-b border-slate-100">
                                                    <td colSpan={5} className="px-8 py-3 pb-5">
                                                        <div className="flex items-start gap-3 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                                                            <div className="text-indigo-400 mt-0.5">
                                                                <ArrowUpRight size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-black text-indigo-700 tracking-widest uppercase mb-1">Generated Call Insight</div>
                                                                <div className="text-sm font-medium text-slate-700 italic">"{alert.call_insight}"</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
