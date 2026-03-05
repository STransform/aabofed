/**
 * getMessages — lightweight static-message loader.
 *
 * Imports the right JSON file for the given locale and returns it.
 * Because Next.js App Router supports dynamic JSON imports, this works
 * both on the server and on the client (the bundler resolves the import
 * statically; the API route provides the runtime-editable copy).
 */

import en from '../messages/en.json';
import am from '../messages/am.json';
import om from '../messages/om.json';

export type Lang = 'en' | 'am' | 'om';
export type Messages = typeof en;

const MESSAGES: Record<Lang, Messages> = { en, am, om };

export function getMessages(lang: Lang): Messages {
    return MESSAGES[lang] ?? en;
}

/**
 * Flatten a nested messages object into dot-notated keys.
 * Only flattens string leaves (arrays and nested objects whose leaves are
 * strings are included; array items are skipped because they are handled
 * separately by the pillar / stats editors).
 *
 * e.g. { sidebar: { items: { dashboard: "Dashboard" } } }
 *   → { "sidebar.items.dashboard": "Dashboard" }
 */
export function flattenMessages(
    obj: Record<string, any>,
    prefix = ''
): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof val === 'string') {
            result[fullKey] = val;
        } else if (Array.isArray(val)) {
            // Skip array entries — they are not editable as simple key-value pairs
        } else if (typeof val === 'object' && val !== null) {
            Object.assign(result, flattenMessages(val, fullKey));
        }
    }
    return result;
}
