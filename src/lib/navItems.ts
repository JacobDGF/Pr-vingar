import { Compass, BookMarked, Users, History, User, Sparkles } from 'lucide-react';
import { TabId } from '../types';

/**
 * The six tabs, one colour each.
 *
 * Every tab used to be the same brand teal, so the sidebar was five identical
 * rows and the only thing distinguishing them was a word you had to read. A
 * colour is recognised before a word is read, which is why every app you use
 * daily colours its destinations: after a week you stop reading "Community"
 * and just hit the pink one.
 *
 * The colours aren't decoration picked at random — each one argues for its
 * tab. Cyan is the map and the horizon; ink is the app itself, answering;
 * amber is the bookmark, the things you put aside for yourself; magenta is
 * people; violet is the past; emerald is you, and growing.
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
   * What the bottom bar calls it, when the full label is too long for a sixth
   * of a phone. Only "Nyligen visade" needs one: at six tabs it wrapped to two
   * lines and made the bar taller than the five labels beside it.
   */
  shortLabel?: string;
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
    id: 'ask',
    label: 'AI-prövning',
    hint: 'Fråga med egna ord',
    icon: Sparkles,
    // Ink, not a sixth hue. The five colours are already spoken for, and the
    // three left unused are the status language — orange, red and green mean
    // "stänger snart", "fullbokat" and "öppen", and a nav item wearing one of
    // them would look like a booking. Ink is the one value that is unmistakably
    // none of the five and none of the three, and it happens to say the right
    // thing: this is the app answering, not a category of listings.
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
    shortLabel: 'Nyligen',
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
