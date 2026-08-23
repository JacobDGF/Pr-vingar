import { Exam, ExamComponent, NextPeriod } from '../types';

// Date this dataset's facts (providers, prices, URLs, periods) were checked against
// each provider's own website / official municipal source.
const VERIFIED = '2026-06-24';

const FREE_IF_PRIOR_F = 'Kostnadsfritt om du redan har betyg F i kursen.';
const NON_REFUNDABLE = 'Avgiften betalas vid anmälan och återbetalas inte vid avbokning.';

const TIPS_MATEMATIK = [
  'Khan Academy har gratisgenomgångar för de flesta matematikkurser på svenska.',
  'Gör gamla nationella prov från Skolverket – prövningar följer samma struktur.',
  'Träna både utan och med digitala hjälpmedel, det är ofta uppdelat i delprov.',
  'Repetera grundalgebra ordentligt innan du går vidare till kursens nya moment.',
];

const TIPS_ENGELSKA = [
  'Lyssna på engelska poddar eller nyheter dagligen för att träna hörförståelse.',
  'Läs en bok eller längre artiklar på engelska – notera nya ord i en lista.',
  'Öva muntlig produktion genom att spela in dig själv och lyssna igenom.',
  'Skriv korta texter regelbundet och be någon ge feedback på struktur och språk.',
];

const TIPS_SVENSKA = [
  'Läs förra årets nationella prov i Svenska för att se hur uppgifterna är upplagda.',
  'Träna källkritik och hur man bygger en argumenterande text med tydlig tes.',
  'Repetera språkriktighet: styckeindelning, sambandsord och meningsbyggnad.',
  'Öva den muntliga delen genom att förbereda och hålla en kort presentation.',
];

const TIPS_KEMI = [
  'Gå igenom det periodiska systemet och vanliga bindningstyper grundligt.',
  'Räkna på mol, koncentration och stökiometri – det är ofta en stor del av provet.',
  'Khan Academy Chemistry har bra förklaringar om du vill ha det på engelska.',
  'Repetera laborationssäkerhet och hur man skriver en labbrapport.',
];

const TIPS_FYSIK = [
  'Förstå Newtons lagar och kraftdiagram – grunden för många uppgifter.',
  'Öva på att räkna med enheter (SI-enheter) genomgående i alla uträkningar.',
  'Gör gamla nationella prov i fysik från Skolverkets bedömningsportal.',
  'Rita figurer till uppgifterna – det gör det lättare att se vad som söks.',
];

const TIPS_PSYKOLOGI = [
  'Lär dig de klassiska experimenten (Pavlov, Skinner, Milgram) och vad de visade.',
  'Repetera de olika psykologiska perspektiven och vad som skiljer dem åt.',
  'Crash Course Psychology på YouTube är ett bra komplement till kursboken.',
  'Öva på att koppla teori till konkreta vardagsexempel i dina svar.',
];

const TIPS_SAMHALLSKUNSKAP = [
  'Följ aktuella nyheter (SVT, DN) för exempel du kan använda i dina svar.',
  'Repetera hur Sveriges politiska system och rättssystem fungerar i praktiken.',
  'Lär dig grunderna i nationalekonomi: utbud, efterfrågan och konjunktur.',
  'Öva på att resonera kring olika perspektiv – samhällskunskap bedömer ofta analysförmåga.',
];

const COMPONENTS_MATEMATIK: ExamComponent[] = [
  {
    name: 'Del A – utan hjälpmedel',
    duration: '1–1,5 timmar',
    description: 'Räkneuppgifter utan miniräknare, fokus på begrepp och metod.',
  },
  {
    name: 'Del B – med hjälpmedel',
    duration: '1,5–2 timmar',
    description: 'Mer omfattande problemlösning, digitala verktyg tillåtna.',
  },
];

const COMPONENTS_ENGELSKA: ExamComponent[] = [
  {
    name: 'Skriftlig produktion',
    duration: '2 timmar',
    description: 'Skriva en längre text utifrån givet ämne.',
  },
  {
    name: 'Hörförståelse',
    duration: '45 min',
    description: 'Lyssna på autentiskt material och besvara frågor.',
  },
  {
    name: 'Muntlig examination',
    duration: '15–20 min',
    description: 'Samtal eller presentation på engelska.',
  },
];

const COMPONENTS_SVENSKA: ExamComponent[] = [
  {
    name: 'Skriftlig uppgift',
    duration: '3 timmar',
    description: 'Argumenterande eller utredande text med källhänvisning.',
  },
  {
    name: 'Muntlig redovisning',
    duration: '10–15 min',
    description: 'Presentera och diskutera ett valt ämne.',
  },
];

const COMPONENTS_KEMI: ExamComponent[] = [
  {
    name: 'Skriftligt prov',
    duration: '2–2,5 timmar',
    description: 'Teori och beräkningar inom kursens centrala innehåll.',
  },
  {
    name: 'Laborativt moment',
    duration: 'Varierar',
    description: 'Praktisk laboration eller skriftlig labbrapport, enligt skolans upplägg.',
  },
];

const COMPONENTS_FYSIK: ExamComponent[] = [
  {
    name: 'Skriftligt prov',
    duration: '2,5–3 timmar',
    description: 'Begrepp, beräkningar och problemlösning enligt kursplanen.',
  },
];

const COMPONENTS_PSYKOLOGI: ExamComponent[] = [
  {
    name: 'Skriftligt prov',
    duration: '2 timmar',
    description: 'Psykologins perspektiv, historia och tillämpning.',
  },
];

const COMPONENTS_SAMHALLSKUNSKAP: ExamComponent[] = [
  {
    name: 'Skriftligt prov',
    duration: '2,5 timmar',
    description: 'Demokrati, politik, ekonomi och samhällsstrukturer.',
  },
];

const TIPS_NATURKUNSKAP = [
  'Repetera ekologi, evolution och människokroppens organsystem grundligt.',
  'Öva på att koppla ihop naturvetenskap med samhällsfrågor, t.ex. klimat och hälsa.',
  'Gamla nationella prov i naturkunskap ger en bra bild av frågeformatet.',
  'Träna på att läsa och tolka diagram, tabeller och grafer korrekt.',
];

const COMPONENTS_NATURKUNSKAP: ExamComponent[] = [
  {
    name: 'Skriftligt prov',
    duration: '2–2,5 timmar',
    description: 'Frågor om ekologi, evolution, hälsa och naturvetenskapliga metoder.',
  },
];

const TIPS_VARD = [
  'Repetera grundläggande vård- och omsorgsbegrepp samt bemötande och etik.',
  'Läs på om vanliga sjukdomstillstånd och hur de påverkar vardagen för patienten.',
  'Öva praktiska moment (t.ex. hygienrutiner) om provet har en praktisk del.',
  'Koppla teorin till konkreta patientfall — det är ofta så frågorna är upplagda.',
];

const COMPONENTS_VARD: ExamComponent[] = [
  {
    name: 'Skriftligt prov',
    duration: '2–3 timmar',
    description: 'Teorifrågor om vård, omsorg, bemötande och etik enligt kursplanen.',
  },
  {
    name: 'Praktiskt/muntligt moment',
    duration: 'Varierar',
    description: 'Praktisk examination eller muntlig redovisning, enligt skolans upplägg.',
  },
];

const TIPS_FLERA = [
  'Kontakta skolan tidigt för att få exakt kurskod och provupplägg för din kurs.',
  'Fråga om gamla tentor eller övningsmaterial för just den kurs du ska pröva.',
  'Gamla nationella prov från Skolverket är ofta bra övning oavsett ämne.',
  'Boka in god tid för självstudier — en hel kurs ska läsas in på egen hand.',
];

const COMPONENTS_FLERA: ExamComponent[] = [
  {
    name: 'Prövning enligt kursplan',
    duration: 'Varierar',
    description:
      'Provets upplägg (skriftligt/muntligt/praktiskt) beror på vilken kurs som prövas — kontrollera med skolan.',
  },
];

// Second research pass covering providers outside the initial 23 (nationwide sweep).
const NATIONWIDE_VERIFIED = '2026-07-12';
const STHLM_LAN_VERIFIED = '2026-08-09';
// Autumn 2026 sweep: re-read the providers whose application windows open in
// August, since those are the listings a stale date hurts most.
const AUTUMN_VERIFIED = '2026-08-11';
const LATE_SUMMER_VERIFIED = '2026-08-12';
// Link sweep of the listings that still landed on an information page (#21).
const LINK_SWEEP_VERIFIED = '2026-08-13';
// Sweep for the län the dataset barely covered — Kronoberg, Jönköping and
// Halland each had a single town, so someone outside it saw an empty map.
const THIN_LAN_VERIFIED = '2026-08-15';
// Checked 2026-08-18, against each provider's own page.
const AUG_18_VERIFIED = '2026-08-18';
// Second thin-län sweep (2026-08-19): Jämtland had one listing, Värmland,
// Västmanland and Jönköping two apiece — a map with one dot on it reads as
// "there is nothing here", which for these four län was never true.
const THIN_LAN_2_VERIFIED = '2026-08-19';
// Fullbokat-svep 2026-08-20: läste alla 95 nåbara anordnarsidor efter
// anordnarens egna ord för "det finns inga platser kvar".
const FULL_SWEEP_VERIFIED = '2026-08-20';
// Datumsvep 2026-08-23: läste om de listningar vars omgång hade gått ut och de
// äldsta odaterade (verifierade 24 juni / 12 juli), enligt #24.
const AUG_23_VERIFIED = '2026-08-23';

/**
 * For providers who put the anmälan on their own page — but only while the
 * window is open.
 *
 * The derived `page` flow tells the user to "leta upp anmälningslänken eller
 * blanketten på sidan". That is the right instruction when the link is there
 * and merely buried; it is the wrong one when the provider hasn't published it
 * yet, because it sends somebody hunting a page for something that does not
 * exist and leaves them assuming they missed it. These providers all say when
 * it appears, so say that instead — the page is still the honest destination,
 * we just stop pretending the form is already on it.
 *
 * @param what  what shows up on the page, e.g. 'anmälningsformuläret'
 * @param when  the provider's own wording for when, e.g. 'den 24 augusti kl. 10'
 */
function publishedOnPage(what: string, when: string): Exam['registration'] {
  return {
    kind: 'page',
    ctaLabel: 'Öppna anmälningssidan',
    landing: `Anmälan görs via ${what}, som anordnaren publicerar på den här sidan ${when}.`,
    steps: [
      `${what[0].toUpperCase()}${what.slice(1)} finns på sidan ${when}`,
      'Fyll i anmälan för din kurs',
      'Betala avgiften enligt anordnarens instruktioner',
    ],
  };
}

/**
 * Stockholms stad's autumn 2026 prövningsomgång.
 *
 * The city moved to one opening day per school, staggered across weeks 33–35
 * (Jensen 11 aug, Komvux Södermalm 13 aug, NTI 17 aug, Hermods 26 aug), and no
 * school publishes a closing date — registration shuts when the seats are gone.
 * So the window is encoded half-open: a real start, no invented end.
 */
function sthlmAutumn2026(opensOn: string, opensLabel: string): NextPeriod {
  return {
    label:
      `Anmälan öppnar ${opensLabel} och stänger så snart platserna är fullbokade. ` +
      'Prövningen genomförs under hösten 2026, planerad så att betyget hinner fram till sista ' +
      'kompletteringsdagen i början av december. Nästa möjlighet därefter är i början av 2027.',
    applicationStart: opensOn,
    confirmed: true,
  };
}

export const EXAMS: Exam[] = [
  {
    id: 'sodermalm-kemi1',
    schoolName: 'Komvux Södermalm',
    provider: 'Stockholms stad',
    subject: 'Kemi',
    course: 'Kemi 1',
    courseCode: 'KEMKEM01',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Stockholm (campusadress bekräftas vid anmälan)',
    lat: 59.3142,
    lng: 18.0735,
    price: 500,
    priceNote: FREE_IF_PRIOR_F,
    nextPeriod: sthlmAutumn2026('2026-08-13', 'torsdag 13 augusti 2026'),
    components: COMPONENTS_KEMI,
    studyTips: TIPS_KEMI,
    // Checked 2026-08-13: anmälan is a form published on this page when the
    // school's window opens — "anmälan blir tillgänglig på den dag och tid som
    // anges i prövningsschemat", först till kvarn, ingen reservlista och ingen
    // efteranmälan. No deeper link exists to point at in the meantime.
    registration: publishedOnPage('anmälningsformuläret', 'den 13 augusti kl. 10'),
    registrationUrl: 'https://komvuxsodermalm.stockholm/provningar/anmalan-till-provning/',
    infoUrl:
      'https://komvuxsodermalm.stockholm/provningar/obligatorisk-forberedelse-infor-provning/kemi-laroplan-gy11gy25/provning-i-kemi-1/',
    description:
      'Prövning i Kemi 1 hos Komvux Södermalm, en av Stockholms stads vuxenutbildningar. Avgiften följer det nationella pristaket på 500 kr.',
    tags: ['kemi', 'naturvetenskap', 'stockholm'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'sodermalm-fysik2',
    schoolName: 'Komvux Södermalm',
    provider: 'Stockholms stad',
    subject: 'Fysik',
    course: 'Fysik 2',
    courseCode: 'FYSFYS02',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Stockholm (campusadress bekräftas vid anmälan)',
    lat: 59.3142,
    lng: 18.0735,
    price: 500,
    priceNote: FREE_IF_PRIOR_F,
    nextPeriod: sthlmAutumn2026('2026-08-13', 'torsdag 13 augusti 2026'),
    components: COMPONENTS_FYSIK,
    studyTips: TIPS_FYSIK,
    // Checked 2026-08-13: anmälan is a form published on this page when the
    // school's window opens — "anmälan blir tillgänglig på den dag och tid som
    // anges i prövningsschemat", först till kvarn, ingen reservlista och ingen
    // efteranmälan. No deeper link exists to point at in the meantime.
    registration: publishedOnPage('anmälningsformuläret', 'den 13 augusti kl. 10'),
    registrationUrl: 'https://komvuxsodermalm.stockholm/provningar/anmalan-till-provning/',
    infoUrl:
      'https://komvuxsodermalm.stockholm/provningar/obligatorisk-forberedelse-infor-provning/fysik-laroplan-gy11gy25/provning-i-fysik-2/',
    description:
      'Prövning i Fysik 2 hos Komvux Södermalm. Krävs ofta för tekniska och naturvetenskapliga högskoleutbildningar.',
    tags: ['fysik', 'naturvetenskap', 'stockholm'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'taby-flera',
    schoolName: 'Medlearn (Täby / KCNO)',
    provider: 'Täby kommun',
    subject: 'Matematik',
    course: 'Flera kurser (kontakta skolan för exakt kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Täby',
    region: 'Stockholm',
    address: 'Kemistvägen 10A, Täby',
    lat: 59.4439,
    lng: 18.0687,
    price: 500,
    priceNote: 'Begränsat antal platser, först till kvarn.',
    // Checked 2026-08-20: samma upplägg som Iris — "Formuläret visas endast på
    // den aktuella Anmälningsdagen för Prövning och avaktiveras när platserna
    // är fullbokade", max 10 platser i Täby. Anmälningsfönstret är en förmiddag,
    // inte en period.
    nextPeriod: {
      label:
        'Provtillfälle 25 september 2026. Anmälan öppnar torsdag 27 augusti kl. 9:00 och stänger ' +
        'samma förmiddag — formuläret visas bara den dagen. Max 10 platser i Täby.',
      applicationStart: '2026-08-27',
      applicationEnd: '2026-08-27',
      examWindowStart: '2026-09-25',
      examWindowEnd: '2026-09-25',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://shop.medlearn.se/produkt/provning-for-betyg-i-taby/',
    infoUrl: 'https://medlearn.se/utbildning/provning/',
    description:
      'Medlearn genomför betygsprövning för KCNO (Täby, Danderyd, Vallentuna, Vaxholm, Österåker) minst två gånger per termin. Matematik och svenska är vanliga ämnen, men kontakta skolan för exakt kurskod inför din anmälan.',
    tags: ['matematik', 'taby', 'kcno'],
    verifiedAt: FULL_SWEEP_VERIFIED,
  },
  {
    id: 'hermods-liljeholmen-ma2b',
    schoolName: 'Hermods Komvux Liljeholmen',
    provider: 'Hermods',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Lövholmsvägen 18, Liljeholmen, Stockholm',
    lat: 59.3072,
    lng: 18.0125,
    price: 500,
    priceNote: FREE_IF_PRIOR_F + ' Förutsätter att din hemkommun har avtal med Hermods.',
    nextPeriod: sthlmAutumn2026('2026-08-26', 'onsdag 26 augusti 2026'),
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://sites.google.com/a/edu.hermods.se/provning-stockholm',
    infoUrl: 'https://hermods.se/komvux/provning/',
    description:
      'Hermods erbjuder prövning i Matematik 2b på kontrakt åt anslutna kommuner, med skriftligt prov på plats i Liljeholmen.',
    tags: ['matematik', 'stockholm', 'hermods'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'nti-ma2b',
    schoolName: 'NTI-skolan',
    provider: 'NTI-skolan',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Hammarby Fabriksväg 65, Stockholm (provlokal, bekräftas vid anmälan)',
    lat: 59.3045,
    lng: 18.1004,
    price: 500,
    priceNote:
      NON_REFUNDABLE + ' Studerar du distans kan provet i vissa fall skrivas på annan godkänd ort.',
    nextPeriod: {
      label: 'Ansökan öppnar 17 augusti 2026 kl. 09:00 — provdatum publiceras strax efter.',
      applicationStart: '2026-08-17',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://ansokan-provning.nti.se/',
    infoUrl: 'https://nti.se/distansutbildning/provning/',
    description:
      'NTI-skolan erbjuder nationell prövning i Matematik 2b för elever i kommuner med avtal. Antas du inte denna omgång är nästa möjlighet våren 2027.',
    tags: ['matematik', 'distans', 'nti'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'nti-psykologi1',
    schoolName: 'NTI-skolan',
    provider: 'NTI-skolan',
    subject: 'Psykologi',
    course: 'Psykologi 1',
    courseCode: 'PSKPSY01',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Hammarby Fabriksväg 65, Stockholm (provlokal, bekräftas vid anmälan)',
    lat: 59.3045,
    lng: 18.1004,
    price: 500,
    priceNote: NON_REFUNDABLE,
    nextPeriod: {
      label: 'Ansökan öppnar 17 augusti 2026 kl. 09:00 — provdatum publiceras strax efter.',
      applicationStart: '2026-08-17',
      confirmed: true,
    },
    components: COMPONENTS_PSYKOLOGI,
    studyTips: TIPS_PSYKOLOGI,
    registrationUrl: 'https://ansokan-provning.nti.se/',
    infoUrl: 'https://nti.se/distansutbildning/provning/',
    description:
      'Nationell prövning i Psykologi 1 via NTI-skolan, för elever i kommuner med avtal.',
    tags: ['psykologi', 'distans', 'nti'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'nti-samkun1b',
    schoolName: 'NTI-skolan',
    provider: 'NTI-skolan',
    subject: 'Samhällskunskap',
    course: 'Samhällskunskap 1b',
    courseCode: 'SAMSAM01b',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Hammarby Fabriksväg 65, Stockholm (provlokal, bekräftas vid anmälan)',
    lat: 59.3045,
    lng: 18.1004,
    price: 500,
    priceNote: NON_REFUNDABLE,
    nextPeriod: {
      label: 'Ansökan öppnar 17 augusti 2026 kl. 09:00 — provdatum publiceras strax efter.',
      applicationStart: '2026-08-17',
      confirmed: true,
    },
    components: COMPONENTS_SAMHALLSKUNSKAP,
    studyTips: TIPS_SAMHALLSKUNSKAP,
    registrationUrl: 'https://ansokan-provning.nti.se/',
    infoUrl: 'https://nti.se/distansutbildning/provning/',
    description:
      'Nationell prövning i Samhällskunskap 1b via NTI-skolan, för elever i kommuner med avtal.',
    tags: ['samhallskunskap', 'distans', 'nti'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'jensen-ma2b',
    schoolName: 'JENSEN komvux Stockholm',
    provider: 'JENSEN vuxenutbildning',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Stockholm (provlokal meddelas vid anmälan)',
    lat: 59.3251,
    lng: 18.0711,
    price: 500,
    priceNote: FREE_IF_PRIOR_F,
    nextPeriod: {
      // Checked 2026-08-20: JENSEN's Typeform now answers with
      // `"isFormClosed":true` and the close screen "Formuläret är just nu
      // stängt … vi redan har fått in det maximala antalet ansökningar för
      // denna prövningsperiod". Their own page states the rule — "formuläret
      // kommer automatiskt att stängas när vi har uppnått max antal
      // ansökningar", ingen reservlista — so the closed form *is* JENSEN
      // saying fullbokat. Leaving this as a half-open window kept the card
      // green for a booking that lasted five minutes on 11 August.
      label:
        'Anmälan öppnade 11 augusti 2026 kl. 11:00 och är redan stängd — formuläret stänger automatiskt när max antal ansökningar nåtts, och JENSEN har ingen reservlista. Höstens prövningar genomförs 7–18 september eller 12–23 oktober för dem som kom in. Nästa möjlighet att anmäla sig är i början av 2027.',
      applicationStart: '2026-08-11',
      examWindowStart: '2026-09-07',
      examWindowEnd: '2026-10-23',
      confirmed: true,
      full: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://form.typeform.com/to/Nitj2W7p',
    infoUrl: 'https://www.jensenkomvux.se/provning',
    description:
      'JENSEN vuxenutbildning erbjuder prövning i Matematik 2b i Stockholm. Missar du höstens omgång är nästa tillfälle i början av 2027.',
    tags: ['matematik', 'stockholm', 'jensen'],
    verifiedAt: FULL_SWEEP_VERIFIED,
  },
  {
    id: 'jensen-fysik1a',
    schoolName: 'JENSEN komvux Stockholm',
    provider: 'JENSEN vuxenutbildning',
    subject: 'Fysik',
    course: 'Fysik 1a',
    courseCode: 'FYSFYS01a',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Stockholm (provlokal meddelas vid anmälan)',
    lat: 59.3251,
    lng: 18.0711,
    price: 500,
    priceNote: FREE_IF_PRIOR_F + ' Laborativa moment genomförs på plats, inte på distans.',
    nextPeriod: {
      // Checked 2026-08-20: JENSEN's Typeform now answers with
      // `"isFormClosed":true` and the close screen "Formuläret är just nu
      // stängt … vi redan har fått in det maximala antalet ansökningar för
      // denna prövningsperiod". Their own page states the rule — "formuläret
      // kommer automatiskt att stängas när vi har uppnått max antal
      // ansökningar", ingen reservlista — so the closed form *is* JENSEN
      // saying fullbokat. Leaving this as a half-open window kept the card
      // green for a booking that lasted five minutes on 11 August.
      label:
        'Anmälan öppnade 11 augusti 2026 kl. 11:00 och är redan stängd — formuläret stänger automatiskt när max antal ansökningar nåtts, och JENSEN har ingen reservlista. Höstens prövningar genomförs 7–18 september eller 12–23 oktober för dem som kom in. Nästa möjlighet att anmäla sig är i början av 2027.',
      applicationStart: '2026-08-11',
      examWindowStart: '2026-09-07',
      examWindowEnd: '2026-10-23',
      confirmed: true,
      full: true,
    },
    components: COMPONENTS_FYSIK,
    studyTips: TIPS_FYSIK,
    registrationUrl: 'https://form.typeform.com/to/Nitj2W7p',
    infoUrl: 'https://www.jensenkomvux.se/provning',
    description:
      'JENSEN vuxenutbildning erbjuder prövning i Fysik 1a i Stockholm, med laborativa moment på plats.',
    tags: ['fysik', 'stockholm', 'jensen'],
    verifiedAt: FULL_SWEEP_VERIFIED,
  },
  {
    id: 'jensen-kemi1',
    schoolName: 'JENSEN komvux Stockholm',
    provider: 'JENSEN vuxenutbildning',
    subject: 'Kemi',
    course: 'Kemi 1',
    courseCode: 'KEMKEM01',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Stockholm (provlokal meddelas vid anmälan)',
    lat: 59.3251,
    lng: 18.0711,
    price: 500,
    priceNote: FREE_IF_PRIOR_F,
    nextPeriod: {
      // Checked 2026-08-20: JENSEN's Typeform now answers with
      // `"isFormClosed":true` and the close screen "Formuläret är just nu
      // stängt … vi redan har fått in det maximala antalet ansökningar för
      // denna prövningsperiod". Their own page states the rule — "formuläret
      // kommer automatiskt att stängas när vi har uppnått max antal
      // ansökningar", ingen reservlista — so the closed form *is* JENSEN
      // saying fullbokat. Leaving this as a half-open window kept the card
      // green for a booking that lasted five minutes on 11 August.
      label:
        'Anmälan öppnade 11 augusti 2026 kl. 11:00 och är redan stängd — formuläret stänger automatiskt när max antal ansökningar nåtts, och JENSEN har ingen reservlista. Höstens prövningar genomförs 7–18 september eller 12–23 oktober för dem som kom in. Nästa möjlighet att anmäla sig är i början av 2027.',
      applicationStart: '2026-08-11',
      examWindowStart: '2026-09-07',
      examWindowEnd: '2026-10-23',
      confirmed: true,
      full: true,
    },
    components: COMPONENTS_KEMI,
    studyTips: TIPS_KEMI,
    registrationUrl: 'https://form.typeform.com/to/Nitj2W7p',
    infoUrl: 'https://www.jensenkomvux.se/provning',
    description: 'JENSEN vuxenutbildning erbjuder prövning i Kemi 1 i Stockholm.',
    tags: ['kemi', 'stockholm', 'jensen'],
    verifiedAt: FULL_SWEEP_VERIFIED,
  },
  {
    id: 'iris-upplandsvasby-fysik1a',
    schoolName: 'Iris Hadar Upplands Väsby',
    provider: 'Iris Hadar',
    subject: 'Fysik',
    course: 'Fysik 1a',
    courseCode: 'FYSFYS01a',
    level: 'Komvux',
    city: 'Upplands Väsby',
    region: 'Stockholm',
    address: 'Optimusvägen 14, Upplands Väsby',
    lat: 59.52,
    lng: 17.91,
    price: 500,
    priceNote: NON_REFUNDABLE,
    // Checked 2026-08-20: Iris egen produktsida skriver i versaler "ALLA
    // PRÖVNINGSPLATSER FÖR TISDAG DEN 8 SEPTEMBER I UPPLANDS VÄSBY ÄR
    // BOKADE!" och webbshoppen står som "Slut i lager". Datumen såg öppna ut
    // och kortet lyste grönt "Öppen nu" — vilket är exakt det `full` finns
    // för: anordnarens ord slår kalendern.
    nextPeriod: {
      label:
        'Alla platser till provtillfället 8 september 2026 är bokade — Iris skriver "slut i lager". ' +
        'Nästa tillfälle är tisdag 8 december kl. 9–12, med anmälan som öppnar torsdag 5 november ' +
        'kl. 9:00 och stänger så snart platserna är fullbokade. Formuläret visas bara den dagen, ' +
        'och platserna brukar gå åt på minuter.',
      applicationStart: '2026-08-06',
      examWindowStart: '2026-09-08',
      examWindowEnd: '2026-09-08',
      confirmed: true,
      full: true,
    },
    components: COMPONENTS_FYSIK,
    studyTips: TIPS_FYSIK,
    registrationUrl:
      'https://shop.iris.se/produkt/provning-for-betyg-i-upplands-vasby-dar-betyg-saknas-eller-vid-hojning-av-befintligt-betyg/',
    infoUrl: 'https://www.iris.se/provningar/',
    description:
      'Iris Hadar genomför betygsprövning i naturvetenskapliga ämnen i Upplands Väsby ett par gånger per termin.',
    tags: ['fysik', 'upplands-vasby', 'iris'],
    verifiedAt: FULL_SWEEP_VERIFIED,
  },
  {
    id: 'iris-flemingsberg-ma',
    schoolName: 'Iris Hadar Flemingsberg',
    provider: 'Iris Hadar',
    subject: 'Matematik',
    course: 'Flera kurser (Ma 1a–5, kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Flemingsberg',
    region: 'Stockholm',
    address: 'Elektronvägen 6, Flemingsberg',
    lat: 59.22,
    lng: 17.94,
    price: 500,
    priceNote: NON_REFUNDABLE,
    // Checked 2026-08-20: "Anmälan: Öppnar torsdag 27 augusti, 2026, kl.
    // 9:00-12:00 … Formuläret visas endast på den aktuella Anmälningsdagen och
    // avaktiveras när platserna är fullbokade." Ett halvöppet fönster hade
    // låtit kortet lysa grönt i veckor efter att formuläret försvann, så
    // slutdagen är samma dag som öppningsdagen.
    nextPeriod: {
      label:
        'Provtillfälle 25 september 2026 kl. 8–17. Anmälan öppnar torsdag 27 augusti kl. 9:00 och ' +
        'stänger samma förmiddag — formuläret visas bara den dagen och avaktiveras när platserna ' +
        'är fullbokade.',
      applicationStart: '2026-08-27',
      applicationEnd: '2026-08-27',
      examWindowStart: '2026-09-25',
      examWindowEnd: '2026-09-25',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://shop.iris.se/produkt/provning-for-betyg-i-flemingsberg/',
    infoUrl: 'https://www.iris.se/provningar/',
    description:
      'Iris Hadar genomför betygsprövning i Flemingsberg, bland annat i matematik. Ange exakt kurs och kurskod vid anmälan.',
    tags: ['matematik', 'flemingsberg', 'iris'],
    verifiedAt: FULL_SWEEP_VERIFIED,
  },
  {
    id: 'goteborg-ma2b',
    schoolName: 'Prövningsenheten Göteborg',
    provider: 'Göteborgs Stad',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Göteborg',
    region: 'Västra Götaland',
    address: 'Brogatan 4, Göteborg',
    lat: 57.7089,
    lng: 11.9746,
    price: 500,
    priceNote:
      'Avgift betalas minst 4 veckor före provdatum och återbetalas ej, utöver vid läkarintyg.',
    nextPeriod: {
      label:
        'Anmälan till höstterminens prövningar öppnar 1 juli 2026 (schema publiceras 15 juni).',
      applicationStart: '2026-07-01',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://provningsenheten.alvis.se/hittakurser',
    infoUrl: 'https://goteborg.se/wps/portal/enheter/provningsenheten',
    description:
      'Göteborgs Stads Prövningsenhet samordnar betygsprövning i gymnasiekurser för hela kommunen, bokningsbart löpande via Alvis.',
    tags: ['matematik', 'goteborg'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'goteborg-eng6',
    schoolName: 'Prövningsenheten Göteborg',
    provider: 'Göteborgs Stad',
    subject: 'Engelska',
    course: 'Engelska 6',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Göteborg',
    region: 'Västra Götaland',
    address: 'Brogatan 4, Göteborg',
    lat: 57.7089,
    lng: 11.9746,
    price: 500,
    priceNote:
      'Avgift betalas minst 4 veckor före provdatum och återbetalas ej, utöver vid läkarintyg.',
    nextPeriod: {
      label:
        'Anmälan till höstterminens prövningar öppnar 1 juli 2026 (schema publiceras 15 juni).',
      applicationStart: '2026-07-01',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    registrationUrl: 'https://provningsenheten.alvis.se/hittakurser/kurs/12372',
    infoUrl: 'https://goteborg.se/wps/portal/enheter/provningsenheten',
    description:
      'Betygsprövning i Engelska 6 via Göteborgs Stads Prövningsenhet. Platsantal varierar och uppdateras löpande.',
    tags: ['engelska', 'goteborg'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'goteborg-kemi1',
    schoolName: 'Prövningsenheten Göteborg',
    provider: 'Göteborgs Stad',
    subject: 'Kemi',
    course: 'Kemi 1',
    courseCode: 'KEMKEM01',
    level: 'Komvux',
    city: 'Göteborg',
    region: 'Västra Götaland',
    address: 'Brogatan 4, Göteborg',
    lat: 57.7089,
    lng: 11.9746,
    price: 500,
    priceNote:
      'Avgift betalas minst 4 veckor före provdatum och återbetalas ej, utöver vid läkarintyg.',
    nextPeriod: {
      label:
        'Anmälan till höstterminens prövningar öppnar 1 juli 2026 (schema publiceras 15 juni).',
      applicationStart: '2026-07-01',
      confirmed: true,
    },
    components: COMPONENTS_KEMI,
    studyTips: TIPS_KEMI,
    registrationUrl: 'https://provningsenheten.alvis.se/hittakurser/kurs/12401',
    infoUrl: 'https://goteborg.se/wps/portal/enheter/provningsenheten',
    description: 'Betygsprövning i Kemi 1 via Göteborgs Stads Prövningsenhet.',
    tags: ['kemi', 'goteborg'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'goteborg-fysik1a',
    schoolName: 'Prövningsenheten Göteborg',
    provider: 'Göteborgs Stad',
    subject: 'Fysik',
    course: 'Fysik 1a',
    courseCode: 'FYSFYS01a',
    level: 'Komvux',
    city: 'Göteborg',
    region: 'Västra Götaland',
    address: 'Brogatan 4, Göteborg',
    lat: 57.7089,
    lng: 11.9746,
    price: 500,
    priceNote:
      'Avgift betalas minst 4 veckor före provdatum och återbetalas ej, utöver vid läkarintyg.',
    nextPeriod: {
      label:
        'Anmälan till höstterminens prövningar öppnar 1 juli 2026 (schema publiceras 15 juni).',
      applicationStart: '2026-07-01',
      confirmed: true,
    },
    components: COMPONENTS_FYSIK,
    studyTips: TIPS_FYSIK,
    registrationUrl: 'https://provningsenheten.alvis.se/hittakurser/kurs/12376',
    infoUrl: 'https://goteborg.se/wps/portal/enheter/provningsenheten',
    description: 'Betygsprövning i Fysik 1a via Göteborgs Stads Prövningsenhet.',
    tags: ['fysik', 'goteborg'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'malmo-svenska3',
    schoolName: 'Komvux Malmö',
    provider: 'Malmö stad',
    subject: 'Svenska',
    course: 'Svenska 3',
    courseCode: 'SVESVE03',
    level: 'Komvux',
    city: 'Malmö',
    region: 'Skåne',
    address: 'Kungsgatan 44, Malmö',
    lat: 55.605,
    lng: 13.0038,
    price: 500,
    priceNote: FREE_IF_PRIOR_F + ' Svenska har två obligatoriska provdagar.',
    nextPeriod: {
      label:
        'Period 4 2026: anmälan 7–18 september, prövningsperiod 26 oktober – 25 november. (Period 3 stängde 7 augusti.)',
      applicationStart: '2026-09-07',
      applicationEnd: '2026-09-18',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-11-25',
      confirmed: true,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    registrationUrl: 'https://sjalvservice.malmo.se/oversikt/overview/926',
    infoUrl:
      'https://malmo.se/Komvux-Malmo/Om-Komvux-Malmo/Provning-komvux/Provning---gymnasiala-kurser.html',
    description:
      'Komvux Malmö genomför betygsprövning i Svenska 3 på plats, med två obligatoriska provdagar enligt skrivschemat.',
    tags: ['svenska', 'malmo'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'malmo-eng6',
    schoolName: 'Komvux Malmö',
    provider: 'Malmö stad',
    subject: 'Engelska',
    course: 'Engelska 6',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Malmö',
    region: 'Skåne',
    address: 'Kungsgatan 44, Malmö',
    lat: 55.605,
    lng: 13.0038,
    price: 500,
    priceNote: FREE_IF_PRIOR_F,
    nextPeriod: {
      label:
        'Period 4 2026: anmälan 7–18 september, prövningsperiod 26 oktober – 25 november. (Period 3 stängde 7 augusti.)',
      applicationStart: '2026-09-07',
      applicationEnd: '2026-09-18',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-11-25',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    registrationUrl: 'https://sjalvservice.malmo.se/oversikt/overview/926',
    infoUrl:
      'https://malmo.se/Komvux-Malmo/Om-Komvux-Malmo/Provning-komvux/Provning---gymnasiala-kurser.html',
    description:
      'Komvux Malmö genomför betygsprövning i Engelska 6 på plats, all examination sker på svenska anvisad lokal.',
    tags: ['engelska', 'malmo'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'helsingborg-ma2b',
    schoolName: 'Komvux Helsingborg',
    provider: 'Helsingborgs stad',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Helsingborg',
    region: 'Skåne',
    address: 'Rönnowsgatan 10, Helsingborg',
    lat: 56.0465,
    lng: 12.6945,
    price: 500,
    priceNote: FREE_IF_PRIOR_F,
    nextPeriod: {
      label:
        'Anmälan 7–11 september 2026 (avgiften ska vara betald senast 11/9), prövningsperiod 12 oktober – 6 november. Du kan göra högst två prövningar per period.',
      applicationStart: '2026-09-07',
      applicationEnd: '2026-09-11',
      examWindowStart: '2026-10-12',
      examWindowEnd: '2026-11-06',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl:
      'https://ansokanvux.helsingborg.se/HCW.Welfare.CC.AdultOpenChoiceWeb/ApplicantHome.aspx',
    infoUrl: 'https://helsingborg.se/forskola-och-utbildning/vuxenutbildning/betygsprovning/',
    description:
      'Komvux Helsingborg erbjuder betygsprövning i gymnasiekurser, bland annat matematik.',
    tags: ['matematik', 'helsingborg'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'lund-ma',
    schoolName: 'Vuxenutbildningen Lund',
    provider: 'Lunds kommun',
    subject: 'Matematik',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Lund',
    region: 'Skåne',
    address: 'Höstbruksvägen 10, Lund',
    lat: 55.7047,
    lng: 13.191,
    price: 500,
    priceNote:
      'Avgift varierar beroende på din situation — skolan bekräftar vid ansökan. Anmälningstider är fasta och bindande.',
    nextPeriod: {
      // Lunds tabell "Prövningsperioder och ansökningsdatum" har två kolumner,
      // Period och Ansökningstid, och februarirutan står tom. Raden som gäller
      // nu är prövningsperiod 19 oktober–4 november med ansökningstid
      // 24 augusti–6 september.
      label:
        'Prövningsperiod 19 oktober – 4 november 2026, med ansökningstid 24 augusti – 6 september. Du ansöker med e-legitimation i kommunens ansökningswebb; utan e-legitimation finns en blankett på samma sida.',
      applicationStart: '2026-08-24',
      applicationEnd: '2026-09-06',
      examWindowStart: '2026-10-19',
      examWindowEnd: '2026-11-04',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl:
      'https://barnskolautbildning.lund.se/HCW.Welfare.CC.AdultOpenChoiceWeb/ApplicantHome.aspx',
    infoUrl: 'https://lund.se/forskola-och-skola/kommunal-vuxenutbildning/provning',
    description:
      'Lunds kommun erbjuder betygsprövning i bland annat matematik, engelska och svenska, med skriftlig del på Höstbruksvägen 10. Kommunen kör fyra prövningsperioder per år (februari, maj, september och oktober–november) och publicerar ansökningstiden för var och en.',
    tags: ['matematik', 'lund'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'umea-ma2b',
    schoolName: 'Umevux',
    provider: 'Umeå kommun',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Umeå',
    region: 'Västerbotten',
    address: 'Mossvägen 1, Umeå (Vuxenutbildningens hus)',
    lat: 63.8258,
    lng: 20.263,
    price: 500,
    priceNote:
      FREE_IF_PRIOR_F +
      ' Kräver folkbokföring i en Västerbottens-kommun. Endast ett ämne per prövningsperiod.',
    nextPeriod: {
      // Umevux publicerar ansökningsfönstret men inte provdatumet: prövningen
      // startar i oktober och pågår i cirka tre veckor, och det exakta datumet
      // får man med antagningsbeskedet. Därför ingen examWindow.
      label:
        'Ansökan till höstens prövningar öppnade 21 augusti 2026 och stänger 18 september. Prövningen startar i oktober och pågår i cirka tre veckor.',
      applicationStart: '2026-08-21',
      applicationEnd: '2026-09-18',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://e.umea.se/studera-ansokan-provning-gymnasiekurs',
    infoUrl:
      'https://www.umea.se/forskolaskolaochutbildning/vuxenutbildning/komvux/studerahososs/provning.4.7d6aaaf718b5a33d8de614e.html',
    description:
      'Umevux erbjuder betygsprövning i gymnasiekurser för folkbokförda i Västerbottens kommuner, minst fyra gånger per år.',
    tags: ['matematik', 'umea'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'umea-eng6',
    schoolName: 'Umevux',
    provider: 'Umeå kommun',
    subject: 'Engelska',
    course: 'Engelska 6',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Umeå',
    region: 'Västerbotten',
    address: 'Mossvägen 1, Umeå (Vuxenutbildningens hus)',
    lat: 63.8258,
    lng: 20.263,
    price: 500,
    priceNote:
      FREE_IF_PRIOR_F +
      ' Kräver folkbokföring i en Västerbottens-kommun. Endast ett ämne per prövningsperiod.',
    nextPeriod: {
      // Umevux publicerar ansökningsfönstret men inte provdatumet: prövningen
      // startar i oktober och pågår i cirka tre veckor, och det exakta datumet
      // får man med antagningsbeskedet. Därför ingen examWindow.
      label:
        'Ansökan till höstens prövningar öppnade 21 augusti 2026 och stänger 18 september. Prövningen startar i oktober och pågår i cirka tre veckor.',
      applicationStart: '2026-08-21',
      applicationEnd: '2026-09-18',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    registrationUrl: 'https://e.umea.se/studera-ansokan-provning-gymnasiekurs',
    infoUrl:
      'https://www.umea.se/forskolaskolaochutbildning/vuxenutbildning/komvux/studerahososs/provning.4.7d6aaaf718b5a33d8de614e.html',
    description:
      'Umevux erbjuder betygsprövning i Engelska 6 för folkbokförda i Västerbottens kommuner.',
    tags: ['engelska', 'umea'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'lulea-kemi1',
    schoolName: 'Vuxenutbildningen Luleå',
    provider: 'Luleå kommun',
    subject: 'Kemi',
    course: 'Kemi 1',
    courseCode: 'KEMKEM01',
    level: 'Komvux',
    city: 'Luleå',
    region: 'Norrbotten',
    address: 'Laboratoriegränd 11, Luleå (Porsön)',
    lat: 65.5848,
    lng: 22.1567,
    price: 500,
    priceNote:
      FREE_IF_PRIOR_F + ' Kemi 2 erbjuds för närvarande inte här — hänvisas till annan kommun.',
    nextPeriod: {
      label: 'Löpande anmälan — se kommunens sida för nästa provtillfälle.',
      confirmed: false,
    },
    components: COMPONENTS_KEMI,
    studyTips: TIPS_KEMI,
    registrationUrl: 'https://sjalvservice.lulea.se/Provningsanmalan',
    infoUrl: 'https://sjalvservice.lulea.se/Provningsanmalan',
    description:
      'Vuxenutbildningen i Luleå erbjuder betygsprövning i bland annat Kemi 1, gymnasiekurser, grundläggande kurser och SFI (B–D).',
    tags: ['kemi', 'lulea'],
    verifiedAt: VERIFIED,
  },
  {
    id: 'vuxenutbildningen-sundsvall-sundsvall-flera-kurser-kontakta-',
    schoolName: 'Vuxenutbildningen Sundsvall',
    provider: 'Sundsvalls kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Sundsvall',
    region: 'Västernorrland',
    address: 'Sundsvall (adress bekräftas vid anmälan, prövning sker på Arena eller Jensen)',
    lat: 62.3908,
    lng: 17.3069,
    price: 500,
    priceNote:
      '500 kr per ämne, betalas vid anmälan och återbetalas ej. Kostnadsfritt om registrerat F/IG i ämnet satt senast 12 månader innan prövningsdatumet.',
    nextPeriod: {
      label: 'Provperiod 2026-10-21 – 2026-10-24',
      applicationStart: '2026-08-17',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-21',
      examWindowEnd: '2026-10-24',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The kommun's e-tjänst for prövning is taken down between periods — the
    // old deep link (oversikt/overview/331) now 404s, and the flow behind it
    // (flowoverview/2659) answers "E-tjänsten är inte längre tillgänglig".
    // Their own prövningssida carries the live link whenever it opens, so that
    // is the honest target. Re-checked 2026-08-13.
    registration: publishedOnPage('länken till kommunens e-tjänst', 'den 17 augusti'),
    registrationUrl:
      'https://sundsvall.se/kommun/utbildning-och-forskola/vuxenutbildning/ansokan/provning',
    infoUrl: 'https://sundsvall.se/kommun/utbildning-och-forskola/vuxenutbildning/ansokan',
    description:
      'Vuxenutbildningen Sundsvall erbjuder prövning fyra gånger per år i ämnen ur den ordinarie kurskatalogen (Alvis). E-tjänsten för oktoberperioden öppnar 17 augusti 2026 med sista anmälningsdag 20 september; prövningstillfällena är 21 och 24 oktober beroende på skolenhet (Arena/Jensen).',
    tags: ['kommun', 'gymnasial', 'flera-amnen'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-ornskoldsvik-komvux-arken-ornskoldsvik-fle',
    schoolName: 'Vuxenutbildningen Örnsköldsvik (Komvux Arken)',
    provider: 'Örnsköldsviks kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod, endast GY25-ämnen)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Örnsköldsvik',
    region: 'Västernorrland',
    address: 'Studielänkens lokaler, Torggatan 10, våning 3, Örnsköldsvik',
    lat: 63.2909,
    lng: 18.7161,
    price: 500,
    priceNote:
      '500 kr per kurs, betalas via Swish (123 562 2162) vid anmälan. Kostnadsfritt om man läst samma/motsvarande kurs hos kommunal vuxenutbildning och fått betyg F eller IG.',
    nextPeriod: {
      label:
        'Anmälan för HT26 är öppen 17 augusti – 11 september. Prövningarna hålls 7 och 8 oktober kl. 11.30.',
      applicationStart: '2026-08-17',
      applicationEnd: '2026-09-11',
      examWindowStart: '2026-10-07',
      examWindowEnd: '2026-10-08',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Was https://e-tjanster.ornskoldsvik.se/oversikt — checked 2026-08-12, that
    // directory lists no prövningstjänst at all, so the button dropped the user
    // in a list of unrelated e-tjänster. Anmälan really is by mail/phone to
    // Arena utbildning, and the kommun's own page is where those details live.
    registration: { kind: 'email' },
    registrationUrl:
      'https://www.ornskoldsvik.se/utbildning-och-barnomsorg/vuxenstuderande/vuxenutbildning---komvux/anmal-till-provning-for-betyg---vuxenstuderande',
    infoUrl:
      'https://www.ornskoldsvik.se/utbildning-och-barnomsorg/vuxenstuderande/vuxenutbildning---komvux/anmal-till-provning-for-betyg---vuxenstuderande',
    description:
      'Prövning erbjuds endast i nya GY25-ämnesnivåer, med fyra fasta datum per år; höstens tillfällen är 7 och 8 oktober 2026 kl. 11:30 i Studielänkens lokaler. Anmälan görs till Arena utbildning på arenautbildning@arenakoncernen.se eller 010-788 00 39, och avgiften på 500 kr swishas till 123 562 2162.',
    tags: ['kommun', 'gymnasial', 'gy25'],
    verifiedAt: LATE_SUMMER_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-harnosand-harnosand-flera-kurser-kontakta-',
    schoolName: 'Vuxenutbildningen Härnösand',
    provider: 'Härnösands kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Härnösand',
    region: 'Västernorrland',
    address: 'Härnösand (adress bekräftas vid anmälan, studerandeservice Komvux)',
    lat: 62.63,
    lng: 17.9386,
    price: 500,
    priceNote:
      '500 kr om kursen inte lästs tidigare eller redan har godkänt betyg; kostnadsfritt om F/IG satts i kursen tidigare (styrks med betygskopia).',
    nextPeriod: {
      label: 'Provperiod 2026-09-21 – 2026-09-27',
      applicationEnd: '2026-08-05',
      examWindowStart: '2026-09-21',
      examWindowEnd: '2026-09-27',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The kommun page describes the service; its own "E-tjänst" button lands
    // here, in the Tieto portal where the application is actually made. The
    // page also offers a PDF blankett as an alternative route.
    registrationUrl:
      'https://education.service.tieto.com/AdultApplication.Student/#/search-offering/kv?domain=harnosandedu',
    infoUrl:
      'https://harnosand.se/e-tjanster-och-blanketter/utbildning-och-forskola/vuxenutbildning/ansokan-om-sarskild-provning-inom-kommunal-vuxenutbildning.html',
    description:
      'Nästa prövningstillfälle startar vecka 39 2026 (21-27 september), med sista ansökningsdag 5 augusti 2026. Legitimationskontroll måste göras på plats hos studerandeservice under vecka 34 efter antagningsbesked.',
    tags: ['kommun', 'gymnasial', 'flera-amnen'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'jamtlands-gymnasium-provning-for-vuxenstuderande-ostersund-f',
    schoolName: 'Jämtlands Gymnasium – prövning för vuxenstuderande',
    provider: 'Jämtlands Gymnasieförbund / Lärcentrum Östersund',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Östersund',
    region: 'Jämtland',
    address: 'Östersund (adress bekräftas vid anmälan, respektive skolenhets expedition)',
    lat: 63.1792,
    lng: 14.6357,
    price: 500,
    priceNote:
      '500 kr per kurs för dig som gått ut gymnasiet, betalas till Jämtlands Gymnasiums bankgiro innan prövningen. Kostnadsfritt för nuvarande gymnasieelever (100 kr deposition som återbetalas).',
    nextPeriod: {
      label:
        'Prövningstillfällen läsår 25/26 var 2025-11-07, 2026-02-27 och 2026-05-08 (anmälan senast 8 veckor innan). Datum för läsåret 26/27 är ännu inte publicerade.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Two blanketter on the page — "Prövning intern" for current students and
    // this one for everybody else. It goes to the school office at least eight
    // weeks before the prövning date. (jgy.se refuses automated requests for
    // the PDF itself, so the link checker may flag it; the href is on their
    // page and was read there on 2026-08-11.)
    registrationUrl: 'https://jgy.se/wp-content/uploads/2024/05/provning_extern-ny-2021.pdf',
    infoUrl: 'https://jgy.se/gymnasieutbildning/elevinformation/betyg/provning/',
    description:
      'I Östersund går det inte att läsa om en hel kurs för att höja ett godkänt betyg, utan enbart göra prövning. Den som gått ut gymnasiet för mer än ett läsår sedan hänvisas till Lärcentrum i hemkommunen; anmälan sker annars till respektive skolas expedition.',
    tags: ['gymnasium', 'gymnasial', 'flera-amnen'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-skelleftea-vux-skelleftea-kemi-1',
    schoolName: 'Vuxenutbildningen Skellefteå (VUX)',
    provider: 'Skellefteå kommun',
    subject: 'Kemi',
    course: 'Kemi 1',
    courseCode: 'KEMKEM01',
    level: 'Komvux',
    city: 'Skellefteå',
    region: 'Västerbotten',
    address: 'Skellefteå (adress bekräftas vid anmälan, VUX Skellefteå)',
    lat: 64.7507,
    lng: 20.9528,
    price: 500,
    priceNote: '500 kr per kurs/ämnesnivå, gratis om du har IG eller F. Pengarna återbetalas ej.',
    nextPeriod: {
      label: 'Provperiod 2026-10-19 – 2026-11-13',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-19',
      examWindowEnd: '2026-11-13',
      confirmed: true,
    },
    components: COMPONENTS_KEMI,
    studyTips: TIPS_KEMI,
    registrationUrl: 'https://sjalvservice.skelleftea.se/bokaprovningstillfalle',
    infoUrl:
      'https://skelleftea.se/invanare/startsida/forskola-skola-och-utbildning/vuxenutbildning-och-hogre-utbildning/vux/provning',
    description:
      'Prövningen består av ett skriftligt prov och ett laborativt moment på plats i Skellefteå. Prövningsperioden 19 oktober-13 november 2026 har sista ansökningsdag 20 september 2026.',
    tags: ['kommun', 'naturvetenskap', 'gymnasial'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-skelleftea-vux-skelleftea-svenska-3',
    schoolName: 'Vuxenutbildningen Skellefteå (VUX)',
    provider: 'Skellefteå kommun',
    subject: 'Svenska',
    course: 'Svenska 3',
    courseCode: 'SVESVE03',
    level: 'Komvux',
    city: 'Skellefteå',
    region: 'Västerbotten',
    address: 'Skellefteå (adress bekräftas vid anmälan, VUX Skellefteå)',
    lat: 64.7507,
    lng: 20.9528,
    price: 500,
    priceNote: '500 kr per kurs/ämnesnivå, gratis om du har IG eller F. Pengarna återbetalas ej.',
    nextPeriod: {
      label: 'Provperiod 2026-10-19 – 2026-11-13',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-19',
      examWindowEnd: '2026-11-13',
      confirmed: true,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    registrationUrl: 'https://sjalvservice.skelleftea.se/bokaprovningstillfalle',
    infoUrl:
      'https://skelleftea.se/invanare/startsida/forskola-skola-och-utbildning/vuxenutbildning-och-hogre-utbildning/vux/provning',
    description:
      'Prövningen innehåller nationellt prov, litterär analys och muntliga examinationer (bl.a. romansamtal). Betyg sätts senast 14 dagar efter avslutad prövning; prövningsperioden är 19 oktober-13 november 2026 med sista ansökningsdag 20 september.',
    tags: ['kommun', 'svenska', 'gymnasial'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-skelleftea-vux-skelleftea-naturkunskap-2',
    schoolName: 'Vuxenutbildningen Skellefteå (VUX)',
    provider: 'Skellefteå kommun',
    subject: 'Naturkunskap',
    course: 'Naturkunskap 2',
    courseCode: 'NAKNAK02',
    level: 'Komvux',
    city: 'Skellefteå',
    region: 'Västerbotten',
    address: 'Skellefteå (adress bekräftas vid anmälan, VUX Skellefteå)',
    lat: 64.7507,
    lng: 20.9528,
    price: 500,
    priceNote: '500 kr per kurs/ämnesnivå, gratis om du har IG eller F. Pengarna återbetalas ej.',
    nextPeriod: {
      label: 'Provperiod 2026-10-19 – 2026-11-13',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-19',
      examWindowEnd: '2026-11-13',
      confirmed: true,
    },
    components: COMPONENTS_NATURKUNSKAP,
    studyTips: TIPS_NATURKUNSKAP,
    registrationUrl: 'https://sjalvservice.skelleftea.se/bokaprovningstillfalle',
    infoUrl:
      'https://skelleftea.se/invanare/startsida/forskola-skola-och-utbildning/vuxenutbildning-och-hogre-utbildning/vux/provning',
    description:
      'Prövningen kräver intyg om tidigare godkänd laborationskurs för att betyg ska kunna sättas. Prövningsperioden 19 oktober-13 november 2026 har sista ansökningsdag 20 september 2026.',
    tags: ['kommun', 'naturvetenskap', 'gymnasial'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-pitea-pitea-flera-kurser-kontakta-skolan-f',
    schoolName: 'Vuxenutbildningen Piteå',
    provider: 'Piteå kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Piteå',
    region: 'Norrbotten',
    address: 'Stadsporten, Västergatan 10, Piteå',
    lat: 65.3172,
    lng: 21.4794,
    price: 500,
    priceNote:
      '500 kr per ämnesnivå eller kurs, betalas via e-tjänst (kort/Swish) och återbetalas ej. Avgiftsfritt vid tidigare F/IG i kommunens vuxenutbildning, eller vid prövning på grundläggande nivå för den som gått ut grundskolan.',
    nextPeriod: {
      label: 'Provperiod 2026-10-05 – 2026-11-01',
      applicationEnd: '2026-09-15',
      examWindowStart: '2026-10-05',
      examWindowEnd: '2026-11-01',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://pitea.enamnd.se/oversikt/overview/1604',
    infoUrl: 'https://www.pitea.se/invanare/skola-forskola/vuxenutbildningen/komvux/provning/',
    description:
      'Prövning i grund- och gymnasieämnen genomförs på plats i Piteå under prövningsperioden vecka 41-44 2026 (5 oktober-1 november), sista anmälningsdag 15 september 2026. Prövning kan även göras i SFI-kurser vid separata datum under hösten.',
    tags: ['kommun', 'gymnasial', 'flera-amnen'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'larcentrum-vuxenutbildningen-i-boden-boden-flera-kurser-kont',
    schoolName: 'Lärcentrum Vuxenutbildningen i Boden',
    provider: 'Bodens kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Boden',
    region: 'Norrbotten',
    address: 'Boden (adress bekräftas vid anmälan, Lärcentrum)',
    lat: 65.8256,
    lng: 21.6886,
    price: 500,
    priceNote:
      '500 kr enligt skollagens huvudregel; exakta avgiftsvillkor och eventuella undantag anges i informationsbladet som bifogas e-tjänsten.',
    nextPeriod: {
      label:
        'Tre prövningsperioder per år: vecka 3-6, vecka 16-19 och vecka 40-43. Nästa period är vecka 40-43 (slutet av september till början av november). Exakt sista ansökningsdag anges inte på sidan.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://boden.enamnd.se/oversikt/overview/3858',
    infoUrl: 'https://boden.enamnd.se/oversikt/overview/3858',
    description:
      'Anmälan till prövning i grundläggande, gymnasiala och SFI-kurser sker via e-tjänst med BankID; max två kurser per prövningsperiod. Kopia av gymnasiebetyg måste bifogas om man inte tidigare studerat hos vuxenutbildningen i Boden.',
    tags: ['kommun', 'gymnasial', 'flera-amnen'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'lapplands-larcentra-kiruna-kiruna-flera-kurser-kontakta-skol',
    schoolName: 'Lapplands Lärcentra Kiruna',
    provider: 'Lapplands kommunalförbund',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Kiruna',
    region: 'Norrbotten',
    address: 'Kiruna (adress bekräftas vid anmälan, kontakta SYV på Lapplands Lärcentra)',
    lat: 67.8558,
    lng: 20.2253,
    price: 500,
    priceNote:
      '500 kr per kurs/ämne för den som vill höja ett godkänt betyg eller saknar betyg. Kostnadsfritt om F nyligen satts i kursen.',
    nextPeriod: {
      label:
        'Ingen fast, publicerad prövningsperiod - ansökan lämnas löpande till studie- och yrkesvägledare (SYV) som avgör prövningstillfälle.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://lapplands.se/media/5onakr4r/anmalan-till-provning.pdf',
    infoUrl: 'https://lapplands.se/sv/larcentra/studera-hos-oss/proevning/',
    description:
      'Lapplands Lärcentra (Gällivare, Jokkmokk, Kiruna, Pajala) erbjuder prövning där ämnet läses in på egen hand utifrån gällande ämnesplan utan lärarstöd. Ansökan görs på pappersblankett till SYV med önskad kurskod och prövningsperiod.',
    tags: ['kommunalförbund', 'gymnasial', 'flera-amnen'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'lapplands-larcentra-gallivare-gallivare-flera-kurser-kontakt',
    schoolName: 'Lapplands Lärcentra Gällivare',
    provider: 'Lapplands kommunalförbund',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Gällivare',
    region: 'Norrbotten',
    address: 'Gällivare (adress bekräftas vid anmälan, kontakta SYV på Lapplands Lärcentra)',
    lat: 67.136,
    lng: 20.6531,
    price: 500,
    priceNote:
      '500 kr per kurs/ämne för den som vill höja ett godkänt betyg eller saknar betyg. Kostnadsfritt om F nyligen satts i kursen.',
    nextPeriod: {
      label:
        'Ingen fast, publicerad prövningsperiod - ansökan lämnas löpande till studie- och yrkesvägledare (SYV) som avgör prövningstillfälle.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://lapplands.se/media/5onakr4r/anmalan-till-provning.pdf',
    infoUrl: 'https://lapplands.se/sv/larcentra/studera-hos-oss/proevning/',
    description:
      'Lapplands Lärcentra (Gällivare, Jokkmokk, Kiruna, Pajala) erbjuder prövning där ämnet läses in på egen hand utifrån gällande ämnesplan utan lärarstöd. Ansökan görs på pappersblankett till SYV med önskad kurskod och prövningsperiod.',
    tags: ['kommunalförbund', 'gymnasial', 'flera-amnen'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-boras-stad-boras-flera-kurser-kontakta-sko',
    schoolName: 'Vuxenutbildningen Borås Stad',
    provider: 'Borås Stad',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Borås',
    region: 'Västra Götaland',
    address: 'BORÅS (adress bekräftas vid anmälan)',
    lat: 57.721,
    lng: 12.9401,
    price: 500,
    priceNote:
      '500 kr per prövning. Gratis om du har betyget F/IG i kursen sedan tidigare (betygskopia bifogas).',
    nextPeriod: {
      // Borås delar upp höstens prövningar på fem tillfällen med två
      // anmälningsfönster. Det som ligger närmast är 24–27 augusti, som täcker
      // Gy11-tillfällena 29 september (språk och övriga) och 1 oktober
      // (matematik och naturvetenskap). Gy25-tillfällena i november har eget
      // fönster 14–17 september, och står i etiketten i stället för i datumen —
      // ett kort kan bara räkna ned till ett fönster i taget.
      label:
        'Anmälan 24–27 augusti 2026 till Gy11-prövningarna: språk och övriga tisdag 29 september, matematik och naturvetenskap torsdag 1 oktober. Nästa fönster är 14–17 september, för Gy25-prövningarna 3, 5 och 6 november.',
      applicationStart: '2026-08-24',
      applicationEnd: '2026-08-27',
      examWindowStart: '2026-09-29',
      examWindowEnd: '2026-10-01',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://boras.alvis.se/provning/amnesomrade',
    infoUrl: 'https://boras.alvis.se/provning/amnesomrade',
    description:
      'Vuxenutbildningen i Borås erbjuder prövning i ett stort urval kurser inom matematik, naturvetenskap, samhällsvetenskap, språk samt vård och omsorg. Anmälan görs i skolans e-tjänst Alvis och endast en kurs kan prövas per tillfälle.',
    tags: ['komvux', 'boras', 'flera-amnen'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'kunskapsforbundet-vast-vuxenutbildningen-vanersborg-flera-ku',
    schoolName: 'Kunskapsförbundet Väst – Vuxenutbildningen',
    provider: 'Kunskapsförbundet Väst',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Vänersborg',
    region: 'Västra Götaland',
    address: 'Vänerparken 5, 462 24 Vänersborg',
    lat: 58.3806,
    lng: 12.3232,
    price: 500,
    priceNote:
      '500 kr, lagstadgad avgift. Avgiftsfritt bl.a. för den som har betyget F i kursen och samtidigt studerar andra kurser på vuxenutbildningen.',
    nextPeriod: {
      label:
        'Ansökan till höstens studieperiod 2026 ska vara inlämnad senast 1 september 2026 (vårens period senast 1 februari)',
      applicationEnd: '2026-09-01',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://minasidor.kunskapsforbundet.se/179',
    infoUrl: 'https://kunskapsforbundet.se/vuxenutbildningen/program/provning-betyg/',
    description:
      'Kunskapsförbundet Väst (Trollhättan/Vänersborg) erbjuder prövning i SFI samt kurser på grundläggande och gymnasial nivå. Ansökan för höstens studieperiod ska lämnas senast 1 september via blankett eller e-tjänst.',
    tags: ['komvux', 'trollhattan', 'vanersborg'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildning-skovde-skovde-matematik-3b',
    schoolName: 'Vuxenutbildning Skövde',
    provider: 'Skövde kommun',
    subject: 'Matematik',
    course: 'Matematik 3b',
    courseCode: 'MATMAT03b',
    level: 'Komvux',
    city: 'Skövde',
    region: 'Västra Götaland',
    address: 'SKÖVDE (adress bekräftas vid anmälan)',
    lat: 58.3907,
    lng: 13.8458,
    price: 500,
    priceNote:
      '500 kr enligt förordning (1991:1124), gratis vid tidigare F/IG enligt kommunens ordinarie villkor.',
    nextPeriod: {
      label:
        'Sidan listar kursutbud för prövning i Gy11-kurser (uppdaterad nov 2025); kontakta Komvux Skövde för aktuella anmälningsdatum',
      confirmed: false,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    // Re-checked 2026-08-13: the page is a course catalogue and nothing else —
    // no form, no e-tjänst, no dates, no prices, and no anmälningsväg anywhere
    // under vuxenutbildningen in the site tree. Kontaktcenter is the only door
    // Skövde publishes, so the flow says that outright rather than telling the
    // user to look for a link that isn't on the page.
    registration: {
      kind: 'email',
      landing:
        'Skövde publicerar varken blankett eller e-tjänst för prövning — sidan visar bara vad prövningen i varje kurs innehåller.',
      steps: [
        'Läs upplägget för din kurs på sidan, så vet du vad prövningen omfattar',
        'Ring kontaktcenter 0500-49 80 00 eller mejla skovdekommun@skovde.se och be om prövningsanmälan',
        'Anmäl dig och betala avgiften enligt de instruktioner du får av vuxenutbildningen',
      ],
    },
    registrationUrl:
      'https://www.skovde.se/barnomsorg-utbildning/vuxenutbildning-skovde/komvux/vara-utbildningar/gymnasial-niva-gy/provningar-i-teoretiska-gymnasiala-kurser-gy11/',
    infoUrl:
      'https://www.skovde.se/barnomsorg-utbildning/vuxenutbildning-skovde/komvux/vara-utbildningar/gymnasial-niva-gy/provningar-i-teoretiska-gymnasiala-kurser-gy11/',
    description:
      'Komvux Skövde beskriver detaljerat provupplägget för Matematik 3b: ett nationellt prov på plats (4 timmar) följt av en muntlig del på cirka 30 minuter, ofta inom en vecka.',
    tags: ['komvux', 'skovde', 'matematik'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'vuxenutbildning-skovde-skovde-svenska-3',
    schoolName: 'Vuxenutbildning Skövde',
    provider: 'Skövde kommun',
    subject: 'Svenska',
    course: 'Svenska 3',
    courseCode: 'SVESVE03',
    level: 'Komvux',
    city: 'Skövde',
    region: 'Västra Götaland',
    address: 'SKÖVDE (adress bekräftas vid anmälan)',
    lat: 58.3907,
    lng: 13.8458,
    price: 500,
    priceNote:
      '500 kr enligt förordning (1991:1124), gratis vid tidigare F/IG enligt kommunens ordinarie villkor.',
    nextPeriod: {
      label:
        'Sidan listar kursutbud för prövning i Gy11-kurser (uppdaterad nov 2025); kontakta Komvux Skövde för aktuella anmälningsdatum',
      confirmed: false,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    // Re-checked 2026-08-13: the page is a course catalogue and nothing else —
    // no form, no e-tjänst, no dates, no prices, and no anmälningsväg anywhere
    // under vuxenutbildningen in the site tree. Kontaktcenter is the only door
    // Skövde publishes, so the flow says that outright rather than telling the
    // user to look for a link that isn't on the page.
    registration: {
      kind: 'email',
      landing:
        'Skövde publicerar varken blankett eller e-tjänst för prövning — sidan visar bara vad prövningen i varje kurs innehåller.',
      steps: [
        'Läs upplägget för din kurs på sidan, så vet du vad prövningen omfattar',
        'Ring kontaktcenter 0500-49 80 00 eller mejla skovdekommun@skovde.se och be om prövningsanmälan',
        'Anmäl dig och betala avgiften enligt de instruktioner du får av vuxenutbildningen',
      ],
    },
    registrationUrl:
      'https://www.skovde.se/barnomsorg-utbildning/vuxenutbildning-skovde/komvux/vara-utbildningar/gymnasial-niva-gy/provningar-i-teoretiska-gymnasiala-kurser-gy11/',
    infoUrl:
      'https://www.skovde.se/barnomsorg-utbildning/vuxenutbildning-skovde/komvux/vara-utbildningar/gymnasial-niva-gy/provningar-i-teoretiska-gymnasiala-kurser-gy11/',
    description:
      'Prövningen i Svenska 3 hos Komvux Skövde består av tre skriftliga delprov (ca 3 timmar vardera) samt det nationella provet med skriftlig och muntlig del, allt genomfört i skolans lokaler.',
    tags: ['komvux', 'skovde', 'svenska'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'uddevalla-vuxenutbildning-uddevalla-flera-kurser-kontakta-sk',
    schoolName: 'Uddevalla Vuxenutbildning',
    provider: 'Uddevalla kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Uddevalla',
    region: 'Västra Götaland',
    address: 'Kaserngården 1A I17, 451 34 Uddevalla',
    lat: 58.3479,
    lng: 11.9423,
    price: 500,
    priceNote:
      '500 kr, lagstadgad avgift, återbetalas ej. Gratis vid F på grundläggande/gymnasial nivå, eller vid SFI-prövning för folkbokförda i Uddevalla.',
    nextPeriod: {
      label:
        'Ansökan öppen 10 juni–10 september (prövning genomförs i november) samt 10 december–28 februari (prövning i april-juni)',
      applicationStart: '2026-06-10',
      applicationEnd: '2026-09-10',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The anmälan form (personnummer, kurs, tidigare betyg) sits on this page
    // itself, which nothing in the URL reveals — hence the override.
    registration: {
      kind: 'form',
      landing: 'Länken går direkt till anmälningsformuläret på skolans egen sida.',
      steps: [
        'Fyll i personnummer och kontaktuppgifter i formuläret',
        'Välj kurs — du kan söka högst två prövningar per tillfälle',
        'Ange om du saknar betyg, har godkänt eller har underkänt i kursen, och skicka in',
      ],
    },
    registrationUrl:
      'https://uddevallavuxenutbildning.se/utbildning/ovriga-verksamheter/provning/anmalan-provning-gr-gy',
    infoUrl: 'https://uddevallavuxenutbildning.se/utbildning/ovriga-verksamheter/provning',
    description:
      'Uddevalla Vuxenutbildning erbjuder prövning i grundläggande och gymnasiala kurser under två återkommande ansökningsperioder per år, med max två prövningar per period.',
    tags: ['komvux', 'uddevalla', 'flera-amnen'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'campus-alingsas-vuxenutbildningen-alingsas-flera-kurser-kont',
    schoolName: 'Campus Alingsås (Vuxenutbildningen)',
    provider: 'Alingsås kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Alingsås',
    region: 'Västra Götaland',
    address:
      'Prövningen genomförs hos Hermods, Fabriksgatan 25, Göteborg (administreras av Campus Alingsås)',
    lat: 57.9306,
    lng: 12.5335,
    price: 500,
    priceNote:
      '500 kr enligt förordning (1991:1124); betalning senast 18 september 2026 för höstens tillfälle.',
    nextPeriod: {
      label:
        'Betygsprövning 23 oktober 2026: ansökan öppen 10 augusti–11 september 2026, antagningsbesked senast 25 september 2026',
      applicationStart: '2026-08-10',
      applicationEnd: '2026-09-11',
      examWindowStart: '2026-10-23',
      examWindowEnd: '2026-10-23',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://minasidor.alingsas.se/betygsprovning',
    infoUrl: 'https://www.alingsas.se/campus/provning',
    description:
      'Alingsås kommun (Campus Alingsås) erbjuder ämnesbetygsprövning enligt Gy25; själva provtillfället genomförs hos Hermods i Göteborg (Fabriksgatan 25). Nästa tillfälle är fredag 23 oktober 2026.',
    tags: ['komvux', 'alingsas', 'gy25'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'campus-molndal-vuxenutbildningen-molndal-flera-kurser-kontak',
    schoolName: 'Campus Mölndal – Vuxenutbildningen',
    provider: 'Mölndals stad',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Mölndal',
    region: 'Västra Götaland',
    address:
      'Krokslätts fabriker 12A, 431 37 Mölndal (prövningen genomförs på Fabriksgatan 25, Göteborg)',
    lat: 57.6555,
    lng: 12.0136,
    price: 500,
    priceNote:
      '500 kr om godkänt betyg finns sedan tidigare eller om inget betyg finns; kostnadsfritt vid tidigare F/IG.',
    // Datumsvepet 2026-08-19 fångade den här: ansökan till 7 oktober stängde
    // 17 augusti, och kortet visade fortfarande den omgången. Mölndal har
    // november-omgången utskriven på samma sida, så listningen flyttas dit.
    nextPeriod: {
      label:
        'Prövningstillfälle 11 november 2026 via Hermods, ansökan 7–20 september. ' +
        'Höstens första tillfälle (7 oktober) stängde för ansökan den 17 augusti. ' +
        'Du kan bara söka en prövningskurs per provdatum.',
      applicationStart: '2026-09-07',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-11-11',
      examWindowEnd: '2026-11-11',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl:
      'https://education.service.tieto.com/AdultApplication.Student/#/search-offering/kv?domain=molndaledu',
    infoUrl: 'https://www.molndal.se/campus-molndal/dina-studier/provning.html',
    description:
      'Campus Mölndal administrerar prövningar via Hermods med fasta provdatum per termin; provtillfällena genomförs på plats på Fabriksgatan 25 i Göteborg (IHM Business School).',
    tags: ['komvux', 'molndal', 'flera-amnen'],
    verifiedAt: THIN_LAN_2_VERIFIED,
  },
  {
    id: 'kompetenscentrum-kungsbacka-vuxenutbildningen-kungsbacka-fle',
    schoolName: 'Kompetenscentrum Kungsbacka – Vuxenutbildningen',
    provider: 'Kungsbacka kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Kungsbacka',
    region: 'Halland',
    address: 'KUNGSBACKA (adress bekräftas vid anmälan)',
    lat: 57.4878,
    lng: 12.0765,
    price: 500,
    priceNote:
      '500 kr per kurs/ämnesnivå och prövningstillfälle; avgiftsfritt vid tidigare F/IG samt pågående studier på vuxenutbildningen.',
    nextPeriod: {
      // Kungsbacka publicerar perioderna i veckonummer, inte datum. Det är
      // skolans egna uppgifter omräknade till kalender (2026 års veckor), inte
      // gissade datum: sista ansökningsdag söndag v. 36 = 6 september,
      // prövningsveckorna 42–43 = 12–25 oktober.
      label:
        'Period 4: prövning vecka 42–43 (12–25 oktober 2026), sista ansökningsdag söndag vecka 36 (6 september).',
      applicationEnd: '2026-09-06',
      examWindowStart: '2026-10-12',
      examWindowEnd: '2026-10-25',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl:
      'https://education.service.tieto.com/AdultApplication.Student/#/search-offering/kv/48606a09-b708-4a51-9588-1cf7e2c79ac7?domain=kungsbackaedu',
    infoUrl: 'https://kungsbacka.se/utbildning-och-barnomsorg/vuxenutbildning/provning',
    description:
      'Kungsbacka kommun erbjuder fyra prövningsperioder per år (veckoangivna) med anmälan i kurskatalogen; max två prövningar per period och betalning senast fyra veckor före perioden.',
    tags: ['komvux', 'kungsbacka', 'flera-amnen'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-halmstad-halmstad-flera-kurser-kontakta-sk',
    schoolName: 'Vuxenutbildningen Halmstad',
    provider: 'Halmstads kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Halmstad',
    region: 'Halland',
    address: 'HALMSTAD (adress bekräftas vid anmälan)',
    lat: 56.6745,
    lng: 12.857,
    price: 500,
    priceNote:
      '500 kr per ämne/kurs och prövningstillfälle, betalas senast en vecka efter anmälningsdagen; ej återbetalningsbar.',
    nextPeriod: {
      label:
        'Prövningsperiod 4, gymnasiekurser: 12–30 oktober 2026. Anmälan öppnar i början av september — period 1–3 är fullbokade.',
      examWindowStart: '2026-10-12',
      examWindowEnd: '2026-10-30',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Checked 2026-08-13: there is no form on this page and none behind a
    // login either — the page says outright "Anmäl dig via Halmstad direkt som
    // du når på telefon 035-13 70 00 eller mejla till direkt@halmstad.se", and
    // betalningen sker med Swish till 123 128 5428 med olika kod per kurstyp.
    // Promising a formulär here would repeat the Örnsköldsvik mistake.
    registration: {
      kind: 'email',
      landing:
        'Anmälan görs via Halmstad direkt — kommunens kontaktcenter — inte i ett formulär på sidan.',
      steps: [
        'Ring 035-13 70 00 eller mejla direkt@halmstad.se och uppge kurs och personnummer',
        'Betala avgiften med Swish till 123 128 5428 med koden för din kurstyp',
        'Anmälan gäller när betalningen kommit in — senast en vecka efter anmälningsdagen',
      ],
    },
    registrationUrl:
      'https://www.halmstad.se/sjalvservice/sjalvserviceinombarnochutbildning/sjalvservicevuxenutbildning/vuxenutbildninganmalantillprovning.n3287.html',
    infoUrl:
      'https://www.halmstad.se/barnochutbildning/vuxenutbildning/provninginomvuxenutbildning.n1368.html',
    description:
      'Halmstads kommun erbjuder prövning i SFI, grundläggande, gymnasiala och yrkeskurser; gymnasieprövning sker via NTI-skolan med ett avslutande prov på plats i Halmstad. Anmälan sker via Halmstad direkt på telefon eller e-post — kommunen har ingen anmälningsblankett på webben.',
    tags: ['komvux', 'halmstad', 'flera-amnen'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-varberg-varberg-flera-kurser-kontakta-skol',
    schoolName: 'Vuxenutbildningen Varberg',
    provider: 'Varbergs kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Varberg',
    region: 'Halland',
    address: 'VARBERG (adress bekräftas vid anmälan)',
    lat: 57.1057,
    lng: 12.2508,
    price: 500,
    priceNote: '500 kr per kurs; kostnadsfritt vid tidigare IG/F i kursen.',
    nextPeriod: {
      label:
        'Prövningsperioder hösten 2026: 24 augusti–11 september (ansökan senast 2 augusti), 28 september–16 oktober (ansökan senast 6 september), 2 november–20 november (ansökan senast 11 oktober)',
      applicationEnd: '2026-10-11',
      examWindowStart: '2026-11-02',
      examWindowEnd: '2026-11-20',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl:
      'https://education.service.tieto.com/HCW.Welfare.CC.AdultChoiceWeb/ApplicantHome.aspx?Actor=Actor_Client&IDPMethod=SAML&domain=VarbergBou',
    infoUrl: 'https://varberg.se/vuxenutbildningen/provning-och-validering',
    description:
      'Varbergs kommun (utbildningsanordnare Talenti) genomför prövning i tre återkommande perioder varje termin, cirka 3–5 veckor långa, med anmälan via kommunens webbansökan.',
    tags: ['komvux', 'varberg', 'flera-amnen'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningscenter-karlstad-karlstad-flera-kurser-kontak',
    schoolName: 'Vuxenutbildningscenter Karlstad',
    provider: 'Karlstads kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Karlstad',
    region: 'Värmland',
    address: 'Norra Klaragatan 18, Karolinen, 653 40 Karlstad',
    lat: 59.3793,
    lng: 13.5036,
    price: 500,
    priceNote:
      '500 kr per kurs via Swish; kostnadsfritt om F i kursen och inskriven på vuxenutbildningen i Karlstad senast sista anmälningsdag.',
    nextPeriod: {
      label:
        'Period 1 vecka 41–46 2026, sista ansökningsdag 1 september 2026. Period 2 vecka 7–12 2027, sista ansökningsdag 11 december 2026',
      applicationEnd: '2026-09-01',
      examWindowStart: '2026-10-05',
      examWindowEnd: '2026-11-15',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Karlstad's "Anmäl dig till en prövning" button. esmaker.net is a generic
    // survey host, so this is an override rather than a classifier rule — the
    // URL alone can't prove any given esmaker link is a booking.
    registration: { kind: 'form' },
    registrationUrl: 'https://esmaker.net/a/Survey?id=160f285c32dd',
    infoUrl:
      'https://karlstad.se/forskola-skola-och-utbildning/vuxenutbildning/studera-som-vuxen/nivatest-provning-och-validering',
    description:
      'Karlstads kommun (Vuxenutbildningscenter) kör två prövningsperioder per läsår; hösten 2026 infaller provveckorna 41–46 med sista ansökningsdag 1 september 2026.',
    tags: ['komvux', 'karlstad', 'flera-amnen'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-kristinehamn-kristinehamn-flera-kurser-kon',
    schoolName: 'Vuxenutbildningen Kristinehamn',
    provider: 'Kristinehamns kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Kristinehamn',
    region: 'Värmland',
    address: 'Tegelslagaregatan 2, Kristinehamn',
    lat: 59.3096,
    lng: 14.1075,
    price: 500,
    priceNote:
      '500 kr per kurs (bankgiro 110-0213); kostnadsfritt för studerande på vuxenutbildningen med IG/F i kursen.',
    nextPeriod: {
      label: 'Höstprövning 2026: ansökan öppen 1 augusti–1 september, betalning senast 1 september',
      applicationStart: '2026-08-01',
      applicationEnd: '2026-09-01',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The prövningssida says "Ansök om prövningen via webbansökan" and links here.
    registrationUrl: 'https://sjalvservice.kristinehamn.se/ansokanvux',
    infoUrl:
      'https://www.kristinehamn.se/barnomsorg-och-utbildning/vuxenutbildning/sarskild-provning/',
    description:
      'Kristinehamns kommun erbjuder prövning i svenska, svenska som andraspråk, engelska och matematik samt SFI, med max två ansökningar per person och termin.',
    tags: ['komvux', 'kristinehamn', 'flera-amnen'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'abf-stockholm-komvux-stockholm-flera-kurser-kontakta-skolan-',
    schoolName: 'ABF Stockholm Komvux',
    provider: 'ABF Stockholm',
    subject: 'Vård och omsorg',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Sveavägen 41, Stockholm (adress bekräftas vid anmälan)',
    lat: 59.34,
    lng: 18.059,
    price: 500,
    priceNote:
      '500 kr per prövning; kostnadsfritt om tidigare betyg F/IG i kursen på komvux, styrks med betygskopia.',
    nextPeriod: {
      label:
        'Prövningsdatum hösten 2026: 7 sep (ev. del 2 den 11 sep) och 9 nov (ev. del 2 den 13 nov)',
      applicationStart: '2026-08-24',
      applicationEnd: '2026-08-28',
      examWindowStart: '2026-09-07',
      examWindowEnd: '2026-09-07',
      confirmed: true,
    },
    components: COMPONENTS_VARD,
    studyTips: TIPS_VARD,
    // Checked 2026-08-13: "Anmälan sker ENDAST via ett formulär på denna
    // webbsida, formuläret syns först när anmälan öppnar." Höstens formulär
    // läggs upp 24 augusti kl. 10, betalning senast 28 augusti. Först till
    // kvarn, ingen reservlista — så sidan är bokningen, när den är bokningen.
    registration: publishedOnPage('anmälningsformuläret', 'den 24 augusti kl. 10'),
    registrationUrl: 'https://abfstockholm.se/komvux/provning/',
    infoUrl: 'https://abfstockholm.se/komvux/provning/',
    description:
      'ABF Stockholm erbjuder prövning i ämnesnivåer inom undersköterskeutbildningen (t.ex. Hälso- och sjukvård, Psykiatri, Social omsorg) för folkbokförda i bl.a. Botkyrka, Huddinge, Nacka, Sollentuna, Solna, Sundbyberg och Södertälje. Anmälan sker via formulär på skolans webbplats när det öppnar.',
    tags: ['komvux', 'vård och omsorg', 'storstockholm'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'abf-stockholm-komvux-stockholm-engelska-6-niva-2',
    schoolName: 'ABF Stockholm Komvux',
    provider: 'ABF Stockholm',
    subject: 'Engelska',
    course: 'Engelska 6 (nivå 2)',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Sveavägen 41, Stockholm (adress bekräftas vid anmälan)',
    lat: 59.34,
    lng: 18.059,
    price: 500,
    priceNote: '500 kr per prövning; kostnadsfritt om tidigare betyg F/IG i kursen på komvux.',
    nextPeriod: {
      // Checked 2026-08-13: ABF lists engelska nivå 1–3 under one datumblock —
      // tillfälle 1 den 7 september (ev. del 2 den 11 september) med anmälan
      // 24 augusti kl. 10 och sista betaldag 28 augusti, tillfälle 2 den
      // 9 november med anmälan 26 oktober.
      label:
        'Tillfälle 1: prövning 7 september 2026 (ev. del 2 den 11 september). Anmälan öppnar 24 augusti kl. 10 och sista betaldag är 28 augusti. Tillfälle 2 är 9 november med anmälan från 26 oktober.',
      applicationStart: '2026-08-24',
      applicationEnd: '2026-08-28',
      examWindowStart: '2026-09-07',
      examWindowEnd: '2026-09-11',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    // Checked 2026-08-13: "Anmälan sker ENDAST via ett formulär på denna
    // webbsida, formuläret syns först när anmälan öppnar." Höstens formulär
    // läggs upp 24 augusti kl. 10, betalning senast 28 augusti. Först till
    // kvarn, ingen reservlista — så sidan är bokningen, när den är bokningen.
    registration: publishedOnPage('anmälningsformuläret', 'den 24 augusti kl. 10'),
    registrationUrl: 'https://abfstockholm.se/komvux/provning/',
    infoUrl: 'https://abfstockholm.se/komvux/provning/',
    description:
      'ABF Stockholm erbjuder prövning i engelska (nivå 1-3, två delar) endast för sökande folkbokförda utanför Stockholms kommun, bland annat Botkyrka, Huddinge, Nacka och Sollentuna.',
    tags: ['komvux', 'engelska', 'storstockholm'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'folkuniversitetet-komvux-sodertalje-sodertalje-flera-kurser-',
    schoolName: 'Folkuniversitetet Komvux Södertälje',
    provider: 'Folkuniversitetet',
    subject: 'Engelska',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Södertälje',
    region: 'Stockholm',
    address: 'Storgatan 3, 151 72 Södertälje',
    lat: 59.1955,
    lng: 17.6253,
    price: 500,
    priceNote: '500 kr, återbetalas ej vid återbud eller utebliven närvaro.',
    nextPeriod: {
      // Folkuniversitetet publishes the anmälningslänk on the day the window
      // opens, so there is nothing deeper to link to until 31 augusti.
      label:
        'Prövningsperiod hösten 2026: 2–5 oktober. Anmälan öppnar 31 augusti 2026, och anmälningslänken publiceras på skolans sida samma dag. Endast för dig som är folkbokförd i Södertälje, Botkyrka, Huddinge, Salem eller Nykvarn.',
      applicationStart: '2026-08-31',
      examWindowStart: '2026-10-02',
      examWindowEnd: '2026-10-05',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    // Checked 2026-08-13: "Håll utkik – mer information och anmälningslänk
    // publiceras då!" — the link goes up on this page when the window opens.
    registration: publishedOnPage('anmälningslänken', 'den 31 augusti'),
    registrationUrl:
      'https://www.folkuniversitetet.se/vara-skolor/komvux/komvux-sodertalje/provning/',
    infoUrl: 'https://www.folkuniversitetet.se/vara-skolor/komvux/komvux-sodertalje/provning/',
    description:
      'Folkuniversitetet Komvux Södertälje erbjuder prövning i bland annat Engelska, Matematik, Naturkunskap, Historia/Religion/Samhällskunskap och Svenska/Svenska som andraspråk. Endast sökande folkbokförda i Södertälje, Botkyrka, Huddinge, Salem eller Nykvarn tas emot; prövningsperioden är 4 veckor.',
    tags: ['komvux', 'flera ämnen', 'södertälje'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'akadeva-vuxenutbildning-sollentuna-flera-kurser-kontakta-sko',
    schoolName: 'Akadeva Vuxenutbildning',
    provider: 'Akadeva',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Sollentuna',
    region: 'Stockholm',
    address: 'Malmvägen 14 A, 191 60 Sollentuna',
    lat: 59.4281,
    lng: 17.95,
    price: 500,
    priceNote: '500 kr per kurs; kostnadsfritt i vissa fall vid tidigare betyg IG/F.',
    nextPeriod: {
      // Akadeva kör två omgångar per termin och höstens är slut ("Fullbokat"
      // 2026-08-12). En listning bär en period, så den som går att söka är den
      // som står här — att höstomgången är fullbokad hör hemma i texten, inte
      // som ett eget kort för samma skola och samma kurser.
      label:
        'Höstomgången (prövning 31/8–18/9) är fullbokad. Nästa omgång: ansökan öppnar 9 november kl. 08.00, prövningen startar 30 november och provet skrivs på plats 18 december.',
      applicationStart: '2026-11-09',
      examWindowStart: '2026-11-30',
      examWindowEnd: '2026-12-18',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Checked 2026-08-12: the page still shows an unfilled "[LÄNK TILL
    // KURSLISTA]" placeholder and offers no way to apply online — anmälan is a
    // mail to info@akadeva.se, so the derived `page` flow would promise a form
    // that isn't there. The URL is a page-builder slug and likely to move.
    registration: { kind: 'email' },
    registrationUrl: 'https://www.akadeva.se/elementor-689/',
    infoUrl: 'https://www.akadeva.se/elementor-689/',
    description:
      'Akadeva i Sollentuna erbjuder prövning i kurser enligt GY11 för folkbokförda i bland annat Sollentuna, Solna, Sigtuna, Lidingö, Danderyd, Täby, Vallentuna, Vaxholm, Österåker och Upplands Väsby. Anmälan görs via e-post till info@akadeva.se, platserna är begränsade.',
    tags: ['komvux', 'flera ämnen', 'sollentuna'],
    verifiedAt: LATE_SUMMER_VERIFIED,
  },
  {
    id: 'komvux-uppsala-kommun-provning-teoretiska-kurser-via-nti-sko',
    schoolName: 'Komvux Uppsala kommun (prövning teoretiska kurser via NTI-skolan)',
    provider: 'Uppsala kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Uppsala',
    region: 'Uppsala',
    address: 'Uppsala (adress bekräftas vid anmälan)',
    lat: 59.8586,
    lng: 17.6389,
    price: 500,
    priceNote:
      '500 kr per prövning, faktureras vid antagning; anmälan bindande så snart bekräftelse mottagits.',
    nextPeriod: {
      label:
        'Höstens ansökan stängde 14 augusti 2026 och prövningsperioden är 14 september – 30 oktober. Uppsala lägger upp anmälningsformuläret på sidan när nästa period öppnar.',
      applicationStart: '2026-08-10',
      applicationEnd: '2026-08-14',
      examWindowStart: '2026-09-14',
      examWindowEnd: '2026-10-30',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // "Under anmälningsperioderna finns en länk till ett anmälningsformulär
    // tillgängligt på den här sidan" — this is that form, live during the
    // 10–14 augusti window. Outside a window it closes rather than 404s, which
    // still tells the user more than a page would.
    registrationUrl: 'https://forms.office.com/e/MyAN26nW6M',
    infoUrl: 'https://www.uppsala.se/skola-forskola-och-komvux/komvux/studera-pa-komvux/provning/',
    description:
      'Uppsala kommun låter NTI-skolan ansvara för prövning i teoretiska kurser för kommunens invånare; man kan bara anmäla sig till en kurs/ämnesnivå per prövningsperiod. Prövning i yrkeskurser hanteras separat via ujc.provning@uppsala.se.',
    tags: ['komvux', 'flera ämnen', 'uppsala'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'vux-huddinge-huddinge-svenska-som-andrasprak-3',
    schoolName: 'Vux Huddinge',
    provider: 'Huddinge kommun',
    subject: 'Svenska som andraspråk',
    course: 'Svenska som andraspråk 3',
    courseCode: 'SVASVA03',
    level: 'Komvux',
    city: 'Huddinge',
    region: 'Stockholm',
    address: 'Huddinge (adress bekräftas vid anmälan)',
    lat: 59.2378,
    lng: 17.9819,
    price: 500,
    priceNote:
      '500 kr per kurs/ämnesnivå; kostnadsfritt vid tidigare betyg F eller IG i kursen på Komvux (styrks med betygskopia).',
    nextPeriod: {
      label: 'Nästa prövningstillfälle är 14 september 2026, anmälan öppen 27 juli - 23 augusti',
      applicationStart: '2026-07-27',
      applicationEnd: '2026-08-23',
      examWindowStart: '2026-09-14',
      examWindowEnd: '2026-09-14',
      confirmed: true,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    registrationUrl: 'https://huddinge.alvis.se/provning/amnesomrade',
    infoUrl:
      'https://www.huddinge.se/forskola-skola/vuxenutbildning/provning-validering-och-nivatest/provning-pa-komvux',
    description:
      'Vux Huddinge erbjuder prövning två gånger per år i svenska som andraspråk. Prövningen tar två dagar: skriftlig examination första dagen och muntlig examination andra dagen. Betalning sker via Swish.',
    tags: ['komvux', 'svenska som andraspråk', 'huddinge'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vux-huddinge-huddinge-svenska-som-andrasprak-1',
    schoolName: 'Vux Huddinge',
    provider: 'Huddinge kommun',
    subject: 'Svenska som andraspråk',
    course: 'Svenska som andraspråk 1',
    courseCode: 'SVASVA01',
    level: 'Komvux',
    city: 'Huddinge',
    region: 'Stockholm',
    address: 'Huddinge (adress bekräftas vid anmälan)',
    lat: 59.2378,
    lng: 17.9819,
    price: 500,
    priceNote:
      '500 kr per kurs/ämnesnivå; kostnadsfritt vid tidigare betyg F eller IG i kursen på Komvux (styrks med betygskopia).',
    nextPeriod: {
      label: 'Nästa prövningstillfälle är 14 september 2026, anmälan öppen 27 juli - 23 augusti',
      applicationStart: '2026-07-27',
      applicationEnd: '2026-08-23',
      examWindowStart: '2026-09-14',
      examWindowEnd: '2026-09-14',
      confirmed: true,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    registrationUrl: 'https://huddinge.alvis.se/provning/amnesomrade',
    infoUrl:
      'https://www.huddinge.se/forskola-skola/vuxenutbildning/provning-validering-och-nivatest/provning-pa-komvux',
    description:
      'Vux Huddinge erbjuder också prövning i Svenska som andraspråk 1, samma anmälningsperiod och villkor som nivå 3. Begränsat antal platser, principen är först till kvarn.',
    tags: ['komvux', 'svenska som andraspråk', 'huddinge'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-kunskapsparken-sollentuna-sollentuna-flera',
    schoolName: 'Vuxenutbildningen Kunskapsparken Sollentuna',
    provider: 'Sollentuna kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Sollentuna',
    region: 'Stockholm',
    address: 'Turebergsvägen 1B, 3 tr, 191 86 Sollentuna',
    lat: 59.4281,
    lng: 17.95,
    price: 500,
    priceNote: '500 kr; kostnadsfritt vid icke godkänt betyg från komvux.',
    nextPeriod: {
      label:
        'Skolorna i ansökningswebben erbjuder prövning på hela sitt utbud minst två gånger per hösttermin och vårtermin - se respektive skolas hemsida för datum',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Checked 2026-08-13: Sollentuna's ansökningswebb carries no prövning
    // entries, and the page says plainly "Kontakta skolan om du önskar att
    // anmäla dig" — the kommun only points you at which schools exist. So the
    // flow is a conversation, not a form, and the steps say which one.
    registration: {
      kind: 'email',
      landing:
        'Kunskapsparken hänvisar prövningen till skolan som ger kursen — anmälan görs där, inte hos kommunen.',
      steps: [
        'Hitta skolan som ger din kurs i ansökningswebben (vuxenutbildning.sollentuna.se)',
        'Mejla kunskapsparken@sollentuna.se eller ring 08-579 220 01 om du är osäker på vilken skola',
        'Anmäl dig hos skolan och betala avgiften dit — betyget hämtar du sedan via ditt studerandekonto',
      ],
    },
    registrationUrl:
      'https://www.sollentuna.se/uweb/kunskapsparken/studera-pa-komvux/inledande-kartlaggning-validering-och-provning/',
    infoUrl:
      'https://www.sollentuna.se/uweb/kunskapsparken/studera-pa-komvux/inledande-kartlaggning-validering-och-provning/',
    description:
      'Vuxenutbildningen Kunskapsparken i Sollentuna hänvisar till skolorna i kommunens ansökningswebb för prövning; avgiften betalas direkt till den skola där prövningen genomförs och betyget hämtas via studerandekontot.',
    tags: ['komvux', 'flera ämnen', 'sollentuna'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'centrum-vux-haninge-haninge-flera-kurser-kontakta-skolan-for',
    schoolName: 'Centrum Vux Haninge',
    provider: 'Haninge kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Haninge',
    region: 'Stockholm',
    address: 'Marinens väg 30, plan 5, 136 40 Handen',
    lat: 59.1673,
    lng: 18.1441,
    price: 500,
    priceNote: '500 kr per prövning; kostnadsfritt om tidigare betyg F/IG i kursen på Centrum Vux.',
    nextPeriod: {
      label:
        'Prövningsanmälan för våren 2026 är stängd; information om prövning för hösten 2026 meddelas senare enligt skolan',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://centrumvux.haninge.se/ansok/provning2/',
    infoUrl: 'https://centrumvux.haninge.se/ansok/provning2/',
    description:
      'Centrum Vux Haninge erbjuder prövning för den som saknar eller vill höja betyg; skriftlig och muntlig examination, betalning via Swish. Senaste omgången (våren 2026) hade ansökan 9-16 april och prövningsperiod veckorna 22-23.',
    tags: ['komvux', 'flera ämnen', 'haninge'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'komvux-enkoping-provning-via-nti-skolan-enkoping-flera-kurse',
    schoolName: 'Komvux Enköping (prövning via NTI-skolan)',
    provider: 'Enköpings kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Enköping',
    region: 'Uppsala',
    address: 'Enköping (adress bekräftas vid anmälan)',
    lat: 59.6362,
    lng: 17.0777,
    price: 500,
    priceNote: '500 kr per prövning enligt Skolverkets förordning.',
    nextPeriod: {
      label:
        'Prövningsperioden för våren 2026 (9 februari - 3 april, ansökan 5-9 januari) är avslutad; nästa period ej bekräftad på sidan',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Enköping's prövningar run through NTI, and the kommun links NTI's
    // "Prövningsansökan" form directly. Like Uppsala's, it is published per
    // anmälningsperiod. No dates below: the kommun hasn't published this term's.
    registrationUrl: 'https://forms.office.com/e/yT2sxpR15V',
    infoUrl:
      'https://enkoping.se/forskola-och-skola/vuxenutbildning/sa-fungerar-det-att-studera-hos-oss/provning-pa-komvux.html',
    description:
      'All prövning inom Enköpings komvux genomförs av NTI-skolan på uppdrag av kommunen. Den studerande läser in kursen på egen hand utan lärarstöd och examineras skriftligt och muntligt.',
    tags: ['komvux', 'flera ämnen', 'enköping'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'sundbybergs-stad-vuxenutbildning-sundbyberg-flera-kurser-kon',
    schoolName: 'Sundbybergs stad Vuxenutbildning',
    provider: 'Sundbybergs stad',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Sundbyberg',
    region: 'Stockholm',
    address: 'Sundbyberg (adress bekräftas vid anmälan)',
    lat: 59.3608,
    lng: 17.9711,
    price: 500,
    priceNote: '500 kr per prövning enligt Skolverkets förordning.',
    nextPeriod: {
      label:
        'Tidigare period: hösten 2025 öppnade anmälan 16 juni med sista dag 3 augusti, våren 2026 öppnade 17 november med sista dag 4 januari - nästa period ej bekräftad på sidan',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The kommun page explains prövning but never links a form; the booking
    // lives in their Alvis catalogue, which lists "Prövningsanmälan" /
    // "Anmälan till prövning" entries (checked 2026-08-11).
    registrationUrl: 'https://sundbyberg.alvis.se/hittakurser',
    infoUrl:
      'https://www.sundbyberg.se/forskola-skola-och-utbildning/vuxenutbildning/infor-och-under-dina-studier',
    description:
      'Sundbybergs stad låter dig göra prövning i kurser inom kommunens utbud; anmälan görs via länk på kommunens webbplats. Skolor med prövning i önskad kurs söks i kurskatalogen.',
    tags: ['komvux', 'flera ämnen', 'sundbyberg'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'linvux-linkopings-vuxenutbildning-linkoping-engelska-6',
    schoolName: 'Linvux (Linköpings vuxenutbildning)',
    provider: 'Linköpings kommun',
    subject: 'Engelska',
    course: 'Engelska 6',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Linköping',
    region: 'Östergötland',
    address: 'Kunskapsgallerian, Sankt Larsgatan 46, Linköping',
    lat: 58.4108,
    lng: 15.6214,
    price: 500,
    priceNote:
      '500 kr per kurs, kostnadsfritt vid tidigare betyg F/IG i kursen (betygsutdrag krävs)',
    nextPeriod: {
      label: 'Prövningsperiod 3, hösten 2026',
      applicationStart: '2026-08-10',
      applicationEnd: '2026-09-04',
      examWindowStart: '2026-09-28',
      examWindowEnd: '2026-10-11',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    // Linvux publishes one "Ansök här" form per prövningsperiod; this is the
    // one open for period 3 (10 augusti–4 september 2026). Max tre kurser per
    // period och begränsat antal platser.
    registrationUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSfda-AcrB_X1CQkm87v60SmosDyMSZ7REcNwEca3yqAqpeX6Q/viewform',
    infoUrl:
      'https://www.linkoping.se/forskola-och-utbildning/vuxenutbildning/komvux/alla-skolor-inom-komvux-i-linkoping/linvux/provning/provning---gymnasiala-kurser',
    description:
      'Linvux erbjuder prövning i Engelska 6 under prövningsperiod 3 hösten 2026, med skrivdagar vecka 40–41 på Kunskapsgallerian i Linköping. Ansökan öppnar 10 augusti och stänger 4 september 2026.',
    tags: ['engelska', 'gymnasial', 'östergötland'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'linvux-linkopings-vuxenutbildning-linkoping-matematik-3b-3c',
    schoolName: 'Linvux (Linköpings vuxenutbildning)',
    provider: 'Linköpings kommun',
    subject: 'Matematik',
    course: 'Matematik 3b/3c',
    courseCode: 'MATMAT03b',
    level: 'Komvux',
    city: 'Linköping',
    region: 'Östergötland',
    address: 'Kunskapsgallerian, Sankt Larsgatan 46, Linköping',
    lat: 58.4108,
    lng: 15.6214,
    price: 500,
    priceNote: '500 kr per kurs, kostnadsfritt vid tidigare betyg F/IG i kursen',
    nextPeriod: {
      label: 'Prövningsperiod 4, hösten 2026',
      applicationStart: '2026-09-21',
      applicationEnd: '2026-10-16',
      examWindowStart: '2026-12-14',
      examWindowEnd: '2026-12-20',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    // Linvux publishes a separate "Ansök här"-formulär per prövningsperiod.
    // This listing sits in period 4, whose form isn't published yet — the
    // page is where it will appear. (The period 3 listing links its form.)
    registration: publishedOnPage('anmälningsformuläret för prövningsperiod 4', 'den 21 september'),
    registrationUrl:
      'https://www.linkoping.se/forskola-och-utbildning/vuxenutbildning/komvux/alla-skolor-inom-komvux-i-linkoping/linvux/provning/provning---gymnasiala-kurser',
    infoUrl:
      'https://www.linkoping.se/forskola-och-utbildning/vuxenutbildning/komvux/alla-skolor-inom-komvux-i-linkoping/linvux/provning/provning---gymnasiala-kurser',
    description:
      'Matematikprövningar (bland annat Matematik 3b/3c) ges av Linvux under prövningsperiod 4 med skrivdag vecka 51 hösten 2026. Provet sker på Kunskapsgallerian i Linköping och kostar 500 kr.',
    tags: ['matematik', 'gymnasial', 'östergötland'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'kallvindsskolan-komvux-norrkoping-norrkoping-kemi-1',
    schoolName: 'Källvindsskolan (Komvux Norrköping)',
    provider: 'Norrköpings kommun / Vuxenutbildning Norrköping',
    subject: 'Kemi',
    course: 'Kemi 1',
    courseCode: 'KEMKEM01',
    level: 'Komvux',
    city: 'Norrköping',
    region: 'Östergötland',
    address: 'Källvindsskolan, Norrköping (adress bekräftas vid anmälan)',
    lat: 58.5877,
    lng: 16.1924,
    price: 500,
    priceNote: '500 kr per prövning; folkbokförda i Norrköpings kommun prioriteras vid platsbrist',
    nextPeriod: {
      label: 'Ansökan vecka 35–38, 2026',
      applicationStart: '2026-08-24',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-19',
      examWindowEnd: '2026-12-20',
      confirmed: true,
    },
    components: COMPONENTS_KEMI,
    studyTips: TIPS_KEMI,
    registrationUrl: 'https://norrkoping.alvis.se/login',
    infoUrl: 'https://komvux.norrkoping.se/komvux/provning',
    description:
      'Komvux Norrköping erbjuder prövning i Kemi 1 på Källvindsskolan; ansökan sker vecka 35–38, första provdatum torsdag vecka 43, sista betygsdatum vecka 51 (2026).',
    tags: ['kemi', 'gymnasial', 'östergötland'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'kallvindsskolan-komvux-norrkoping-norrkoping-matematik-forts',
    schoolName: 'Källvindsskolan (Komvux Norrköping)',
    provider: 'Norrköpings kommun / Vuxenutbildning Norrköping',
    subject: 'Matematik',
    course: 'Matematik – fortsättning nivå 1 (Matematik 3)',
    courseCode: 'MATMAT03b',
    level: 'Komvux',
    city: 'Norrköping',
    region: 'Östergötland',
    address: 'Källvindsskolan, Norrköping (adress bekräftas vid anmälan)',
    lat: 58.5877,
    lng: 16.1924,
    price: 500,
    priceNote: '500 kr per prövning; kostnadsfritt vid tidigare F/IG i kursen på Komvux Norrköping',
    nextPeriod: {
      label: 'Ansökan vecka 35–38, 2026',
      applicationStart: '2026-08-24',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-19',
      examWindowEnd: '2026-12-20',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://norrkoping.alvis.se/login',
    infoUrl: 'https://komvux.norrkoping.se/komvux/provning',
    description:
      'Prövning i matematik fortsättningsnivå (motsvarande Matematik 3) ges på Källvindsskolan, med ansökan vecka 35–38 och provstart vecka 43 hösten 2026.',
    tags: ['matematik', 'gymnasial', 'östergötland'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-motala-carlsund-utbildningscentrum-motala-',
    schoolName: 'Vuxenutbildningen Motala (Carlsund utbildningscentrum)',
    provider: 'Motala kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Motala',
    region: 'Östergötland',
    address: 'Motala (adress bekräftas vid anmälan)',
    lat: 58.5369,
    lng: 15.0359,
    price: 500,
    priceNote: '500 kr per kurs/ämnesnivå, kostnadsfritt vid tidigare betyg F/IG',
    nextPeriod: {
      label: 'Höstens anmälningsperiod 2026',
      applicationStart: '2026-08-03',
      applicationEnd: '2026-09-15',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://etjanst.motala.se/provning',
    infoUrl:
      'https://www.motala.se/skola-och-forskola/vuxenutbildning/provning-pa-vuxenutbildningen/',
    description:
      'Motala vuxenutbildning tar emot anmälningar till höstens prövningsperiod 3 augusti–15 september 2026; prövningen tar oftast cirka sex veckor och saknar fasta provdatum.',
    tags: ['flera ämnen', 'gymnasial', 'östergötland'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-eskilstuna-eskilstuna-flera-kurser-kontakt',
    schoolName: 'Vuxenutbildningen Eskilstuna',
    provider: 'Eskilstuna kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Eskilstuna',
    region: 'Södermanland',
    address: 'Drottninggatan 12, Eskilstuna',
    lat: 59.3706,
    lng: 16.5077,
    price: 500,
    priceNote:
      '500 kr per kurs (ordinarie avgift); avgiftsfritt vid tidigare F/IG i kursen enligt kommunens generella prövningsregler',
    nextPeriod: {
      // Eskilstuna replaced one period per termin with four, each three weeks
      // long and each ending in a compulsory on-site slutprov. Their table now
      // lists spring 2027; the autumn 2026 dates this listing used to carry are
      // no longer published anywhere, so they're replaced rather than kept.
      label:
        'Kommunen har gått över till fyra prövningsperioder per termin, med högst 100 poäng per period. Nästa publicerade tillfälle: anmälan 9 november–4 december 2026, prövningsperiod 28 december 2026–15 januari 2027, med obligatoriskt slutprov på plats 13 januari 2027.',
      applicationStart: '2026-11-09',
      applicationEnd: '2026-12-04',
      examWindowStart: '2026-12-28',
      examWindowEnd: '2027-01-15',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The kommun's own "Webbansökan - prövningar" e-tjänst link, pointing at
    // the prövning offering rather than the portal's front door.
    registrationUrl:
      'https://education.service.tieto.com/AdultApplication.Student/#/search-offering/kv/fc77aae0-6b0b-4796-b45c-141dbfc4e026?domain=EskilstunaEdu',
    infoUrl:
      'https://www.eskilstuna.se/e-tjanster-och-blanketter/anmal-dig-till-provning-hos-komvux',
    description:
      'Anmälan till höstens prövningsperiod hos Komvux Eskilstuna är öppen 2 februari–15 augusti 2026, med prövningar genomförda 15 september–15 november 2026.',
    tags: ['flera ämnen', 'gymnasial', 'södermanland'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'campus-nykoping-nykoping-flera-kurser-kontakta-skolan-for-ku',
    schoolName: 'Campus Nyköping',
    provider: 'Nyköpings kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Nyköping',
    region: 'Södermanland',
    address: 'Campus Nyköping (adress bekräftas vid anmälan)',
    lat: 58.7527,
    lng: 17.0093,
    price: 500,
    priceNote: '500 kr per prövning, max 2 prövningar per elev',
    nextPeriod: {
      label: 'Prövning genomförs vecka 43–45 hösten (ansökningsperioder enligt kurskatalogen)',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://campusnykoping.alvis.se/hittakurser',
    infoUrl: 'https://www.campusnykoping.se/komvux/vuxenutbildning-gymnasial-niva/',
    description:
      'Campus Nyköping genomför prövningar vecka 13–15 på våren och vecka 43–45 på hösten; aktuella ansökningsperioder publiceras löpande i kurskatalogen.',
    tags: ['flera ämnen', 'gymnasial', 'södermanland'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'vuxenutbildningscentrum-vasteras-edstromska-m-fl-vasteras-fl',
    schoolName: 'Vuxenutbildningscentrum Västerås (Edströmska m.fl.)',
    provider: 'Västerås stad',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Västerås',
    region: 'Västmanland',
    address: 'Vuxenutbildningscentrum, Västerås (adress bekräftas vid anmälan)',
    lat: 59.6099,
    lng: 16.5448,
    price: 500,
    priceNote: '500 kr per kurs, betalning via Swish; återbetalas endast vid styrkt sjukdom',
    nextPeriod: {
      label: 'Prövningsperiod vecka 41–44, 2026',
      applicationStart: '2026-08-17',
      applicationEnd: '2026-08-31',
      examWindowStart: '2026-10-05',
      examWindowEnd: '2026-11-01',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // "Kurskatalog Vuxenutbildningscentrum" on the kommun page — the Alvis
    // prövningskatalog, which is where the anmälan is actually made.
    registrationUrl: 'https://vasteras.alvis.se/provning/amnesomrade',
    infoUrl:
      'https://www.vasteras.se/barn-och-utbildning/vuxenutbildning/nivatest-och-provning-infor-vuxenutbildning.html',
    description:
      'Västerås stad samordnar prövning i sfi, grundläggande och gymnasiala kurser hos flera anordnare (bl.a. Edströmska); anmälan är öppen 17–31 augusti inför prövningsperiod vecka 41–44, 2026.',
    tags: ['flera ämnen', 'gymnasial', 'västmanland'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'komvux-orebro-campus-risbergska-orebro-flera-kurser-kontakta',
    schoolName: 'Komvux Örebro (Campus Risbergska)',
    provider: 'Örebro kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Örebro',
    region: 'Örebro',
    address: 'Campus Risbergska, Örebro (adress bekräftas vid anmälan)',
    lat: 59.2753,
    lng: 15.2134,
    price: 500,
    priceNote: '500 kr per prövning, avgiftsfritt vid styrkt F från vuxenutbildningen i ämnet',
    nextPeriod: {
      label: 'Anmälan till höstens prövningar 2026',
      applicationStart: '2026-09-14',
      applicationEnd: '2026-09-27',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Checked 2026-08-13: anmälan runs 14–27 september 2026, and it is made by
    // logging in to Komvux Örebros ansökningswebb — not on the kommun page,
    // which only carries the timetable and a prövningsinfo-PDF per ämne.
    //
    // Örebro's own link is an SP-less SAML entry point
    // (m46-mg-local.e24.orebro.se/samlv2/idp/sign_in/1) that answers a cold
    // click with "Cookie error". The ansökningswebb it fronts is the IST Open24
    // instance below, which serves its own login and is titled "Komvux Örebro",
    // so that is the door we send people through.
    registrationUrl: 'https://open24.ist-asp.com/orebro/vux/Vux/MyAccount',
    infoUrl:
      'https://gymnasieskolor.orebro.se/komvux/provningtentaavkursellerhojbetyg.4.17bd677b15a180b3e7e75d5.html',
    description:
      'Komvux Örebro öppnar anmälan till prövningar i grundskole-, gymnasiala- och sfi-kurser hösten 2026 den 14–27 september; anmälan görs i Komvux ansökningswebb med e-legitimation. Antagningsbesked skickas per e-post den 1 oktober och du måste tacka ja eller nej — anmälan är bindande efter sista svarsdag.',
    tags: ['flera ämnen', 'gymnasial', 'örebro'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'vuxnas-larande-karlskoga-karlskoga-engelska-6',
    schoolName: 'Vuxnas lärande Karlskoga',
    provider: 'Karlskoga kommun',
    subject: 'Engelska',
    course: 'Engelska 6',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Karlskoga',
    region: 'Örebro',
    address: 'Vuxnas lärande, Karlskoga (adress bekräftas vid anmälan)',
    lat: 59.3266,
    lng: 14.5211,
    price: 500,
    priceNote: '500 kr per kurs, oavsett tidigare betyg',
    nextPeriod: {
      label: 'Prövning hösten 2026',
      applicationStart: '2026-08-10',
      applicationEnd: '2026-08-20',
      examWindowStart: '2026-09-14',
      examWindowEnd: '2026-10-25',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    registration: { kind: 'email' },
    registrationUrl:
      'https://karlskoga.se/utbildning--barnomsorg/vuxenutbildning/provning/provning-gymnasiekurser.html',
    infoUrl:
      'https://karlskoga.se/utbildning--barnomsorg/vuxenutbildning/provning/provning-gymnasiekurser.html',
    description:
      'Karlskoga erbjuder prövning i Engelska 6 med obligatoriska prövningsveckor 38–39 och 43; ansökan är öppen 10–20 augusti 2026 och prövningen sker på Vuxnas lärande i Karlskoga.',
    tags: ['engelska', 'gymnasial', 'örebro'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxnas-larande-karlskoga-karlskoga-matematik-3b-3c',
    schoolName: 'Vuxnas lärande Karlskoga',
    provider: 'Karlskoga kommun',
    subject: 'Matematik',
    course: 'Matematik 3b/3c',
    courseCode: 'MATMAT03b',
    level: 'Komvux',
    city: 'Karlskoga',
    region: 'Örebro',
    address: 'Vuxnas lärande, Karlskoga (adress bekräftas vid anmälan)',
    lat: 59.3266,
    lng: 14.5211,
    price: 500,
    priceNote: '500 kr per kurs, oavsett tidigare betyg',
    nextPeriod: {
      label: 'Prövning hösten 2026',
      applicationStart: '2026-08-10',
      applicationEnd: '2026-08-20',
      examWindowStart: '2026-10-05',
      examWindowEnd: '2026-10-25',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registration: { kind: 'email' },
    registrationUrl:
      'https://karlskoga.se/utbildning--barnomsorg/vuxenutbildning/provning/provning-gymnasiekurser.html',
    infoUrl:
      'https://karlskoga.se/utbildning--barnomsorg/vuxenutbildning/provning/provning-gymnasiekurser.html',
    description:
      'Prövning i Matematik 3b/3c på Vuxnas lärande Karlskoga har obligatoriska prövningsveckor 41–43 hösten 2026; ansökan öppen 10–20 augusti 2026, avgift 500 kr.',
    tags: ['matematik', 'gymnasial', 'örebro'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-falun-falu-larcentrum-falun-flera-kurser-k',
    schoolName: 'Vuxenutbildningen Falun (Falu lärcentrum)',
    provider: 'Falu kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Falun',
    region: 'Dalarna',
    address: 'Falun (adress bekräftas vid anmälan)',
    lat: 60.6065,
    lng: 15.6355,
    price: 500,
    priceNote:
      '500 kr anmälningsavgift, kostnadsfritt vid tidigare F/IG i kursen. Prövning i Gy11-kurser erbjuds fram till 2030.',
    nextPeriod: {
      // Anmälan sker på plats under två timmar en enda dag — därför är
      // applicationStart och applicationEnd samma datum.
      label:
        'Anmälan sker på plats tisdag 1 september 2026 kl. 13.00–15.00 på Åsgatan 15, och prövningen genomförs vecka 41 i Falun. Ta med kvitto på betald avgift (bankgiro 218-0289).',
      applicationStart: '2026-09-01',
      applicationEnd: '2026-09-01',
      examWindowStart: '2026-10-05',
      examWindowEnd: '2026-10-11',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://falun.alvis.se/hittakurser',
    infoUrl: 'https://www.falun.se/vuxenutbildningen/utbildningar/provning.html',
    description:
      'Vuxenutbildningen i Falun erbjuder prövning i alla ämnen som finns i det egna kursutbudet, mot en anmälningsavgift på 500 kr; exakt datum för höstens anmälningsperiod meddelas separat.',
    tags: ['flera ämnen', 'gymnasial', 'dalarna'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-borlange-borlange-flera-kurser-kontakta-sk',
    schoolName: 'Vuxenutbildningen Borlänge',
    provider: 'Borlänge kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Borlänge',
    region: 'Dalarna',
    address: 'Borlänge (adress bekräftas vid anmälan)',
    lat: 60.4858,
    lng: 15.4366,
    price: 500,
    priceNote: '500 kr per kurs, kostnadsfritt vid tidigare F/IG i kursen/ämnesnivån',
    nextPeriod: {
      label: 'Period 2, 2026',
      applicationStart: '2026-08-15',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-12',
      examWindowEnd: '2026-11-13',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Borlänge has no separate prövningsanmälan: you use the ordinary ansökan,
    // search for "prövning" and tick "visa även kurser för prövning". This is
    // the ansökan their own page links to.
    registrationUrl:
      'https://education.service.tieto.com/AdultApplication.Student/#/search-offering/kv?domain=borlange',
    infoUrl:
      'https://www.borlange.se/barn-och-utbildning/vuxenutbildningen/ansokan-och-kursstarter/ansokan-grundskolekurser-gymnasieamnen-yrkesutbildningar-och-provning',
    description:
      'Vuxenutbildningen i Borlänge har prövningsanmälan för period 2, 2026 öppen 15 augusti–20 september, med prövningsperiod 12 oktober–13 november 2026; max två prövningar per period.',
    tags: ['flera ämnen', 'gymnasial', 'dalarna'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-gavle-gavle-flera-kurser-kontakta-skolan-f',
    schoolName: 'Vuxenutbildningen Gävle',
    provider: 'Gävle kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Gävle',
    region: 'Gävleborg',
    address: 'Gävle (adress bekräftas vid anmälan)',
    lat: 60.6749,
    lng: 17.1413,
    price: 500,
    priceNote: '500 kr per prövning, avgiftsfritt vid styrkt tidigare F/IG i kursen/ämnesnivån',
    nextPeriod: {
      // Period 4 anges i veckonummer på Gävles sida: v. 45–47 är 2–22
      // november 2026.
      label:
        'Prövningsperiod 4, 2026: prövningen genomförs vecka 45–47 och sista anmälningsdatum är 22 september.',
      applicationEnd: '2026-09-22',
      examWindowStart: '2026-11-02',
      examWindowEnd: '2026-11-22',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://sjalvservice.gavle.se/provning',
    infoUrl:
      'https://www.gavle.se/utbildning-och-barnomsorg/vuxenutbildning-i-gavle/for-dig-som-ar-elev-pa-vuxenutbildningen/betyg-studieintyg-och-provning/',
    description:
      'Vuxenutbildningen Gävle erbjuder upp till 3 prövningar per period; period 3, 2026 genomförs vecka 38–40 med sista anmälningsdatum 4 augusti 2026.',
    tags: ['flera ämnen', 'gymnasial', 'gävleborg'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'laroviken-sandvikens-kommun-sandviken-flera-kurser-kontakta-',
    schoolName: 'Läroviken (Sandvikens kommun)',
    provider: 'Sandvikens kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Sandviken',
    region: 'Gävleborg',
    address: 'Sandviken (adress bekräftas vid anmälan)',
    lat: 60.6167,
    lng: 16.7761,
    price: 500,
    priceNote:
      'Avgift betalas direkt via Swish eller kort vid ansökan (ordinarie prövningsavgift 500 kr)',
    nextPeriod: {
      label: 'Hösten 2026',
      applicationStart: '2026-09-10',
      applicationEnd: '2026-10-15',
      examWindowStart: '2026-11-02',
      examWindowEnd: '2026-11-22',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://minasidor.sandviken.se/oversikt/overview/267',
    infoUrl: 'https://minasidor.sandviken.se/oversikt/overview/267',
    description:
      'Läroviken i Sandviken erbjuder prövning hösten under vecka 45–47 (november) 2026; e-tjänsten för anmälan öppnar 10 september och sista anmälningsdatum är 15 oktober 2026.',
    tags: ['flera ämnen', 'gymnasial', 'gävleborg'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'cul-utbildning-for-vuxna-hudiksvalls-kommun-hudiksvall-flera',
    schoolName: 'Cul – Utbildning för vuxna (Hudiksvalls kommun)',
    provider: 'Hudiksvalls kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Hudiksvall',
    region: 'Gävleborg',
    address: 'Cul, Hudiksvall (adress bekräftas vid anmälan)',
    lat: 61.7285,
    lng: 17.1069,
    price: 500,
    priceNote: 'Gratis om betyg saknas i ämnet (F/IG räknas som saknat betyg), annars 500 kr',
    nextPeriod: {
      label: 'Prövningsperiod 2027',
      applicationStart: '2027-03-15',
      applicationEnd: '2027-04-15',
      examWindowStart: '2027-06-03',
      examWindowEnd: '2027-06-09',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://hudiksvall.alvis.se/provning/amnesomrade',
    infoUrl:
      'https://www.hudiksvall.se/Sidor/Barn-och-utbildning/Utbildning-for-vuxna---Cul/Komplettera-din-behorighet/Provning-for-betyg.html',
    description:
      'Cul i Hudiksvall genomför en prövningsperiod per år; nästa tillfälle är 3–9 juni 2027 med anmälan öppen 15 mars–15 april 2027.',
    tags: ['flera ämnen', 'gymnasial', 'gävleborg'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-kristianstad-kristianstad-flera-kurser-kon',
    schoolName: 'Vuxenutbildningen Kristianstad',
    provider: 'Kristianstads kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Kristianstad',
    region: 'Skåne',
    address: 'Väglednings- och lärcentrum, Östra Kaserngatan 6, Kristianstad',
    lat: 56.0294,
    lng: 14.1567,
    price: 500,
    priceNote:
      '500 kr per prövning; gratis om du saknar betyg eller har F i kursen (alltid 500 kr för dig som är folkbokförd i annan kommun)',
    nextPeriod: {
      // Perioden startar 9 november och löper i tio veckor, men Kristianstad
      // publicerar inget slutdatum och ämnesläraren sätter provdagen efter
      // antagningsbeskedet. Ett uträknat slutdatum vore vår gissning, inte
      // deras uppgift, så perioden står bara i texten.
      label:
        'Ansökan till prövningsperioden som startar 9 november 2026 är öppen nu och stänger 18 oktober. Perioden löper i tio veckor, och ditt provdatum sätts av ämnesläraren efter antagningsbeskedet.',
      applicationEnd: '2026-10-18',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl:
      'https://education.service.tieto.com/HCW.Welfare.CC.AdultOpenChoiceWeb/ApplicantHome.aspx?domain=KristianstadEdu',
    infoUrl:
      'https://www.kristianstad.se/sv/barn-och-utbildning/vuxenutbildning/vuxenutbildning/ansokan/provning/',
    description:
      'Kristianstads kommun erbjuder betygsprövning i gymnasiala kurser via webbansökan med BankID, max två prövningar per period. Prövning kan inte sökas med CSN-studiemedel.',
    tags: ['komvux', 'kommunal', 'skåne'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'campus-trelleborg-trelleborg-engelska-6',
    schoolName: 'Campus Trelleborg',
    provider: 'Trelleborgs kommun',
    subject: 'Engelska',
    course: 'Engelska 6',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Trelleborg',
    region: 'Skåne',
    address: 'Trelleborg (adress bekräftas vid anmälan)',
    lat: 55.3753,
    lng: 13.1569,
    price: 500,
    priceNote: '500 kr per kurs; gratis vid tidigare F i kursen som inskriven elev i Trelleborg',
    nextPeriod: {
      // Trelleborg publishes one weekday per subject inside the prövningsvecka:
      // engelska skrivs på fredagen, 13 november.
      label:
        'Ansökan till höstens prövningar är öppen 31 augusti – 13 september 2026. Prövningarna genomförs vecka 46, och engelska skrivs fredag 13 november.',
      applicationStart: '2026-08-31',
      applicationEnd: '2026-09-13',
      examWindowStart: '2026-11-13',
      examWindowEnd: '2026-11-13',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    registrationUrl:
      'https://education.service.tieto.com/AdultApplication.Student/#/search-offering/kv?domain=Trelleborg_VUXDMN',
    infoUrl: 'https://www.trelleborg.se/barn-utbildning/vuxenutbildning/provning/',
    description:
      'Campus Trelleborg erbjuder prövning enligt Gy11 i egna kurser, bland annat Engelska 6, med prov på plats i Trelleborg. Betalning ska ske senast ett angivet datum efter antagningsbesked.',
    tags: ['komvux', 'engelska', 'gy11'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'campus-trelleborg-trelleborg-samhallskunskap-1b',
    schoolName: 'Campus Trelleborg',
    provider: 'Trelleborgs kommun',
    subject: 'Samhällskunskap',
    course: 'Samhällskunskap 1b',
    courseCode: 'SAMSAM01b',
    level: 'Komvux',
    city: 'Trelleborg',
    region: 'Skåne',
    address: 'Trelleborg (adress bekräftas vid anmälan)',
    lat: 55.3753,
    lng: 13.1569,
    price: 500,
    priceNote: '500 kr per kurs; gratis vid tidigare F i kursen som inskriven elev i Trelleborg',
    nextPeriod: {
      // Samhällskunskap ligger på måndagen i prövningsveckan, 9 november.
      label:
        'Ansökan till höstens prövningar är öppen 31 augusti – 13 september 2026. Prövningarna genomförs vecka 46, och samhällskunskap skrivs måndag 9 november.',
      applicationStart: '2026-08-31',
      applicationEnd: '2026-09-13',
      examWindowStart: '2026-11-09',
      examWindowEnd: '2026-11-09',
      confirmed: true,
    },
    components: COMPONENTS_SAMHALLSKUNSKAP,
    studyTips: TIPS_SAMHALLSKUNSKAP,
    registrationUrl:
      'https://education.service.tieto.com/AdultApplication.Student/#/search-offering/kv?domain=Trelleborg_VUXDMN',
    infoUrl: 'https://www.trelleborg.se/barn-utbildning/vuxenutbildning/provning/',
    description:
      'Campus Trelleborg listar Samhällskunskap 1b bland de Gy11-kurser man kan pröva i, med max två prövningar per elev och tillfälle.',
    tags: ['komvux', 'samhällskunskap', 'gy11'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-eslov-eslov-svenska-1',
    schoolName: 'Vuxenutbildningen Eslöv',
    provider: 'Eslövs kommun',
    subject: 'Svenska',
    course: 'Svenska 1',
    courseCode: 'SVESVE01',
    level: 'Komvux',
    city: 'Eslöv',
    region: 'Skåne',
    address: 'Eslöv (adress bekräftas vid anmälan)',
    lat: 55.838,
    lng: 13.3033,
    price: 500,
    priceNote: '500 kr per tillfälle (faktureras); gratis vid tidigare F/Icke godkänt i kursen',
    nextPeriod: {
      label:
        'Ingen specifik ansökningsperiod angiven på sidan - ansökan görs löpande via studie- och yrkesvägledare',
      confirmed: false,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    // "Du ansöker via våra studie- och yrkesvägledare" — there is no form to
    // deep-link to, so the flow is corrected instead of the URL. The generic
    // e-post steps assume you mail the school and pay up front; Eslöv routes
    // you via a vägledare and invoices afterwards, so they're replaced.
    registration: {
      kind: 'email',
      ctaLabel: 'Se vägledarnas kontaktuppgifter',
      landing:
        'Anmälan görs via skolans studie- och yrkesvägledare — kontaktuppgifterna står på sidan.',
      steps: [
        'Kontakta en studie- och yrkesvägledare och säg vilken kurs eller ämnesnivå du vill pröva i',
        'Bifoga betygskopior — ansökan är inte komplett utan dem',
        'Avgiften faktureras i efterhand, den betalas alltså inte vid anmälan',
      ],
    },
    registrationUrl: 'https://eslov.se/utbildning-barnomsorg/vuxenutbildning-yh/ansokan/provning/',
    infoUrl: 'https://eslov.se/utbildning-barnomsorg/vuxenutbildning-yh/ansokan/',
    description:
      'Vuxenutbildningen i Eslöv erbjuder prövning i bland annat svenska/svenska som andraspråk nivå 1, samhällskunskap 1a1 och vårdkurser på gymnasial nivå. Ansökan sker via kommunens studie- och yrkesvägledare med bifogade betygskopior.',
    tags: ['komvux', 'svenska', 'skåne'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-angelholm-angelholm-engelska-6',
    schoolName: 'Vuxenutbildningen Ängelholm',
    provider: 'Ängelholms kommun',
    subject: 'Engelska',
    course: 'Engelska 6',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Ängelholm',
    region: 'Skåne',
    address: 'Ängelholm, prövning genomförs hos Talenti (adress bekräftas vid anmälan)',
    lat: 56.2428,
    lng: 12.8619,
    price: 500,
    priceNote: '500 kr per kurs och prövningstillfälle, betalas via kort eller Swish vid anmälan',
    nextPeriod: {
      label:
        'Prövningsperiod 4: 12 oktober – 6 november 2026. Anmälan öppnar 31 augusti och stänger 11 september. (Period 3 stängde 7 augusti.)',
      applicationStart: '2026-08-31',
      applicationEnd: '2026-09-11',
      examWindowStart: '2026-10-12',
      examWindowEnd: '2026-11-06',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    registrationUrl: 'https://eservice.engelholm.se/PROVNING',
    infoUrl:
      'https://www.engelholm.se/barn-och-utbildning/vuxenutbildning/provning-i-kurs-hos-vuxenutbildningen.html',
    description:
      'Ängelholms kommun upphandlar prövningsgenomförandet av Talenti; anmälan görs med mobilt BankID och max två kurser per period. Sidan anger exakta datum för prövningsperiod 3 och 4 hösten 2026.',
    tags: ['komvux', 'engelska', 'skåne'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-angelholm-angelholm-matematik-3b',
    schoolName: 'Vuxenutbildningen Ängelholm',
    provider: 'Ängelholms kommun',
    subject: 'Matematik',
    course: 'Matematik 3b',
    courseCode: 'MATMAT03b',
    level: 'Komvux',
    city: 'Ängelholm',
    region: 'Skåne',
    address: 'Ängelholm, prövning genomförs hos Talenti (adress bekräftas vid anmälan)',
    lat: 56.2428,
    lng: 12.8619,
    price: 500,
    priceNote: '500 kr per kurs och prövningstillfälle, betalas via kort eller Swish vid anmälan',
    nextPeriod: {
      label: 'Prövningsperiod 4: 12 oktober - 6 november 2026',
      applicationStart: '2026-08-31',
      applicationEnd: '2026-09-11',
      examWindowStart: '2026-10-12',
      examWindowEnd: '2026-11-06',
      confirmed: true,
    },
    components: COMPONENTS_MATEMATIK,
    studyTips: TIPS_MATEMATIK,
    registrationUrl: 'https://eservice.engelholm.se/PROVNING',
    infoUrl:
      'https://www.engelholm.se/barn-och-utbildning/vuxenutbildning/provning-i-kurs-hos-vuxenutbildningen.html',
    description:
      'Matematik 3b ingår i kursutbudet för prövning hos Vuxenutbildningen Ängelholm; laborationer och muntliga moment schemaläggs runt slutprovsdatumet.',
    tags: ['komvux', 'matematik', 'skåne'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'provning-i-gymnasieskolan-karlskrona-flera-kurser-kontakta-s',
    schoolName: 'Prövning i gymnasieskolan',
    provider: 'Karlskrona kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Karlskrona',
    region: 'Blekinge',
    address: 'Karlskrona (adress bekräftas vid anmälan)',
    lat: 56.1612,
    lng: 15.5869,
    price: 500,
    priceNote: '500 kr för en prövning om eleven har avslutat sina studier',
    nextPeriod: {
      label: 'Ingen specifik ansökningsperiod angiven på sidan',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The kommun publishes two blanketter; this listing is for people who are
    // no longer gymnasieelever, so it points at the "extern elev" one.
    registrationUrl:
      'https://www.karlskrona.se/globalassets/skola-och-forskola/gymnasieskola/dokument/ansokan-om-provning-gy-extern-elev.pdf',
    infoUrl:
      'https://www.karlskrona.se/skola-och-forskola/gymnasieskola-och-gymnasiesarskola/provning-i-gymnasieskolan/',
    description:
      'Karlskrona kommun tar ut 500 kronor för en prövning av den som avslutat sina gymnasiestudier; kopia på tidigare betygsdokument ska bifogas ansökan.',
    tags: ['gymnasium', 'blekinge', 'prövning'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-karlshamn-karlshamn-flera-kurser-kontakta-',
    schoolName: 'Vuxenutbildningen Karlshamn',
    provider: 'Karlshamns kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Karlshamn',
    region: 'Blekinge',
    address: 'Karlshamn, vuxenutbildningens expedition i A-huset (adress bekräftas vid anmälan)',
    lat: 56.1705,
    lng: 14.8594,
    price: 500,
    priceNote:
      '500 kr per kurs (300 kr för SFI och grundläggande nivå); gratis vid F-betyg inom komvux',
    nextPeriod: {
      label: 'Ansökningsperiod 10/8-4/9 2026, prövningsperiod 14/9-20/11 2026',
      applicationStart: '2026-08-10',
      applicationEnd: '2026-09-04',
      examWindowStart: '2026-09-14',
      examWindowEnd: '2026-11-20',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl:
      'https://vuxenutbildningen.karlshamn.se/wp-content/uploads/2026/04/anmalan_till_provning.pdf',
    infoUrl:
      'https://vuxenutbildningen.karlshamn.se/jag-ar-elev/studieinformation/provning-och-validering/',
    description:
      'Vuxenutbildningen Karlshamn anger exakta ansöknings- och prövningsdatum för hösten 2026 samt bankgironummer för avgiftsbetalning på 500 kr per kurs.',
    tags: ['komvux', 'blekinge', 'validering'],
    verifiedAt: NATIONWIDE_VERIFIED,
  },
  {
    id: 'ronneby-vuxenutbildning-ronneby-flera-kurser-kontakta-skolan',
    schoolName: 'Ronneby Vuxenutbildning',
    provider: 'Ronneby kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Ronneby',
    region: 'Blekinge',
    address: 'Fridhemsvägen 17, 372 38 Ronneby',
    lat: 56.2128,
    lng: 15.2757,
    price: 500,
    priceNote:
      'Högst 500 kr per prövning; gratis vid F-betyg inom komvux, efter validering, eller F i motsvarande grundskolekurs',
    nextPeriod: {
      label:
        'Höstterminen 2026: ansökan öppnar 28 september och sista anmälningsdag är 12 oktober. Anmälan bekräftas och betalas på plats 13, 16 eller 19 oktober; nationella prov skrivs vecka 50–51.',
      applicationStart: '2026-09-28',
      applicationEnd: '2026-10-12',
      examWindowStart: '2026-12-07',
      examWindowEnd: '2026-12-20',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Checked 2026-08-13: the page now carries the autumn 2026 timetable, and
    // anmälan is made through SYV by mail or phone — there is no form and no
    // e-tjänst. Confirmation and payment happen in person with the named
    // administrator on three set days, which is why the flow says so.
    registration: {
      kind: 'email',
      landing:
        'Anmälan görs hos studie- och yrkesvägledaren — sidan har ingen blankett och ingen e-tjänst.',
      steps: [
        'Mejla eller ring SYV under telefontiden och uppge vilken kurs du vill pröva i',
        'Kom till skolan 13, 16 eller 19 oktober för att bekräfta anmälan och betala',
        'Du får kvitto och kontaktuppgifter till ansvarig lärare — hör av dig senast 23 oktober',
      ],
    },
    registrationUrl:
      'https://www.ronneby.se/sidowebbplatser/ronneby-vuxenutbildning/studie--yrkesvagledning/provning.html',
    infoUrl:
      'https://www.ronneby.se/sidowebbplatser/ronneby-vuxenutbildning/studie--yrkesvagledning/provning.html',
    description:
      'Ronneby Vuxenutbildning tar emot prövningsanmälan via studie- och yrkesvägledare. Ansökan till höstterminen 2026 öppnar 28 september med sista anmälningsdag 12 oktober; bekräftelse och betalning sker på plats hos administratören 13, 16 eller 19 oktober och nationella prov skrivs vecka 50–51.',
    tags: ['komvux', 'blekinge', 'prövning'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'komvux-i-jonkoping-jonkoping-flera-kurser-kontakta-skolan-fo',
    schoolName: 'Komvux i Jönköping',
    provider: 'Jönköpings kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Jönköping',
    region: 'Jönköping',
    address: 'Lärcentrum, Barnarpsgatan 40, Jönköping',
    lat: 57.7826,
    lng: 14.1618,
    price: 500,
    priceNote:
      '500 kr per kurs/ämnesnivå och prövningstillfälle (gymnasienivå); kostnadsfritt vid tidigare IG/F eller på grundläggande nivå',
    nextPeriod: {
      label:
        'Prövningsperiod 3 (gymnasial nivå): 26 oktober – 27 november 2026, anmälan 13 juli – ' +
        '13 augusti. Komvux skriver själva att anmälan till nästa period är stängd och att nya ' +
        'datum läggs ut under hösten 2026 — håll koll på samma sida.',
      applicationStart: '2026-07-13',
      applicationEnd: '2026-08-13',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-11-27',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Checked 2026-08-13: the page says "Du kan anmäla dig till prövning i
    // gymnasiala kurser/ämnesnivåer via e-tjänsten (se nedan)", but the
    // e-tjänst block is rendered client-side and carries no URL we can reach —
    // etjanst.jonkoping.se refuses automated requests, so there is no deep link
    // to verify. Grundläggande och sfi anmäls på plats hos SYV oavsett.
    registration: {
      kind: 'page',
      ctaLabel: 'Öppna anmälningssidan',
      landing:
        'Anmälan till gymnasiala kurser görs i kommunens e-tjänst, som ligger längst ned på den här sidan under anmälningsperioden.',
      steps: [
        'Öppna e-tjänsten längst ned på sidan och logga in',
        'Välj rätt kurs eller ämnesnivå — fråga SYV först om du är osäker',
        'Fakturan skickas några veckor innan perioden startar; anmälan är bindande',
      ],
    },
    registrationUrl:
      'https://www.jonkoping.se/barn--utbildning/vuxenutbildning-och-yrkeshogskola/komvux-i-jonkoping/studievagledning-for-vuxna/att-studera-pa-komvux/provning-och-validering',
    infoUrl:
      'https://www.jonkoping.se/barn--utbildning/vuxenutbildning-och-yrkeshogskola/komvux-i-jonkoping/studievagledning-for-vuxna/att-studera-pa-komvux/provning-och-validering',
    description:
      'Komvux i Jönköping erbjuder prövning i alla kurser/ämnesnivåer i sitt utbud och publicerar en tabell med tre prövningsperioder för 2026. Gymnasiala kurser anmäls i kommunens e-tjänst; för sfi och grundläggande kurser gör du anmälan på plats hos studie- och yrkesvägledare på Lärcentrum, Barnarpsgatan 40.',
    tags: ['komvux', 'jönköping', 'småland'],
    verifiedAt: LINK_SWEEP_VERIFIED,
  },
  {
    id: 'komvux-vaxjo-vaxjo-flera-kurser-kontakta-skolan-for-kurskod',
    schoolName: 'Komvux Växjö',
    provider: 'Växjö kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Växjö',
    region: 'Kronoberg',
    address: 'Norra Järnvägsgatan 7, Växjö (kommunens kontaktcenter)',
    lat: 56.8777,
    lng: 14.8091,
    price: 500,
    priceNote:
      '500 kr per kurs/ämnesnivå; kostnadsfritt vid F/IG-betyg inom ett år från betygssättning',
    nextPeriod: {
      // Samma form som Köping: Växjö publicerar sina två perioder som en
      // stående tabell utan årtal, och period 2 (15–22 augusti) stängde
      // 22 augusti 2026. Att skriva 2027 i period 1 vore att fylla i ett
      // årtal anordnaren inte satt dit — se koping-kompetenscenter, som
      // avgjorde samma fråga åt andra hållet i augusti. Datumen står i
      // etiketten, där de är skolans ord och inte appens nedräkning.
      label:
        'Två perioder per år, utan utsatta årtal: period 1 har anmälan 15–22 februari, sista betalningsdag 7 mars och prövningen genomförd senast 30 juni; period 2 har anmälan 15–22 augusti och prövningen genomförd senast 30 december. Alla prövningar görs på plats i Växjö.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://e-tjanster.vaxjo.se/loggain?redirect=%2Foversikt%2Foverview%2F1950',
    infoUrl: 'https://www.vaxjo.se/sidor/forskola-och-skola/komvux/provning.html',
    description:
      'Växjö kommun har två anmälningsperioder per år för prövning, max två kurser/ämnesnivåer per tillfälle, med betalning via e-tjänst efter godkänd anmälan.',
    tags: ['komvux', 'växjö', 'småland'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'axel-weudelskolan-kunskapsnavet-kalmar-flera-kurser-kontakta',
    schoolName: 'Axel Weüdelskolan (Kunskapsnavet)',
    provider: 'Kalmarsunds gymnasieförbund',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Kalmar',
    region: 'Kalmar',
    address: 'Norra vägen 47, 392 34 Kalmar',
    lat: 56.6634,
    lng: 16.3567,
    price: 500,
    priceNote: '500 kr per kurs; kostnadsfritt vid tidigare Icke Godkänd/F',
    nextPeriod: {
      label:
        'Tidplan för prövning på gymnasial vux publiceras separat; max två kurser per prövningsperiod',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl:
      'https://open24.ist-asp.com/kunskapsnavet/vux/Vux/Login?ref=Application%2FOverview',
    infoUrl:
      'https://gyf.se/vara-skolor/axel-weudelskolan/utbildningar/gymnasial-vuxenutbildning/provning-gymnasial-vux',
    description:
      'Axel Weüdelskolan inom Kalmarsunds gymnasieförbund ansvarar för alla prövningar inom vuxenutbildningen i Kalmar, Mörbylånga och Torsås; ansökan sker via webbansökan och betalning via Swish.',
    tags: ['komvux', 'kalmar', 'småland'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'komvux-vastervik-vastervik-flera-kurser-kontakta-skolan-for-',
    schoolName: 'Komvux Västervik',
    provider: 'Västerviks kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Västervik',
    region: 'Kalmar',
    address: 'Komvux, 593 80 Västervik',
    lat: 57.7595,
    lng: 16.6386,
    price: 500,
    priceNote: '500 kr per kurs; kostnadsfritt vid F-betyg som elev vid Komvux Västervik',
    nextPeriod: {
      // Autumn has two windows; the first (24 juli, prövning v37–40) has closed,
      // so this is the one a user can still act on.
      label:
        'Höstens andra omgång: sista ansökningsdag 30 augusti 2026, prövningen genomförs vecka 42–45. Anmälan görs på blanketten, som mejlas till komvux@vastervik.se eller postas till Komvux, 593 80 Västervik.',
      applicationEnd: '2026-08-30',
      examWindowStart: '2026-10-12',
      examWindowEnd: '2026-11-08',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Västervik's autumn 2026 blankett, filled in and mailed to
    // komvux@vastervik.se (or posted). Max två ämnen per tillfälle.
    registrationUrl:
      'https://www.vastervik.se/contentassets/12f80706f3114d88895a5764ac20900a/ansokan-om-provning-komvux-vastervik_hosten26.pdf',
    infoUrl:
      'https://www.vastervik.se/Forskola-skola-och-utbildning/Utbildning-for-vuxna/Komvux/provning/',
    description:
      'Komvux Västervik erbjuder fyra prövningstillfällen per år via ifylld blankett skickad per e-post eller post, med angivna sista ansökningsdagar för höstens veckor 37-40 och 42-45.',
    tags: ['komvux', 'västervik', 'småland'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-ystad-ystad-flera-kurser-kontakta-skolan-f',
    schoolName: 'Vuxenutbildningen Ystad',
    provider: 'Ystads kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Ystad',
    region: 'Skåne',
    address: 'Nya Rådhuset, Österportstorg 2, Ystad',
    lat: 55.4295,
    lng: 13.8204,
    price: 500,
    priceNote:
      '500 kr enligt Skolverkets regler för prövningsavgift (ej specificerat separat på sidan)',
    nextPeriod: {
      label: 'Höstens prövningsdag 7 oktober 2026, anmälan 10-28 augusti 2026',
      applicationStart: '2026-08-10',
      applicationEnd: '2026-08-28',
      examWindowStart: '2026-10-07',
      examWindowEnd: '2026-10-07',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // "Mejla fransisca.isaksson@ystad.se för din anmälan och prövningsinformation"
    // — an email address is the whole booking system here, so the generic
    // e-post steps are replaced with what Ystad actually asks for.
    registration: {
      kind: 'email',
      ctaLabel: 'Se anmälningsadressen',
      landing:
        'Anmälan görs genom att mejla vuxenutbildningens handläggare — adressen står på sidan.',
      steps: [
        'Mejla fransisca.isaksson@ystad.se med personnummer, kontaktuppgifter och vilken kurs det gäller',
        'Du får prövningsinformation och betalningsuppgifter i svaret',
        'Prövningen genomförs på plats på höstens prövningsdag',
      ],
    },
    registrationUrl:
      'https://www.ystad.se/forskola-och-skola/vuxenutbildning/provning-och-tentamenservice',
    infoUrl: 'https://www.ystad.se/forskola-och-skola/vuxenutbildning/ansokan-vuxenutbildning',
    description:
      'Vuxenutbildningen Ystad anordnar en gemensam prövningsdag per termin; anmälan görs via e-post till ansvarig studie- och yrkesvägledare. Sidan uppdaterades 2026-07-01.',
    tags: ['komvux', 'ystad', 'skåne'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-gotland-visby-flera-kurser-kontakta-skolan',
    schoolName: 'Vuxenutbildningen Gotland',
    provider: 'Region Gotland',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Visby',
    region: 'Gotland',
    address: 'Gesällgatan 7, 621 82 Visby',
    lat: 57.6348,
    lng: 18.2948,
    price: 500,
    priceNote: '500 kr per kurs/ämnesnivå och skrivtillfälle; gratis vid IG/F-betyg i kursen',
    nextPeriod: {
      // Höstens skrivtillfällen är onsdagar i vecka 36, 42 och 46 (2 september,
      // 14 oktober, 11 november 2026), och anmälan ska vara inne fem veckor
      // innan. Tillfället i vecka 36 är därför redan stängt; nästa som går att
      // söka är 14 oktober, med anmälan senast 9 september.
      label:
        'Nästa skrivtillfälle är onsdag 14 oktober 2026 kl. 09.00, och anmälan ska vara inne senast fem veckor innan (9 september). Därefter skrivs prövningar onsdag 11 november.',
      applicationEnd: '2026-09-09',
      examWindowStart: '2026-10-14',
      examWindowEnd: '2026-10-14',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://dokument.gotland.se/IntegrationService.svc/doc/content/47915',
    infoUrl:
      'https://gotland.se/forskola-skola-och-utbildning/utbildning-for-vuxna/vuxenutbildningen/provning',
    description:
      'Vuxenutbildningen Gotland håller skriftliga prövningar på plats i Visby varannan onsdag (jämna veckor) med muntlig del 1-2 veckor senare digitalt; anmälan sker på blankett i mån av lediga platser.',
    tags: ['komvux', 'gotland', 'visby'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'jarfalla-larcentrum-flera-kurser',
    schoolName: 'Järfälla Lärcentrum',
    provider: 'Järfälla kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Järfälla',
    region: 'Stockholm',
    address: 'Mälarvägen 2, ingång B, 177 41 Järfälla',
    lat: 59.423,
    lng: 17.8352,
    price: 500,
    priceNote:
      FREE_IF_PRIOR_F +
      ' Avgiften ska vara betald och kvittot bifogat innan anmälan skickas in — anmälan utan kvitto avslås.',
    nextPeriod: {
      label:
        'Period 5 hösten 2026: anmälan senast 13 oktober, delprov 1 den 10 november, betygsdatum 18 december.',
      applicationEnd: '2026-10-13',
      examWindowStart: '2026-11-10',
      examWindowEnd: '2026-12-18',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://jarfalla.alvis.se/provning/amnesomrade',
    infoUrl: 'https://www.jarfalla.se/larcentrum/elev',
    description:
      'Järfälla Lärcentrum tar emot prövningar i två perioder per termin. Prövningen börjar med ett gemensamt delprov och fortsätter med efterföljande delprov ett par veckor senare — räkna med flera besök på plats. Antalet platser är begränsat och anmälan kan stänga i förtid.',
    tags: ['komvux', 'jarfalla', 'stockholm'],
    verifiedAt: STHLM_LAN_VERIFIED,
  },
  {
    id: 'campus-botkyrka-grundlaggande',
    schoolName: 'Komvux Campus Botkyrka',
    provider: 'Botkyrka kommun',
    subject: 'Flera ämnen',
    course: 'Grundläggande delkurs 4 och SFI kurs D',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Tumba',
    region: 'Stockholm',
    address: 'Gröndalsvägen 20, 147 30 Tumba',
    lat: 59.1976,
    lng: 17.8329,
    price: 500,
    priceNote:
      'Avgiften betalas till bankgiro innan anmälan och kvitto bifogas. Blir du inte antagen betalas avgiften tillbaka.',
    nextPeriod: {
      label:
        'Vårens prövningar är stängda. Höstens datum för svenska som andraspråk, engelska och SFI är ännu inte publicerade av skolan.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://botkyrka.alvis.se/provning/amnesomrade',
    infoUrl: 'https://campusbotkyrka.se/',
    description:
      'Campus Botkyrka håller prövning två gånger om året och erbjuder just nu prövning i grundläggande engelska och svenska som andraspråk delkurs 4 samt SFI kurs D. Platserna är begränsade och fördelas i turordning.',
    tags: ['komvux', 'botkyrka', 'tumba', 'stockholm'],
    verifiedAt: STHLM_LAN_VERIFIED,
  },
  {
    id: 'c3l-tyreso-flera-kurser',
    schoolName: 'C3L Tyresö komvux',
    provider: 'Tyresö kommun',
    subject: 'Flera ämnen',
    course: 'Engelska, matematik, svenska och svenska som andraspråk',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Tyresö',
    region: 'Stockholm',
    address: 'Farmarstigen 7, 135 36 Tyresö',
    lat: 59.244,
    lng: 18.228,
    price: 500,
    priceNote:
      FREE_IF_PRIOR_F +
      ' ' +
      NON_REFUNDABLE +
      ' Du kan bara anmäla dig till en prövning per tillfälle.',
    nextPeriod: {
      label:
        'Två prövningstillfällen per år, ett på våren och ett på hösten. C3L hade vid kontrollen inte publicerat datum för hösten 2026 — se anmälningssidan.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://tyreso.alvis.se/provning/amnesomrade',
    infoUrl:
      'https://www.tyreso.se/komvux/for-studerande/anmal--bestall/anmalan-till-provning.html',
    description:
      'C3L erbjuder prövning i engelska, matematik, svenska och svenska som andraspråk. Prövningen kan innehålla informationsmöten, skriftliga och muntliga prov samt inlämningsuppgifter — platserna är begränsade och fördelas först till kvarn.',
    tags: ['komvux', 'tyreso', 'stockholm'],
    verifiedAt: STHLM_LAN_VERIFIED,
  },
  {
    id: 'komvux-katrineholm-flera-kurser',
    schoolName: 'Komvux Katrineholm (Viadidakt)',
    provider: 'Katrineholms kommun',
    subject: 'Flera ämnen',
    course: 'Engelska, matematik, svenska och svenska som andraspråk',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Katrineholm',
    region: 'Södermanland',
    address: 'Kungsgatan 19 (Röda huset), 641 30 Katrineholm',
    lat: 58.9963,
    lng: 16.2062,
    price: 500,
    priceNote: FREE_IF_PRIOR_F + ' Avgiften betalas innan anmälan och kvittot bifogas i ansökan.',
    nextPeriod: {
      label:
        'Höstens ansökningsperiod 2026: 1 augusti – 1 september. Prövning erbjuds på både grundläggande och gymnasial nivå.',
      applicationStart: '2026-08-01',
      applicationEnd: '2026-09-01',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://katrineholm.alvis.se/provning/amnesomrade',
    infoUrl: 'https://www.viadidakt.se/vuxenutbildning/start/komvux/validering-och-provning.html',
    description:
      'Viadidakt tar emot prövningsanmälningar i två perioder per år, i januari och i augusti. Prövning erbjuds i svenska, svenska som andraspråk, engelska och matematik på både grundläggande och gymnasial nivå.',
    tags: ['komvux', 'katrineholm', 'viadidakt'],
    verifiedAt: STHLM_LAN_VERIFIED,
  },
  {
    id: 'arena-utbildning-solna-flera-kurser',
    schoolName: 'Arena Utbildning Solna',
    provider: 'Arena Utbildning',
    subject: 'Flera ämnen',
    course: 'Flera kurser (ange GY11 eller GY25 vid anmälan)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Solna',
    region: 'Stockholm',
    address: 'Solna (provlokal meddelas vid anmälan)',
    lat: 59.3601,
    lng: 18.0011,
    price: 500,
    priceNote: FREE_IF_PRIOR_F + ' Du kan bara göra prövning i en kurs per tillfälle.',
    nextPeriod: {
      label:
        'Vårterminens anmälan är stängd. Arena Utbildning publicerar höstens prövningstillfälle på samma sida — anmälan stänger även när tillfället är fullbokat.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registration: { kind: 'email' },
    registrationUrl: 'https://arenautbildning.se/provning/',
    infoUrl: 'https://arenautbildning.se/provning/',
    description:
      'Arena Utbildning anordnar prövning för Solna vuxenutbildning. Anmälan görs per e-post med personnummer, kontaktuppgifter och vilken kurs prövningen gäller — glöm inte ange om kursen följer GY11 eller GY25.',
    tags: ['komvux', 'solna', 'stockholm'],
    verifiedAt: STHLM_LAN_VERIFIED,
  },
  // Mora vuxenutbildning — verified against moragymnasium.se 2026-08-11 (their
  // page was itself updated 7 August). Two fixed periods a year, both timed so
  // the grade lands before a högskola application deadline: ansökan 14–20
  // februari with the prövning in vecka 13, and ansökan 14–20 september with
  // the prövning in vecka 44. Autumn 2026 is the period encoded below.
  {
    id: 'mora-vuxenutbildning-engelska-6',
    schoolName: 'Mora vuxenutbildning',
    provider: 'Mora kommun',
    subject: 'Engelska',
    course: 'Engelska 6',
    courseCode: 'ENGENG06',
    level: 'Komvux',
    city: 'Mora',
    region: 'Dalarna',
    address: 'Mora gymnasium, Älvgatan 27, 792 32 Mora',
    lat: 61.0122,
    lng: 14.5639,
    price: 500,
    priceNote:
      'Kostnadsfritt om du är inskriven elev vid vuxenutbildningen och har F eller IG i kursen — det behöver styrkas. ' +
      'Avgiften är bindande, återbetalas inte och ska vara betald senast sista dagen i ansökningsmånaden.',
    nextPeriod: {
      label:
        'Höstens ansökningsperiod är 14–20 september 2026 och prövningen genomförs vecka 44. Antalet platser är begränsat, och du kan bara ansöka om en prövning per period.',
      applicationStart: '2026-09-14',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-11-01',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    registrationUrl: 'https://etjanster.morakommun.se/oversikt/overview/108',
    infoUrl: 'https://moragymnasium.se/mora-vuxenutbildning/provning.html',
    description:
      'Mora vuxenutbildning prövar alla kurser och nivåer som kommunens vuxenutbildning anordnar. Prövningen sker på plats i Mora och kan innehålla inlämningsuppgifter, laborationer samt skriftliga och muntliga prov — skolan publicerar en prövningsanvisning per kurs som säger exakt vad som ingår.',
    tags: ['engelska', 'mora', 'dalarna'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'mora-vuxenutbildning-svenska-3',
    schoolName: 'Mora vuxenutbildning',
    provider: 'Mora kommun',
    subject: 'Svenska',
    course: 'Svenska 3',
    courseCode: 'SVESVE03',
    level: 'Komvux',
    city: 'Mora',
    region: 'Dalarna',
    address: 'Mora gymnasium, Älvgatan 27, 792 32 Mora',
    lat: 61.0122,
    lng: 14.5639,
    price: 500,
    priceNote:
      'Kostnadsfritt om du är inskriven elev vid vuxenutbildningen och har F eller IG i kursen — det behöver styrkas. ' +
      'Avgiften är bindande, återbetalas inte och ska vara betald senast sista dagen i ansökningsmånaden.',
    nextPeriod: {
      label:
        'Höstens ansökningsperiod är 14–20 september 2026 och prövningen genomförs vecka 44. Antalet platser är begränsat, och du kan bara ansöka om en prövning per period.',
      applicationStart: '2026-09-14',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-11-01',
      confirmed: true,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    registrationUrl: 'https://etjanster.morakommun.se/oversikt/overview/108',
    infoUrl: 'https://moragymnasium.se/mora-vuxenutbildning/provning.html',
    description:
      'Mora vuxenutbildning prövar alla kurser och nivåer som kommunens vuxenutbildning anordnar. Prövningen sker på plats i Mora och kan innehålla inlämningsuppgifter, laborationer samt skriftliga och muntliga prov — skolan publicerar en prövningsanvisning per kurs som säger exakt vad som ingår.',
    tags: ['svenska', 'mora', 'dalarna'],
    verifiedAt: AUTUMN_VERIFIED,
  },
  {
    id: 'mora-vuxenutbildning-psykologi-1',
    schoolName: 'Mora vuxenutbildning',
    provider: 'Mora kommun',
    subject: 'Psykologi',
    course: 'Psykologi 1',
    courseCode: 'PSKPSY01',
    level: 'Komvux',
    city: 'Mora',
    region: 'Dalarna',
    address: 'Mora gymnasium, Älvgatan 27, 792 32 Mora',
    lat: 61.0122,
    lng: 14.5639,
    price: 500,
    priceNote:
      'Kostnadsfritt om du är inskriven elev vid vuxenutbildningen och har F eller IG i kursen — det behöver styrkas. ' +
      'Avgiften är bindande, återbetalas inte och ska vara betald senast sista dagen i ansökningsmånaden.',
    nextPeriod: {
      label:
        'Höstens ansökningsperiod är 14–20 september 2026 och prövningen genomförs vecka 44. Antalet platser är begränsat, och du kan bara ansöka om en prövning per period.',
      applicationStart: '2026-09-14',
      applicationEnd: '2026-09-20',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-11-01',
      confirmed: true,
    },
    components: COMPONENTS_PSYKOLOGI,
    studyTips: TIPS_PSYKOLOGI,
    registrationUrl: 'https://etjanster.morakommun.se/oversikt/overview/108',
    infoUrl: 'https://moragymnasium.se/mora-vuxenutbildning/provning.html',
    description:
      'Mora vuxenutbildning prövar alla kurser och nivåer som kommunens vuxenutbildning anordnar. Prövningen sker på plats i Mora och kan innehålla inlämningsuppgifter, laborationer samt skriftliga och muntliga prov — skolan publicerar en prövningsanvisning per kurs som säger exakt vad som ingår.',
    tags: ['psykologi', 'mora', 'dalarna'],
    verifiedAt: AUTUMN_VERIFIED,
  },

  // ----------------------------------------------------------------------
  // Fourth pass (2026-08-12): providers that publish an actual autumn-2026
  // window, plus three regions the dataset was thin in (Halland, Skåne west,
  // Västra Götaland north).
  // ----------------------------------------------------------------------
  {
    id: 'kunskapsforbundet-trollhattan-flera-kurser',
    schoolName: 'Vuxenutbildningen Trollhättan',
    provider: 'Kunskapsförbundet Väst',
    subject: 'Flera ämnen',
    course: 'Flera kurser (högst två per studieperiod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Trollhättan',
    region: 'Västra Götaland',
    address: 'Gärdhemsvägen 27, 461 35 Trollhättan',
    lat: 58.2794,
    lng: 12.2903,
    price: 500,
    priceNote:
      FREE_IF_PRIOR_F +
      ' Du kan pröva högst två kurser per studieperiod, och avgiften betalas per kurs.',
    nextPeriod: {
      label:
        'Ansökan till höstens studieperiod ska vara inne senast 1 september 2026. Vårens period stänger 1 februari.',
      applicationEnd: '2026-09-01',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://minasidor.kunskapsforbundet.se/179',
    infoUrl: 'https://kunskapsforbundet.se/vuxenutbildningen/program/provning-betyg/',
    description:
      'Kunskapsförbundet Väst är Trollhättans och Vänersborgs gemensamma vuxenutbildning och prövar alla kurser och ämnesnivåer det sätts betyg i — sfi, grundläggande och gymnasial nivå. Prövningen görs på Gärdhemsvägen 27 i Trollhättan eller på Vänerparken 5 i Vänersborg. Anmälan går via e-tjänsten, eller på blankett som skickas till Box 317, 462 24 Vänersborg.',
    tags: ['komvux', 'trollhättan', 'kunskapsförbundet'],
    verifiedAt: LATE_SUMMER_VERIFIED,
  },
  {
    id: 'landskrona-komvux-flera-kurser',
    schoolName: 'Komvux Landskrona',
    provider: 'Landskrona stad',
    subject: 'Flera ämnen',
    course: 'Flera kurser (en prövning per prövningsperiod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Landskrona',
    region: 'Skåne',
    address: 'Landskrona (prövningslokal meddelas vid anmälan)',
    lat: 55.8708,
    lng: 12.83,
    price: 500,
    priceNote:
      '350 kr om du är inskriven elev vid Landskronas vuxenutbildning, och kostnadsfritt om du har F/IG i kursen därifrån. ' +
      NON_REFUNDABLE,
    nextPeriod: {
      label:
        'Landskrona publicerar inga fasta prövningsperioder — anmälan görs löpande i e-tjänsten, och du kan anmäla dig till en prövning per period.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://etjanster.landskrona.se/oversikt/overview/668',
    infoUrl: 'https://www.landskrona.se/utbildning-barnomsorg/vuxenutbildning/provning/',
    description:
      'Landskrona stad tar emot prövningsanmälningar i e-tjänsten "Prövning Komvux – Anmälan", som kräver inloggning med BankID. Prövningen består av ett skriftligt och ibland ett muntligt prov. Betyget rapporteras till betygsdatabasen och skickas hem cirka 14 dagar efter genomförd prövning.',
    tags: ['komvux', 'landskrona', 'skåne'],
    verifiedAt: LATE_SUMMER_VERIFIED,
  },
  {
    id: 'campus-laholm-svenska-engelska-matematik',
    schoolName: 'Campus Laholm',
    provider: 'Laholms kommun',
    subject: 'Flera ämnen',
    course: 'Svenska, svenska som andraspråk, engelska eller matematik',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Laholm',
    region: 'Halland',
    address: 'Skottegränd 3, 312 31 Laholm',
    lat: 56.5115,
    lng: 13.0424,
    price: 500,
    priceNote:
      'Kostnadsfritt om du läst kursen i Laholm det senaste året och fick F. Anmälan är bindande och avgiften ska vara betald senast sista anmälningsdagen.',
    nextPeriod: {
      label:
        'Höstens anmälan öppnar 17 augusti 2026. Prövningarna i svenska, svenska som andraspråk, engelska och matematik genomförs i oktober; övriga ämnen prövas hos Hermods i Falkenberg 7 och 27 oktober.',
      applicationStart: '2026-08-17',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The kommun publishes the anmälningslänk on this page when the window
    // opens (17/8) — until then the page itself is the only real destination,
    // so that is what we link to rather than a URL we've guessed.
    registration: publishedOnPage('anmälningslänken', 'den 17 augusti'),
    registrationUrl:
      'https://www.laholm.se/forskola-skola-och-utbildning/vuxenutbildning/provning-och-validering',
    infoUrl:
      'https://www.laholm.se/forskola-skola-och-utbildning/vuxenutbildning/provning-och-validering',
    description:
      'Campus Laholm prövar svenska, svenska som andraspråk, matematik och engelska på plats i Laholm. Övriga gymnasiekurser hänvisas till Hermods i Falkenberg. Anmälningslänken publiceras på kommunens prövningssida när perioden öppnar — går det inte att vänta når du vuxenutbildningen på vuxenutbildning@laholm.se eller 0430-265 09.',
    tags: ['komvux', 'laholm', 'halland'],
    verifiedAt: LATE_SUMMER_VERIFIED,
  },
  {
    id: 'jutus-vux-sollentuna-svenska',
    schoolName: 'Jutus Vux',
    provider: 'Jutus Vux AB',
    subject: 'Svenska',
    course: 'Svenska nivå 1, 2 eller 3',
    courseCode: 'SVESVE01 / SVESVE02 / SVESVE03 (nivå 1–3 enligt GY25)',
    level: 'Komvux',
    city: 'Sollentuna',
    region: 'Stockholm',
    address: 'Häggviksvägen 2A, 191 50 Sollentuna',
    lat: 59.4394,
    lng: 17.9236,
    price: 500,
    priceNote: FREE_IF_PRIOR_F + ' Betyget F ska ha satts inom komvux.',
    nextPeriod: {
      label:
        'Höstens andra omgång: anmälan stänger 27 september 2026 kl. 23.59 och prövningen genomförs 26–28 oktober. (Den första omgången stängde 16 augusti.)',
      applicationEnd: '2026-09-27',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-10-28',
      confirmed: true,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    // The anmälningsformulär is embedded on this page — following the link puts
    // you on the form itself, which the derived `page` flow would understate.
    registration: { kind: 'form' },
    registrationUrl: 'https://jutusvux.se/provningar/',
    infoUrl: 'https://jutusvux.se/provningar/',
    description:
      'Jutus Vux i Sollentuna kör prövningar i tätt schemalagda omgångar: anmälan är öppen i tre dygn, sedan genomförs prövningen några veckor senare. Frågor besvaras på provningar@jutusvux.se.',
    tags: ['svenska', 'sollentuna', 'stockholm'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'jutus-vux-sollentuna-engelska',
    schoolName: 'Jutus Vux',
    provider: 'Jutus Vux AB',
    subject: 'Engelska',
    course: 'Engelska nivå 1, 2 eller 3',
    courseCode: 'ENGENG05 / ENGENG06 / ENGENG07 (nivå 1–3 enligt GY25)',
    level: 'Komvux',
    city: 'Sollentuna',
    region: 'Stockholm',
    address: 'Häggviksvägen 2A, 191 50 Sollentuna',
    lat: 59.4394,
    lng: 17.9236,
    price: 500,
    priceNote: FREE_IF_PRIOR_F + ' Betyget F ska ha satts inom komvux.',
    nextPeriod: {
      label:
        'Höstens andra omgång: anmälan stänger 27 september 2026 kl. 23.59 och prövningen genomförs 26–28 oktober. (Den första omgången stängde 16 augusti.)',
      applicationEnd: '2026-09-27',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-10-28',
      confirmed: true,
    },
    components: COMPONENTS_ENGELSKA,
    studyTips: TIPS_ENGELSKA,
    registration: { kind: 'form' },
    registrationUrl: 'https://jutusvux.se/provningar/',
    infoUrl: 'https://jutusvux.se/provningar/',
    description:
      'Prövning i Engelska hos Jutus Vux i Sollentuna. Skolan prövar nivå 1–3 i svenska, svenska som andraspråk och engelska; anmälningsfönstret är kort, så sätt en påminnelse när det öppnar.',
    tags: ['engelska', 'sollentuna', 'stockholm'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'jutus-vux-sollentuna-sva',
    schoolName: 'Jutus Vux',
    provider: 'Jutus Vux AB',
    subject: 'Svenska som andraspråk',
    course: 'Svenska som andraspråk nivå 1, 2 eller 3',
    courseCode: 'SVASVA01 / SVASVA02 / SVASVA03 (nivå 1–3 enligt GY25)',
    level: 'Komvux',
    city: 'Sollentuna',
    region: 'Stockholm',
    address: 'Häggviksvägen 2A, 191 50 Sollentuna',
    lat: 59.4394,
    lng: 17.9236,
    price: 500,
    priceNote: FREE_IF_PRIOR_F + ' Betyget F ska ha satts inom komvux.',
    nextPeriod: {
      label:
        'Höstens andra omgång: anmälan stänger 27 september 2026 kl. 23.59 och prövningen genomförs 26–28 oktober. (Den första omgången stängde 16 augusti.)',
      applicationEnd: '2026-09-27',
      examWindowStart: '2026-10-26',
      examWindowEnd: '2026-10-28',
      confirmed: true,
    },
    components: COMPONENTS_SVENSKA,
    studyTips: TIPS_SVENSKA,
    registration: { kind: 'form' },
    registrationUrl: 'https://jutusvux.se/provningar/',
    infoUrl: 'https://jutusvux.se/provningar/',
    description:
      'Prövning i Svenska som andraspråk hos Jutus Vux i Sollentuna, höstens andra omgång. Anmälan görs i formuläret på skolans prövningssida och stänger sista anmälningsdagen kl. 23.59.',
    tags: ['svenska som andraspråk', 'sollentuna', 'stockholm'],
    verifiedAt: AUG_18_VERIFIED,
  },
  // Two providers added 2026-08-18, each read off its own page, in län the
  // dataset barely covered: Västernorrland had three schools and Västmanland
  // exactly one.
  {
    id: 'vuxenutbildningen-ornskoldsvik-flera-kurser',
    schoolName: 'Vuxenutbildningen Örnsköldsvik',
    provider: 'Örnsköldsviks kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Örnsköldsvik',
    region: 'Västernorrland',
    address: 'Torggatan 10, våning 3, 891 33 Örnsköldsvik',
    lat: 63.2909,
    lng: 18.716,
    price: 500,
    priceNote: 'Avgiften betalas med Swish direkt vid anmälan (123 562 2162).',
    nextPeriod: {
      label:
        'Anmälan till höstens prövningar öppnade 17 augusti 2026 och stänger 11 september. Prövningarna skrivs onsdag 7 oktober och torsdag 8 oktober kl. 11.30 hos Studielänken.',
      applicationStart: '2026-08-17',
      applicationEnd: '2026-09-11',
      examWindowStart: '2026-10-07',
      examWindowEnd: '2026-10-08',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Anmälningsformuläret ligger på sidan självt — det finns ingen e-tjänst
    // att länka vidare till, och avgiften swishas i samma steg.
    registration: { kind: 'form' },
    registrationUrl:
      'https://www.ornskoldsvik.se/utbildning-och-barnomsorg/vuxenstuderande/vuxenutbildning---komvux/anmal-till-provning-for-betyg---vuxenstuderande',
    infoUrl:
      'https://www.ornskoldsvik.se/utbildning-och-barnomsorg/vuxenstuderande/vuxenutbildning---komvux',
    description:
      'Vuxenutbildningen i Örnsköldsvik håller två skrivdagar per termin i Studielänkens lokaler på Torggatan 10. Anmälan görs i formuläret på kommunens sida och avgiften swishas samtidigt — betalningen är det som gör anmälan giltig. Frågor: vuxenutbildningen@ornskoldsvik.se eller 0660-789 10, tisdagar 10.00–11.30.',
    tags: ['komvux', 'flera ämnen', 'örnsköldsvik', 'västernorrland'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'koping-kompetenscenter-flera-kurser',
    schoolName: 'Köpings kompetenscenter',
    provider: 'Köpings kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Köping',
    region: 'Västmanland',
    address: 'Glasgatan 20 B, 731 85 Köping',
    lat: 59.5133,
    lng: 15.9946,
    price: 500,
    priceNote:
      'Faktura skickas när anmälningsperioden stängt. Anmälan är bindande — avgiften tas ut även om du uteblir.',
    nextPeriod: {
      // Köping skriver ut sina två sista anmälningsdagar utan årtal, som en
      // rytm snarare än ett datum: 1 februari för prövning i maj/juni,
      // 7 juni för prövning i november. Vilket år som gäller står det ingen
      // stans, och årtalet är inte vårt att fylla i.
      label:
        'Två omgångar per år: sista anmälningsdag 1 februari för prövning i maj eller juni, och 7 juni för prövning i november. Köping skriver inte ut årtalen — hör med studievägledarna vilken omgång som är öppen.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Ingen e-tjänst och ingen blankett på sidan: anmälan går via
    // studievägledarna, som sidan hänvisar till med e-post och telefon.
    registration: { kind: 'email' },
    registrationUrl: 'https://koping.se/kompetenscenter/vara-utbildningar/provning.html',
    infoUrl: 'https://koping.se/kompetenscenter/vara-utbildningar/provning.html',
    description:
      'Köpings kompetenscenter prövar gymnasiekurser i två omgångar per år, högst två prövningar per omgång. Anmälan görs via studievägledarna på studievagledarna.kkc@koping.se eller 0221-25 400 — sidan har varken blankett eller e-tjänst.',
    tags: ['komvux', 'flera ämnen', 'köping', 'västmanland'],
    verifiedAt: AUG_18_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-falkenberg-flera-kurser',
    schoolName: 'Vuxenutbildningen Falkenberg',
    provider: 'Falkenbergs kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Falkenberg',
    region: 'Halland',
    address: 'Nyhems plan 2, Falkenberg',
    lat: 56.9027,
    lng: 12.4885,
    price: 500,
    priceNote:
      '500 kr per tillfälle om du har godkänt betyg sedan tidigare, streck (-) eller inget betyg alls. ' +
      NON_REFUNDABLE +
      ' Återbetalning sker bara mot läkarintyg.',
    nextPeriod: {
      label:
        'Hösten 2026: anmälan 9 september (kl. 10.00) – 23 september. Prövningen görs 7 oktober eller 27 oktober — du väljer ett av tillfällena vid anmälan.',
      applicationStart: '2026-09-09',
      applicationEnd: '2026-09-23',
      examWindowStart: '2026-10-07',
      examWindowEnd: '2026-10-27',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // The kommun's egen sida leder bara vidare; anmälan görs i e-tjänsten på
    // service.falkenberg.se, som är målet här.
    registrationUrl: 'https://service.falkenberg.se/provning-ovriga-kurser',
    infoUrl:
      'https://vuxenutbildningenfalkenberg.se/proevning-och-validering?view=article&id=178:proevningar&catid=8',
    description:
      'Falkenberg kör två prövningstillfällen i höst med ett gemensamt anmälningsfönster i september. De flesta prövningar hanteras av Hermods men görs på plats i Falkenberg. Du kan anmäla dig till högst en prövning per termin, och betalningen är bindande.',
    tags: ['komvux', 'falkenberg', 'halland'],
    verifiedAt: THIN_LAN_VERIFIED,
  },
  {
    id: 'varnamo-vuxenutbildning-flera-kurser',
    schoolName: 'Värnamo Vuxenutbildning',
    provider: 'Värnamo kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Värnamo',
    region: 'Jönköping',
    address: 'Boagatan 2, 331 83 Värnamo',
    lat: 57.1842,
    lng: 14.0432,
    price: 500,
    priceNote: '500 kr per kurs, betalas efter att anmälan godkänts och innan prövningen startar.',
    nextPeriod: {
      // Ansökan sägs vara "öppen i augusti" utan startdatum, så bara sista
      // dagen står här — ett påhittat startdatum vore ett sämre svar än inget.
      label:
        'Hösten 2026: ansökan är öppen i augusti och sista dag att ansöka är 28 augusti. Prövningsdatum får du besked om när ansökan har bedömts. (Våren 2027: sista ansökningsdag 29 januari.)',
      applicationEnd: '2026-08-28',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registration: {
      kind: 'pdf',
      ctaLabel: 'Hämta anmälningsblanketten',
      landing:
        'Länken går till prövningssidan, där blanketterna ligger — en för Vuxenutbildningen och en för kurser som prövas på Finnvedens gymnasium.',
      steps: [
        'Ladda ner rätt blankett: Vux/Grund eller FIGY',
        'Lämna in den ifyllda blanketten till SYV på vuxenutbildningen (även FIGY-prövningar lämnas dit)',
        'Vänta på besked om prövningen kan genomföras — betala avgiften först därefter',
      ],
    },
    registrationUrl:
      'https://kommun.varnamo.se/miniwebbar/varnamo-vuxenutbildning/borja-studera/provning.html',
    infoUrl:
      'https://kommun.varnamo.se/miniwebbar/varnamo-vuxenutbildning/borja-studera/provning.html',
    description:
      'Värnamo tar emot prövningsansökningar på papper hos studie- och yrkesvägledarna, även för de kurser som prövas på Finnvedens gymnasium. Du kan bara pröva kurser som finns i Värnamos eller Finnvedens utbud, och först efter godkänd ansökan betalar du avgiften.',
    tags: ['komvux', 'värnamo', 'jönköping', 'småland'],
    verifiedAt: THIN_LAN_VERIFIED,
  },
  {
    id: 'vuxenutbildningen-ljungby-flera-kurser',
    schoolName: 'Vuxenutbildningen Ljungby',
    provider: 'Ljungby kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Ljungby',
    region: 'Kronoberg',
    address: 'Axel Roothsgatan 13, 341 41 Ljungby',
    lat: 56.8324,
    lng: 13.9366,
    price: 500,
    priceNote:
      '500 kr per prövningstillfälle, betalas i förskott — kvittot visas upp vid prövningen. ' +
      'Kostnadsfritt om du redan har betyget F/IG i kursen.',
    nextPeriod: {
      label:
        'Hösten 2026 har två prövningstillfällen. Anmäl dig senast 20 september eller 20 oktober. (Våren: senast 20 februari eller 1 april.)',
      applicationEnd: '2026-09-20',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Blanketten låg bakom "Anmäl dig till prövning" på kommunens sida — nu
    // pekar länken på själva PDF:en i stället för på sidan som innehåller den.
    // Steget som URL:en inte avslöjar står kvar: Ljungby vill att du talar med
    // vägledaren innan blanketten skickas in.
    registration: {
      kind: 'pdf',
      landing: 'Länken öppnar kommunens blankett "Anmälan till prövning – Vuxenutbildningen".',
      steps: [
        'Kontakta studie- och yrkesvägledaren eller administratören — de gör prövningsansökan tillsammans med dig',
        'Fyll i och skriv under blanketten före sista anmälningsdagen',
        'Betala 500 kr i förskott och ta med kvittot till prövningen (gratis vid tidigare F/IG)',
      ],
    },
    registrationUrl:
      'https://www.ljungby.se/download/18.1e0fa62b19047f61fcc4a454/1719552808188/Anm%C3%A4lan%20till%20pr%C3%B6vning%20%E2%80%93%20Vuxenutbildningen.pdf',
    infoUrl: 'https://www.ljungby.se/forskola-skola-och-utbildning/vuxenutbildning',
    description:
      'Ljungby har två prövningstillfällen per termin och tar anmälan via blankett efter kontakt med vägledaren. Vuxenutbildningen nås på 0372-78 40 60 och vuxenutbildningen@skola.ljungby.se.',
    tags: ['komvux', 'ljungby', 'kronoberg', 'småland'],
    verifiedAt: AUG_23_VERIFIED,
  },
  {
    id: 'ostersund-larcentrum-gymnasiala',
    schoolName: 'Vuxenutbildningen Östersund (Hermods)',
    provider: 'Östersunds kommun',
    subject: 'Flera ämnen',
    course: 'Flera gymnasiekurser (välj ämnesområde i anmälan)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Östersund',
    region: 'Jämtland',
    address: 'Östersund (provlokalen står i kallelsen, ca 3,5 veckor innan)',
    lat: 63.1792,
    lng: 14.6357,
    price: 500,
    priceNote:
      'Betalas till bankgiro 991-1249 innan anmälan kan slutföras — daterat kvitto bifogas i ' +
      'anmälan. Har du F i kursen laddar du upp en bild på betyget i stället för kvitto. ' +
      'Inbetald avgift återbetalas inte.',
    // Checked 2026-08-19 in Östersunds egen prövningsanmälan: fyra
    // prövningsdatum för hösten med anmälningstiden i parentes. 11/8 och 29/9
    // har redan stängt (8/7 respektive 17/8), så nästa omgång är 27/10.
    nextPeriod: {
      label:
        'Prövningsdatum 27 oktober 2026, anmälan 26 augusti – 22 september. Därefter 3 november ' +
        '(anmälan 1 september – 1 oktober). Max 30 platser per tillfälle — anmälan stänger när ' +
        'det är fullsatt, och efteranmälan handläggs inte.',
      applicationStart: '2026-08-26',
      applicationEnd: '2026-09-22',
      examWindowStart: '2026-10-27',
      examWindowEnd: '2026-10-27',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://ostersund.alvis.se/provning/amnesomrade',
    infoUrl: 'https://www.larcentrum.se/ostersund/provning/',
    description:
      'Östersunds kommun köper prövningarna av Hermods och genomför dem alltid på plats i skolan, ' +
      'kl. 8.45–14.00. Du kan anmäla dig till en kurs per prövningstillfälle, och skolan hör av sig ' +
      'ungefär 3,5 veckor innan. Vård- och omsorgskurser hanteras manuellt av KUI utan fasta datum.',
    tags: ['komvux', 'östersund', 'jämtland', 'hermods'],
    verifiedAt: THIN_LAN_2_VERIFIED,
  },
  {
    id: 'ostersund-larcentrum-grundlaggande',
    schoolName: 'Vuxenutbildningen Östersund (Folkuniversitetet)',
    provider: 'Östersunds kommun',
    subject: 'Flera ämnen',
    course: 'Grundläggande delkurs D och SFI delkurs 1–3D',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Östersund',
    region: 'Jämtland',
    address: 'Östersund (provlokalen står i kallelsen, ca 3,5 veckor innan)',
    lat: 63.1786,
    lng: 14.6389,
    price: 500,
    priceNote:
      'Betalas till bankgiro 991-1249 innan anmälan kan slutföras. Har du F i kursen laddar du ' +
      'upp en bild på betyget i stället för kvitto.',
    // Checked 2026-08-19: Folkuniversitetets två höstdatum är 25/8 (anmälan
    // 29/6–19/7, stängd) och 3/11.
    nextPeriod: {
      label:
        'Prövningsdatum 3 november 2026, anmälan 1 september – 1 oktober. Höstens första ' +
        'tillfälle (25 augusti) stängde för anmälan den 19 juli.',
      applicationStart: '2026-09-01',
      applicationEnd: '2026-10-01',
      examWindowStart: '2026-11-03',
      examWindowEnd: '2026-11-03',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://ostersund.alvis.se/provning/amnesomrade',
    infoUrl: 'https://www.larcentrum.se/ostersund/provning/',
    description:
      'Folkuniversitetet genomför Östersunds prövningar på grundläggande nivå — svenska som ' +
      'andraspråk, engelska och matematik delkurs D samt SFI — på plats i skolan. Samma ' +
      'anmälan och samma avgift som de gymnasiala kurserna, men egna prövningsdatum.',
    tags: ['komvux', 'grundläggande', 'sfi', 'östersund', 'jämtland'],
    verifiedAt: THIN_LAN_2_VERIFIED,
  },
  {
    id: 'nassjo-hoglandsvux-flera-kurser',
    schoolName: 'Höglandsvux Nässjö',
    provider: 'Nässjö kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (en kurs per prövningsperiod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Nässjö',
    region: 'Jönköping',
    address: 'Provet skrivs på Träcentrum, Framtidsvägen 1 — anmälan på Rådhusgatan 20, Nässjö',
    lat: 57.6531,
    lng: 14.6963,
    price: 500,
    priceNote:
      'Betalas med Swish i receptionen i samband med anmälan. Kostnadsfritt vid första ' +
      'tillfället om du redan har betyget F — ta med betygsdokumentet. Litteratur ingår inte, ' +
      'och inbetald avgift återbetalas inte.',
    // Checked 2026-08-19 mot kommunens egen prövningssida: ett datum för
    // hösten 2026 med utskriven anmälningsperiod.
    nextPeriod: {
      label:
        'Prövning 16 oktober 2026, anmälningsperiod 17 augusti – 18 september. Endast de 16 ' +
        'första kompletta anmälningarna erbjuds plats.',
      applicationStart: '2026-08-17',
      applicationEnd: '2026-09-18',
      examWindowStart: '2026-10-16',
      examWindowEnd: '2026-10-16',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    // Nässjö tar anmälan över disk: ingen e-tjänst, ingen blankett att ladda
    // ner. Länken går till sidan som säger när receptionen är öppen, för det
    // är den enda uppgiften som avgör om resan dit är lönlös.
    registration: {
      kind: 'inperson',
      steps: [
        'Besök Höglandsvux reception på Rådhusgatan 20 — måndag, tisdag eller torsdag kl. 13–15',
        'Fyll i anmälan på plats och lämna en vidimerad betygskopia',
        'Betala 500 kr med Swish i receptionen (gratis första gången om du har F i kursen)',
      ],
    },
    registrationUrl: 'https://nassjo.se/barn-och-utbildning/vuxenutbildning/provning.html',
    infoUrl: 'https://nassjo.se/barn-och-utbildning/vuxenutbildning/provning.html',
    description:
      'Höglandsvux i Nässjö köper prövningarna av Hermods: efter antagningen aktiverar du ett ' +
      'elevkonto, gör inlämningarna på egen hand och avslutar med ett slutprov på Träcentrum. ' +
      'Antagningsbesked kommer senast en vecka efter att anmälningsperioden stängt.',
    tags: ['komvux', 'nässjö', 'jönköping', 'höglandet', 'småland'],
    verifiedAt: THIN_LAN_2_VERIFIED,
  },
  {
    id: 'vetlanda-larcentrum-flera-kurser',
    schoolName: 'Vetlanda Lärcentrum',
    provider: 'Vetlanda kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (en kurs per termin)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Vetlanda',
    region: 'Jönköping',
    address: 'Kyrkogatan 54 A, A-huset våning 2, sal 223b, Vetlanda',
    lat: 57.4283,
    lng: 15.0772,
    price: 500,
    priceNote:
      'Avgiften ska vara betald när du ansöker (Swish 123 650). Kostnadsfritt om du har F eller ' +
      'IG i kursen — betygskopian bifogas då i e-tjänsten. Litteratur betalar du själv.',
    // Checked 2026-08-19: sidan listar VT27, HT27 och VT28. Höstens 2026-omgång
    // står inte längre kvar, så den närmaste publicerade omgången är våren 2027
    // — och den är utskriven med både anmälningstid och prövningstid.
    nextPeriod: {
      label:
        'Våren 2027: anmälan 4 januari – 19 februari kl. 24.00, prövningstid 15 mars – 9 april. ' +
        'Totalt 20 platser per termin (10 per prövningsperiod), och anmälan stänger tidigare om ' +
        'platserna tar slut.',
      applicationStart: '2027-01-04',
      applicationEnd: '2027-02-19',
      examWindowStart: '2027-03-15',
      examWindowEnd: '2027-04-09',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl: 'https://sjalvservice.vetlanda.se/oversikt/overview/412',
    infoUrl:
      'https://vetlandalarcentrum.se/vetlanda-larcentrum/om-vetlanda-larcentrum/provning.html',
    description:
      'Vetlanda Lärcentrum kör prövningarna via NTI-skolan: du bokar tid själv efter att ' +
      'anmälan gått igenom, och slutprovet skrivs på plats på Kyrkogatan 54 A. Betyget kommer ' +
      'hem inom fyra veckor och skickas automatiskt vidare till antagningen (BEDA).',
    tags: ['komvux', 'vetlanda', 'jönköping', 'småland', 'nti'],
    verifiedAt: THIN_LAN_2_VERIFIED,
  },
  {
    id: 'arvika-vagledningscentrum-flera-kurser',
    schoolName: 'Vägledningscentrum Arvika',
    provider: 'Arvika kommun',
    subject: 'Flera ämnen',
    course: 'Engelska, matematik, svenska och svenska som andraspråk',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Arvika',
    region: 'Värmland',
    address: 'Arvika Näringslivscentrum (tid och sal kommer senast tre veckor innan prövningen)',
    lat: 59.6547,
    lng: 12.5906,
    price: 500,
    priceNote:
      'Betalas med Swish 123-231 22 05 i samband med anmälan, märkt med ämnet. Har du F i ' +
      'kursen har du rätt till en gratis prövning — det görs upp med studievägledaren och ' +
      'skrivs in i studieplanen. Uteblir du räknas prövningen som genomförd.',
    // Checked 2026-08-19 (sidan uppdaterad 15 april 2026): Arvika publicerar
    // sina perioder i veckonummer, vilket är exakta datum — period 2 är v.47–51
    // med anmälan måndag v.36 till fredag v.40.
    nextPeriod: {
      label:
        'Period 2 hösten 2026: prövning vecka 47–51 (16 november – 18 december), anmälan öppen ' +
        'måndag vecka 36 till fredag vecka 40 (31 augusti – 2 oktober). Period 1 våren 2027 är ' +
        'vecka 18–23 med anmälan vecka 9–13.',
      applicationStart: '2026-08-31',
      applicationEnd: '2026-10-02',
      examWindowStart: '2026-11-16',
      examWindowEnd: '2026-12-18',
      confirmed: true,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registrationUrl:
      'https://education.service.tieto.com/AdultApplication.Student/#/search-offering/kv?domain=arvika',
    infoUrl:
      'https://www.arvika.se/utbildningochbarnomsorg/vuxenutbildning/provningochvalidering.8126.html',
    description:
      'Arvika erbjuder prövning på grundläggande och gymnasial nivå i engelska, matematik, ' +
      'svenska och svenska som andraspråk, plus yrkeskurser inom vård och omsorg, industri och ' +
      'kock. Planera prövningen med en studie- och yrkesvägledare först (vlc@arvika.se) — ' +
      'utbudet på sidan är preliminärt, och webbansökan är den som gäller.',
    tags: ['komvux', 'arvika', 'värmland', 'edlevo'],
    verifiedAt: THIN_LAN_2_VERIFIED,
  },
  {
    id: 'sala-vuxnas-larande-flera-kurser',
    schoolName: 'Vuxnas lärande Sala',
    provider: 'Sala kommun',
    subject: 'Flera ämnen',
    course: 'Flera kurser (kontakta skolan för kurskod)',
    courseCode: 'Varierar',
    level: 'Komvux',
    city: 'Sala',
    region: 'Västmanland',
    address: 'Gymnasiegatan 1, 733 40 Sala (ingång reception Vuxnas lärande)',
    lat: 59.9207,
    lng: 16.6033,
    price: 500,
    priceNote:
      'Anmälningsblankett och kvitto på betald avgift ska vara inne senast sista ansökningsdag. ' +
      'Avgiften återbetalas inte utan läkarintyg, och litteraturen betalar du själv.',
    // Checked 2026-08-19: Sala skriver ut veckorna och de två sista
    // anmälningsdagarna, men aldrig något årtal, och sidan uppdaterades senast
    // i maj 2025. Vecka 41 och "7 september" utan år är inte ett datum vi kan
    // stå för — samma bedömning som för Köping.
    nextPeriod: {
      label:
        'Två tillfällen per år: vecka 10 på våren med sista anmälningsdag 2 februari, och vecka ' +
        '41 på hösten med sista anmälningsdag 7 september. Sala skriver inte ut årtalen — hör ' +
        'med vägledaren vilken omgång som är öppen.',
      confirmed: false,
    },
    components: COMPONENTS_FLERA,
    studyTips: TIPS_FLERA,
    registration: {
      kind: 'page',
      ctaLabel: 'Läs hur du anmäler dig',
      landing:
        'Länken går till kommunens självservicesida för prövning, där villkoren och kontakten till vägledarna står.',
      steps: [
        'Kontakta studie- och yrkesvägledaren på Vuxnas lärande (0224-74 88 92) — de lämnar ut anmälningsblanketten',
        'Betala 500 kr per kurs och spara kvittot',
        'Lämna in blankett och kvitto senast sista ansökningsdagen för perioden',
      ],
    },
    registrationUrl: 'https://www.sala.se/selfservice/15229',
    infoUrl: 'https://www.sala.se/selfservice/15229',
    description:
      'Sala kommun håller ett prövningstillfälle per termin, på plats på Gymnasiegatan 1. ' +
      'Anmälan görs på blankett via studie- och yrkesvägledaren, som också hjälper till att ' +
      'välja rätt kurs. Vuxnas lärande nås på vuxnaslarande@skola.sala.se.',
    tags: ['komvux', 'sala', 'västmanland'],
    verifiedAt: THIN_LAN_2_VERIFIED,
  },
];

export const SUBJECTS = [...new Set(EXAMS.map((e) => e.subject))].sort();
export const REGIONS = [...new Set(EXAMS.map((e) => e.region))].sort();
export const CITIES = [...new Set(EXAMS.map((e) => e.city))].sort();
