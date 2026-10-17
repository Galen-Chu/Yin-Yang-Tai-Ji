import { useRef, useState } from 'react';
import {
  type CharacterDefinition,
  dexCounts,
  formKey,
  type GestureId,
  getHidden,
  getItem,
  getPlace,
  getTouch,
  hiddenKey,
  itemsAt,
  resolveForm,
  type Text,
} from '../../core';
import type { Game } from '../hooks/useGame';
import { inline, pick, t, useLang } from '../i18n';
import { Swatch, TaijiFigure } from './TaijiFigure';

type Tab = 'forms' | 'items' | 'hidden';

const GREY = { top: '#E4E1D9', bottom: '#D3CFC5', line: '#9C978C' };
const TWIN = { top: '#FFF8EC', bottom: '#FFCFA8' };

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

/** TaiJi Log 台吉圖鑑 — every form, item and hidden form, found or not. */
export function Dex({ def, game }: { def: CharacterDefinition; game: Game }) {
  const lang = useLang();
  const [tab, setTab] = useState<Tab>('forms');
  const [selected, setSelected] = useState<Partial<Record<Tab, string>>>({});
  const detailRef = useRef<HTMLDivElement>(null);
  const { play, progress } = game.state;
  const discovered = new Set(progress.discovered);
  const collected = new Set(progress.collected);
  const counts = dexCounts(def, progress);
  const current = resolveForm(def, play, progress);

  const select = (which: Tab, id: string) => {
    setTab(which);
    setSelected((s) => ({ ...s, [which]: id }));
    // On narrow screens the detail panel wraps below the grid; bring it into view.
    requestAnimationFrame(() => {
      const el = detailRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight - 120) window.scrollTo({ top: window.scrollY + r.top - 16, behavior: 'smooth' });
    });
  };

  const tabs: [Tab, Text, string][] = [
    ['forms', t('Forms', '形態'), `${counts.forms.found}/${counts.forms.total}`],
    ['items', t('Items', '收集物'), `${counts.items.found}/${counts.items.total}`],
    ['hidden', t('Hidden', '隱藏'), `${counts.hidden.found}/${counts.hidden.total}`],
  ];

  return (
    <section className="card dex">
      <div className="space-between wrap">
        <h2>TaiJi Log 台吉圖鑑</h2>
        <div className="row-wrap" role="tablist">
          {tabs.map(([id, label, count]) => (
            <button key={id} role="tab" className="btn pill-btn" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>
              {inline(label, lang)} <span className="muted tiny bold">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dex-body">
        <div className="dex-main">
          {tab === 'forms' && (
            <div className="scroll-x">
              <div className="forms-grid" style={{ gridTemplateColumns: `86px repeat(${def.touches.length}, minmax(72px, 1fr))` }}>
                <div />
                {def.touches.map((x) => (
                  <div key={x.id} className="forms-head">
                    {x.name.zh} {x.name.en}
                    <br />
                    <span className="muted">{x.gesture.en}</span>
                  </div>
                ))}
                {def.places.map((p) => {
                  const n = def.touches.filter((x) => discovered.has(formKey(p.id, x.id))).length;
                  const complete = n === def.touches.length;
                  return (
                    <div key={p.id} className="contents">
                      <div className="forms-row-label">
                        {p.name.zh} {p.name.en}
                        <span className={complete ? 'complete' : 'muted'}>{complete ? '★ Complete 完成' : `${n}/${def.touches.length}`}</span>
                      </div>
                      {def.touches.map((x) => {
                        const key = formKey(p.id, x.id);
                        const found = discovered.has(key);
                        return (
                          <button
                            key={key}
                            className={`dex-cell${found ? '' : ' locked'}${current.key === key ? ' current' : ''}`}
                            aria-pressed={selected.forms === key}
                            onClick={() => select('forms', key)}
                          >
                            <Swatch
                              size={30}
                              top={found ? p.palette.top : '#ECEAE4'}
                              bottom={found ? p.palette.bottom : '#DDDAD2'}
                              line={found ? 'var(--ink)' : '#B9B5AB'}
                            />
                            <span className="cell-name">{found ? `${p.prefix.zh}${x.name.zh}` : '？？'}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'items' && (
            <div className="items-dex">
              {def.places.map((p) => {
                const its = itemsAt(def, p.id);
                return (
                  <div key={p.id} className="items-dex-group">
                    <div className="row">
                      <Swatch size={20} top={p.palette.top} bottom={p.palette.bottom} />
                      <span className="bold">{p.name.zh}</span>
                      <span className="muted tiny ellipsis">{p.name.en}</span>
                      <span className="muted small bold push-right">
                        {its.filter((i) => collected.has(i.id)).length}/{its.length}
                      </span>
                    </div>
                    <div className="item-grid">
                      {its.map((i) => {
                        const got = collected.has(i.id);
                        return (
                          <button
                            key={i.id}
                            className={`dex-cell${got ? '' : ' locked'}${play.carried.includes(i.id) ? ' current' : ''}`}
                            aria-pressed={selected.items === i.id}
                            onClick={() => select('items', i.id)}
                          >
                            <span className="glyph small-glyph">{got ? i.glyph : '？'}</span>
                            <span className="cell-name">{got ? i.name.zh : '？？'}</span>
                            <span className="muted tiny">{got ? i.trait.zh : `去${p.name.zh}打卡`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'hidden' && (
            <div className="hidden-list">
              {def.hidden.map((h) => {
                const found = discovered.has(hiddenKey(h.id));
                return (
                  <button
                    key={h.id}
                    className={`hidden-cell${found ? ' found' : ''}`}
                    aria-pressed={selected.hidden === h.id}
                    onClick={() => select('hidden', h.id)}
                  >
                    <span className="kicker">Hidden form 隱藏形態</span>
                    <span className="bold">{found ? inline(h.name, 'both') : '？？？'}</span>
                    <span className="muted small">{found ? inline(h.hint, 'both', ' · ') : 'Combine layers to discover · 組合條件來發現'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div ref={detailRef} className="dex-detail">
          <Detail def={def} game={game} tab={tab} id={selected[tab]} onSelectItem={(id) => select('items', id)} />
        </div>
      </div>

      <button
        className="link-btn"
        onClick={() => {
          if (window.confirm('Reset all progress? 確定要清除圖鑑嗎？')) {
            game.dispatch({ type: 'resetProgress' });
            setSelected({});
          }
        }}
      >
        Reset log 清除圖鑑
      </button>
    </section>
  );
}

interface DetailView {
  sky: string;
  ground: string;
  status: Text;
  kicker: string;
  title: string;
  sub: string;
  line: Text;
  recipe: { k: string; v: string }[];
  figure?: React.ReactNode;
  chipsFor?: string;
  primary?: { label: Text; run: () => void };
}

function Detail({
  def,
  game,
  tab,
  id,
  onSelectItem,
}: {
  def: CharacterDefinition;
  game: Game;
  tab: Tab;
  id: string | undefined;
  onSelectItem: (id: string) => void;
}) {
  const lang = useLang();
  const { play, progress } = game.state;
  if (!id) {
    return (
      <div className="detail-empty">
        <Swatch size={44} top="#ECEAE4" bottom="#DDDAD2" line="#B9B5AB" />
        <span className="bold">Tap any cell to see details</span>
        <span className="small">點任何一格查看詳情</span>
      </div>
    );
  }

  const found = (key: string) => progress.discovered.includes(key);
  const statusFound = t('Found', '已發現');
  const statusMissing = t('Undiscovered', '未發現');
  let v: DetailView;

  if (tab === 'forms') {
    const [pid, tid] = id.split('/') as [string, GestureId];
    const p = getPlace(def, pid);
    const x = getTouch(def, tid);
    const f = found(id);
    const index = def.places.indexOf(p) * def.touches.length + def.touches.indexOf(x) + 1;
    const name = pick(def.describe.formName(p, x), 'both');
    v = {
      sky: p.palette.sky,
      ground: p.palette.ground,
      status: f ? statusFound : statusMissing,
      kicker: `Form · 形態 ${index}/${def.places.length * def.touches.length}`,
      title: f ? name.secondary : '？？',
      sub: f ? name.primary : 'Not met yet',
      line: f
        ? def.describe.formLine(p, x)
        : t(`It's somewhere in ${p.name.en}, waiting for the right touch.`, `它就在${p.name.zh}某處，等著用對的方式被碰到。`),
      recipe: [
        { k: 'Place 地點', v: `${p.name.zh} ${p.name.en}` },
        { k: 'Touch 觸碰', v: f ? `${x.gesture.zh} ${x.gesture.en}` : '？' },
      ],
      figure: (
        <TaijiFigure
          shape={def.shapes[tid] ?? def.shapes.base!}
          scale={0.55}
          detailed={false}
          top={f ? p.palette.top : GREY.top}
          bottom={f ? p.palette.bottom : GREY.bottom}
          accent={p.palette.accent}
          line={f ? 'var(--ink)' : GREY.line}
        />
      ),
      chipsFor: pid,
      primary: f
        ? { label: t('Become this form', '變成這個形態'), run: () => game.dispatch({ type: 'becomeForm', placeId: pid, touchId: tid }) }
        : {
            label: t(`Go to ${p.name.en}`, `去${p.name.zh}`),
            run: () => {
              game.dispatch({ type: 'goTo', placeId: pid });
              game.flash(t('Try different touches', '試試不同的觸碰'));
            },
          },
    };
  } else if (tab === 'items') {
    const i = getItem(def, id);
    const p = getPlace(def, i.placeId);
    const got = progress.collected.includes(id);
    const carrying = play.carried.includes(id);
    v = {
      sky: p.palette.sky,
      ground: p.palette.ground,
      status: carrying ? t('Carrying', '攜帶中') : got ? t('Found', '已取得') : t('Not found', '未取得'),
      kicker: `Item · 收集物 ${def.items.indexOf(i) + 1}/${def.items.length}`,
      title: got ? i.name.zh : '？？',
      sub: got ? i.name.en : 'Not found yet',
      line: got
        ? t(`A TaiJi carrying it ${i.trait.en}.`, `帶著它的台吉會${i.trait.zh}。`)
        : t(`Check in at ${p.name.en} to find it.`, `在${p.name.zh}打卡就能找到。`),
      recipe: [
        { k: 'Found at 取得地點', v: `${p.name.zh} ${p.name.en}` },
        { k: 'Trait 特質', v: got ? i.trait.zh : '？' },
      ],
      figure: <span className={`glyph big-glyph${got ? '' : ' locked'}`}>{got ? i.glyph : '？'}</span>,
      primary: got
        ? { label: carrying ? t('Put down', '放下') : t('Carry', '帶在身上'), run: () => game.dispatch({ type: 'toggleCarry', itemId: id }) }
        : { label: t(`Go to ${p.name.en}`, `去${p.name.zh}打卡`), run: () => game.dispatch({ type: 'setPlace', placeId: p.id }) },
    };
  } else {
    const h = getHidden(def, id);
    const f = found(hiddenKey(id));
    const p = getPlace(def, h.when.place ?? play.place);
    const top = h.look.top ?? p.palette.top;
    const bottom = h.look.bottom ?? p.palette.bottom;
    const fig = (a: string, b: string, line: string) => (
      <TaijiFigure shape={def.shapes[h.shape] ?? def.shapes.base!} scale={0.5} detailed={false} top={a} bottom={b} accent={p.palette.accent} line={line} />
    );
    v = {
      sky: h.look.sky ?? p.palette.sky,
      ground: h.look.ground ?? p.palette.ground,
      status: f ? statusFound : statusMissing,
      kicker: `Hidden form · 隱藏形態 ${def.hidden.indexOf(h) + 1}/${def.hidden.length}`,
      title: f ? h.name.zh : '？？？',
      sub: f ? h.name.en : 'Secret',
      line: f ? h.line : h.riddle,
      recipe: f
        ? [{ k: 'Unlock 解鎖條件', v: `${h.hint.zh} · ${h.hint.en}` }]
        : [{ k: 'Riddle 謎語', v: 'Combine layers to solve · 組合條件來解開' }],
      figure: (
        <span className="row">
          {f ? fig(top, bottom, 'var(--ink)') : fig(GREY.top, GREY.bottom, GREY.line)}
          {f && h.when.friend && fig(TWIN.top, TWIN.bottom, 'var(--ink)')}
        </span>
      ),
      primary: f ? { label: t('Become this form', '變成這個形態'), run: () => game.dispatch({ type: 'becomeHidden', hiddenId: id }) } : undefined,
    };
  }

  const line = pick(v.line, 'both');
  return (
    <>
      <div className="detail-hero" style={{ background: v.sky }}>
        <div className="stage-ground" style={{ background: v.ground }} />
        <div className="detail-figure">{v.figure}</div>
        <span className="pill detail-status">{inline(v.status, lang)}</span>
      </div>
      <div className="detail-body">
        <span className="kicker">{v.kicker}</span>
        <div>
          <div className="detail-title">{v.title}</div>
          <div className="muted bold">{v.sub}</div>
        </div>
        <div className="detail-line">
          {line.secondary}
          <br />
          <span className="muted">{line.primary}</span>
        </div>
        <dl className="recipe">
          {v.recipe.map((r) => (
            <div key={r.k}>
              <dt>{r.k}</dt>
              <dd>{r.v}</dd>
            </div>
          ))}
        </dl>
        {v.chipsFor && (
          <div className="stack-sm">
            <span className="muted small bold">Items here 這裡的收集物</span>
            <div className="row">
              {itemsAt(def, v.chipsFor).map((i) => {
                const got = progress.collected.includes(i.id);
                return (
                  <button key={i.id} className={`chip${got ? '' : ' locked'}`} onClick={() => onSelectItem(i.id)} aria-label={got ? i.name.en : 'Unknown item'}>
                    {got ? i.glyph : '？'}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {v.primary && (
          <button
            className="btn primary-btn"
            onClick={() => {
              v.primary!.run();
              scrollToTop();
            }}
          >
            {inline(v.primary.label, lang, ' · ')}
          </button>
        )}
      </div>
    </>
  );
}
