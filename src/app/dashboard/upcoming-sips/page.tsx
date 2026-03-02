import { createClient } from '@/utils/supabase/server';
import { Zap, Calendar, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function UpcomingSIPsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Calculate the upcoming 5 dates relative to today
    const today = new Date().getDate();
    let endDay = today + 5;

    // We handle the edge case where endDay crosses end of month simply
    // by fetching items whose sip_date is within [today, today+5] 
    // Usually dates are stored from 1 to 28/31
    const { data: upcomingSips } = await supabase
        .from('monthly_investments')
        .select(`
            id,
            fund_name,
            amount,
            sip_date,
            folio_number,
            investors (
                investor_id,
                name,
                phone
            )
        `)
        .eq('user_id', user?.id || '')
        .gte('sip_date', today)
        .lte('sip_date', endDay)
        .order('sip_date', { ascending: true });

    const totalUpcomingAmount = upcomingSips?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;

    return (
        <div className="p-8 lg:p-12 2xl:p-16">
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                            <Zap size={24} strokeWidth={2.5} />
                        </div>
                        Upcoming SIP Schedules
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Monitor active SIP deducons scheduled for your investors within the next 5 days.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm shadow-amber-100/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 font-bold shadow-inner">
                            <Clock size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Next 5 Days</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-amber-600 tracking-tight mb-1">
                            {upcomingSips?.length || 0}
                        </div>
                        <div className="text-sm font-bold text-slate-800">Scheduled SIPs</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm shadow-emerald-100/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 font-bold shadow-inner">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Volume</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-emerald-600 tracking-tight mb-1">
                            ₹{totalUpcomingAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm font-bold text-slate-800">Expected Capital Flow</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col w-full">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                    <Calendar className="text-amber-500 w-5 h-5" />
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active SIPs ({today} - {endDay <= 31 ? endDay : 31})</h3>
                </div>
                <div className="flex-1 overflow-x-auto">
                    {!upcomingSips || upcomingSips.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-200/50">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No SIPs Found</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">There are no upcoming SIP deducts scheduled for any investors in the next 5 days.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-8 py-5 font-bold">Investor details</th>
                                    <th className="px-8 py-5 font-bold">Fund Name</th>
                                    <th className="px-8 py-5 font-bold">SIP Date</th>
                                    <th className="px-8 py-5 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {upcomingSips.map((sip: any) => (
                                    <tr key={sip.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            {sip.investors ? (
                                                <Link href={`/dashboard/investors/${sip.investors.investor_id}`} className="font-bold text-slate-900 flex items-center gap-2 hover:text-amber-600">
                                                    {sip.investors.name}
                                                    <ArrowUpRight size={14} className="text-slate-400" />
                                                </Link>
                                            ) : (
                                                <span className="font-bold text-slate-900">Unknown Investor</span>
                                            )}
                                            {sip.investors?.phone && <div className="text-xs text-slate-400 font-medium mt-1">{sip.investors.phone}</div>}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-800 line-clamp-1">{sip.fund_name}</div>
                                            {sip.folio_number && <div className="text-xs text-slate-400 font-medium mt-1">Folio: {sip.folio_number}</div>}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                                                <Calendar size={12} className={sip.sip_date === today ? "text-amber-600" : "text-slate-500"} />
                                                Day {sip.sip_date}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-emerald-600">
                                            ₹{(sip.amount || 0).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
