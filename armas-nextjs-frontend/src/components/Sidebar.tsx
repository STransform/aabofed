'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Building2, Users, FileText, Calculator, Shell, Lock, CheckCircle,
    XOctagon, Clock, Edit3, UploadCloud, DownloadCloud, ClipboardList,
    LayoutDashboard, Filter, ShieldCheck, Briefcase, ChevronRight,
    UserCog, Languages, BadgeCheck
} from 'lucide-react';
import { getMessages, type Lang } from '@/lib/messages';

export function Sidebar() {
    const { userRole } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const prefetchedRoutesRef = useRef<Set<string>>(new Set());

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

    const msgs = getMessages(lang).sidebar;
    const s = msgs.sections;
    const it = msgs.items;

    const isAdmin = userRole === 'ADMIN';
    const isUser = userRole === 'USER';
    const isSeniorAuditor = userRole === 'SENIOR_AUDITOR';
    const isArchiver = userRole === 'ARCHIVER';
    const isApprover = userRole === 'APPROVER';
    const isManager = userRole === 'MANAGER';

    const commonItems = [{ name: it.dashboard, href: '/dashboard', icon: LayoutDashboard }];

    const userItems = [
        { name: it.outgoingReports, href: '/buttons/file-upload', icon: UploadCloud },
        { name: it.incomingLetters, href: '/buttons/letter-download', icon: DownloadCloud },
        { name: it.fileHistory, href: '/file-history', icon: ClipboardList },
    ];

    const managerItems = [
        { name: it.viewLetters, href: '/transactions/letters', icon: FileText },
    ];

    const adminManageItems = [
        { name: it.organizations, href: '/buttons/organizations', icon: Building2 },
        { name: it.directorates, href: '/buttons/directorates', icon: Briefcase },
        { name: it.reportType, href: '/buttons/documents', icon: FileText },
        { name: it.budgetYear, href: '/buttons/budgetyear', icon: Calculator },
    ];

    const adminUserItems = [
        { name: it.users, href: '/buttons/users', icon: Users },
        { name: it.roles, href: '/buttons/roles', icon: Shell },
        { name: it.assignRole, href: '/buttons/assign', icon: UserCog },
        { name: it.assignPrivileges, href: '/buttons/assign-privileges', icon: Lock },
        { name: it.translations, href: '/buttons/translations', icon: Languages },
        { name: it.notices || 'Notices', href: '/transactions/notices', icon: FileText },
    ];

    const uploadorgItems = isApprover ? [
        { name: it.uploadToOrganizations || 'Upload to Organizations', href: '/transactions/upload-to-organizations', icon: UploadCloud },
        { name: it.notices || 'Notices', href: '/transactions/notices', icon: FileText }
    ] : [];

    const archiverItems = isArchiver ? [
        { name: it.incomingReports, href: '/buttons/file-download', icon: DownloadCloud },
        { name: it.approvedReports, href: '/transactions/approved-reports', icon: CheckCircle },
        { name: it.pendingReports, href: '/transactions/pending-reports', icon: ClipboardList },
    ] : [];

    const auditorApproverItems = isSeniorAuditor || isApprover ? [
        { name: it.assignedTasks, href: '/transactions/auditor-tasks', icon: ClipboardList },
        { name: it.rejectedReports, href: '/transactions/rejected-reports', icon: XOctagon },
        { name: it.approvedReports, href: '/transactions/approved-reports', icon: CheckCircle },
        { name: it.underReview, href: '/transactions/under-review-reports', icon: Clock },
        { name: it.correctedReports, href: '/transactions/corrected-reports', icon: Edit3 },
    ] : [];

    const advancedFiltersItem = isAdmin || isApprover || isArchiver || isSeniorAuditor ? [
        { name: it.advancedFilters, href: '/transactions/advanced-filters', icon: Filter }
    ] : [];

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
    const prefetchRoute = useCallback((href: string) => {
        if (prefetchedRoutesRef.current.has(href)) return;
        prefetchedRoutesRef.current.add(href);
        router.prefetch(href);
    }, [router]);

    const renderSection = (title: string, items: { name: string; href: string; icon: any }[]) => {
        if (items.length === 0) return null;
        return (
            <section className="mb-7">
                <div className="mb-3 px-4">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-100/75">
                        {title}
                    </p>
                </div>
                <ul className="space-y-1.5">
                    {items.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    prefetch={false}
                                    onMouseEnter={() => prefetchRoute(item.href)}
                                    onFocus={() => prefetchRoute(item.href)}
                                    className={`group mx-3 flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 ${active
                                        ? 'border border-white/80 bg-white text-[var(--brand-800)] shadow-[0_18px_30px_rgba(0,0,0,0.18)]'
                                        : 'border border-white/10 bg-white/10 text-white hover:border-white/20 hover:bg-white/14 hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${active ? 'bg-emerald-50 ring-1 ring-emerald-100' : 'bg-white/12'}`}>
                                            <Icon className={`h-5 w-5 ${active ? 'text-[var(--brand-800)]' : 'text-white'}`} />
                                        </div>
                                        <span className="leading-5">{item.name}</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition ${active ? 'translate-x-0.5 text-[var(--brand-800)]' : 'text-emerald-100/80 group-hover:translate-x-0.5 group-hover:text-white'}`} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </section>
        );
    };

    return (
        <aside data-armas-shell="true" className="flex h-screen w-[320px] flex-col overflow-hidden border-r border-emerald-950/20 bg-[linear-gradient(180deg,#064e3b_0%,#065f46_46%,#0f766e_100%)] shadow-[18px_0_48px_rgba(15,23,42,0.18)]">
            <div className="border-b border-white/10 px-5 py-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 shadow-[0_18px_30px_rgba(6,95,70,0.2)]">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <p className="font-display text-2xl font-black tracking-tight text-white">ARMAS</p>
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-100/80">{msgs.logoSub}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-1 py-5">
                {renderSection(s.main, commonItems)}
                {isUser && renderSection(s.myActions, userItems)}
                {isManager && renderSection(s.managerActions, managerItems)}

                {isAdmin && (
                    <>
                        {renderSection(s.manageOrganization, adminManageItems)}
                        {renderSection(s.manageAccess, adminUserItems)}
                    </>
                )}

                {(isArchiver || isSeniorAuditor || isApprover) && renderSection(
                    s.reportsTransactions,
                    [...archiverItems, ...auditorApproverItems]
                )}

                {uploadorgItems.length > 0 && renderSection(s.organizationActions, uploadorgItems)}
                {advancedFiltersItem.length > 0 && renderSection(s.reporting, advancedFiltersItem)}
            </nav>

            <div className="border-t border-white/10 px-5 py-4">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white">
                        <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{msgs.integrityTitle}</p>
                        <p className="text-xs text-emerald-100/75">{msgs.footer}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
