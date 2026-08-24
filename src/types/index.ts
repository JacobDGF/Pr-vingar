/**
 * One application window as the provider publishes it: a day and a month, no
 * year. `MM-DD`, so `'02-15'` is 15 February.
 */
export interface RecurringWindow {
  /** Day the window opens, when the provider names one. */
  start?: string;
  /** Last day to apply. Always published — it is the point of the rhythm. */
  end: string;
}

export interface NextPeriod {
  label: string;
  applicationStart?: string;
  applicationEnd?: string;
  examWindowStart?: string;
  examWindowEnd?: string;
  /**
   * The provider's standing periodplan, when they publish a rhythm instead of
   * a calendar: "sista anmälningsdag 1 februari", "period 1: 15–22 februari",
   * year after year with no year on it.
   *
   * Kept apart from the dated fields on purpose. Writing which year is next
   * would be the app's arithmetic and not the school's word, so a recurring
   * period is never `confirmed` and never reaches the countdown, the calendar
   * export or the map's "öppen"-count. What it does buy is the difference
   * between *"we don't know"* and *"we know exactly which days, just not which
   * year"* — the card can say "Söks 15–22 feb." instead of "Datum ej satt",
   * and the listing sorts above the providers who publish nothing at all.
   *
   * Windows go in the provider's own order; the app picks whichever comes next
   * in the year from today.
   */
  recurring?: RecurringWindow[];
  /** True when we have a real confirmed date for this period. When false, the UI must not present a fabricated date — link out instead. */
  confirmed: boolean;
  /**
   * True when the provider has published this round as fully booked.
   *
   * A dated window that is already full is the one case where "öppen för
   * anmälan" would be true and useless — the dates say yes, the provider says
   * no. Set it only from the provider's own wording ("Fullbokat", "inga platser
   * kvar"), never inferred.
   */
  full?: boolean;
}

/** What kind of system `registrationUrl` drops the user into. */
export type RegistrationKind =
  | 'form'
  | 'coursepicker'
  | 'eservice'
  | 'webshop'
  | 'pdf'
  | 'email'
  /**
   * No system at all: the provider takes the anmälan over a counter, during
   * opening hours, with papers in hand. Nässjö is the case in the dataset —
   * reception, Swish, a vidimerad betygskopia. A link cannot be followed to
   * the end here, and saying "gå till anmälan" would be a lie the user only
   * discovers after planning a trip.
   */
  | 'inperson'
  | 'page';

export interface RegistrationFlow {
  kind: RegistrationKind;
  /** Verb for the primary button, e.g. "Boka din plats". */
  ctaLabel: string;
  /** One sentence describing where the link lands, shown before the user leaves. */
  landing: string;
  /** The steps still left after following the link. Two to four, shortest first. */
  steps: string[];
  /** True when the link lands on the booking itself rather than a page about it. */
  direct: boolean;
}

export interface Exam {
  id: string;
  schoolName: string;
  provider: string;
  subject: string;
  course: string;
  courseCode: string;
  level: 'Gymnasieskola' | 'Komvux';
  city: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  priceNote?: string;
  nextPeriod: NextPeriod;
  components: ExamComponent[];
  studyTips: string[];
  registrationUrl: string;
  infoUrl: string;
  /**
   * Overrides the flow derived from `registrationUrl` in
   * `lib/registrationFlow.ts`. Only set this when a provider's booking
   * genuinely differs from what its URL implies — the derived flow is the
   * default so the two can't drift apart.
   */
  registration?: Partial<RegistrationFlow> & { kind: RegistrationKind };
  description: string;
  tags: string[];
  /** ISO date this listing's facts (price, URL, periods) were last checked against the school's own site. */
  verifiedAt: string;
}

export interface ExamComponent {
  name: string;
  duration: string;
  description: string;
}

export interface SavedExam {
  examId: string;
  savedAt: string;
  notes?: string;
  status: 'interested' | 'registered' | 'completed' | 'passed' | 'failed';
}

export interface ViewedExam {
  examId: string;
  viewedAt: string;
}

export type PostKind = 'fråga' | 'tips' | 'diskussion' | 'seger';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  /**
   * Only ever a photo the author took themselves (`data:`/`blob:`), and only on
   * this device. Everyone else renders as a drawn monogram — see `lib/avatar.ts`.
   */
  userAvatar?: string;
  content: string;
  subject?: string;
  kind?: PostKind;
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies: Reply[];
  tags: string[];
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  /** Same rule as `Post.userAvatar`: the author's own photo, or nothing. */
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  /** Empty until the user supplies their own photo; never a stock image. */
  avatar: string;
  bio: string;
  following: string[];
  followers: string[];
  completedExams: CompletedExam[];
  joinedAt: string;
  location: string;
  /**
   * What the user is studying towards, in their own words ("Teknisk fysik,
   * LTH"). Empty until they write one — the profile prompts rather than
   * inventing a goal on their behalf.
   */
  goal?: string;
}

export interface CompletedExam {
  examId: string;
  schoolName: string;
  subject: string;
  course: string;
  date: string;
  grade?: string;
}

export type TabId = 'discover' | 'exams' | 'community' | 'history' | 'profile';
