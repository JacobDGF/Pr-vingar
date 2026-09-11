/**
 * Vilken Gy11-kurs och vilken Gy25-ämnesnivå som är samma innehåll.
 *
 * Sedan Gy25 började tillämpas 1 juli 2025 publicerar anordnarna samma prövning
 * under två namn och två koder, och användaren känner bara till det ena — det
 * som stod på betyget eller i schemat när hen läste kursen. Datan speglar det:
 * `MATMAT03b` och `MATO1B00X` är två listningar med två förberedelsedokument,
 * precis som README kräver, och den som söker på "Matematik 3b" ser därför inte
 * hälften av de prövningar som faktiskt prövar hens kurs.
 *
 * Paren är inte härledda ur koderna — `MATMAT03b → MATO1B00X` går inte att
 * gissa fram, och en gissning här skulle tysta en riktig prövning bakom fel
 * namn. De är lästa ur Komvux Örebros prövningstabell, som är den källa i datan
 * som skriver ut båda systemen på samma rad ("Gamla Gy11: … / Nya Gy25: …").
 * Namnen är datans egen stavning av respektive kod, så en listning och dess
 * motsvarighet aldrig kan säga olika saker om samma kurs.
 *
 * Kurser som bara finns i ett av systemen står inte här. Fysik 1a och Fysik
 * nivå 1b listas var för sig hos Örebro utan att paras ihop, och då är tystnad
 * det enda ärliga svaret.
 *
 * Källa: gymnasieskolor.orebro.se, Komvux Örebros prövningstabell hösten 2026,
 * läst 2026-09-10.
 */

export interface CourseVariant {
  /** Kurskoden, som anordnaren skriver den. */
  code: string;
  /** Kursens namn i det systemet, med datans stavning. */
  name: string;
}

export type CourseSystem = 'gy11' | 'gy25';

export interface CoursePair {
  gy11: CourseVariant;
  gy25: CourseVariant;
}

export const COURSE_PAIRS: CoursePair[] = [
  { gy11: c('BIOBIO01', 'Biologi 1'), gy25: c('BIOG1000X', 'Biologi Nivå 1') },
  { gy11: c('BIOBIO02', 'Biologi 2'), gy25: c('BIOG2000X', 'Biologi Nivå 2') },
  { gy11: c('ENGENG05', 'Engelska 5'), gy25: c('ENGE1000X', 'Engelska Nivå 1') },
  { gy11: c('ENGENG06', 'Engelska 6'), gy25: c('ENGE2000X', 'Engelska Nivå 2') },
  { gy11: c('ENGENG07', 'Engelska 7'), gy25: c('ENGE3000X', 'Engelska Nivå 3') },
  { gy11: c('FYSFYS02', 'Fysik 2'), gy25: c('FYSK2000X', 'Fysik Nivå 2') },
  { gy11: c('HISHIS01a1', 'Historia 1a1'), gy25: c('HIST1A10X', 'Historia Nivå 1a1') },
  { gy11: c('HISHIS01a2', 'Historia 1a2'), gy25: c('HIST1A20X', 'Historia Nivå 1a2') },
  { gy11: c('HISHIS01b', 'Historia 1b'), gy25: c('HIST1B00X', 'Historia Nivå 1b') },
  { gy11: c('KEMKEM01', 'Kemi 1'), gy25: c('KEMI1000X', 'Kemi Nivå 1') },
  { gy11: c('KEMKEM02', 'Kemi 2'), gy25: c('KEMI2000X', 'Kemi Nivå 2') },
  { gy11: c('MATMAT01a', 'Matematik 1a'), gy25: c('MATE1A00X', 'Matematik Nivå 1a') },
  { gy11: c('MATMAT01b', 'Matematik 1b'), gy25: c('MATE1B00X', 'Matematik Nivå 1b') },
  { gy11: c('MATMAT01c', 'Matematik 1c'), gy25: c('MATE1C00X', 'Matematik Nivå 1c') },
  { gy11: c('MATMAT02a', 'Matematik 2a'), gy25: c('MATE2A00X', 'Matematik Nivå 2a') },
  { gy11: c('MATMAT02b', 'Matematik 2b'), gy25: c('MATE2B00X', 'Matematik Nivå 2b') },
  { gy11: c('MATMAT02c', 'Matematik 2c'), gy25: c('MATE2C00X', 'Matematik Nivå 2c') },
  {
    gy11: c('MATMAT03b', 'Matematik 3b'),
    gy25: c('MATO1B00X', 'Matematik – fortsättning Nivå 1b'),
  },
  {
    gy11: c('MATMAT03c', 'Matematik 3c'),
    gy25: c('MATO1C00X', 'Matematik – fortsättning Nivå 1c'),
  },
  { gy11: c('MATMAT04', 'Matematik 4'), gy25: c('MATO2000X', 'Matematik – fortsättning Nivå 2') },
  { gy11: c('MATMAT05', 'Matematik 5'), gy25: c('MATF1000X', 'Matematik – fördjupning Nivå 1') },
  { gy11: c('NAKNAK01a1', 'Naturkunskap 1a1'), gy25: c('NATU1A10X', 'Naturkunskap Nivå 1a1') },
  { gy11: c('NAKNAK01a2', 'Naturkunskap 1a2'), gy25: c('NATU1A20X', 'Naturkunskap Nivå 1a2') },
  { gy11: c('NAKNAK01b', 'Naturkunskap 1b'), gy25: c('NATU1B00X', 'Naturkunskap Nivå 1b') },
  { gy11: c('NAKNAK02', 'Naturkunskap 2'), gy25: c('NATU2000X', 'Naturkunskap Nivå 2') },
  { gy11: c('PSKPSY01', 'Psykologi 1'), gy25: c('PSYL1000X', 'Psykologi Nivå 1') },
  { gy11: c('RELREL01', 'Religionskunskap 1'), gy25: c('RELI1000X', 'Religionskunskap Nivå 1') },
  {
    gy11: c('SAMSAM01a1', 'Samhällskunskap 1a1'),
    gy25: c('SAMH1A10X', 'Samhällskunskap Nivå 1a1'),
  },
  {
    gy11: c('SAMSAM01a2', 'Samhällskunskap 1a2'),
    gy25: c('SAMH1A20X', 'Samhällskunskap Nivå 1a2'),
  },
  { gy11: c('SAMSAM01b', 'Samhällskunskap 1b'), gy25: c('SAMH1B00X', 'Samhällskunskap Nivå 1b') },
  { gy11: c('SVESVE01', 'Svenska 1'), gy25: c('SVEN1000X', 'Svenska Nivå 1') },
  { gy11: c('SVESVE02', 'Svenska 2'), gy25: c('SVEN2000X', 'Svenska Nivå 2') },
  { gy11: c('SVESVE03', 'Svenska 3'), gy25: c('SVEN3000X', 'Svenska Nivå 3') },
  {
    gy11: c('SVASVA01', 'Svenska som andraspråk 1'),
    gy25: c('SVEA1000X', 'Svenska som andraspråk Nivå 1'),
  },
  {
    gy11: c('SVASVA02', 'Svenska som andraspråk 2'),
    gy25: c('SVEA2000X', 'Svenska som andraspråk Nivå 2'),
  },
  {
    gy11: c('SVASVA03', 'Svenska som andraspråk 3'),
    gy25: c('SVEA3000X', 'Svenska som andraspråk Nivå 3'),
  },
];

function c(code: string, name: string): CourseVariant {
  return { code, name };
}

/** Vilket system en kurskod tillhör, och kursens andra namn. */
export interface Counterpart {
  /** Systemet listningens egen kurskod tillhör. */
  system: CourseSystem;
  /** Samma kurs i det andra systemet. */
  other: CourseVariant;
}

const BY_CODE = new Map<string, Counterpart>();
for (const pair of COURSE_PAIRS) {
  BY_CODE.set(pair.gy11.code.toLowerCase(), { system: 'gy11', other: pair.gy25 });
  BY_CODE.set(pair.gy25.code.toLowerCase(), { system: 'gy25', other: pair.gy11 });
}

/**
 * Kursens andra namn, eller `undefined` när kursen bara finns i ett system —
 * eller när ingen källa har skrivit ut paret. Tystnaden är avsiktlig: appen
 * säger hellre ingenting om övergången än fel sak.
 */
export function courseCounterpart(courseCode: string): Counterpart | undefined {
  return BY_CODE.get(courseCode.trim().toLowerCase());
}
