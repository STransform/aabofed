"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
    Globe,
    ChevronDown,
    ArrowRight,
    FileSpreadsheet,
    ShieldCheck,
    FolderOpen,
    Users,
    BarChart2,
    Lock,
    CheckCircle2,
    Building2,
    Target,
    Eye,
    Star,
    Landmark,
    BadgeCheck,
    Activity,
    BriefcaseBusiness,
    CalendarRange,
    ClipboardList,
    ScanSearch,
} from "lucide-react";
import { getMessages, type Lang } from "@/lib/messages";
import { NoticeFeed } from "@/components/NoticeFeed";

const LANGS = [
    { code: "en" as Lang, label: "English", flag: "EN" },
    { code: "am" as Lang, label: "Amharic", flag: "AM" },
    { code: "om" as Lang, label: "Afaan Oromoo", flag: "OM" },
];

const PUBLIC_STATS_CACHE_KEY = "armas_public_stats_cache";
const PUBLIC_STATS_CACHE_TTL_MS = 5 * 60 * 1000;

const VALUE_COLORS = [
    { bg: "bg-white", border: "border-emerald-100", icon: "text-emerald-700", accent: "bg-emerald-600" },
    { bg: "bg-white", border: "border-amber-100", icon: "text-amber-700", accent: "bg-amber-500" },
    { bg: "bg-white", border: "border-sky-100", icon: "text-sky-700", accent: "bg-sky-600" },
    { bg: "bg-white", border: "border-teal-100", icon: "text-teal-700", accent: "bg-teal-600" },
    { bg: "bg-white", border: "border-emerald-100", icon: "text-emerald-800", accent: "bg-emerald-700" },
    { bg: "bg-white", border: "border-stone-200", icon: "text-stone-700", accent: "bg-stone-700" },
];

const platformMetrics = [
    { key: "organizations", icon: Building2 },
    { key: "users", icon: Users },
];

const serviceHighlightIcons = [FileSpreadsheet, Activity, BadgeCheck];

const planCardIcons = [Target, CalendarRange];
const planFeatureIcons = [ScanSearch, ClipboardList, CheckCircle2];

const ValueIcon = ({ type }: { type: string }) => {
    const cls = "h-6 w-6";
    switch (type) {
        case "shield": return <ShieldCheck className={cls} />;
        case "users": return <Users className={cls} />;
        case "chart": return <BarChart2 className={cls} />;
        case "globe": return <Globe className={cls} />;
        case "check": return <CheckCircle2 className={cls} />;
        case "lock": return <Lock className={cls} />;
        default: return <Star className={cls} />;
    }
};

export default function HomePage() {
    const router = useRouter();
    const [lang, setLang] = useState<Lang>("en");
    const [mounted, setMounted] = useState(false);
    const [dynamicStats, setDynamicStats] = useState<{ [key: string]: string | number }>({
        organizations: "...",
        users: "...",
    });

    useEffect(() => {
        setMounted(true);
        const s = localStorage.getItem("armas_lang") as Lang | null;
        if (s && (s === "en" || s === "am" || s === "om")) setLang(s);

        try {
            const cached = sessionStorage.getItem(PUBLIC_STATS_CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached) as {
                    timestamp: number;
                    data: { [key: string]: string | number };
                };
                if ((Date.now() - parsed.timestamp) < PUBLIC_STATS_CACHE_TTL_MS) {
                    setDynamicStats(parsed.data);
                }
            }
        } catch {
            // Ignore cache parse issues and continue with a fresh fetch.
        }

        const fetchStats = () => {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/transactions/public-stats")
                .then(res => res.json())
                .then(data => {
                    if (data.organizations !== undefined && data.users !== undefined) {
                        setDynamicStats(data);
                        try {
                            sessionStorage.setItem(PUBLIC_STATS_CACHE_KEY, JSON.stringify({
                                timestamp: Date.now(),
                                data,
                            }));
                        } catch {
                            // Ignore storage failures.
                        }
                    }
                })
                .catch(console.error);
        };

        fetchStats();

        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            const idleId = window.requestIdleCallback(() => {
                router.prefetch("/login");
            }, { timeout: 1000 });
            return () => window.cancelIdleCallback(idleId);
        }

        const timeoutId = globalThis.setTimeout(() => {
            router.prefetch("/login");
        }, 200);
        return () => globalThis.clearTimeout(timeoutId);
    }, [router]);

    const pick = (code: Lang) => {
        setLang(code);
        localStorage.setItem("armas_lang", code);
    };

    if (!mounted) return null;

    const t = getMessages(lang).home;
    const cur = LANGS.find(l => l.code === lang)!;

    return (
        <div className="min-h-screen bg-[var(--surface-0)] text-[var(--ink-900)]">
            <div className="border-b border-emerald-900/10 bg-[var(--brand-900)] text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-sm sm:px-8">
                    <div className="flex items-center gap-3 text-emerald-50/90">
                        <Landmark className="h-4 w-4" />
                        <span className="font-semibold tracking-wide">{t.bureauName}</span>
                    </div>
                    <div className="hidden items-center gap-2 text-emerald-100/80 sm:flex">
                        <span className="h-2 w-2 rounded-full bg-amber-300" />
                        <span>{t.platformTagline}</span>
                    </div>
                </div>
            </div>

            <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-900)] via-[var(--brand-700)] to-[var(--brand-600)] shadow-[0_18px_40px_rgba(2,86,67,0.28)]">
                            <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <p className="font-display text-2xl font-black tracking-tight text-[var(--ink-900)]">ARMAS</p>
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--ink-500)]">
                                {t.bureauName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger className="flex items-center gap-2 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-1)] px-4 py-3 text-base font-semibold text-[var(--ink-700)] transition hover:border-[var(--brand-300)] hover:text-[var(--brand-800)]">
                                <Globe className="h-4 w-4" />
                                <span>{cur.flag}</span>
                                <span className="hidden sm:inline">{cur.label}</span>
                                <ChevronDown className="h-4 w-4 text-[var(--ink-400)]" />
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                    align="end"
                                    sideOffset={8}
                                    className="min-w-[180px] rounded-2xl border border-[var(--line-soft)] bg-white p-2 shadow-2xl"
                                >
                                    {LANGS.map(l => (
                                        <DropdownMenu.Item
                                            key={l.code}
                                            onClick={() => pick(l.code)}
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base outline-none transition ${lang === l.code ? "bg-[var(--brand-50)] font-bold text-[var(--brand-800)]" : "text-[var(--ink-700)] hover:bg-[var(--surface-2)]"}`}
                                        >
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-black">
                                                {l.flag}
                                            </span>
                                            {l.label}
                                        </DropdownMenu.Item>
                                    ))}
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>

                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-900)] px-6 py-3 text-base font-bold text-white shadow-[0_16px_30px_rgba(2,86,67,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-700)]"
                        >
                            {t.navLogin}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.24),_transparent_34%),linear-gradient(135deg,#042f2e_0%,#064e3b_35%,#0f766e_100%)] text-white">
                    <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:100px_100px]" />
                    <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
                    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-200/10 blur-3xl" />

                    <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-center lg:py-28">
                        <div className="max-w-3xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-50/90">
                                <BriefcaseBusiness className="h-4 w-4" />
                                {t.departmentLabel}
                            </div>

                            <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                                {t.heroHeadlinePro}
                            </h1>

                            <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/88 sm:text-xl">
                                {t.heroBodyPro}
                            </p>

                            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-lg font-bold text-[var(--brand-900)] shadow-2xl transition hover:-translate-y-0.5 hover:bg-emerald-50"
                                >
                                    <ShieldCheck className="h-5 w-5" />
                                    {t.heroCta}
                                </Link>
                                <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-base font-semibold text-emerald-50/90">
                                    <Lock className="h-5 w-5" />
                                    {t.heroCtaSub}
                                </div>
                            </div>

                            <div className="mt-12 grid gap-4 sm:grid-cols-3">
                                {t.heroHighlights.map((item: { title: string; body: string }, index: number) => {
                                    const Icon = serviceHighlightIcons[index] || BadgeCheck;
                                    return (
                                    <div key={item.title} className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                            <Icon className="h-6 w-6 text-amber-200" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-emerald-50/78">{item.body}</p>
                                    </div>
                                )})}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
                                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-100/70">{t.statsLabel}</p>
                                        <h2 className="mt-2 font-display text-3xl font-bold text-white">{t.readinessTitle}</h2>
                                    </div>
                                    <div className="rounded-2xl bg-amber-300 px-3 py-2 text-sm font-black text-[var(--ink-900)]">{t.liveLabel}</div>
                                </div>

                                <div className="mt-6 grid gap-4">
                                    {platformMetrics.map(({ key, icon: Icon }) => (
                                        <div key={key} className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/70">{t.metricLabels?.[key as keyof typeof t.metricLabels] || key}</p>
                                                    <p className="mt-3 font-display text-4xl font-black text-white">
                                                        {dynamicStats[key] ?? "..."}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-white/10 p-3">
                                                    <Icon className="h-6 w-6 text-amber-200" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-3xl border border-white/10 bg-[#f8fafc] p-6 text-[var(--ink-900)]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--brand-700)]">{t.portalTitle}</p>
                                            <p className="mt-2 text-base leading-7 text-[var(--ink-600)]">{t.portalNote}</p>
                                        </div>
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                                            {t.portalOnline}
                                        </span>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {t.portalServices.map((service: string) => (
                                            <div key={service} className="flex items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-base font-semibold">
                                                <CheckCircle2 className="h-5 w-5 text-[var(--brand-700)]" />
                                                <span>{service}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-b border-[var(--line-soft)] bg-[var(--surface-1)] py-16 sm:py-20">
                    <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--brand-700)]">{t.aboutLabel}</p>
                            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[var(--ink-900)] sm:text-5xl">
                                {t.aboutTitlePro}
                            </h2>
                            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--ink-600)]">
                                {t.aboutBodyPro}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                            {(t.aboutStats || []).map((stat: { value: string; label: string }) => (
                                <div key={stat.label} className="rounded-3xl border border-[var(--line-soft)] bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
                                    <p className="font-display text-4xl font-black text-[var(--brand-800)]">{stat.value}</p>
                                    <p className="mt-2 text-base font-semibold text-[var(--ink-600)]">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <NoticeFeed />

                <section className="bg-white py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8">
                        <div className="mb-12 text-center">
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--brand-700)]">{t.strategicDirection}</p>
                            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[var(--ink-900)] sm:text-5xl">
                                {t.purposeTitlePro}
                            </h2>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-2">
                            <div className="rounded-[2rem] bg-[linear-gradient(160deg,#064e3b_0%,#065f46_60%,#0f766e_100%)] p-10 text-white shadow-[0_28px_70px_rgba(6,78,59,0.22)]">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
                                    <Eye className="h-8 w-8 text-amber-200" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-100/75">{t.visionLabel}</p>
                                <h3 className="mt-3 font-display text-3xl font-black">{t.visionTitle}</h3>
                                <p className="mt-5 text-lg leading-8 text-emerald-50/88">{t.visionBody}</p>
                            </div>

                            <div className="rounded-[2rem] bg-[linear-gradient(160deg,#111827_0%,#1f2937_55%,#374151_100%)] p-10 text-white shadow-[0_28px_70px_rgba(17,24,39,0.22)]">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
                                    <Target className="h-8 w-8 text-emerald-200" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-300">{t.missionLabel}</p>
                                <h3 className="mt-3 font-display text-3xl font-black">{t.missionTitle}</h3>
                                <p className="mt-5 text-lg leading-8 text-slate-200">{t.missionBody}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[var(--surface-1)] py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8">
                        <div className="mb-12 text-center">
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--brand-700)]">{t.valuesLabel}</p>
                            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[var(--ink-900)] sm:text-5xl">
                                {t.valuesTitle}
                            </h2>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {t.values.map((v: any, i: number) => {
                                const c = VALUE_COLORS[i % VALUE_COLORS.length];
                                return (
                                    <div
                                        key={i}
                                        className={`${c.bg} rounded-[1.75rem] border ${c.border} p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(15,23,42,0.1)]`}
                                    >
                                        <div className="mb-6 flex items-center gap-4">
                                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] ${c.icon}`}>
                                                <ValueIcon type={v.icon} />
                                            </div>
                                            <div className={`h-2 w-10 rounded-full ${c.accent}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight text-[var(--ink-900)]">{v.title}</h3>
                                        <p className="mt-4 text-lg leading-8 text-[var(--ink-600)]">{v.body}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-[linear-gradient(135deg,#032a26_0%,#064e3b_42%,#0f766e_100%)] py-20 text-white sm:py-24">
                    <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:72px_72px]" />
                    <div className="absolute -right-10 top-10 h-56 w-56 rounded-full bg-amber-200/10 blur-3xl" />
                    <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-emerald-200/10 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
                        <div className="mb-12 max-w-4xl">
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-100/80">{t.capLabel}</p>
                            <h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">{t.trustTitle}</h2>
                            <p className="mt-5 max-w-3xl text-lg leading-8 text-emerald-50/82">
                                {t.planShowcaseIntro}
                            </p>
                        </div>

                        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                            <div className="grid gap-6">
                                {t.planCards.map((plan: any, index: number) => {
                                    const Icon = planCardIcons[index] || ClipboardList;
                                    return (
                                        <div
                                            key={plan.title}
                                            className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.07))] p-8 shadow-[0_28px_70px_rgba(0,0,0,0.16)] backdrop-blur-xl"
                                        >
                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="max-w-2xl">
                                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-50/90">
                                                        <Icon className="h-4 w-4 text-amber-200" />
                                                        {plan.badge}
                                                    </div>
                                                    <h3 className="font-display text-3xl font-black tracking-tight text-white">
                                                        {plan.title}
                                                    </h3>
                                                    <p className="mt-4 text-lg leading-8 text-emerald-50/82">
                                                        {plan.summary}
                                                    </p>
                                                </div>

                                                <div className="min-w-[170px] rounded-[1.6rem] border border-emerald-200/15 bg-[#f8fafc] p-5 text-[var(--ink-900)] shadow-[0_16px_35px_rgba(15,23,42,0.16)]">
                                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--brand-700)]">
                                                        {plan.metaLabel}
                                                    </p>
                                                    <p className="mt-3 font-display text-3xl font-black text-[var(--brand-900)]">
                                                        {plan.metaValue}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-7 grid gap-4 md:grid-cols-3">
                                                {plan.points.map((point: string, pointIndex: number) => {
                                                    const FeatureIcon = planFeatureIcons[pointIndex] || CheckCircle2;
                                                    return (
                                                        <div
                                                            key={point}
                                                            className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5"
                                                        >
                                                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                                                                <FeatureIcon className="h-5 w-5 text-amber-200" />
                                                            </div>
                                                            <p className="text-base font-semibold leading-7 text-emerald-50/90">
                                                                {point}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(3,7,18,0.22),rgba(15,23,42,0.3))] p-7 shadow-[0_30px_75px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-100/75">
                                            {t.planTimelineEyebrow}
                                        </p>
                                        <h3 className="mt-3 font-display text-3xl font-black text-white">
                                            {t.planTimelineTitle}
                                        </h3>
                                    </div>
                                    <div className="rounded-2xl bg-amber-300 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--ink-900)]">
                                        {t.liveLabel}
                                    </div>
                                </div>

                                <p className="mt-5 text-base leading-7 text-emerald-50/78">
                                    {t.planTimelineBody}
                                </p>

                                <div className="mt-8 space-y-4">
                                    {t.planTimeline.map((item: any) => (
                                        <div
                                            key={item.phase}
                                            className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <h4 className="text-lg font-bold text-white">{item.phase}</h4>
                                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-50/88">
                                                    {item.period}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-base leading-7 text-emerald-50/78">
                                                {item.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {t.planVisibilityTags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-emerald-200/20 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50/92"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8">
                        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_48%,#f0fdf4_100%)] shadow-[0_24px_60px_rgba(2,86,67,0.08)]">
                            <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--brand-700)]">{t.accessLabel}</p>
                                    <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[var(--ink-900)] sm:text-5xl">
                                        {t.ctaBannerHeadline}
                                    </h2>
                                    <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-600)]">
                                        {t.ctaBannerBody}
                                    </p>
                                    <Link
                                        href="/login"
                                        className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[var(--brand-900)] px-8 py-4 text-lg font-bold text-white shadow-[0_16px_30px_rgba(2,86,67,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-700)]"
                                    >
                                        <ShieldCheck className="h-5 w-5" />
                                        {t.ctaBannerBtn}
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </div>

                                <div className="grid gap-4">
                                    {t.heroHighlights.map((item: { title: string; body: string }, index: number) => {
                                        const Icon = serviceHighlightIcons[index] || BadgeCheck;
                                        return (
                                        <div key={item.title} className="rounded-3xl border border-[var(--line-soft)] bg-white p-5">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--brand-800)]">
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-[var(--ink-900)]">{item.title}</h3>
                                                    <p className="mt-2 text-base leading-7 text-[var(--ink-600)]">{item.body}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-[var(--brand-950)] py-10 text-sm text-emerald-50/70">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                            <BarChart2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-display text-xl font-black text-white">ARMAS</p>
                            <p className="text-sm text-emerald-50/60">{t.bureauName}</p>
                        </div>
                    </div>
                    <p className="text-center text-base text-emerald-50/65">{t.footer}</p>
                </div>
            </footer>
        </div>
    );
}
