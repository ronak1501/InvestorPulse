import { createClient } from '@/utils/supabase/server'
import { TrendingUp, Users, AlertCircle, ArrowUpRight, Zap, PieChart, Info, ArrowRight, ShieldAlert, BarChart3, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userName = user?.user_metadata?.name || 'User'

    if (!userName && user?.id) {
        const { data } = await supabase.from('users').select('name').eq('id', user.id).single()
        if (data?.name) {
            userName = data.name
        }
    }

    const firstName = userName.split(' ')[0]

    const { count: totalInvestors } = await supabase.from('investors').select('*', { count: 'exact', head: true })

    let totalAum = 0;
    const { data: aumData } = await supabase.from('monthly_investments').select('current_value');
    if (aumData) aumData.forEach(inv => totalAum += Number(inv.current_value));

    const today = new Date().getDate();
    let endDay = today + 5;
    let upcomingSipsCount = 0;
    if (endDay <= 31) {
        const { count } = await supabase.from('monthly_investments').select('*', { count: 'exact', head: true })
            .gte('sip_date', today).lte('sip_date', endDay);
        upcomingSipsCount = count || 0;
    }

    const { count: sipStopped } = await supabase.from('investor_alerts').select('*', { count: 'exact', head: true }).eq('alert_type', 'SIP_STOPPED')
    const { count: redemptions } = await supabase.from('investor_alerts').select('*', { count: 'exact', head: true }).eq('alert_type', 'REDEMPTION')
    const { count: panicRedemptions } = await supabase.from('investor_alerts').select('*', { count: 'exact', head: true }).eq('alert_type', 'PANIC_REDEMPTION')
    const { count: newInv } = await supabase.from('investor_alerts').select('*', { count: 'exact', head: true }).eq('alert_type', 'NEW_INVESTMENT')

    const { count: existingInv } = await supabase.from('investor_alerts').select('*', { count: 'exact', head: true }).eq('alert_type', 'EXISTING_INVESTMENT')

    const { data: recentInvestors } = await supabase.from('investors').select('*').order('created_at', { ascending: false }).limit(5);

    // Fetch user active funds
    let userActiveFunds: string[] = [];
    if (user?.id) {
        const { data: userInvestments } = await supabase
            .from('monthly_investments')
            .select('fund_name')
            .eq('user_id', user.id);

        if (userInvestments) {
            userActiveFunds = Array.from(new Set(userInvestments.map(i => i.fund_name).filter(Boolean)));
        }
    }

    // Fund Performance: try synced market data first, fallback to monthly_investments
    const DUMMY_FUNDS = ['Tech Opportunities', 'Infrastructure Theme', 'Midcap Momentum', 'Liquid Cash Plus', 'Flexi Cap Alpha', 'Small Cap Discover', 'Banking & PSU', 'Bluechip Equity'];

    const { data: allFunds } = await supabase
        .from('fund_performance')
        .select(`
            *,
            fund_schemes (
                scheme_name
            )
        `)
        .order('return_1y', { ascending: false });

    const syncedFunds = (allFunds || []).filter(f => {
        const name = f.fund_schemes?.scheme_name;
        if (!name) return false;
        if (DUMMY_FUNDS.some(dummy => name.includes(dummy) || dummy.includes(name))) return false;
        return true;
    }).slice(0, 10);

    // Fallback: aggregate from monthly_investments if no synced data
    let fundsPerformance: any[] = syncedFunds;
    if (syncedFunds.length === 0 && user?.id) {
        const { data: investData } = await supabase
            .from('monthly_investments')
            .select('fund_name, current_value, nav, investor_id')
            .eq('user_id', user.id);

        if (investData && investData.length > 0) {
            const fundMap: Record<string, { fund_name: string; navs: number[]; count: number; total_value: number }> = {};
            for (const inv of investData) {
                if (!inv.fund_name) continue;
                if (DUMMY_FUNDS.some(d => inv.fund_name.includes(d) || d.includes(inv.fund_name))) continue;
                if (!fundMap[inv.fund_name]) {
                    fundMap[inv.fund_name] = { fund_name: inv.fund_name, navs: [], count: 0, total_value: 0 };
                }
                if (inv.nav) fundMap[inv.fund_name].navs.push(Number(inv.nav));
                fundMap[inv.fund_name].count += 1;
                fundMap[inv.fund_name].total_value += Number(inv.current_value || 0);
            }
            fundsPerformance = Object.values(fundMap).map(f => ({
                _isFallback: true,
                fund_schemes: { scheme_name: f.fund_name },
                latest_nav: f.navs.length > 0 ? (f.navs.reduce((a, b) => a + b, 0) / f.navs.length).toFixed(2) : null,
                investor_count: f.count,
                total_value: f.total_value,
                return_1y: null,
                return_3y: null,
            })).slice(0, 10);
        }
    }

    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Overview
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Welcome back, {firstName}. Here's what's happening today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                        Upload Data
                    </Link>
                    <Link href="/dashboard/investors" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 border border-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                        View Database
                    </Link>
                </div>
            </header>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/investors" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Users size={24} strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Total Investors</p>
                        <h3 className="text-3xl font-bold text-slate-900">{totalInvestors || 0}</h3>
                    </div>
                </Link>

                <Link href="/dashboard/upcoming-sips" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition-colors relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Zap size={24} strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Upcoming SIPs</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-slate-900">{upcomingSipsCount}</h3>
                            <span className="text-sm font-medium text-slate-400 mb-1">next 5 days</span>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/panic-risk" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition-colors relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <AlertCircle size={24} strokeWidth={2} />
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-700">Urgent</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Actions Required</p>
                        <h3 className="text-3xl font-bold text-slate-900">{(redemptions || 0) + (sipStopped || 0) + (panicRedemptions || 0)}</h3>
                    </div>
                </Link>
            </div>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area - Span 2 */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Fund Performance Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="text-slate-400 w-5 h-5" />
                                <h3 className="text-base font-bold text-slate-900">Fund Performance</h3>
                            </div>
                            <Link href="/dashboard/market" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Intel &rarr;</Link>
                        </div>
                        <div className="overflow-x-auto">
                            {fundsPerformance && fundsPerformance.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                            <th className="px-6 py-4 font-semibold">Fund Name</th>
                                            <th className="px-6 py-4 font-semibold text-right">NAV</th>
                                            {fundsPerformance[0]?._isFallback
                                                ? <th className="px-6 py-4 font-semibold text-right">Investors</th>
                                                : <th className="px-6 py-4 font-semibold text-right">1Y Return</th>}
                                            {fundsPerformance[0]?._isFallback
                                                ? <th className="px-6 py-4 font-semibold text-right">AUM (₹)</th>
                                                : <th className="px-6 py-4 font-semibold text-right">3Y Return</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {fundsPerformance.map((fund: any, idx: number) => (
                                            <tr key={fund.scheme_code || fund.fund_schemes?.scheme_name || idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 max-w-[260px]">
                                                    <span className="line-clamp-2">{fund.fund_schemes?.scheme_name || 'Unnamed Fund'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-right">
                                                    {fund.latest_nav ? `₹${Number(fund.latest_nav).toFixed(2)}` : '--'}
                                                </td>
                                                {fund._isFallback ? (
                                                    <>
                                                        <td className="px-6 py-4 text-right font-semibold text-slate-700">{fund.investor_count}</td>
                                                        <td className="px-6 py-4 text-right text-slate-600">
                                                            {fund.total_value > 0 ? `₹${(fund.total_value / 100000).toFixed(1)}L` : '--'}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-6 py-4 text-right">
                                                            {fund.return_1y !== null && fund.return_1y !== undefined ? (
                                                                <span className={Number(fund.return_1y) < 0 ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>
                                                                    {Number(fund.return_1y) > 0 ? '+' : ''}{Number(fund.return_1y).toFixed(2)}%
                                                                </span>
                                                            ) : <span className="text-slate-400">--</span>}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {fund.return_3y !== null && fund.return_3y !== undefined ? (
                                                                <span className={Number(fund.return_3y) < 0 ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>
                                                                    {Number(fund.return_3y) > 0 ? '+' : ''}{Number(fund.return_3y).toFixed(2)}%
                                                                </span>
                                                            ) : <span className="text-slate-400">--</span>}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-slate-500 text-sm font-medium">No fund data available.</p>
                                    <p className="text-slate-400 text-xs mt-1">Upload investor data or sync market data to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column - Span 1 */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex flex-col h-full min-h-[350px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl"></div>
                        <div className="p-6 relative z-10 flex flex-col h-full text-white">
                            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                                <ShieldAlert className="w-6 h-6 text-rose-400" />
                            </div>

                            <h3 className="text-xl font-bold tracking-tight mb-2">Panic Risk Engine</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                AI has detected <strong className="text-rose-300 font-semibold">{panicRedemptions || 0} panic drops</strong>, <strong className="text-white font-semibold">{redemptions || 0} regular redemptions</strong>, and <strong className="text-white font-semibold">{sipStopped || 0} stopped SIPs</strong>.
                            </p>

                            <div className="mt-auto pt-8">
                                <Link href="/dashboard/panic-risk" className="flex items-center justify-between w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group">
                                    <span className="font-semibold text-sm text-slate-200">View Client List</span>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
