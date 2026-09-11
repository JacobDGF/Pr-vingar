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
 * Kurser som bara finns i ett av systemen står inte här, och tystnaden gäller
 * tills en källa faktiskt skriver ut paret. Fysik 1a och Fysik nivå 1b listades
 * var för sig hos Örebro, utan att paras ihop — Helsingborg lägger dem på samma
 * rad, och först då hör de ihop här.
 *
 * Källor: gymnasieskolor.orebro.se, Komvux Örebros prövningstabell hösten 2026,
 * läst 2026-09-10, och helsingborg.se, "Gymnasiala kurser – jämförelse Gy25",
 * läst 2026-09-11.
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
  // Paren nedan är lästa ur Helsingborgs stads jämförelsetabell, som kommunens
  // betygsprövningssida länkar till som "hela listan på kurser och ämne du kan
  // göra prövningar i" — samma slags källa som Örebros tabell, men för nästan
  // hela gymnasieutbudet i stället för kärnämnena. Två av dess rader står inte
  // här, för de är inte par: Datorteknik 1a *eller* 1b blir en enda nivå
  // (DATR1000X), och Matematik specialisering blir två (MASB1000X, MASC1000X).
  // En tabell med ett namn per kod kan inte säga det utan att ljuga om det
  // andra hållet, och prövningarna finns ändå som egna listningar.
  //
  // Tre koder är hämtade ur datans egen stavning i stället för tabellens, där
  // tabellen motsäger sig själv: den trycker PSYL1000X på både Psykologi nivå 1
  // och nivå 2 (Göteborgs listning skriver PSYL2000X för nivå 2), och skriver
  // HALAHL0 och SPCSSPE01 där både Skolverkets kod och Göteborgs listningar har
  // HALHAL0 och SPCSPE01. En kod med en bokstav fel leder till fel
  // förberedelsematerial, och då är den korrekturläsningen värd mer än
  // troheten mot tryckfelet.
  //
  // Källa: helsingborg.se, "Gymnasiala kurser – jämförelse Gy25", läst 2026-09-11.
  { gy11: c('ADMADM01', 'Administration 1'), gy25: c('ADMI1000X', 'Administration Nivå 1') },
  { gy11: c('ADMADM02', 'Administration 2'), gy25: c('ADMI2000X', 'Administration Nivå 2') },
  { gy11: c('ARKARK0', 'Arkitektur – hus'), gy25: c('ARKI1000X', 'Arkitektur Nivå 1') },
  { gy11: c('DIGDIG01', 'Digitalt skapande 1'), gy25: c('DIGA1000X', 'Digitalt skapande Nivå 1') },
  { gy11: c('DIGDIG02', 'Digitalt skapande 2'), gy25: c('DIGA2000X', 'Digitalt skapande Nivå 2') },
  { gy11: c('ENTENR0', 'Entreprenörskap'), gy25: c('ENTR1000X', 'Entreprenörskap Nivå 1') },
  { gy11: c('FIOFIO01', 'Filosofi 1'), gy25: c('FILS1000X', 'Filosofi Nivå 1') },
  { gy11: c('FIOFIO02', 'Filosofi 2'), gy25: c('FILS2000X', 'Filosofi Nivå 2') },
  { gy11: c('FYSFYS01a', 'Fysik 1a'), gy25: c('FYSK1B00X', 'Fysik Nivå 1b') },
  { gy11: c('FYSFYS01b1', 'Fysik 1b1'), gy25: c('FYSK1A10X', 'Fysik Nivå 1a1') },
  { gy11: c('FYSFYS01b2', 'Fysik 1b2'), gy25: c('FYSK1A20X', 'Fysik Nivå 1a2') },
  {
    gy11: c('FÖRENT0', 'Entreprenörskap och företagande'),
    gy25: c('ENTP1000X', 'Entreprenörskap och företagande Nivå 1'),
  },
  { gy11: c('FÖRFÖR01', 'Företagsekonomi 1'), gy25: c('FOET1000X', 'Företagsekonomi Nivå 1') },
  { gy11: c('FÖRFÖR02', 'Företagsekonomi 2'), gy25: c('FOET2000X', 'Företagsekonomi Nivå 2') },
  { gy11: c('FÖRMAD0', 'Marknadsföring'), gy25: c('MARK1000X', 'Marknadsföring Nivå 1') },
  { gy11: c('FÖRRED01', 'Redovisning 1'), gy25: c('REDO1000X', 'Redovisning Nivå 1') },
  { gy11: c('GEOGEO01', 'Geografi 1'), gy25: c('GEOG1000X', 'Geografi Nivå 1') },
  { gy11: c('GEOGEO02', 'Geografi 2'), gy25: c('GEOG2000X', 'Geografi Nivå 2') },
  { gy11: c('HALHAL0', 'Hälsopedagogik'), gy25: c('HALS1000X', 'Hälsopedagogik Nivå 1') },
  { gy11: c('HISHIS02a', 'Historia 2a'), gy25: c('HIST2A00X', 'Historia Nivå 2a') },
  { gy11: c('HISHIS02b', 'Historia 2b – kultur'), gy25: c('HIST2B00X', 'Historia Nivå 2b') },
  { gy11: c('INKLOG01', 'Logistik 1'), gy25: c('LOGS1000X', 'Logistik Nivå 1') },
  { gy11: c('KOSFIL0', 'Film- och TV-kunskap'), gy25: c('FILM1000X', 'Filmkunskap Nivå 1') },
  {
    gy11: c('LATLAT01', 'Latin - språk och kultur 1'),
    gy25: c('LATI1000X', 'Latin – språk och kultur Nivå 1'),
  },
  {
    gy11: c('LEDLED0', 'Ledarskap och organisation'),
    gy25: c('LEDA1000X', 'Ledarskap och organisation Nivå 1'),
  },
  { gy11: c('MEPMEI01', 'Medieproduktion 1'), gy25: c('MEDP1000X', 'Medieproduktion Nivå 1') },
  {
    gy11: c('MODDAN01', 'Moderna språk 1, Danska'),
    gy25: c('MODY1000XDAN', 'Moderna språk – nybörjare Nivå 1, Danska'),
  },
  {
    gy11: c('MODDEU01', 'Moderna språk 1, Tyska'),
    gy25: c('MODY1000XDEU', 'Moderna språk – nybörjare Nivå 1, Tyska'),
  },
  {
    gy11: c('MODDEU02', 'Moderna språk 2, Tyska'),
    gy25: c('MODG1000XDEU', 'Moderna språk – grund Nivå 1, Tyska'),
  },
  {
    gy11: c('MODDEU03', 'Moderna språk 3, Tyska'),
    gy25: c('MODO1000XDEU', 'Moderna språk – fortsättning Nivå 1, Tyska'),
  },
  {
    gy11: c('MODDEU04', 'Moderna språk 4, Tyska'),
    gy25: c('MODO2000XDEU', 'Moderna språk – fortsättning Nivå 2, Tyska'),
  },
  {
    gy11: c('MODDEU05', 'Moderna språk 5, Tyska'),
    gy25: c('MODF1000XDEU', 'Moderna språk – fördjupning Nivå 1, Tyska'),
  },
  {
    gy11: c('MODFRA01', 'Moderna språk 1, Franska'),
    gy25: c('MODY1000XFRA', 'Moderna språk – nybörjare Nivå 1, Franska'),
  },
  {
    gy11: c('MODFRA02', 'Moderna språk 2, Franska'),
    gy25: c('MODG1000XFRA', 'Moderna språk – grund Nivå 1, Franska'),
  },
  {
    gy11: c('MODFRA03', 'Moderna språk 3, Franska'),
    gy25: c('MODO1000XFRA', 'Moderna språk – fortsättning Nivå 1, Franska'),
  },
  {
    gy11: c('MODFRA04', 'Moderna språk 4, Franska'),
    gy25: c('MODO2000XFRA', 'Moderna språk – fortsättning Nivå 2, Franska'),
  },
  {
    gy11: c('MODFRA05', 'Moderna språk 5, Franska'),
    gy25: c('MODF1000XFRA', 'Moderna språk – fördjupning Nivå 1, Franska'),
  },
  {
    gy11: c('MODITA01', 'Moderna språk 1, Italienska'),
    gy25: c('MODY1000XITA', 'Moderna språk – nybörjare Nivå 1, Italienska'),
  },
  {
    gy11: c('MODITA02', 'Moderna språk 2, Italienska'),
    gy25: c('MODG1000XITA', 'Moderna språk – grund Nivå 1, Italienska'),
  },
  {
    gy11: c('MODITA03', 'Moderna språk 3, Italienska'),
    gy25: c('MODO1000XITA', 'Moderna språk – fortsättning Nivå 1, Italienska'),
  },
  {
    gy11: c('MODSPA01', 'Moderna språk 1, Spanska'),
    gy25: c('MODY1000XSPA', 'Moderna språk – nybörjare Nivå 1, Spanska'),
  },
  {
    gy11: c('MODSPA02', 'Moderna språk 2, Spanska'),
    gy25: c('MODG1000XSPA', 'Moderna språk – grund Nivå 1, Spanska'),
  },
  {
    gy11: c('MODSPA03', 'Moderna språk 3, Spanska'),
    gy25: c('MODO1000XSPA', 'Moderna språk – fortsättning Nivå 1, Spanska'),
  },
  {
    gy11: c('MODSPA04', 'Moderna språk 4, Spanska'),
    gy25: c('MODO2000XSPA', 'Moderna språk – fortsättning Nivå 2, Spanska'),
  },
  { gy11: c('PRRPRR01', 'Programmering 1'), gy25: c('PROG1000X', 'Programmering Nivå 1') },
  { gy11: c('PRRPRR02', 'Programmering 2'), gy25: c('PROG2000X', 'Programmering Nivå 2') },
  { gy11: c('PSKPSY02a', 'Psykologi 2a'), gy25: c('PSYL2000X', 'Psykologi Nivå 2') },
  { gy11: c('PSYPSY01', 'Psykiatri 1'), gy25: c('PSYK1000X', 'Psykiatri Nivå 1') },
  { gy11: c('RELREL02', 'Religionskunskap 2'), gy25: c('RELI2000X', 'Religionskunskap Nivå 2') },
  {
    gy11: c('SAMINE0', 'Internationell ekonomi'),
    gy25: c('INTE1000X', 'Internationell ekonomi Nivå 1'),
  },
  {
    gy11: c('SAMINR0', 'Internationella relationer'),
    gy25: c('INTR1000X', 'Internationella relationer Nivå 1'),
  },
  { gy11: c('SAMSAM02', 'Samhällskunskap 2'), gy25: c('SAMH2000X', 'Samhällskunskap Nivå 2') },
  { gy11: c('SAMSAM03', 'Samhällskunskap 3'), gy25: c('SAMH3000X', 'Samhällskunskap Nivå 3') },
  {
    gy11: c('SEVSEV01', 'Service och bemötande 1'),
    gy25: c('SERV1000X', 'Service och bemötande Nivå 1'),
  },
  { gy11: c('SPCSPE01', 'Specialpedagogik 1'), gy25: c('SPEI1000X', 'Specialpedagogik Nivå 1') },
  { gy11: c('SVERET0', 'Retorik'), gy25: c('RETO1000X', 'Retorik Nivå 1') },
  { gy11: c('TEKTEK01', 'Teknik 1'), gy25: c('TEKI1000X', 'Teknik Nivå 1') },
  {
    gy11: c('WESWEB01', 'Webbserverprogrammering 1'),
    gy25: c('WEBS1000X', 'Webbserverprogrammering Nivå 1'),
  },
  { gy11: c('WEUWEB01', 'Webbutveckling 1'), gy25: c('WEBB1000X', 'Webbutveckling Nivå 1') },
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

/**
 * Den andra läroplanens listning hos samma skola, när skolan prövar båda.
 *
 * Att veta att kursen också heter något annat är halva svaret; den andra halvan
 * är prövningen med det namnet, och den har hittills bara gått att nå genom att
 * stänga detaljvyn och söka om på ett namn man just läst. Anordnarna publicerar
 * de två varianterna som två anmälningar, så den som står vid fel av dem är ett
 * steg från rätt — och det steget hör hemma där meningen står.
 *
 * Nyckeln är skolan och orten, inte anordnaren: `Komvux Örebro (Talenti)` och
 * `Komvux Örebro` vore två skolor för en läsare, och en länk mellan dem vore ett
 * påstående om att prövningarna hör ihop som vi inte har täckning för.
 */
export function counterpartListing<
  T extends { schoolName: string; city: string; courseCode: string },
>(exam: T, exams: readonly T[]): T | undefined {
  const other = courseCounterpart(exam.courseCode)?.other;
  if (!other) return undefined;
  const wanted = other.code.trim().toLowerCase();
  return exams.find(
    (e) =>
      e !== exam &&
      e.schoolName === exam.schoolName &&
      e.city === exam.city &&
      e.courseCode.trim().toLowerCase() === wanted,
  );
}
