import { type CharacterDefinition, getItem, getPlace, getSeason, type ResolvedForm, type Text } from '../../core';
import { Bi, inline, pick, t, useLang } from '../i18n';

/** The "who am I right now" card: form name, its trait, and modifier lines. */
export function FormCard({
  def,
  form,
  placeId,
  seasonId,
  carried,
  isNew,
}: {
  def: CharacterDefinition;
  form: ResolvedForm;
  placeId: string;
  seasonId: string;
  carried: string[];
  isNew: boolean;
}) {
  const lang = useLang();
  const place = getPlace(def, placeId);
  let kicker: string;
  let name: Text;
  let line: Text;

  if (form.kind === 'hidden') {
    kicker = inline(t('Hidden form', '隱藏形態'), lang, ' · ');
    name = form.hidden.name;
    line = form.hidden.line;
  } else if (form.kind === 'form') {
    kicker = inline(
      t(`${form.place.name.en} × ${form.touch.gesture.en}`, `${form.place.name.zh} × ${form.touch.gesture.zh}`),
      lang,
      ' · ',
    );
    name = def.describe.formName(form.place, form.touch);
    line = def.describe.formLine(form.place, form.touch);
  } else {
    kicker = inline(t('Base form', '原形'), lang, ' · ');
    name = t(`${def.name.en} — base`, `${def.name.zh}・原形`);
    line = def.describe.baseLine(place);
  }

  const extras = [
    def.describe.seasonLine(getSeason(def, seasonId)),
    ...carried.map((id) => def.describe.itemLine(getItem(def, id))),
  ];
  const title = pick(name, lang);

  return (
    <section className="card form-card" aria-live="polite">
      <div className="form-card-head">
        <span className="kicker">{kicker}</span>
        {isNew && <span className="new-badge">{inline(t('New', '新發現'), lang)}</span>}
      </div>
      <div>
        <div className="form-name">{title.primary}</div>
        {title.secondary && <div className="form-name-sub">{title.secondary}</div>}
      </div>
      <Bi text={line} className="form-line" />
      {extras.map((x, i) => (
        <Bi key={i} text={x} className="form-extra" />
      ))}
    </section>
  );
}
