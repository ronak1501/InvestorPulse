'use client';

import { useState, useEffect } from 'react';
import * as xlsx from 'xlsx';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { processMonthlyData } from './actions';
import UploadedDataManager from '@/components/UploadedDataManager';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [rowsParsed, setRowsParsed] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'uploading') {
            setUploadProgress(0);
            interval = setInterval(() => {
                setUploadProgress((prev) => {
                    const next = prev + Math.floor(Math.random() * 10) + 5;
                    return next >= 95 ? 95 : next;
                });
            }, 300);
        } else if (status === 'success') {
            setUploadProgress(100);
        }
        return () => clearInterval(interval);
    }, [status]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
            setRowsParsed(0);
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('parsing');
        try {
            const data = await file.arrayBuffer();
            const workbook = xlsx.read(data, { type: 'array' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const jsonData = xlsx.utils.sheet_to_json(worksheet);
            setRowsParsed(jsonData.length);

            if (jsonData.length === 0) {
                setStatus('error');
                setMessage('The Excel file appears to be empty.');
                return;
            }

            setStatus('uploading');

            const result = await processMonthlyData(jsonData, file.name);

            if (result.success) {
                setStatus('success');
                setTimeout(() => {
                    setToast({ show: true, message: `Successfully imported ${jsonData.length} investor records!` });
                    // Reset UI to fresh browse state
                    setFile(null);
                    setStatus('idle');
                    setMessage('');
                    setRowsParsed(0);
                    setUploadProgress(0);

                    // Hide toast after a few seconds
                    setTimeout(() => setToast({ show: false, message: '' }), 4000);
                }, 500); // slight delay to show 100%
            } else {
                setStatus('error');
                setMessage(result.error || 'Failed to process data. Please check the console.');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setStatus('error');
            setMessage(error.message || 'An error occurred while parsing the Excel file.');
        }
    };

    return (
        <div className="p-8 lg:p-12">
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Upload Investor Data</h1>
                <p className="text-slate-500 font-medium">Ingest monthly Excel reports to automatically trigger AI behavior analysis and generate alerts.</p>
            </header>

            <div className="max-w-3xl bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                    <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 mb-6">
                        <UploadCloud size={32} strokeWidth={2} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">Select Excel File</h3>
                    <p className="text-sm font-medium text-slate-500 text-center max-w-sm mb-6">
                        Upload your monthly investor digest. Must contain columns: investor_id, name, phone, city, fund_name, sip_amount, sip_date, units, nav, total_investment, month.
                    </p>

                    <label className="relative cursor-pointer bg-white border border-slate-300 rounded-xl px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
                        <span>Browse Files</span>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </label>

                    {file && (
                        <div className="mt-8 flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm w-full max-w-sm">
                            <FileSpreadsheet className="text-emerald-500" size={24} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500 font-medium truncate">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <div className="flex-1">
                        {status === 'parsing' && <p className="text-sm font-bold text-indigo-600 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Parsing Excel data...</p>}

                        {status === 'uploading' && (
                            <div className="flex flex-col gap-2 max-w-md">
                                <p className="text-sm font-bold text-blue-600 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" /> Uploading and Analyzing... {uploadProgress}%
                                </p>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {status === 'success' && <p className="text-sm font-bold text-emerald-600 flex items-start gap-2 max-w-md"><CheckCircle2 size={18} className="shrink-0 mt-0.5" /> <span>{message}</span></p>}
                        {status === 'error' && <p className="text-sm font-bold text-rose-600 flex items-start gap-2 max-w-md"><AlertCircle size={18} className="shrink-0 mt-0.5" /> <span>{message}</span></p>}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || status === 'parsing' || status === 'uploading'}
                        className="px-8 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {status === 'uploading' || status === 'parsing' ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Processing...
                            </>
                        ) : 'Upload Data'}
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mt-10">
                <UploadedDataManager />
            </div>

            {/* Custom Success Toast */}
            {toast.show && (
                <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(5,150,105,0.3)] flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 transition-all">
                    <CheckCircle2 size={24} className="text-emerald-100" />
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
