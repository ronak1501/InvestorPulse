"use client";

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle, RefreshCw, BarChart3, Users, DollarSign, ShieldAlert, PieChart } from 'lucide-react';
import Link from 'next/link';

export default function MarketClient({
    userFirstName,
    funds,
    navHistory,
    investments,
    alerts
}: {
    userFirstName: string;
    funds: any[];
    navHistory: any[];
    investments: any[];
    alerts: any[];
}) {
    // Top and Worst Performers
    const topFunds = [...funds].filter(f => f.return_3m > 0).sort((a, b) => b.return_3m - a.return_3m).slice(0, 5);
    const worstFunds = [...funds].filter(f => f.return_3m < 0).sort((a, b) => a.return_3m - b.return_3m).slice(0, 5);

    // Market Status Indicator
    const avgReturn1M = funds.length > 0 ? funds.reduce((acc, f) => acc + (f.return_1m || 0), 0) / funds.length : 0;

    let marketState = 'Neutral';
    let marketColor = 'text-amber-500';
    let marketBg = 'bg-amber-50';
    let marketIcon = <Activity className="w-8 h-8 text-amber-500" />;

    if (avgReturn1M > 2) {
        marketState = 'Bullish';
        marketColor = 'text-emerald-500';
        marketBg = 'bg-emerald-50';
        marketIcon = <TrendingUp className="w-8 h-8 text-emerald-500" />;
    } else if (avgReturn1M < -2) {
        marketState = 'Correction';
        marketColor = 'text-rose-500';
        marketBg = 'bg-rose-50';
        marketIcon = <TrendingDown className="w-8 h-8 text-rose-500" />;
    }

    // Chart State
    const [selectedFund, setSelectedFund] = useState(funds[0]?.scheme_code || '');

    // Process Chart Data
    const formattedNavHistory = navHistory
        .filter(h => h.scheme_code === selectedFund)
        .sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime())
        .map(h => ({
            date: new Date(h.date || h.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            nav: Number(h.nav)
        }));

    // Generate Portfolio Impact
    const portfolioImpact = investments.map(inv => {
        const units = Number(inv.units || 0);
        const amount = Number(inv.sip_amount || inv.total_investment || 0);
        // Fallback to calculation if nav/units not perfectly populated
        const nav = Number(inv.nav || 0);
        const currentValue = Number(inv.current_value || 0);

        return {
            id: inv.id,
            investor_name: inv.investors?.name || 'Unknown',
            investor_id: inv.investors?.investor_id,
            fund_name: inv.fund_name,
            units: units > 0 ? units.toFixed(2) : (amount > 0 && nav > 0 ? (amount / nav).toFixed(2) : '--'),
            nav: nav > 0 ? nav.toFixed(2) : '--',
            portfolio_value: currentValue > 0 ? currentValue.toFixed(2) : '--'
        };
    }).slice(0, 10); // Show max 10 for dashboard

    // Sector Grouping
    const sectorStats = funds.reduce((acc: any, f) => {
        const cat = f.fund_schemes?.fund_category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = { sum: 0, count: 0 };
        acc[cat].sum += (f.return_1m || 0);
        acc[cat].count += 1;
        return acc;
    }, {});

    const sectors = Object.keys(sectorStats).map(cat => ({
        category: cat,
        avgReturn: (sectorStats[cat].sum / sectorStats[cat].count).toFixed(2)
    })).sort((a, b) => Number(b.avgReturn) - Number(a.avgReturn));

    // Panic Contexts
    const panicAlerts = alerts.filter(a => a.alert_type === 'REDEMPTION' || a.alert_type === 'PANIC_REDEMPTION');
    const redemptionFunds = funds.filter(f => f.return_3m < 0 && panicAlerts.some(pa => pa.previous_value > 0));
    // Just a heuristic mapping for panic items based on 3m drops

    return (
        <div className="space-y-8">

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Market Status Card */}
                <div className={`p-6 rounded-2xl border bg-white shadow-sm flex items-center justify-between ${marketState === 'Bullish' ? 'border-emerald-200' : marketState === 'Correction' ? 'border-rose-200' : 'border-amber-200'}`}>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Market State</p>
                        <h3 className={`text-3xl font-extrabold ${marketColor} tracking-tight`}>{marketState}</h3>
                        <p className="text-sm font-medium text-slate-400 mt-2">Avg Return: {avgReturn1M > 0 ? '+' : ''}{avgReturn1M.toFixed(2)}%</p>
                    </div>
                    <div className={`p-4 rounded-full ${marketBg}`}>
                        {marketIcon}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 transition-colors">
                            <BarChart3 size={24} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Total Monitored Funds</p>
                        <h3 className="text-3xl font-bold text-slate-900">{funds.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 transition-colors">
                            <ShieldAlert size={24} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Contexted Alerts</p>
                        <h3 className="text-3xl font-bold text-slate-900">{panicAlerts.length}</h3>
                    </div>
                </div>

            </div>

            {/* Split Grid row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* NAV Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                NAV Trend Analysis
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Historical unit pricing movements</p>
                        </div>
                        <select
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-medium max-w-xs"
                            value={selectedFund}
                            onChange={(e) => setSelectedFund(e.target.value)}
                        >
                            {funds.map(f => (
                                <option key={f.scheme_code} value={f.scheme_code}>
                                    {f.fund_schemes?.scheme_name || f.scheme_code}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="h-[300px] w-full">
                        {formattedNavHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formattedNavHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}
                                        itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                                        formatter={(value: any) => [`₹${value}`, 'NAV']}
                                    />
                                    <Line type="monotone" dataKey="nav" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                                <Activity className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">No NAV history available for selected fund</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sector Performance */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-500" />
                        Category Overview
                    </h3>
                    <div className="space-y-4 flex-1">
                        {sectors.length > 0 ? sectors.map((sector: any) => (
                            <div key={sector.category} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                                <span className="font-semibold text-slate-700 truncate mr-4 text-sm">{sector.category}</span>
                                <span className={`font-bold text-sm ${Number(sector.avgReturn) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {Number(sector.avgReturn) > 0 ? '+' : ''}{sector.avgReturn}%
                                </span>
                            </div>
                        )) : (
                            <div className="text-center text-slate-400 text-sm py-8">Categories not available</div>
                        )}
                    </div>
                </div>

            </div>

            {/* Split Grid row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Top Performers */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
                        <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Top Performing Funds
                        </h3>
                    </div>
                    <div className="overflow-x-auto flex-1 p-2">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-header-group">
                                <tr>
                                    <th className="px-4 py-3">Fund Name</th>
                                    <th className="px-4 py-3 text-right">3M Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {topFunds.length > 0 ? topFunds.map(f => (
                                    <tr key={`top-${f.scheme_code}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-800 text-sm line-clamp-1">{f.fund_schemes?.scheme_name || 'Unnamed'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-sm bg-emerald-50 px-2 py-1 rounded">
                                                +{f.return_3m}%
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={2} className="px-4 py-8 text-center text-sm font-medium text-slate-400">No positive 3M returns.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Worst Performers */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
                        <h3 className="text-base font-bold text-rose-800 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Worst Performing Funds
                        </h3>
                    </div>
                    <div className="overflow-x-auto flex-1 p-2">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-header-group">
                                <tr>
                                    <th className="px-4 py-3">Fund Name</th>
                                    <th className="px-4 py-3 text-right">3M Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {worstFunds.length > 0 ? worstFunds.map(f => (
                                    <tr key={`worst-${f.scheme_code}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-800 text-sm line-clamp-1">{f.fund_schemes?.scheme_name || 'Unnamed'}</div>
                                            {f.return_3m < -5 && <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Possible Panic Context</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center gap-1 font-bold text-rose-600 text-sm bg-rose-50 px-2 py-1 rounded">
                                                {f.return_3m}%
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={2} className="px-4 py-8 text-center text-sm font-medium text-slate-400">No negative 3M returns found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Investor Portfolio Impact */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                    <Users className="text-indigo-500 w-5 h-5" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Investor Portfolio Impact</h3>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">Effect of NAV trends on assigned portfolios</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {portfolioImpact.length > 0 ? (
                        <table className="w-full text-left bg-white">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-6 py-4 font-bold">Investor Name</th>
                                    <th className="px-6 py-4 font-bold">Fund Scheme</th>
                                    <th className="px-6 py-4 font-bold text-right">Units Held</th>
                                    <th className="px-6 py-4 font-bold text-right">Latest NAV</th>
                                    <th className="px-6 py-4 font-bold text-right text-indigo-700">Portfolio Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {portfolioImpact.map(impact => (
                                    <tr key={impact.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            <Link href={`/dashboard/investors/${impact.investor_id}`} className="hover:text-indigo-600">{impact.investor_name}</Link>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600 truncate max-w-[200px]">{impact.fund_name}</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-500">{impact.units}</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-500">
                                            {impact.nav !== '--' ? `₹${impact.nav}` : '--'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-indigo-700 bg-indigo-50/30">
                                            {impact.portfolio_value !== '--' ? `₹${Number(impact.portfolio_value).toLocaleString('en-IN')}` : '--'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center text-slate-400 font-medium text-sm border-t border-slate-100">
                            No active investments synced to gauge portfolio impact.
                        </div>
                    )}
                </div>
            </div>

            {/* Fund Performance Table Complete */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="text-indigo-500 w-5 h-5" />
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Complete Asset Performance List</h3>
                    </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                    {funds.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-200/50">
                                <RefreshCw size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Market Data Synced</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">Hit the Sync endpoint to pull mutual fund data and calculate historical returns.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse bg-white">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-8 py-5 font-bold">Fund Scheme & AMC</th>
                                    <th className="px-8 py-5 font-bold text-right">Latest NAV</th>
                                    <th className="px-8 py-5 font-bold text-right">1M Return</th>
                                    <th className="px-8 py-5 font-bold text-right">3M Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {funds.map((fund: any) => (
                                    <tr key={`full-${fund.scheme_code}`} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900 mb-1">{fund.fund_schemes?.scheme_name || fund.scheme_code}</div>
                                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{fund.fund_schemes?.amc_name || 'N/A'}</div>
                                            {(fund.return_3m < -3 && panicAlerts.length > 0) && (
                                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 gap-1 border border-rose-200">
                                                    <AlertCircle size={10} /> Possible Panic Redemption Candidate
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right font-semibold text-slate-700 align-middle">
                                            {fund.latest_nav ? `₹${fund.latest_nav}` : '--'}
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold align-middle">
                                            {fund.return_1m !== undefined && fund.return_1m !== null ? (
                                                <span className={fund.return_1m >= 0 ? 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md' : 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md'}>
                                                    {fund.return_1m > 0 ? '+' : ''}{fund.return_1m}%
                                                </span>
                                            ) : '--'}
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold align-middle">
                                            {fund.return_3m !== undefined && fund.return_3m !== null ? (
                                                <span className={fund.return_3m >= 0 ? 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md' : 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md'}>
                                                    {fund.return_3m > 0 ? '+' : ''}{fund.return_3m}%
                                                </span>
                                            ) : '--'}
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
