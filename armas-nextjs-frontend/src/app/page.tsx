"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
    Globe,
    ChevronDown,
    ArrowRight,
    FileSpreadsheet,
    ShieldCheck,
    BarChart2,
    CheckCircle2,
    Target,
    Eye,
    Landmark,
    BadgeCheck,
    Activity,
    BriefcaseBusiness,
    CalendarRange,
    ClipboardList,
    ScanSearch,
    Sparkles,
} from "lucide-react";
import { getMessages, type Lang } from "@/lib/messages";
import { NoticeFeed } from "@/components/NoticeFeed";

const LANGS = [
    { code: "en" as Lang, label: "English", flag: "EN" },
    { code: "am" as Lang, label: "Amharic", flag: "AM" },
    { code: "om" as Lang, label: "Afaan Oromoo", flag: "OM" },
];

const serviceHighlightIcons = [FileSpreadsheet, Activity, BadgeCheck];
const planCardIcons = [Target, CalendarRange];
const planFeatureIcons = [ScanSearch, ClipboardList, CheckCircle2];

export default function HomePage() {
    const router = useRouter();
    const [lang, setLang] = useState<Lang>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const s = localStorage.getItem("armas_lang") as Lang | null;
        if (s && (s === "en" || s === "am" || s === "om")) setLang(s);

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
    const cur = LANGS.find((l) => l.code === lang)!;

    return (
        <div className="min-h-screen bg-[var(--surface-0)] text-[var(--ink-900)]">
            <div className="border-b border-white/10 bg-[linear-gradient(90deg,#032a24_0%,#064e3b_45%,#0b6a61_100%)] text-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div className="flex items-center gap-3 text-emerald-50/90">
                        <Landmark className="h-4 w-4" />
                        <span className="font-semibold tracking-[0.18em] uppercase">{t.bureauName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100/80">
                        <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_0_6px_rgba(252,211,77,0.14)]" />
                        <span>{t.platformTagline}</span>
                    </div>
                </div>
            </div>

            <header className="sticky top-0 z-50 border-b border-black/5 bg-white/86 backdrop-blur-2xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(160deg,#053f33_0%,#0f766e_100%)] shadow-[0_18px_40px_rgba(2,86,67,0.28)]">
                            <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <p className="font-display text-2xl font-black tracking-tight text-[var(--ink-900)]">ARMAS</p>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-500)] sm:text-sm">
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
                                    {LANGS.map((l) => (
                                        <DropdownMenu.Item
                                            key={l.code}
                                            onClick={() => pick(l.code)}
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base outline-none transition ${
                                                lang === l.code
                                                    ? "bg-[var(--brand-50)] font-bold text-[var(--brand-800)]"
                                                    : "text-[var(--ink-700)] hover:bg-[var(--surface-2)]"
                                            }`}
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
                <section className="relative overflow-hidden bg-[linear-gradient(135deg,#032c28_0%,#07453d_32%,#0a5c56_68%,#10354a_100%)] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(253,224,71,0.16),transparent_18%),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:auto,auto,96px_96px,96px_96px]" />
                    <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
                    <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-200/12 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
                        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-50/90 backdrop-blur">
                                    <BriefcaseBusiness className="h-4 w-4" />
                                    {t.departmentLabel}
                                </div>

                                <h1 className="mt-6 font-display text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
                                    {t.heroHeadlinePro}
                                </h1>

                                <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#f8fafc] text-[var(--ink-900)] shadow-[0_28px_60px_rgba(6,95,70,0.18)]">
                                    <div className="border-b border-[var(--line-soft)] px-6 py-5 sm:px-8">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--brand-700)]">
                                                    {t.portalTitle}
                                                </p>
                                                <p className="mt-2 text-base leading-7 text-[var(--ink-600)]">
                                                    {t.portalNote}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                                                {t.portalOnline}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 px-6 py-6 sm:px-8">
                                        {t.portalServices.map((service: string, index: number) => (
                                            <div
                                                key={service}
                                                className="flex items-center gap-3 rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3 text-base font-semibold shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
                                            >
                                                {index === 0 ? (
                                                    <ShieldCheck className="h-5 w-5 text-[var(--brand-700)]" />
                                                ) : index === 1 ? (
                                                    <Sparkles className="h-5 w-5 text-[var(--brand-700)]" />
                                                ) : (
                                                    <CheckCircle2 className="h-5 w-5 text-[var(--brand-700)]" />
                                                )}
                                                <span>{service}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur-md sm:grid-cols-3 lg:grid-cols-1 lg:self-stretch lg:p-6">
                                {(t.aboutStats || []).map((stat: { value: string; label: string }) => (
                                    <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-black/10 px-5 py-5">
                                        <p className="font-display text-4xl font-black text-white">{stat.value}</p>
                                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100/78">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <NoticeFeed />

                <section className="bg-white py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8">
                        <div className="mb-12 text-center">
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--brand-700)]">
                                {t.strategicDirection}
                            </p>
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

                <section className="bg-white py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--brand-700)]">{t.valuesLabel}</p>
                            <h2 className="mt-4 font-display text-5xl font-black tracking-tight text-[var(--ink-900)] sm:text-6xl">
                                Our {t.valuesTitle}
                            </h2>
                            <p className="mt-5 text-lg leading-8 text-[var(--ink-400)]">{t.aboutBodyPro}</p>
                        </div>

                        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {t.values.map((item: any) => (
                                <div
                                    key={item.title}
                                    className="min-h-[250px] border border-slate-200 bg-white px-10 py-14 transition duration-300 hover:border-rose-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
                                >
                                    <h3 className="font-display text-3xl font-black text-[#d94b43] text-center">
                                        {item.title}
                                    </h3>
                                    <p className="mt-8 text-[1.05rem] leading-8 text-slate-500">
                                        {item.body}
                                    </p>
                                </div>
                            ))}
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
                                        );
                                    })}
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
