'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

export default function InvestorChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                Not enough data points yet
            </div>
        );
    }

    // Reverse data to show oldest to newest (assuming data was sorted DESC originally)
    const chartData = [...data].reverse().map(d => ({
        name: d.month,
        value: Number(d.current_value),
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                        itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                        formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Portfolio Value']}
                    />
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
