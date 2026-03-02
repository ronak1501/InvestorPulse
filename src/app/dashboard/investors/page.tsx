import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Users, Search, ArrowUpRight, Phone, MapPin } from 'lucide-react';

export default async function InvestorsPage() {
    const supabase = await createClient();

    // Fetch all investors 
    const { data: investors } = await supabase.from('investors').select('*').order('name', { ascending: true });

    // Fetch Stats
    const { count: totalInvestors } = await supabase.from('investors').select('*', { count: 'exact', head: true });

    // Fetch unique uploaded months and their import dates
    const { data: invData } = await supabase.from('monthly_investments').select('month, file_name, created_at, investor_id').order('created_at', { ascending: false });
    const monthMap = new Map();
    const investorMonths = new Map();
    if (invData) {
        invData.forEach(inv => {
            if (!monthMap.has(inv.month)) {
                monthMap.set(inv.month, {
                    month: inv.month,
                    file_name: inv.file_name || 'System Generated',
                    date: new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                });
            }
            if (!investorMonths.has(inv.investor_id)) {
                investorMonths.set(inv.investor_id, new Set());
            }
            investorMonths.get(inv.investor_id).add(inv.month);
        });
    }
    const uploadedMonths = Array.from(monthMap.values());

    return (
        <div className="p-8 lg:p-12">
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Investors Master Database</h1>
                    <p className="text-slate-500 font-medium">Directory of all managed investor profiles and portfolios.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="search"
                        placeholder="Search investors..."
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm min-w-[300px]"
                    />
                </div>
            </header>

            {/* Database Ingestion Info */}
            <div className="mb-8 w-full xl:w-[400px] bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3"></div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 relative z-10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Data Ingestion Sync
                </h4>
                <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="text-base font-bold text-slate-700">Existing Investors</span>
                    <span className="text-base font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{totalInvestors || 0}</span>
                </div>
                <div className="text-xs font-semibold text-slate-400 mb-5 relative z-10">Unique Entities Master List</div>

                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100 relative z-10">
                    {uploadedMonths.length > 0 ? uploadedMonths.map((m: any) => (
                        <div key={m.month} className="group flex justify-between items-center group bg-slate-50 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100">
                            <div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors"></div>
                                    {m.month}
                                </span>
                                <div className="text-xs text-slate-500 font-medium pl-3.5 truncate max-w-[200px]" title={m.file_name}>
                                    {m.file_name}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-white shadow-sm px-2 py-1 rounded-md border border-slate-100">{m.date}</span>
                        </div>
                    )) : (
                        <span className="text-sm text-slate-500 font-medium">No months synced yet.</span>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                {!investors || investors.length === 0 ? (
                    <div className="px-12 py-24 text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No investors found</h3>
                        <p className="text-slate-500 mb-6 font-medium">Upload your first monthly Excel file to populate the database.</p>
                        <Link href="/dashboard/upload" className="inline-flex px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                            Upload Data File
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-8 py-5 font-bold">Investor details</th>
                                    <th className="px-8 py-5 font-bold">Contact</th>
                                    <th className="px-8 py-5 font-bold">Location</th>
                                    <th className="px-8 py-5 font-bold">Joined</th>
                                    <th className="px-8 py-5 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {investors.map((inv) => (
                                    <tr key={inv.investor_id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-inner">
                                                    {inv.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <Link href={`/dashboard/investors/${inv.investor_id}`} className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                            {inv.name}
                                                        </Link>
                                                        {investorMonths.get(inv.investor_id)?.size > 1 ? (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 text-slate-500 uppercase tracking-wider">Existing</span>
                                                        ) : (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-700 uppercase tracking-wider">New</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium">ID: {inv.investor_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <Phone size={14} className="text-slate-400" />
                                                {inv.phone}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <MapPin size={14} className="text-slate-400" />
                                                {inv.city}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-500">
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link href={`/dashboard/investors/${inv.investor_id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-bold hover:bg-indigo-100 transition-colors">
                                                View
                                                <ArrowUpRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
