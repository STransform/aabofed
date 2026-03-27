'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { getMessages, type Lang } from '@/lib/messages';
import { preloadTranslations } from '@/hooks/useTranslation';
import { Building2, Users, FileText, CalendarRange, TrendingUp, BadgeCheck } from 'lucide-react';

const EMPTY_GLOBAL_STATS = {
    totalOrganizations: 0,
    totalReportTypes: 0,
    totalUsers: 0,
};

const COLORS = ['#0f766e', '#d97706'];

export default function Dashboard() {
    const { isAuthenticated, userRole } = useAuth();

    const [globalStats, setGlobalStats] = useState(EMPTY_GLOBAL_STATS);
    const [budgetYears, setBudgetYears] = useState<any[]>([]);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState('');
    const [reportTypeStats, setReportTypeStats] = useState<any>({});

    const [lang, setLang] = useState<Lang>('en');
    useEffect(() => {
        const s = localStorage.getItem('armas_lang') as Lang | null;
        if (s && (s === 'en' || s === 'am' || s === 'om')) setLang(s);
        const handler = () => {
            const v = localStorage.getItem('armas_lang') as Lang | null;
            if (v && (v === 'en' || v === 'am' || v === 'om')) setLang(v);
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    useEffect(() => {
        preloadTranslations(lang);
        preloadTranslations('en');
    }, [lang]);
    const msgs = getMessages(lang);

    const [globalLoading, setGlobalLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        let isMounted = true;
        setGlobalLoading(true);

        const fetchGlobalData = async () => {
            try {
                const [statsRes, yearsRes] = await Promise.all([
                    axiosInstance.get('/transactions/global-stats').catch(() => ({ data: EMPTY_GLOBAL_STATS })),
                    axiosInstance.get('/transactions/budget-years').catch(() => ({ data: [] }))
                ]);

                if (isMounted) {
                    setGlobalStats(statsRes.data || EMPTY_GLOBAL_STATS);

                    const years = Array.isArray(yearsRes.data) ? yearsRes.data : [];
                    setBudgetYears(years);
                    if (years.length > 0) {
                        setSelectedFiscalYear(years[0].fiscalYear);
                    }
                }
            } catch (err: any) {
                if (isMounted) setError('Failed to load global data: ' + err.message);
            } finally {
                if (isMounted) setGlobalLoading(false);
            }
        };

        fetchGlobalData();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!selectedFiscalYear || !isAuthenticated) return;

        let isMounted = true;
        setStatsLoading(true);

        axiosInstance.get(`/transactions/dashboard-stats?fiscalYear=${selectedFiscalYear}`)
            .then((res) => {
                if (isMounted) {
                    setReportTypeStats(res.data?.reportTypeStats || {});
                    setError(null);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setReportTypeStats({});
                    let msg = 'Failed to load specific stats.';
                    if (err.response?.status === 404) msg = `No statistics available for ${selectedFiscalYear}`;
                    if (err.response?.status === 403) msg = 'Permission denied.';
                    setError(msg);
                }
            })
            .finally(() => {
                if (isMounted) setStatsLoading(false);
            });

        return () => { isMounted = false; };
    }, [selectedFiscalYear, isAuthenticated]);

    if (!isAuthenticated) return null;

    const statCards = [
        {
            title: msgs.dashboard.totalOrgs,
            value: globalStats.totalOrganizations,
            icon: Building2,
            tone: 'from-emerald-700 to-emerald-600',
            surface: 'bg-emerald-50',
            text: 'text-emerald-900',
        },
        {
            title: msgs.dashboard.totalReportTypes,
            value: globalStats.totalReportTypes,
            icon: FileText,
            tone: 'from-amber-600 to-amber-500',
            surface: 'bg-amber-50',
            text: 'text-amber-900',
        },
        {
            title: msgs.dashboard.activeUsers,
            value: globalStats.totalUsers,
            icon: Users,
            tone: 'from-sky-700 to-sky-600',
            surface: 'bg-sky-50',
            text: 'text-sky-900',
        },
    ];

    if (globalLoading) {
        return (
            <div className="flex h-screen overflow-hidden bg-[var(--surface-1)]">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <div className="flex flex-1 items-center justify-center">
                        <div className="rounded-[2rem] border border-[var(--line-soft)] bg-white px-10 py-12 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                            <p className="font-display text-3xl font-black tracking-tight text-[var(--ink-900)]">{msgs.dashboard.loadingTitle}</p>
                            <p className="mt-3 text-lg text-[var(--ink-500)]">{msgs.dashboard.loadingBody}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--surface-1)]">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-[1440px] px-6 py-8">
                        <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#042f2e_0%,#065f46_48%,#0f766e_100%)] px-8 py-8 text-white shadow-[0_28px_80px_rgba(6,95,70,0.24)]">
                            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-100/80">{msgs.dashboard.execOverview}</p>
                                    <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
                                        {msgs.dashboard.welcome}, {userRole}
                                    </h1>
                                    <p className="mt-5 max-w-3xl text-lg leading-8 text-emerald-50/85">
                                        {msgs.dashboard.heroBody}
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                                                <TrendingUp className="h-6 w-6 text-amber-200" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-100/70">{msgs.dashboard.monitoringFocus}</p>
                                                <p className="text-lg font-bold text-white">{msgs.dashboard.fiscalAnalysis}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                                                <BadgeCheck className="h-6 w-6 text-emerald-100" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-100/70">{msgs.dashboard.statusLabel}</p>
                                                <p className="text-lg font-bold text-white">{msgs.dashboard.liveAnalytics}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {error && budgetYears.length === 0 && (
                            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-base font-semibold text-rose-700">
                                {error}
                            </div>
                        )}

                        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <div className="grid gap-6 md:grid-cols-3">
                                {statCards.map(({ title, value, icon: Icon, tone, surface, text }) => (
                                    <div
                                        key={title}
                                        className="overflow-hidden rounded-[1.75rem] border border-[var(--line-soft)] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]"
                                    >
                                        <div className={`h-2 w-full bg-gradient-to-r ${tone}`} />
                                        <div className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--ink-400)]">{title}</p>
                                                    <p className="mt-4 font-display text-5xl font-black text-[var(--ink-900)]">{value}</p>
                                                </div>
                                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${surface}`}>
                                                    <Icon className={`h-7 w-7 ${text}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-[1.75rem] border border-[var(--line-soft)] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--brand-700)]">{msgs.dashboard.fiscalAnalysis}</p>
                                        <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-[var(--ink-900)]">
                                            {msgs.dashboard.selectorTitle}
                                        </h2>
                                        <p className="mt-3 text-base leading-7 text-[var(--ink-500)]">{msgs.dashboard.fiscalDesc}</p>
                                    </div>
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--brand-800)]">
                                        <CalendarRange className="h-7 w-7" />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em] text-[var(--ink-500)]">
                                        {msgs.dashboard.selectYear}
                                    </label>
                                    <select
                                        className="block w-full rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-1)] px-4 py-4 text-lg font-semibold text-[var(--ink-800)] shadow-sm outline-none transition focus:border-[var(--brand-400)] focus:ring-4 focus:ring-[var(--brand-100)]"
                                        value={selectedFiscalYear}
                                        onChange={(e) => setSelectedFiscalYear(e.target.value)}
                                        disabled={budgetYears.length === 0 || statsLoading}
                                    >
                                        {budgetYears.length === 0 && <option value="">No years found</option>}
                                        {budgetYears.map((b_year) => (
                                            <option key={b_year.id} value={b_year.fiscalYear}>
                                                {b_year.fiscalYear} ({b_year.startDate} - {b_year.endDate})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="mt-8">
                            {statsLoading ? (
                                <div className="flex h-64 items-center justify-center rounded-[2rem] border border-[var(--line-soft)] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
                                    <p className="text-xl font-semibold text-[var(--ink-500)]">Loading stats for {selectedFiscalYear}...</p>
                                </div>
                            ) : error ? (
                                <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-center text-base font-semibold text-amber-800">
                                    {error}
                                </div>
                            ) : Object.keys(reportTypeStats).length === 0 ? (
                                <div className="rounded-[2rem] border border-dashed border-[var(--line-soft)] bg-white px-6 py-16 text-center shadow-[0_18px_42px_rgba(15,23,42,0.04)]">
                                    <p className="font-display text-3xl font-black text-[var(--ink-900)]">{msgs.dashboard.emptyTitle}</p>
                                    <p className="mt-3 text-lg text-[var(--ink-500)]">{msgs.dashboard.emptyBody}</p>
                                </div>
                            ) : (
                                <div className="grid gap-8">
                                    {Object.entries(reportTypeStats).map(([reportType, counts]: any, index) => {
                                        const chartData = [
                                            { name: 'Senders', value: counts.senders || 0 },
                                            { name: 'Non-Senders', value: counts.nonSenders || 0 }
                                        ];

                                        const total = chartData.reduce((sum, item) => sum + item.value, 0);

                                        return (
                                            <article
                                                key={index}
                                                className="overflow-hidden rounded-[2rem] border border-[var(--line-soft)] bg-white shadow-[0_22px_48px_rgba(15,23,42,0.06)]"
                                            >
                                                <div className="border-b border-[var(--line-soft)] bg-[linear-gradient(180deg,#f8fffc_0%,#f5faf7_100%)] px-6 py-5">
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                        <div>
                                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--brand-700)]">{msgs.dashboard.complianceOverview}</p>
                                                            <h3 className="mt-2 font-display text-3xl font-black tracking-tight text-[var(--ink-900)]">
                                                                {reportType}
                                                            </h3>
                                                        </div>
                                                        <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3">
                                                            <span className="text-sm font-black uppercase tracking-[0.18em] text-[var(--ink-400)]">{msgs.dashboard.totalRecords}</span>
                                                            <span className="font-display text-3xl font-black text-[var(--brand-800)]">{total}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr]">
                                                    <div className="rounded-[1.5rem] border border-[var(--line-soft)] bg-[var(--surface-1)] p-5">
                                                        <div className="mb-5">
                                                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--ink-400)]">{msgs.dashboard.barComparison}</p>
                                                        </div>
                                                        <div className="h-80">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 0 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe5df" />
                                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 14, fontWeight: 600 }} />
                                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                                                                    <RechartsTooltip
                                                                        cursor={{ fill: '#ecfdf5' }}
                                                                        contentStyle={{ borderRadius: '18px', border: '1px solid #d7e4db', boxShadow: '0 18px 30px rgba(15, 23, 42, 0.08)' }}
                                                                    />
                                                                    <Bar dataKey="value" radius={[14, 14, 0, 0]}>
                                                                        {chartData.map((entry, idx) => (
                                                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                                                        ))}
                                                                    </Bar>
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-6">
                                                        <div className="rounded-[1.5rem] border border-[var(--line-soft)] bg-[var(--surface-1)] p-5">
                                                            <div className="mb-5">
                                                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--ink-400)]">{msgs.dashboard.distribution}</p>
                                                            </div>
                                                            <div className="h-72">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <PieChart>
                                                                        <Pie
                                                                            data={chartData}
                                                                            cx="50%"
                                                                            cy="50%"
                                                                            innerRadius={58}
                                                                            outerRadius={98}
                                                                            paddingAngle={5}
                                                                            dataKey="value"
                                                                        >
                                                                            {chartData.map((entry, idx) => (
                                                                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                                                            ))}
                                                                        </Pie>
                                                                        <RechartsTooltip contentStyle={{ borderRadius: '18px', border: '1px solid #d7e4db', boxShadow: '0 18px 30px rgba(15, 23, 42, 0.08)' }} />
                                                                        <Legend verticalAlign="bottom" height={36} />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            {chartData.map((item, idx) => (
                                                                <div key={item.name} className="rounded-[1.25rem] border border-[var(--line-soft)] bg-white p-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                                        <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--ink-400)]">{item.name}</p>
                                                                    </div>
                                                                    <p className="mt-3 font-display text-4xl font-black text-[var(--ink-900)]">{item.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
