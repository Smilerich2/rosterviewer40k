'use client';

import { useTooltip } from '@/context/TooltipContext';
import { cleanRuleText, findRule } from '@/lib/utils';

interface Props {
  keyword: string;
  rules?: Record<string, string>;
  className?: string;
}

export function KeywordChip({ keyword, rules, className = '' }: Props) {
  const { showTooltip } = useTooltip();
  const ruleText = findRule(rules, keyword);

  if (!ruleText) {
    return <span className={className}>{keyword}</span>;
  }

  return (
    <span
      className={`border-b border-dotted border-current cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 rounded px-0.5 transition-colors select-none ${className}`}
      onClick={e => {
        e.stopPropagation();
        showTooltip(cleanRuleText(ruleText), keyword, e.currentTarget.getBoundingClientRect());
      }}
      title="Tap for rules"
    >
      {keyword}
    </span>
  );
}
