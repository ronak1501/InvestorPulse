import Link from 'next/link'
import { LayoutDashboard, Users, Bell, AlertTriangle, ShieldAlert, BarChart3, LogOut, Settings, ChevronRight, UploadCloud, LineChart } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Fetch the user's name from public.users table or user metadata
    let userName = user?.user_metadata?.name || 'User'
    if (!userName && user?.id) {
        const { data } = await supabase.from('users').select('name').eq('id', user.id).single()
        if (data?.name) {
            userName = data.name
        }
    }

    // Fetch Alert Counts
    const { count: sipAlertsCount } = await supabase
        .from('investor_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('alert_type', 'SIP_STOPPED');

    const { count: redemptionAlertsCount } = await supabase
        .from('investor_alerts')
        .select('*', { count: 'exact', head: true })
        .in('alert_type', ['REDEMPTION', 'PANIC_REDEMPTION']);

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-200/80 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
                <div className="p-7 border-b border-slate-100 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-600/20">
                        <BarChart3 className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">VRM<span className="text-indigo-600 font-medium">Pro</span></h2>
                </div>

                <div className="py-6 px-4 flex-1 overflow-y-auto">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Main Navigation</div>
                    <nav className="space-y-1 mb-8">
                        <Link href="/dashboard" className="group flex items-center justify-between px-3 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                            <div className="flex items-center gap-3">
                                <LayoutDashboard size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                Overview
                            </div>
                        </Link>
                        <Link href="/dashboard/investors" className="group flex items-center justify-between px-3 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                Investors Database
                            </div>
                        </Link>
                        <Link href="/dashboard/upload" className="group flex items-center justify-between px-3 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                            <div className="flex items-center gap-3">
                                <UploadCloud size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                Upload Data
                            </div>
                        </Link>
                    </nav>

                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Alerts & Intel Platform</div>
                    <nav className="space-y-1 mb-8">
                        <Link href="/dashboard/sip-alerts" className="group flex items-center justify-between px-3 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                                Missed SIP Alerts
                            </div>
                            <span className="bg-amber-100/80 text-amber-700 py-0.5 px-2.5 rounded-full text-xs font-bold ring-1 ring-amber-200/50">{sipAlertsCount || 0}</span>
                        </Link>
                        <Link href="/dashboard/redemption-alerts" className="group flex items-center justify-between px-3 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={20} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                                Redemption Alerts
                            </div>
                            <span className="bg-rose-100/80 text-rose-700 py-0.5 px-2.5 rounded-full text-xs font-bold ring-1 ring-rose-200/50">{redemptionAlertsCount || 0}</span>
                        </Link>
                        <Link href="/dashboard/market" className="group flex items-center justify-between px-3 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                            <div className="flex items-center gap-3">
                                <LineChart size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                Market Intelligence
                            </div>
                        </Link>
                        <Link href="/dashboard/panic-risk" className="group flex items-center justify-between px-3 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold mt-4">
                            <div className="flex items-center gap-3">
                                <ShieldAlert size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                Panic Risk Engine
                            </div>
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text text-xs font-extrabold uppercase tracking-wide">AI Core</div>
                        </Link>
                    </nav>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50/50">

                    <div className="flex items-center gap-3 mb-5 p-2 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 group">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner ring-2 ring-white">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate tracking-tight">
                                {userName}
                            </div>
                            <div className="text-xs text-slate-500 font-medium truncate">
                                VRM Access
                            </div>
                        </div>
                        <Link href="/dashboard/settings" title="Edit VRM Profile" className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ml-1 border border-transparent hover:border-indigo-100">
                            <Settings size={18} />
                        </Link>
                    </div>

                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold tracking-wide text-slate-700 bg-white border-2 border-slate-200/80 rounded-xl hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
                            <LogOut size={16} strokeWidth={2.5} />
                            Sign Out of Session
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[#F8FAFC]">
                <div className="mx-auto max-w-[1600px]">
                    {children}
                </div>
            </main>
        </div>
    )
}
