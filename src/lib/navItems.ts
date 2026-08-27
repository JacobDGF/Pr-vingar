import { Compass, Sparkles, BookMarked, Users, History, User } from 'lucide-react';
import { TabId } from '../types';

/**
 * The six tabs, one colour each — and one deliberately without.
 *
 * Every tab used to be the same brand teal, so the sidebar was five identical
 * rows and the only thing distinguishing them was a word you had to read. A
 * colour is recognised before a word is read, which is why every app you use
 * daily colours its destinations: after a week you stop reading "Community"
 * and just hit the pink one.
 *
 * The colours aren't decoration picked at random — each one argues for its
 * tab. Cyan is the map and the horizon; amber is the bookmark, the things you
 * put aside for yourself; magenta is people; violet is the past; emerald is
 * you, and growing.
 *
 * One deliberate limit: none of these is the app's *status* language. Red means
 * fullbokat and forest green means bookable, and those two live on the
 * listings, never in the nav — a nav that borrowed them would make "Profil"
 * look like a booking you can make. Emerald sits well clear of trust-green,
 * and nothing here is red at all.
 *
 * Class strings are written out in full rather than composed, because
 * Tailwind's scanner reads source text: a template literal like
 * `from-${c}-500` compiles to nothing at all.
 */
export interface NavTone {
  /** Filled state: gradient behind an active tab. */
  gradient: string;
  /** The glow under an active tab, in its own colour. */
  glow: string;
  /** Tinted surface for the resting icon tile. */
  tint: string;
  /** The icon's colour when resting. */
  ink: string;
  /** Hover wash on the row. */
  hover: string;
  /** Solid dot/badge colour. */
  solid: string;
}

export const NAV_ITEMS: {
  id: TabId;
  label: string;
  /**
   * What the phone's bottom bar shows, when the full label doesn't fit.
   *
   * Six cells across a 360px screen leaves about 58px each, and "Nyligen
   * visade" needs twice that — it wrapped to two lines and pushed the bar's
   * height around as tabs changed. The sidebar, which has the room, keeps the
   * full label either way.
   */
  short?: string;
  /** One line, shown under the label in the sidebar. */
  hint: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  tone: NavTone;
}[] = [
  {
    id: 'discover',
    label: 'Upptäck',
    hint: 'Kartan och alla tillfällen',
    icon: Compass,
    tone: {
      gradient: 'bg-brand-500',
      glow: 'shadow-[0_8px_20px_-4px] shadow-brand-500/55',
      tint: 'bg-brand-50',
      ink: 'text-brand-500',
      hover: 'hover:bg-brand-50',
      solid: 'bg-brand-500',
    },
  },
  {
    id: 'ai',
    label: 'AI-prövning',
    hint: 'Fråga med egna ord',
    short: 'AI',
    icon: Sparkles,
    // The sixth tab is the one that can't have a hue. Every free colour left
    // sits next to one already spoken for — an indigo lands on violet's toes,
    // an orange on amber's — and two tabs a reader has to stop and tell apart
    // costs more than the colour buys. So this one is ink: the app's own black,
    // the same one on every primary button, and the only monochrome tab in the
    // bar. It reads as "ask the app" rather than as a sixth destination
    // competing with the five, which is exactly what it is.
    tone: {
      gradient: 'bg-ink',
      glow: 'shadow-[0_8px_20px_-4px] shadow-ink/45',
      tint: 'bg-sand',
      ink: 'text-ink',
      hover: 'hover:bg-sand',
      solid: 'bg-ink',
    },
  },
  {
    id: 'exams',
    label: 'Prövningar',
    hint: 'Dina sparade',
    icon: BookMarked,
    tone: {
      gradient: 'bg-amber-accent',
      glow: 'shadow-[0_8px_20px_-4px] shadow-amber-accent/55',
      tint: 'bg-amber-accent-50',
      ink: 'text-amber-accent',
      hover: 'hover:bg-amber-accent-50',
      solid: 'bg-amber-accent',
    },
  },
  {
    id: 'community',
    label: 'Forum',
    hint: 'Frågor och tips',
    icon: Users,
    tone: {
      gradient: 'bg-accent2-500',
      glow: 'shadow-[0_8px_20px_-4px] shadow-accent2-500/55',
      tint: 'bg-accent2-50',
      ink: 'text-accent2-500',
      hover: 'hover:bg-accent2-50',
      solid: 'bg-accent2-500',
    },
  },
  {
    id: 'history',
    label: 'Nyligen visade',
    short: 'Nyligen',
    hint: 'Det du tittat på',
    icon: History,
    tone: {
      gradient: 'bg-violet-ink',
      glow: 'shadow-[0_8px_20px_-4px] shadow-violet-ink/55',
      tint: 'bg-violet-tint',
      ink: 'text-violet-ink',
      hover: 'hover:bg-violet-tint',
      solid: 'bg-violet-ink',
    },
  },
  {
    id: 'profile',
    label: 'Profil',
    hint: 'Betyg och dina data',
    icon: User,
    tone: {
      gradient: 'bg-trust-500',
      glow: 'shadow-[0_8px_20px_-4px] shadow-trust-500/55',
      tint: 'bg-trust-50',
      ink: 'text-trust-700',
      hover: 'hover:bg-trust-50',
      solid: 'bg-trust-500',
    },
  },
];
