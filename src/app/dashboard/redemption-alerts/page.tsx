import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { AlertTriangle, TrendingDown, ArrowUpRight } from 'lucide-react';

export default async function RedemptionAlertsPage() {
    const supabase = await createClient();

    // Fetch alerts for REDEMPTION
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
        .eq('alert_type', 'REDEMPTION')
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 lg:p-12 2xl:p-16">
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <AlertTriangle className="text-rose-500 w-8 h-8" />
                        Redemption Alerts
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Monitor deep drops in portfolio values indicating large fund redemptions by clients over the past month.
                    </p>
                </div>
            </header>

            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-rose-100 bg-rose-50/30 flex items-center gap-3">
                    <TrendingDown className="text-rose-600 w-6 h-6" />
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Recent Major Redemptions</h3>
                </div>
                <div className="flex-1 overflow-x-auto">
                    {!alerts || alerts.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-medium">No redemptions detected.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-8 py-5 font-bold">Investor details</th>
                                    <th className="px-8 py-5 font-bold text-right">Previous Value</th>
                                    <th className="px-8 py-5 font-bold text-right">Current Value</th>
                                    <th className="px-8 py-5 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {alerts.map((alert: any) => {
                                    const investor = alert.investors || {};
                                    return (
                                        <tr key={alert.id} className="hover:bg-rose-50/20 transition-colors">
                                            <td className="px-8 py-5">
                                                <Link href={`/dashboard/investors/${alert.investor_id}`} className="font-bold text-slate-900 hover:text-indigo-600 block">
                                                    {investor.name || alert.investor_id}
                                                </Link>
                                                <span className="text-xs text-slate-400 font-medium">{alert.fund_name}</span>
                                            </td>
                                            <td className="px-8 py-5 text-sm align-middle">
                                                <div className="flex flex-col gap-1 items-end">
                                                    <span className="font-bold text-slate-900 line-through decoration-slate-300">{Number(alert.previous_units || 0).toFixed(2)} Units</span>
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
                                                <a href={`tel:${investor.phone}`} className="inline-block px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors">
                                                    Call
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
        </div>
    );
}
