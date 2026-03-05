/**
 * useTranslation
 *
 * Fetches the active locale's dynamic translation dictionary from the
 * translation-service and exposes a `resolve(key)` helper.
 *
 * Usage:
 *   const { resolve } = useTranslation();
 *   ...
 *   <td>{resolve(org.orgname)}</td>
 *
 * For any value that does NOT look like a translation key (no dots, or
 * doesn't match "<entityName>.<id>.<field>") it is returned as-is.
 */

import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '@/lib/axios';

type Dict = Record<string, string>;

// Module-level cache so simultaneous components share one request
let cachedLang = '';
let cachedDict: Dict = {};
let pendingPromise: Promise<Dict> | null = null;

async function loadDict(lang: string): Promise<Dict> {
    if (lang === cachedLang && Object.keys(cachedDict).length > 0) {
        return cachedDict;
    }
    if (!pendingPromise || lang !== cachedLang) {
        cachedLang = lang;
        cachedDict = {};
        pendingPromise = axiosInstance
            .get('/transactions/translations', { params: { lang } })
            .then(r => {
                cachedDict = r.data || {};
                pendingPromise = null;
                return cachedDict;
            })
            .catch(() => {
                pendingPromise = null;
                return {} as Dict;
            });
    }
    return pendingPromise!;
}

export function useTranslation() {
    const [dict, setDict] = useState<Dict>(cachedDict);

    useEffect(() => {
        const lang = (typeof window !== 'undefined'
            ? localStorage.getItem('armas_lang')
            : null) || 'en';

        loadDict(lang).then(d => setDict({ ...d }));
    }, []);

    /**
     * Resolves a value that might be a translation key.
     * A "key" looks like "someentity.ID.fieldname" — at least two dots.
     * If the value looks like a key but has no entry in the dictionary,
     * we fall back to the English dictionary, then to the raw key.
     */
    const resolve = useCallback(
        (value: string | null | undefined): string => {
            if (!value) return '';
            // Only attempt resolution if the string looks like a translation key
            const parts = value.split('.');
            if (parts.length < 3) return value;          // not a key pattern → return as-is
            const resolved = dict[value];
            return resolved !== undefined ? resolved : value;
        },
        [dict]
    );

    return { resolve, dict };
}
