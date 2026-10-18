import { useMemo, useState } from 'react';
import { taiji } from './characters/taiji';
import { resolveForm } from './core';
import { createLocalProgressStore } from './storage/progressStore';
import { CompanionControls, ItemPanel, PlacePicker, SeasonPicker, TouchPicker } from './ui/components/Controls';
import { Dex } from './ui/components/Dex';
import { FormCard } from './ui/components/FormCard';
import { Stage } from './ui/components/Stage';
import { useGame } from './ui/hooks/useGame';
import { type Lang, LangContext } from './ui/i18n';
import { lookFor } from './ui/look';

const def = taiji;
const LANGS: [Lang, string][] = [
  ['both', 'EN + 中'],
  ['zh', '中文'],
  ['en', 'EN'],
];

export function App() {
  const store = useMemo(() => createLocalProgressStore(def), []);
  const game = useGame(def, store);
  const [lang, setLang] = useState<Lang>('both');
  const { play, progress } = game.state;
  const form = resolveForm(def, play, progress);
  const look = lookFor(def, play, form);

  return (
    <LangContext.Provider value={lang}>
      <main className="page">
        <header className="page-header">
          <div className="stack-sm">
            <span className="kicker">Character prototype · 角色原型</span>
            <h1>
              {def.name.en} {def.name.zh}
            </h1>
            <p className="muted">
              {def.tagline.en} · {def.tagline.zh}
            </p>
          </div>
          <div className="row-wrap" role="group" aria-label="Language">
            {LANGS.map(([id, label]) => (
              <button key={id} className="btn pill-btn" aria-pressed={lang === id} onClick={() => setLang(id)}>
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="play-grid">
          <div className="stack">
            <Stage def={def} game={game} look={look} />
            <TouchPicker def={def} game={game} />
            <SeasonPicker def={def} game={game} />
            <CompanionControls game={game} />
          </div>
          <div className="stack">
            <FormCard
              def={def}
              form={form}
              placeId={play.place}
              seasonId={play.season}
              carried={play.carried}
              isNew={game.isNew}
            />
            <PlacePicker def={def} game={game} />
            <ItemPanel def={def} game={game} />
          </div>
        </div>

        <Dex def={def} game={game} />

        <footer className="page-footer">
          TaiJi 台吉 © 2026 Galen Chu ·{' '}
          <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer">
            Character CC BY-NC 4.0
          </a>{' '}
          ·{' '}
          <a href="https://github.com/Galen-Chu/Yin-Yang-Tai-Ji" target="_blank" rel="noreferrer">
            Code MIT
          </a>
        </footer>
      </main>
    </LangContext.Provider>
  );
}
