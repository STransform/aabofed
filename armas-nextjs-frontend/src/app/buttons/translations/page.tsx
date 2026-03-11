"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Edit, Trash2, Eye, Languages, Home, ChevronRight, FileText, Database, FileJson, AlertCircle, CheckCircle2, ArrowLeft, Save, Globe, RefreshCw } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from '@/hooks/useTranslation';
import axiosInstance from "../../../lib/axios";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { flattenMessages } from "@/lib/messages";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface LangStats {
    code: string;
    name: string;
    nativeName: string;
    totalKeys: number;
    translated: number;
    untranslated: number;
    progress: number;
}

interface TranslationRow {
    key: string;
    en: string;
    target: string;
    isDirty: boolean;
    source: "static" | "dynamic";
}

type FilterType = "all" | "untranslated" | "translated";

const LANGUAGES: Record<string, { name: string; nativeName: string; flag: string }> = {
    am: { name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
    om: { name: "Afaan Oromoo", nativeName: "Afaan Oromoo", flag: "🇪🇹" },
};

// ──────────────────────────────────────────────
// Progress bar component
// ──────────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
    const color =
        value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
    return (
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
                className={`h-2 rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

// ──────────────────────────────────────────────
// Level 1 — Language Selection Page
// ──────────────────────────────────────────────
function LanguageSelectionView({ onSelect }: { onSelect: (lang: string) => void }) {
    const [stats, setStats] = useState<LangStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const [enStaticRaw, enDynamicRes] = await Promise.all([
                fetch('/api/messages?lang=en').then(r => r.json()),
                axiosInstance.get('/transactions/translations/dynamic', { params: { lang: 'en' } })
            ]);

            const enStatic = flattenMessages(enStaticRaw);
            const enDynamic = enDynamicRes.data || {};

            // Only count dynamic keys that are NOT already in static
            const enDynamicKeys = Object.keys(enDynamic).filter(k => !(k in enStatic));
            const enStaticKeys = Object.keys(enStatic);
            const totalKeys = enDynamicKeys.length + enStaticKeys.length;

            const newStats: LangStats[] = [];

            for (const code of Object.keys(LANGUAGES)) {
                const [targetStaticRaw, targetDynamicRes] = await Promise.all([
                    fetch(`/api/messages?lang=${code}`).then(r => r.json()),
                    axiosInstance.get('/transactions/translations/dynamic', { params: { lang: code } })
                ]);

                const targetStatic = flattenMessages(targetStaticRaw);
                const targetDynamic = targetDynamicRes.data || {};

                let translatedCount = 0;

                enStaticKeys.forEach(key => {
                    const val = targetStatic[key];
                    const enVal = enStatic[key];
                    if (val && val.trim() !== '' && val !== enVal) translatedCount++;
                });

                enDynamicKeys.forEach(key => {
                    const val = targetDynamic[key];
                    const enVal = enDynamic[key];
                    if (val && val.trim() !== '' && val !== enVal) translatedCount++;
                });

                const untranslatedCount = totalKeys - translatedCount;
                const progress = totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0;

                newStats.push({
                    code,
                    name: LANGUAGES[code].name,
                    nativeName: LANGUAGES[code].nativeName,
                    totalKeys,
                    translated: translatedCount,
                    untranslated: untranslatedCount,
                    progress
                });
            }

            setStats(newStats);
        } catch (err) {
            console.error("Failed to load language stats", err);
            setError("Failed to load translation statistics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500 flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Loading language statistics...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary">
                            <Languages size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Translation Management</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Manage application strings for all supported languages
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                <Home size={14} />
                <span>Home</span>
                <ChevronRight size={14} />
                <span className="text-slate-900 font-medium">Language Selection</span>
            </nav>

            {error && (
                <div className="p-4 rounded-lg flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Available Languages
                    </h2>
                </div>

                <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Language</span>
                    <span>Progress</span>
                    <span>Translated</span>
                    <span>Untranslated</span>
                    <span>Total Keys</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {stats.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => onSelect(lang.code)}
                            className="w-full text-left px-6 py-5 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{LANGUAGES[lang.code]?.flag}</span>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                            {lang.name}
                                        </div>
                                        <div className="text-xs text-slate-500">{lang.nativeName}</div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 pr-8">
                                    <ProgressBar value={lang.progress} />
                                    <span className={`text-xs font-bold ${lang.progress >= 80 ? "text-emerald-600" : lang.progress >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                        {lang.progress}%
                                    </span>
                                </div>
                                <span className="text-emerald-600 font-semibold">{lang.translated}</span>
                                <span className="text-red-500 font-semibold">{lang.untranslated}</span>
                                <span className="text-slate-600">{lang.totalKeys}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Level 2 — Per-Language Editor (Rosetta Style)
// ──────────────────────────────────────────────
function TranslationEditorView({
    langCode,
    onBack,
}: {
    langCode: string;
    onBack: () => void;
}) {
    const langMeta = LANGUAGES[langCode] || { name: langCode, nativeName: langCode, flag: "🌐" };

    const [rows, setRows] = useState<TranslationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Load translations
    const loadTranslations = useCallback(() => {
        setLoading(true);
        Promise.all([
            fetch('/api/messages?lang=en').then(r => r.json()),
            axiosInstance.get('/transactions/translations/dynamic', { params: { lang: 'en' } }),
            fetch(`/api/messages?lang=${langCode}`).then(r => r.json()),
            axiosInstance.get('/transactions/translations/dynamic', { params: { lang: langCode } }),
        ]).then(([enStaticRaw, enDynamicRes, targetStaticRaw, targetDynamicRes]) => {
            const enStatic = flattenMessages(enStaticRaw);
            const enDynamic = enDynamicRes.data || {};
            const targetStatic = flattenMessages(targetStaticRaw);
            const targetDynamic = targetDynamicRes.data || {};

            const parsed: TranslationRow[] = [];

            // Static keys from JSON files
            Object.keys(enStatic).forEach(key => {
                parsed.push({
                    key,
                    en: enStatic[key] || "",
                    target: targetStatic[key] || "",
                    isDirty: false,
                    source: "static"
                });
            });

            // Dynamic keys from DB
            Object.keys(enDynamic).forEach(key => {
                if (!enStatic[key]) {
                    parsed.push({
                        key,
                        en: enDynamic[key] || "",
                        target: targetDynamic[key] || "",
                        isDirty: false,
                        source: "dynamic"
                    });
                }
            });

            // Sort by untranslated first, then alphabetically
            parsed.sort((a, b) => {
                const aTranslated = a.target.trim() !== "" && a.target !== a.en;
                const bTranslated = b.target.trim() !== "" && b.target !== b.en;
                if (!aTranslated && bTranslated) return -1;
                if (aTranslated && !bTranslated) return 1;
                return a.key.localeCompare(b.key);
            });

            setRows(parsed);
            setLoading(false);
        }).catch(() => {
            setStatus({ type: "error", text: "Failed to load translations." });
            setLoading(false);
        });
    }, [langCode]);

    useEffect(() => {
        loadTranslations();
    }, [loadTranslations]);

    const handleEdit = useCallback((key: string, value: string) => {
        setRows((prev) =>
            prev.map((r) => (r.key === key ? { ...r, target: value, isDirty: true } : r))
        );
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);

        const dirtyRows = rows.filter((r) => r.isDirty);
        if (dirtyRows.length === 0) {
            setStatus({ type: "success", text: "No changes to save." });
            setSaving(false);
            return;
        }

        const dirtyStatic = dirtyRows.filter(r => r.source === "static");
        const dirtyDynamic = dirtyRows.filter(r => r.source === "dynamic");

        const promises = [];

        try {
            if (dirtyStatic.length > 0) {
                const staticUpdates: Record<string, string> = {};
                dirtyStatic.forEach(r => { staticUpdates[r.key] = r.target; });
                promises.push(
                    fetch(`/api/messages?lang=${langCode}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(staticUpdates)
                    }).then(r => { if (!r.ok) throw new Error("Static save failed"); })
                );
            }

            if (dirtyDynamic.length > 0) {
                const dynamicUpdates: Record<string, string> = {};
                dirtyDynamic.forEach(r => { dynamicUpdates[r.key] = r.target; });
                promises.push(
                    axiosInstance.post('/transactions/translations', dynamicUpdates, {
                        params: { lang: langCode }
                    })
                );
            }

            await Promise.all(promises);
            setRows((prev) => prev.map((r) => ({ ...r, isDirty: false })));
            setStatus({ type: "success", text: `${dirtyRows.length} strings saved successfully!` });
            setTimeout(() => setStatus(null), 4000);
        } catch {
            setStatus({ type: "error", text: "Failed to save. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    // Per-row save handler
    const handleSaveRow = async (key: string) => {
        const row = rows.find(r => r.key === key);
        if (!row) return;
        setSavingKey(key);
        try {
            if (row.source === "static") {
                const res = await fetch(`/api/messages?lang=${langCode}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [row.key]: row.target })
                });
                if (!res.ok) throw new Error("Failed");
            } else {
                await axiosInstance.post('/transactions/translations', { [row.key]: row.target }, {
                    params: { lang: langCode }
                });
            }
            setRows(prev => prev.map(r => r.key === key ? { ...r, isDirty: false } : r));
            setStatus({ type: "success", text: `✓ Saved!` });
            setTimeout(() => setStatus(null), 2500);
        } catch {
            setStatus({ type: "error", text: `Failed to save '${key}'` });
        } finally {
            setSavingKey(null);
        }
    };

    // Filtering logic
    const isTranslatedRow = (r: TranslationRow) => r.target.trim() !== "" && r.target !== r.en;

    const filteredRows = rows.filter((r) => {
        const matchesSearch =
            !search ||
            r.key.toLowerCase().includes(search.toLowerCase()) ||
            r.en.toLowerCase().includes(search.toLowerCase()) ||
            r.target.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;
        if (filter === "translated") return isTranslatedRow(r);
        if (filter === "untranslated") return !isTranslatedRow(r);
        return true;
    });

    const dirtyCount = rows.filter((r) => r.isDirty).length;
    const translatedCount = rows.filter(isTranslatedRow).length;
    const progress = rows.length > 0 ? Math.round((translatedCount / rows.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500 flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Loading {langMeta.name} translations...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4 pt-6">
            {/* Header bar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary">
                            <Languages size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Translate into {langMeta.name}
                                <span className="ml-2 text-sm font-normal text-slate-500">({langMeta.nativeName})</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <ProgressBar value={progress} />
                                <span className={`text-xs font-bold whitespace-nowrap ${progress >= 80 ? "text-emerald-600" : progress >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                    {progress}% ({translatedCount}/{rows.length})
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || dirtyCount === 0}
                            className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : dirtyCount > 0 ? `Save Changes (${dirtyCount})` : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                <Home size={14} />
                <span>Home</span>
                <ChevronRight size={14} />
                <button onClick={onBack} className="hover:text-primary transition-colors">Translations</button>
                <ChevronRight size={14} />
                <span className="text-slate-900 font-medium">{langMeta.name}</span>
                <ChevronRight size={14} />
                <span className="text-slate-500">Progress: {progress}%</span>
            </nav>

            {/* Pick file bar */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-amber-800">
                    <FileText size={16} />
                    <span className="font-medium">Welcome to the translation editor. Includes both static & dynamic strings.</span>
                </div>
                <code className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded font-mono hidden md:block">
                    messages/{langCode}.json + Database
                </code>
            </div>

            {/* Status message */}
            {status && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${status.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                    {status.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span className="font-medium">{status.text}</span>
                </div>
            )}

            {/* Toolbar: search + filter */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search keys or text..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                            />
                        </div>

                        {/* Filter tabs */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-sm overflow-x-auto w-full md:w-auto">
                            {(["all", "untranslated", "translated"] as FilterType[]).map((f) => {
                                const label =
                                    f === "all"
                                        ? `All (${rows.length})`
                                        : f === "untranslated"
                                            ? `Untranslated (${rows.length - translatedCount})`
                                            : `Translated (${translatedCount})`;
                                return (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-xs text-slate-400 shrink-0">
                        Showing {filteredRows.length} of {rows.length} strings
                    </div>
                </div>
            </div>

            {/* Translation Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_1.2fr_1fr_110px] gap-0 border-b border-slate-200 bg-slate-50">
                    <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                        Original (English)
                    </div>
                    <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                        {langMeta.name} Translation
                    </div>
                    <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                        Key &amp; Source
                    </div>
                    <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                        Action
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100">
                    {filteredRows.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <Globe className="mx-auto text-slate-300 mb-3" size={40} />
                            <p className="text-slate-500 font-medium">No strings found</p>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        filteredRows.map((row) => {
                            const isTranslated = isTranslatedRow(row);
                            return (
                                <div
                                    key={row.key}
                                    className={`grid grid-cols-[1fr_1.2fr_1fr_110px] gap-0 hover:bg-slate-50/50 transition-colors ${row.isDirty ? "bg-amber-50/30" : ""}`}
                                >
                                    {/* English original */}
                                    <div className="px-4 py-4 border-r border-slate-100">
                                        <p className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                                            {row.en || <span className="text-slate-400 italic">Empty string</span>}
                                        </p>
                                    </div>

                                    {/* Editable translation */}
                                    <div className="px-4 py-4 border-r border-slate-100">
                                        <textarea
                                            value={row.target}
                                            onChange={(e) => handleEdit(row.key, e.target.value)}
                                            rows={2}
                                            dir="auto"
                                            placeholder={`Translate to ${langMeta.name}...`}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y text-sm transition-colors ${row.isDirty ? "border-amber-400 bg-amber-50/50" : "border-slate-200 bg-slate-50"}`}
                                        />
                                    </div>

                                    {/* Key & Source */}
                                    <div className="px-4 py-4 border-r border-slate-100 flex flex-col items-start gap-2">
                                        <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded block break-all font-mono leading-relaxed">
                                            {row.key}
                                        </code>
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${row.source === "static" ? "bg-indigo-100 text-indigo-700" : "bg-fuchsia-100 text-fuchsia-700"}`}>
                                            {row.source === "static" ? <><FileJson size={9} /> JSON</> : <><Database size={9} /> DB</>}
                                        </span>
                                    </div>

                                    {/* Action — status + save button */}
                                    <div className="px-3 py-4 flex flex-col items-center justify-start gap-2">
                                        {isTranslated && !row.isDirty ? (
                                            <span title="Translated"><CheckCircle2 size={16} className="text-emerald-500" /></span>
                                        ) : !isTranslated && !row.isDirty ? (
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1" title="Untranslated" />
                                        ) : (
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1" title="Unsaved changes" />
                                        )}
                                        <button
                                            onClick={() => handleSaveRow(row.key)}
                                            disabled={savingKey === row.key || saving}
                                            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all disabled:opacity-50 ${row.isDirty
                                                ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                                                }`}
                                        >
                                            {savingKey === row.key ? (
                                                <span className="w-3 h-3 border border-current/40 border-t-current rounded-full animate-spin" />
                                            ) : (
                                                <Save size={11} />
                                            )}
                                            {savingKey === row.key ? "Saving" : row.isDirty ? "Save" : "Update"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Root Page — Controller (wrapped in Suspense for useSearchParams)
// ──────────────────────────────────────────────
function TranslationsController() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang");

    const selectLang = (code: string) => {
        router.push(`?lang=${code}`);
    };

    const goBack = () => {
        router.push("?");
    };

    if (lang && LANGUAGES[lang]) {
        return <TranslationEditorView langCode={lang} onBack={goBack} />;
    }

    return <LanguageSelectionView onSelect={selectLang} />;
}

export default function TranslationsPage() {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 w-full">
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <div className="text-slate-500 flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                Loading...
                            </div>
                        </div>
                    }>
                        <TranslationsController />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
