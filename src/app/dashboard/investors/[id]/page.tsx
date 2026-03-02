import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Phone, MapPin, Calendar, TrendingUp, AlertCircle, ArrowLeft, ArrowUpRight, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import InvestorChart from '@/components/InvestorChart';

export default async function InvestorDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { id } = await params;

    // Fetch Investor
    const { data: investor } = await supabase.from('investors').select('*').eq('investor_id', id).single();
    if (!investor) notFound();

    // Fetch Investments
    const { data: investments } = await supabase.from('monthly_investments').select('*').eq('investor_id', id).order('created_at', { ascending: false });

    // Fetch Alerts
    const { data: alerts } = await supabase.from('investor_alerts').select('*').eq('investor_id', id).order('created_at', { ascending: false });

    const currentInvestment = investments && investments.length > 0 ? investments[0] : null;

    // Fetch Latest Real-Time NAV from synced data
    let dynamicPortfolioValue = currentInvestment?.current_value || 0;
    let trueLatestNav = currentInvestment?.nav || 0;
    let isLiveNav = false;
    if (currentInvestment) {
        const { data: latestNavData } = await supabase
            .from('fund_nav_history')
            .select('nav')
            .eq('fund_name', currentInvestment.fund_name)
            .order('created_at', { ascending: false })
            .limit(1);

        if (latestNavData && latestNavData.length > 0) {
            trueLatestNav = latestNavData[0].nav;
            dynamicPortfolioValue = currentInvestment.units * trueLatestNav;
            isLiveNav = true;
        }
    }

    // Determine SIP status styling
    let sipStatusClass = "bg-emerald-50 text-emerald-700 ring-emerald-200 border-emerald-100";
    let sipStatusText = "Active SIP";
    if (currentInvestment?.sip_amount === 0) {
        sipStatusClass = "bg-rose-50 text-rose-700 ring-rose-200 border-rose-100";
        sipStatusText = "Stopped";
    }

    return (
        <div className="p-8 lg:p-12">
            {/* Header & Back Nav */}
            <div className="mb-8">
                <Link href="/dashboard/investors" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6">
                    <ArrowLeft size={16} /> Back to Directory
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-indigo-600/20">
                            {investor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold tracking-widest uppercase mb-3">
                                ID: {investor.investor_id}
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">{investor.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                                <span className="flex items-center gap-1.5"><Phone size={15} className="text-slate-400" /> {investor.phone}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={15} className="text-slate-400" /> {investor.city}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 w-full md:w-auto">
                        <a href={`tel:${investor.phone}`} className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all hover:-translate-y-0.5 group">
                            <Phone size={18} className="group-hover:animate-pulse" />
                            Call Investor Action
                        </a>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    {isLiveNav && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-inner">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div> Live NAV
                        </div>
                    )}
                    <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Total Wealth</h3>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{dynamicPortfolioValue?.toLocaleString() || 0}</div>
                    {isLiveNav && <div className="text-xs font-semibold text-slate-400 mt-1">Based on NAV: ₹{trueLatestNav}</div>}
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                    <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Current SIP</h3>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{currentInvestment?.sip_amount?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                    <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">SIP Status</h3>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border ring-1 ring-inset ${sipStatusClass}`}>
                        {sipStatusText}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                    <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">SIP Date</h3>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
                        {currentInvestment?.sip_date || '--'}
                        <span className="text-sm text-slate-400 font-medium">of month</span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout (Chart + Alerts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="text-indigo-600 w-6 h-6" />
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Portfolio Value Trend</h3>
                    </div>
                    {/* Render Recharts Area Chart Component here */}
                    <div className="w-full">
                        <InvestorChart data={investments || []} />
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="text-rose-500 w-6 h-6" />
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Behavior Engine</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {alerts && alerts.length > 0 ? (
                            <div className="space-y-4">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`p-4 rounded-2xl border ${alert.alert_type === 'REDEMPTION' || alert.alert_type === 'SIP_STOPPED'
                                        ? 'bg-rose-50 border-rose-100'
                                        : alert.alert_type === 'SIP_INCREASED' || alert.alert_type === 'NEW_INVESTMENT'
                                            ? 'bg-emerald-50 border-emerald-100'
                                            : 'bg-indigo-50 border-indigo-100'
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${alert.alert_type === 'REDEMPTION' || alert.alert_type === 'SIP_STOPPED'
                                                ? 'bg-rose-100 text-rose-700'
                                                : alert.alert_type === 'SIP_INCREASED' || alert.alert_type === 'NEW_INVESTMENT'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-indigo-100 text-indigo-700'
                                                }`}>
                                                {alert.alert_type.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400">{alert.month}</span>
                                        </div>
                                        {alert.previous_value !== null && alert.current_value !== null && (
                                            <div className="text-sm font-medium text-slate-700 mt-2 flex flex-col gap-1 items-start">
                                                {(alert.alert_type === 'REDEMPTION' || alert.alert_type === 'PANIC_REDEMPTION') ? (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500 line-through decoration-slate-300">{alert.previous_units} Units</span>
                                                            <ArrowRight size={14} className="text-slate-400" />
                                                            <span className="font-bold">{alert.current_units} Units</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">NAV Shift: ₹{alert.previous_nav} → ₹{alert.current_nav}</span>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 line-through decoration-slate-300">₹{alert.previous_value}</span>
                                                        <ArrowRight size={14} className="text-slate-400" />
                                                        <span className="font-bold">₹{alert.current_value}</span>
                                                    </div>
                                                )}

                                                {alert.call_insight && (
                                                    <div className="mt-3 bg-white/60 p-3 rounded-xl border border-slate-200/50 text-slate-600 italic">
                                                        "{alert.call_insight}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                                    <Zap size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-700 mb-1">No Alerts Detected</p>
                                <p className="text-xs font-medium text-slate-400">Behavior metrics are stable across all analyzed months.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Monthly History Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                    <Calendar className="text-indigo-600 w-6 h-6" />
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Investment Digest History</h3>
                </div>

                {investments && investments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-8 py-5 font-bold">Month Tag</th>
                                    <th className="px-8 py-5 font-bold">Fund Asset</th>
                                    <th className="px-8 py-5 font-bold text-right">Units</th>
                                    <th className="px-8 py-5 font-bold text-right">NAV</th>
                                    <th className="px-8 py-5 font-bold text-right">SIP Amount</th>
                                    <th className="px-8 py-5 font-bold text-right">Total Invested</th>
                                    <th className="px-8 py-5 font-bold text-right">Current Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {investments.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900">{inv.month}</td>
                                        <td className="px-8 py-5 text-sm font-bold text-indigo-600">{inv.fund_name}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-600 text-right">{Number(inv.units).toFixed(4)}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-600 text-right">₹{Number(inv.nav).toFixed(2)}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-600 text-right">₹{Number(inv.sip_amount).toLocaleString()}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-600 text-right">₹{Number(inv.total_investment).toLocaleString()}</td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-900 text-right">₹{Number(inv.current_value).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500 font-medium">No history found.</div>
                )}
            </div>
        </div>
    );
}
