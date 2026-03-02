import { createClient } from '@/utils/supabase/server';
import { LineChart } from 'lucide-react';
import SyncMarketButton from '@/components/SyncMarketButton';
import MarketClient from './MarketClient';

export default async function MarketIntelligencePage() {
    const supabase = await createClient();

    // 1. Get Logged in User
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Fetch User metadata
    let userName = user?.user_metadata?.name || 'User';
    if (!userName && user?.id) {
        const { data } = await supabase.from('users').select('name').eq('id', user.id).single();
        if (data?.name) userName = data.name;
    }
    const firstName = userName.split(' ')[0];

    // 3. Fetch Performance Data
    const { data: performance } = await supabase
        .from('fund_performance')
        .select(`
            *,
            fund_schemes (
                scheme_name,
                amc_name,
                fund_category
            )
        `)
        .order('return_1m', { ascending: false });

    // 4. Clean Funds
    const DUMMY_FUNDS = ['Tech Opportunities', 'Infrastructure Theme', 'Midcap Momentum', 'Liquid Cash Plus', 'Flexi Cap Alpha', 'Small Cap Discover', 'Banking & PSU', 'Bluechip Equity'];
    const funds = (performance || []).filter(f => {
        const name = f.fund_schemes?.scheme_name;
        if (!name) return false;
        if (DUMMY_FUNDS.some(dummy => name.includes(dummy) || dummy.includes(name))) return false;
        return true;
    });

    // 5. Fetch NAV History for chart 
    const { data: navHistory } = await supabase
        .from('fund_nav_history')
        .select('*');

    // 6. Fetch User Investments
    const { data: investments } = await supabase
        .from('monthly_investments')
        .select(`
            *,
            investors (
                name,
                investor_id
            )
        `)
        .eq('user_id', user?.id || '');

    // 7. Fetch Alerts
    const { data: alerts } = await supabase
        .from('investor_alerts')
        .select('*')
        .eq('user_id', user?.id || '');

    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <div className="bg-indigo-600/10 p-2.5 rounded-xl text-indigo-600">
                            <LineChart className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        Market Intelligence
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Real-time Mutual Fund data synchronized with MFAPI to track actual portfolio scheme performance, evaluate sector categories, and detect market-driven movements.
                    </p>
                </div>
                <SyncMarketButton />
            </header>

            <MarketClient
                userFirstName={firstName}
                funds={funds}
                navHistory={navHistory || []}
                investments={investments || []}
                alerts={alerts || []}
            />
        </div>
    );
}
