import { describe, it, expect } from 'vitest';
import { getPriceRule, PriceRuleKey } from './priceRule';
import { EXAMS } from '../data/exams';
import { Exam } from '../types';

function withNote(priceNote?: string): Exam {
  return {
    ...EXAMS[0],
    provider: 'Testkommun',
    price: 500,
    priceNote,
  };
}

const keyFor = (note?: string): PriceRuleKey => getPriceRule(withNote(note)).key;

describe('getPriceRule', () => {
  it('reads a plain waiver as free', () => {
    expect(keyFor('Kostnadsfritt om du redan har betyg F i kursen.')).toBe('freeIfPriorF');
    expect(keyFor('500 kr per kurs/ämnesnivå, gratis om du har IG eller F.')).toBe('freeIfPriorF');
    expect(keyFor('Gratis om betyg saknas i ämnet (F/IG räknas som saknat betyg), annars 500 kr')) //
      .toBe('freeIfPriorF');
    expect(keyFor('500 kr per kurs, kostnadsfritt vid tidigare betyg F/IG')).toBe('freeIfPriorF');
  });

  it('reads an explicit refusal as a flat fee, even before it looks at the waiver words', () => {
    expect(keyFor('500 kr per kurs, oavsett tidigare betyg')).toBe('flatFee');
    expect(keyFor('500 kr oavsett betyg — gratis endast för personal')).toBe('flatFee');
  });

  it('demotes a waiver the provider hedged', () => {
    // Each of these is a real note in the dataset, and each names someone the
    // waiver does not cover.
    expect(keyFor('500 kr per kurs; kostnadsfritt i vissa fall vid tidigare betyg IG/F.')) //
      .toBe('conditionalFree');
    expect(
      keyFor('500 kr per kurs; gratis vid tidigare F i kursen som inskriven elev i Trelleborg'),
    ).toBe('conditionalFree');
    expect(keyFor('500 kr; kostnadsfritt vid icke godkänt betyg från komvux.')) //
      .toBe('conditionalFree');
    expect(
      keyFor('500 kr per prövning; kostnadsfritt om tidigare betyg F/IG i kursen på Centrum Vux.'),
    ).toBe('conditionalFree');
    expect(keyFor('500 kr per kurs; kostnadsfritt vid F-betyg som elev vid Komvux Västervik')) //
      .toBe('conditionalFree');
    expect(
      keyFor(
        '500 kr per kurs/ämnesnivå; kostnadsfritt vid F/IG-betyg inom ett år från betygssättning',
      ),
    ).toBe('conditionalFree');
    expect(
      keyFor('Kostnadsfritt om du redan har betyg F i kursen. Betyget F ska ha satts inom komvux.'),
    ).toBe('conditionalFree');
  });

  it('does not mistake a grade token for the name of a school', () => {
    // "vid F/IG" and "vid F-betyg" are the two shapes that would otherwise trip
    // the named-provider hedge and demote a clean waiver.
    expect(keyFor('500 kr per prövning, avgiftsfritt vid F/IG i kursen')).toBe('freeIfPriorF');
    expect(keyFor('500 kr, gratis vid F-betyg')).toBe('freeIfPriorF');
  });

  it('says nothing about F when the provider said nothing about it', () => {
    expect(keyFor('500 kr per prövning enligt Skolverkets förordning.')).toBe('unstated');
    expect(keyFor('Begränsat antal platser, först till kvarn.')).toBe('unstated');
    expect(keyFor('Avgiften betalas vid anmälan och återbetalas inte vid avbokning.')) //
      .toBe('unstated');
    expect(keyFor(undefined)).toBe('unstated');
  });

  it('hands back the provider’s own sentence, never a rewritten one', () => {
    const note = '500 kr per kurs; gratis vid tidigare F i kursen som inskriven elev i Trelleborg';
    const rule = getPriceRule(withNote(note));
    expect(rule.detail).toBe(note);
    expect(rule.fromProvider).toBe(true);
  });

  it('names the provider, and does not claim to quote one, when there is no note', () => {
    const rule = getPriceRule(withNote(undefined));
    expect(rule.fromProvider).toBe(false);
    expect(rule.detail).toContain('Testkommun');
  });

  it('gives every rule a chip, a note and a colour', () => {
    for (const note of [
      undefined,
      'Kostnadsfritt om du redan har betyg F i kursen.',
      '500 kr per kurs, oavsett tidigare betyg',
      '500 kr per kurs; kostnadsfritt i vissa fall.',
      '500 kr per prövning enligt Skolverkets förordning.',
    ]) {
      const rule = getPriceRule(withNote(note));
      expect(rule.note).not.toBe('');
      expect(rule.chipLabel).not.toBe('');
      expect(rule.chip).toMatch(/bg-/);
      expect(rule.detail.length).toBeGreaterThan(10);
    }
  });
});

describe('the dataset read through the rule', () => {
  it('never promises a free prövning on a note that hedges the waiver', () => {
    // The one direction this heuristic is not allowed to fail in. A listing may
    // be read as more expensive than it is; it may never be read as cheaper.
    const overPromised = EXAMS.filter((e) => {
      if (getPriceRule(e).key !== 'freeIfPriorF') return false;
      return /i vissa fall|inskriven elev|folkbokförd|avtal|inom ett år/i.test(e.priceNote ?? '');
    });
    expect(overPromised.map((e) => e.id)).toEqual([]);
  });

  it('holds the providers that charge regardless of a prior F apart from the rest', () => {
    const flat = EXAMS.filter((e) => getPriceRule(e).key === 'flatFee');
    // Karlskoga is the case the old blanket "gratis om du har F" got wrong.
    expect(flat.length).toBeGreaterThan(0);
    for (const exam of flat) {
      expect(exam.priceNote).toMatch(/oavsett/i);
    }
  });

  it('reaches a verdict for every listing, and quotes the provider wherever there is one', () => {
    for (const exam of EXAMS) {
      const rule = getPriceRule(exam);
      expect(['freeIfPriorF', 'conditionalFree', 'flatFee', 'unstated']).toContain(rule.key);
      if (exam.priceNote) expect(rule.detail).toBe(exam.priceNote.trim());
    }
  });
});
