import { Exam } from '../types';

/**
 * The answer to the second question a listing has to settle, after the date:
 * **can this be free for me?**
 *
 * The fee is 500 kr under Skolverket's own regulation, and the same regulation
 * lets a provider waive it when you already have an F in the course. The app
 * used to state that as one national rule, in one confident sentence, on the
 * filter sheet — and the dataset it ships disproves it. Karlskoga charges "500
 * kr per kurs, oavsett tidigare betyg". Trelleborg waives it only for someone
 * who was enrolled in Trelleborg. Several waive it only for an F set inside
 * komvux, and Växjö only within a year of the grade. A user re-taking a failed
 * course is exactly who this app is for, so "gratis om du har F" is the single
 * claim it can least afford to get wrong: being wrong costs 500 kr.
 *
 * So the rule is derived per listing, from the provider's own `priceNote`, and
 * it is deliberately pessimistic. Anything the provider hedged reads as
 * `conditionalFree`, not as free; anything the provider never addressed reads
 * as `unstated`, not as free. The colour may under-promise. It may not
 * over-promise, which is why the hedges are matched against the whole note
 * rather than against the waiver's own sentence — a condition one sentence
 * later ("Betyget F ska ha satts inom komvux.") still decides who gets it.
 *
 * The heuristic is never the last word: `detail` carries the provider's own
 * sentence verbatim, and the app renders it next to the chip. That sentence is
 * the fact — this file only decides which colour it gets read in.
 */
export type PriceRuleKey = 'freeIfPriorF' | 'conditionalFree' | 'flatFee' | 'unstated';

export interface PriceRule {
  key: PriceRuleKey;
  /** Two or three words, for the price tile under "500 kr". */
  note: string;
  /** The chip over the provider's sentence, in the price panel. */
  chipLabel: string;
  /** Tinted chip, matching the status palette's `softChip` shape. */
  chip: string;
  /** The provider's own sentence, or a plain statement of what isn't published. */
  detail: string;
  /** True when the provider actually wrote the sentence in `detail`. */
  fromProvider: boolean;
}

/** The provider waives the fee — "gratis", "kostnadsfritt", "avgiftsfritt". */
const FREE = /gratis|kostnadsfri|avgiftsfri|utan avgift/i;

/**
 * The fee stands whatever your old grade was. Checked before {@link FREE} so a
 * note that says both ("500 kr oavsett betyg, gratis för …") cannot be read as
 * a clean waiver.
 */
const FLAT = /oavsett\s+(?:ditt\s+|dina\s+|din\s+|tidigare\s+)*betyg/i;

/**
 * What turns a waiver into a conditional one.
 *
 * Each of these is a real qualifier somewhere in the dataset, and each one
 * changes who the waiver applies to: where the F was set, whether you were
 * enrolled there, how long ago it was, whether your kommun has an agreement.
 * A reader who sees plain "gratis" and then meets one of these at the checkout
 * has been told the wrong thing by the app, not by the school.
 */
const HEDGES: RegExp[] = [
  /i vissa fall/i,
  /som (?:inskriven )?elev/i,
  /elev (?:vid|på|i)\s/i,
  /(?:inom|på|från|hos|vid)\s+(?:komvux|vuxenutbildning)/i,
  /avtal/i,
  /folkbokförd/i,
  /inom\s+(?:ett|två|tre|\d+)\s+år/i,
  /**
   * A waiver tied to one named provider or kommun — "i kursen på Centrum Vux",
   * "som elev i Trelleborg". The capitalised word must carry at least two
   * lowercase letters, so the grade tokens this dataset is full of ("vid F/IG",
   * "vid F-betyg") are not mistaken for a school's name.
   */
  /\b(?:på|vid|hos|i)\s+[A-ZÅÄÖ][a-zåäö]{2,}/,
];

export function getPriceRule(exam: Exam): PriceRule {
  const note = exam.priceNote?.trim() ?? '';

  if (!note) {
    return {
      key: 'unstated',
      note: 'villkor ej publicerade',
      chipLabel: 'Villkor ej publicerade',
      chip: 'bg-cream text-ink-soft border border-line',
      detail:
        `${exam.provider} har inte publicerat några villkor för avgiften. Avgiften för en ` +
        'prövning är 500 kr enligt Skolverkets förordning, och anordnaren får efterskänka ' +
        'den om du redan har betyget F — fråga skolan om det gäller dig.',
      fromProvider: false,
    };
  }

  if (FLAT.test(note)) {
    return {
      key: 'flatFee',
      note: 'oavsett tidigare betyg',
      chipLabel: 'Ingen rabatt vid F',
      chip: 'bg-sand text-ink-soft border border-line',
      detail: note,
      fromProvider: true,
    };
  }

  if (FREE.test(note)) {
    return HEDGES.some((h) => h.test(note))
      ? {
          key: 'conditionalFree',
          note: 'kan bli gratis',
          chipLabel: 'Gratis vid F — med villkor',
          chip: 'bg-orange-50 text-orange-700 border border-orange-200',
          detail: note,
          fromProvider: true,
        }
      : {
          key: 'freeIfPriorF',
          note: 'gratis vid tidigare F',
          chipLabel: 'Gratis vid tidigare F',
          chip: 'bg-trust-50 text-trust-700 border border-trust-100',
          detail: note,
          fromProvider: true,
        };
  }

  return {
    key: 'unstated',
    note: 'se villkoren nedan',
    chipLabel: 'Oklart vid F',
    chip: 'bg-cream text-ink-soft border border-line',
    detail: note,
    fromProvider: true,
  };
}
