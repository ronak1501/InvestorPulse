'use client';

import { useState, useEffect } from 'react';
import { getUploadedDataSummary, deleteUploadedMonth } from '@/app/dashboard/upload/actions';
import { Database, Trash2, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react';

export default function UploadedDataManager() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingMonth, setDeletingMonth] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const result = await getUploadedDataSummary();
        if (result.success) {
            setData(result.data || []);
        } else {
            setError(result.error || 'Failed to fetch uploaded data');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // Set up an interval to refresh the list occasionally if needed
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (month: string) => {
        if (!confirm(`Are you sure you want to delete all data and alerts for ${month}? This action cannot be undone.`)) {
            return;
        }

        setDeletingMonth(month);
        const result = await deleteUploadedMonth(month);
        if (result.success) {
            await fetchData();
        } else {
            alert('Failed to delete data: ' + result.error);
        }
        setDeletingMonth(null);
    };

    if (loading && data.length === 0) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 size={24} className="text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="font-bold text-sm">{error}</span>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-3xl border border-slate-200/60 border-dashed">
                <Database className="mx-auto h-12 w-12 text-slate-300 mb-3" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Data Uploaded</h3>
                <p className="text-sm font-medium text-slate-500">You haven't uploaded any monthly digest files yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                <Database className="text-indigo-600 w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Manage Parsed Data</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                            <th className="px-8 py-4 font-bold">Month / Period</th>
                            <th className="px-8 py-4 font-bold">Source File</th>
                            <th className="px-8 py-4 font-bold text-right">Records Synced</th>
                            <th className="px-8 py-4 font-bold text-right">Delete</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item) => (
                            <tr key={item.month} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span className="font-bold text-slate-900">{item.month}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium mt-1">Uploaded {new Date(item.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="px-8 py-5 align-middle">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                        <FileText size={14} />
                                        {item.file_name}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right font-bold text-slate-700 align-middle">
                                    {item.records} Rows
                                </td>
                                <td className="px-8 py-5 text-right align-middle">
                                    <button
                                        onClick={() => handleDelete(item.month)}
                                        disabled={deletingMonth === item.month}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
                                        title="Delete Data"
                                    >
                                        {deletingMonth === item.month ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        Drop
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
