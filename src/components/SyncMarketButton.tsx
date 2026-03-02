'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyncMarketButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/sync-market');
            const data = await res.json();

            if (data.success) {
                alert(`Market Sync Complete! Synced ${data.synced} schemes from MFAPI.`);
                router.refresh();
            } else {
                alert(`Sync Failed: ${data.error}`);
            }
        } catch (e: any) {
            alert(`Network Error: ${e.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm text-xs border border-slate-200/60 disabled:opacity-50"
        >
            <RefreshCw size={14} className={`text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="opacity-0 w-0 md:w-auto md:opacity-100 transition-all overflow-hidden whitespace-nowrap">
                {isSyncing ? 'Syncing...' : 'Sync Market Data'}
            </span>
        </button>
    );
}
