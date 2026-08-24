import { describe, it, expect } from 'vitest';
import { Post, PostKind } from '../types';
import { INITIAL_POSTS } from '../data/community';
import { KIND_ORDER, KIND_TONES, countByKind, isUnanswered, kindOf, roomsFrom } from './postKind';

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p',
    userId: 'u',
    userName: 'Namn',
    content: 'Innehåll',
    createdAt: '2026-08-01T10:00:00Z',
    likes: 0,
    likedBy: [],
    replies: [],
    tags: [],
    ...overrides,
  };
}

describe('KIND_TONES', () => {
  it('covers every kind the type allows', () => {
    const kinds: PostKind[] = ['fråga', 'tips', 'diskussion', 'seger'];
    for (const kind of kinds) expect(KIND_TONES[kind].key).toBe(kind);
  });

  it('gives every kind its own colour', () => {
    const rails = KIND_ORDER.map((k) => KIND_TONES[k].rail);
    expect(new Set(rails).size).toBe(rails.length);
  });

  it('orders questions first and victories last', () => {
    expect(KIND_ORDER).toEqual(['fråga', 'tips', 'diskussion', 'seger']);
  });

  it('never spends the status palette’s red on a thread', () => {
    // Red means one thing in this app, and it is "fullbokat". A forum has
    // nothing that can be full, so nothing here may borrow it.
    for (const kind of KIND_ORDER) {
      const tone = KIND_TONES[kind];
      const classes = [tone.chip, tone.softChip, tone.tint, tone.rail, tone.border].join(' ');
      expect(classes).not.toMatch(/red/);
    }
  });
});

describe('kindOf', () => {
  it('reads the kind a post carries', () => {
    expect(kindOf(post({ kind: 'seger' }))).toBe('seger');
  });

  it('reads a post without a kind as a question', () => {
    // The composer sent every post as 'fråga' before it asked for a kind.
    expect(kindOf(post())).toBe('fråga');
  });
});

describe('countByKind', () => {
  it('counts every kind, including the ones with nothing in them', () => {
    const counts = countByKind([post({ kind: 'tips' }), post({ kind: 'tips' })]);
    expect(counts).toEqual({ fråga: 0, tips: 2, diskussion: 0, seger: 0 });
  });

  it('counts a kindless post as a question', () => {
    expect(countByKind([post()]).fråga).toBe(1);
  });

  it('adds up to the number of posts', () => {
    const counts = countByKind(INITIAL_POSTS);
    const total = KIND_ORDER.reduce((sum, k) => sum + counts[k], 0);
    expect(total).toBe(INITIAL_POSTS.length);
  });
});

describe('isUnanswered', () => {
  it('is true for a question nobody has replied to', () => {
    expect(isUnanswered(post({ kind: 'fråga' }))).toBe(true);
  });

  it('is false once someone has replied', () => {
    const reply = {
      id: 'r',
      userId: 'u2',
      userName: 'Svar',
      content: 'Här',
      createdAt: '2026-08-02T10:00:00Z',
      likes: 0,
      likedBy: [],
    };
    expect(isUnanswered(post({ kind: 'fråga', replies: [reply] }))).toBe(false);
  });

  it('is false for a tip with no replies — a tip is not waiting for anyone', () => {
    expect(isUnanswered(post({ kind: 'tips' }))).toBe(false);
  });
});

describe('roomsFrom', () => {
  it('finds every subject the posts actually carry', () => {
    const rooms = roomsFrom(INITIAL_POSTS).map((r) => r.subject);
    // Kemi, Fysik and Historia were in the data while the room list named only
    // Matematik and Engelska — the case this function exists to stop.
    expect(rooms).toContain('Kemi');
    expect(rooms).toContain('Fysik');
    expect(rooms).toContain('Historia');
  });

  it('never invents a room with nothing in it', () => {
    for (const room of roomsFrom(INITIAL_POSTS)) expect(room.count).toBeGreaterThan(0);
    expect(roomsFrom([])).toEqual([]);
  });

  it('skips posts without a subject', () => {
    expect(roomsFrom([post(), post({ subject: 'Kemi' })])).toEqual([{ subject: 'Kemi', count: 1 }]);
  });

  it('puts the busiest room first, then sorts by name', () => {
    const rooms = roomsFrom([
      post({ subject: 'Engelska' }),
      post({ subject: 'Ämne' }),
      post({ subject: 'Biologi' }),
      post({ subject: 'Engelska' }),
    ]);
    expect(rooms).toEqual([
      { subject: 'Engelska', count: 2 },
      { subject: 'Biologi', count: 1 },
      { subject: 'Ämne', count: 1 },
    ]);
  });
});
