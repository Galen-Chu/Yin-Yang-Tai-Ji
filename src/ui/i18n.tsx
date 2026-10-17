import { createContext, useContext } from 'react';
import type { Text } from '../core';

/** `both` shows English first with Chinese underneath, as in the prototype. */
export type Lang = 'both' | 'en' | 'zh';

export const LangContext = createContext<Lang>('both');

export const useLang = () => useContext(LangContext);

/** Split bilingual text into a primary and an optional secondary line. */
export function pick(text: Text, lang: Lang): { primary: string; secondary: string } {
  if (lang === 'en') return { primary: text.en, secondary: '' };
  if (lang === 'zh') return { primary: text.zh, secondary: '' };
  return { primary: text.en, secondary: text.zh };
}

/** Inline bilingual label: "English 中文", or a single language. */
export function inline(text: Text, lang: Lang, sep = ' '): string {
  if (lang === 'en') return text.en;
  if (lang === 'zh') return text.zh;
  return `${text.en}${sep}${text.zh}`;
}

/** Bilingual text block. Renders the secondary language on its own line. */
export function Bi({ text, className }: { text: Text; className?: string }) {
  const { primary, secondary } = pick(text, useLang());
  return (
    <span className={className}>
      {primary}
      {secondary && (
        <>
          <br />
          <span className="secondary">{secondary}</span>
        </>
      )}
    </span>
  );
}

/** Small helper to build Text inline without noise. */
export const t = (en: string, zh: string): Text => ({ en, zh });
