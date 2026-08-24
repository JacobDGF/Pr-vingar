import { Post, PostKind } from '../types';

/**
 * The four kinds of thread, as one colour each.
 *
 * This is the community's counterpart to `examStatusColor.ts`, and it is a
 * separate table on purpose. The status palette answers "can I book this",
 * which is the only question a listing has; a thread has no booking, so green
 * there cannot mean "open". What a reader scanning a forum wants first is what
 * kind of thing a post is — a question waiting for them, or someone else's
 * answer — so that is what the colour carries here.
 *
 * The kind used to be an emoji inside the text and nothing else, which is the
 * one thing on a card that a reader in a feed does not read as a category.
 */
export interface KindTone {
  key: PostKind;
  /** Capitalised for a chip; `PostKind` itself is lowercase Swedish. */
  label: string;
  /** What the colour means, for the filter row's title attribute. */
  meaning: string;
  /** The composer's placeholder while this kind is chosen. Written out per
      kind rather than assembled from `label`, since Swedish will not take
      one template for "ett tips" and "en diskussion". */
  placeholder: string;
  /** Solid badge: white text on the kind colour. */
  chip: string;
  /** Tinted badge, for a chip sitting among other chips on a thread. */
  softChip: string;
  /** The tint on its own, for a surface the size of the composer. */
  tint: string;
  /** The 5px edge down the left of a thread — the part read at a glance. */
  rail: string;
  /** Border colour for the composer's kind picker when that kind is chosen. */
  border: string;
  /** Filter order: what needs a reader first, what is someone's own news last. */
  rank: number;
}

export const KIND_TONES: Record<PostKind, KindTone> = {
  fråga: {
    key: 'fråga',
    label: 'Fråga',
    meaning: 'Någon väntar på ett svar.',
    placeholder: 'Ställ en fråga till andra som prövar…',
    chip: 'bg-accent2-500 text-white',
    softChip: 'bg-accent2-50 text-accent2-700 border border-accent2-200',
    tint: 'bg-accent2-50',
    rail: 'bg-accent2-500',
    border: 'border-accent2-500',
    rank: 0,
  },
  tips: {
    key: 'tips',
    label: 'Tips',
    meaning: 'Någon som klarat kursen berättar hur.',
    placeholder: 'Dela ett tips som hjälpte dig…',
    chip: 'bg-amber-accent text-white',
    softChip: 'bg-amber-accent-50 text-amber-accent border border-amber-accent',
    tint: 'bg-amber-accent-50',
    rail: 'bg-amber-accent',
    border: 'border-amber-accent',
    rank: 1,
  },
  diskussion: {
    key: 'diskussion',
    label: 'Diskussion',
    meaning: 'En öppen fråga utan ett rätt svar.',
    placeholder: 'Starta en diskussion…',
    chip: 'bg-brand-600 text-white',
    softChip: 'bg-brand-50 text-brand-700 border border-brand-100',
    tint: 'bg-brand-50',
    rail: 'bg-brand-500',
    border: 'border-brand-500',
    rank: 2,
  },
  seger: {
    key: 'seger',
    label: 'Seger',
    meaning: 'Någon har klarat sin prövning.',
    placeholder: 'Berätta om prövningen du klarade…',
    chip: 'bg-trust-600 text-white',
    softChip: 'bg-trust-50 text-trust-700 border border-trust-100',
    tint: 'bg-trust-50',
    rail: 'bg-trust-500',
    border: 'border-trust-500',
    rank: 3,
  },
};

/** The filter row's order, and the composer's. */
export const KIND_ORDER: PostKind[] = (Object.keys(KIND_TONES) as PostKind[]).sort(
  (a, b) => KIND_TONES[a].rank - KIND_TONES[b].rank,
);

/**
 * A post's kind, with the fallback the data allows.
 *
 * `kind` is optional on `Post`, and posts written before the composer asked
 * for one carry nothing. The old composer sent every post as a question, so
 * that is what an absent kind means — not a fifth, colourless category.
 */
export function kindOf(post: Post): PostKind {
  return post.kind ?? 'fråga';
}

/** How many threads sit in each colour, for the filter chips' counts. */
export function countByKind(posts: Post[]): Record<PostKind, number> {
  const counts: Record<PostKind, number> = { fråga: 0, tips: 0, diskussion: 0, seger: 0 };
  for (const post of posts) counts[kindOf(post)] += 1;
  return counts;
}

/**
 * A question nobody has answered yet.
 *
 * Deliberately not a colour. The colour on a thread already answers "what kind
 * of post is this", and a second colour answering "does this one need me"
 * would leave a red-railed magenta card saying two things at once. The unread
 * state is a shape instead: the reply counter goes hollow.
 */
export function isUnanswered(post: Post): boolean {
  return kindOf(post) === 'fråga' && post.replies.length === 0;
}

export interface Room {
  /** The subject as posts spell it, e.g. "Matematik". */
  subject: string;
  count: number;
}

/**
 * The subject rooms, read out of the posts themselves.
 *
 * The rooms were a hardcoded list of three — Matematik, Engelska and a text
 * search for "avgifter" — while the posts carried Kemi, Fysik and Historia.
 * Those threads were reachable only from "Allt", so the filter row quietly
 * said the forum had less in it than it did. Building the row from the data
 * cannot drift: a room exists exactly when a thread is in it, and a room that
 * empties out disappears rather than promising results it has none of.
 */
export function roomsFrom(posts: Post[]): Room[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (!post.subject) continue;
    counts.set(post.subject, (counts.get(post.subject) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count || a.subject.localeCompare(b.subject, 'sv'));
}
