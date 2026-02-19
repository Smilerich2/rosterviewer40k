import React from 'react';

/** Renders bold markdown (`**text**` and `^^text^^`) and newlines as JSX. */
export function formatText(text?: string): React.ReactNode {
  if (!text) return '';
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-200">$1</strong>')
    .replace(/\^\^(.*?)\^\^/g,  '<strong class="text-amber-200">$1</strong>')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Strips bold markers, returning plain text. */
export function cleanRuleText(text?: string): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/\^\^/g, '');
}

/**
 * Looks up a keyword in the rules dictionary.
 * Handles numeric suffixes (e.g. "Heavy 3") and the "Anti-" prefix.
 */
export function findRule(
  rules: Record<string, string> | undefined,
  keyword: string,
): string | null {
  if (!rules || !keyword) return null;
  const key = keyword.toLowerCase().trim();
  if (rules[key]) return rules[key];
  const base = key.replace(/\s(\d+|d\d+)(\+)?$/i, '').trim();
  if (rules[base]) return rules[base];
  if (key.startsWith('anti-')) return rules['anti-'] ?? null;
  return null;
}
