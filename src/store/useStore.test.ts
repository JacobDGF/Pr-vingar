import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore, stripStockAvatars } from './useStore';

const initialState = useStore.getState();

beforeEach(() => {
  localStorage.clear();
  useStore.setState(initialState, true);
});

describe('saveExam / unsaveExam / isExamSaved', () => {
  it('saves an exam as interested and reports it as saved', () => {
    useStore.getState().saveExam('e1');
    expect(useStore.getState().isExamSaved('e1')).toBe(true);
    expect(useStore.getState().savedExams).toEqual([
      expect.objectContaining({ examId: 'e1', status: 'interested' }),
    ]);
  });

  it('does not duplicate an already-saved exam', () => {
    useStore.getState().saveExam('e1');
    useStore.getState().saveExam('e1');
    expect(useStore.getState().savedExams).toHaveLength(1);
  });

  it('unsaveExam removes it and isExamSaved reports false', () => {
    useStore.getState().saveExam('e1');
    useStore.getState().unsaveExam('e1');
    expect(useStore.getState().isExamSaved('e1')).toBe(false);
    expect(useStore.getState().savedExams).toHaveLength(0);
  });

  it('unsaveExam on an exam that was never saved is a no-op', () => {
    useStore.getState().unsaveExam('nope');
    expect(useStore.getState().savedExams).toHaveLength(0);
  });
});

describe('updateExamStatus', () => {
  it('changes the status of a saved exam without touching others', () => {
    useStore.getState().saveExam('e1');
    useStore.getState().saveExam('e2');
    useStore.getState().updateExamStatus('e1', 'registered');
    const { savedExams } = useStore.getState();
    expect(savedExams.find((e) => e.examId === 'e1')?.status).toBe('registered');
    expect(savedExams.find((e) => e.examId === 'e2')?.status).toBe('interested');
  });
});

describe('setShowingExamDetail / viewedExams history', () => {
  it('records a view when opening an exam', () => {
    useStore.getState().setShowingExamDetail('e1');
    expect(useStore.getState().showingExamDetail).toBe('e1');
    expect(useStore.getState().viewedExams[0]).toMatchObject({ examId: 'e1' });
  });

  it('moves a re-viewed exam to the front instead of duplicating it', () => {
    useStore.getState().setShowingExamDetail('e1');
    useStore.getState().setShowingExamDetail('e2');
    useStore.getState().setShowingExamDetail('e1');
    const { viewedExams } = useStore.getState();
    expect(viewedExams.map((v) => v.examId)).toEqual(['e1', 'e2']);
  });

  it('caps history at 40 entries', () => {
    for (let i = 0; i < 45; i++) {
      useStore.getState().setShowingExamDetail(`e${i}`);
    }
    expect(useStore.getState().viewedExams).toHaveLength(40);
    // most recently viewed stays first
    expect(useStore.getState().viewedExams[0].examId).toBe('e44');
  });

  it('closes the detail sheet without adding a history entry', () => {
    useStore.getState().setShowingExamDetail('e1');
    useStore.getState().setShowingExamDetail(null);
    expect(useStore.getState().showingExamDetail).toBeNull();
    expect(useStore.getState().viewedExams).toHaveLength(1);
  });
});

describe('clearHistory', () => {
  it('empties viewedExams', () => {
    useStore.getState().setShowingExamDetail('e1');
    useStore.getState().clearHistory();
    expect(useStore.getState().viewedExams).toHaveLength(0);
  });
});

describe('addPost / addReply', () => {
  it('prepends a new post authored by the current user', () => {
    const before = useStore.getState().posts.length;
    useStore.getState().addPost('Hej!', 'Matematik', 'fråga', ['tips']);
    const { posts } = useStore.getState();
    expect(posts).toHaveLength(before + 1);
    expect(posts[0]).toMatchObject({
      userId: 'me',
      content: 'Hej!',
      subject: 'Matematik',
      kind: 'fråga',
      tags: ['tips'],
      likes: 0,
    });
  });

  it('appends a reply to the correct post without touching others', () => {
    // addPost/addReply id posts off Date.now(); advance the clock between
    // calls so two posts made in the same test don't collide on one id.
    vi.useFakeTimers();
    useStore.getState().addPost('Post A');
    vi.advanceTimersByTime(1);
    useStore.getState().addPost('Post B');
    vi.useRealTimers();

    const [postB, postA] = useStore.getState().posts;
    useStore.getState().addReply(postA.id, 'A reply');
    const { posts } = useStore.getState();
    expect(posts.find((p) => p.id === postA.id)?.replies).toHaveLength(1);
    expect(posts.find((p) => p.id === postB.id)?.replies).toHaveLength(0);
  });
});

describe('toggleLikePost / toggleLikeReply', () => {
  it('likes then unlikes a post, tracking count and likedBy together', () => {
    useStore.getState().addPost('Post A');
    const postId = useStore.getState().posts[0].id;

    useStore.getState().toggleLikePost(postId);
    let post = useStore.getState().posts.find((p) => p.id === postId)!;
    expect(post.likes).toBe(1);
    expect(post.likedBy).toContain('me');

    useStore.getState().toggleLikePost(postId);
    post = useStore.getState().posts.find((p) => p.id === postId)!;
    expect(post.likes).toBe(0);
    expect(post.likedBy).not.toContain('me');
  });

  it('likes then unlikes a reply without affecting the post like count', () => {
    useStore.getState().addPost('Post A');
    const postId = useStore.getState().posts[0].id;
    useStore.getState().addReply(postId, 'A reply');
    const replyId = useStore.getState().posts[0].replies[0].id;

    useStore.getState().toggleLikeReply(postId, replyId);
    let post = useStore.getState().posts.find((p) => p.id === postId)!;
    expect(post.replies[0].likes).toBe(1);
    expect(post.likes).toBe(0);

    useStore.getState().toggleLikeReply(postId, replyId);
    post = useStore.getState().posts.find((p) => p.id === postId)!;
    expect(post.replies[0].likes).toBe(0);
  });
});

describe('toggleFollow', () => {
  it('follows then unfollows a user', () => {
    useStore.getState().toggleFollow('u9');
    expect(useStore.getState().currentUser.following).toContain('u9');
    useStore.getState().toggleFollow('u9');
    expect(useStore.getState().currentUser.following).not.toContain('u9');
  });
});

describe('requestLocation', () => {
  it('sets locationStatus to "error" when geolocation is unavailable', () => {
    const original = navigator.geolocation;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- deleting a readonly navigator API for the test
    delete (navigator as any).geolocation;

    useStore.getState().requestLocation();
    expect(useStore.getState().locationStatus).toBe('error');

    Object.defineProperty(navigator, 'geolocation', { value: original, configurable: true });
  });
});

describe('deletePost', () => {
  it('removes the user’s own post', () => {
    useStore.getState().addPost('Mitt inlägg', 'Matematik', 'tips');
    const mine = useStore.getState().posts.find((p) => p.userId === 'me');
    useStore.getState().deletePost(mine!.id);
    expect(useStore.getState().posts.some((p) => p.id === mine!.id)).toBe(false);
  });

  it('refuses to delete somebody else’s post', () => {
    const other = useStore.getState().posts.find((p) => p.userId !== 'me');
    useStore.getState().deletePost(other!.id);
    expect(useStore.getState().posts.some((p) => p.id === other!.id)).toBe(true);
  });
});

describe('stripStockAvatars (persist v0 → v1)', () => {
  it('drops a stock portrait left in a returning user’s storage', () => {
    const migrated = stripStockAvatars({
      currentUser: { name: 'Du', avatar: 'https://i.pravatar.cc/150?img=1' },
      posts: [
        {
          id: 'p1',
          userId: 'u2',
          userName: 'Emma',
          userAvatar: 'https://i.pravatar.cc/150?img=47',
          replies: [
            { id: 'r1', userId: 'u3', userName: 'Lars', userAvatar: 'https://i.pravatar.cc/150' },
          ],
        },
      ],
    }) as {
      currentUser: { avatar: string };
      posts: { userAvatar?: string; replies: { userAvatar?: string }[] }[];
    };

    expect(migrated.currentUser.avatar).toBe('');
    expect(migrated.posts[0].userAvatar).toBeUndefined();
    expect(migrated.posts[0].replies[0].userAvatar).toBeUndefined();
  });

  it('keeps a photo the user took themselves', () => {
    const migrated = stripStockAvatars({
      currentUser: { avatar: 'data:image/jpeg;base64,abc' },
      posts: [],
    }) as { currentUser: { avatar: string } };
    expect(migrated.currentUser.avatar).toBe('data:image/jpeg;base64,abc');
  });

  it('survives storage that predates these fields entirely', () => {
    expect(stripStockAvatars({ savedExams: [] })).toEqual({ savedExams: [] });
    expect(stripStockAvatars(null)).toBeNull();
  });
});

describe('the default profile', () => {
  it('ships without a picture rather than with somebody else’s face', () => {
    expect(useStore.getState().currentUser.avatar).toBe('');
  });

  it('ships without invented followers', () => {
    expect(useStore.getState().currentUser.followers).toEqual([]);
  });
});

describe('filterOpenOnly', () => {
  it('defaults to off so the first screen shows everything', () => {
    expect(useStore.getState().filterOpenOnly).toBe(false);
  });

  it('toggles independently of the direct-booking filter', () => {
    useStore.getState().setFilterOpenOnly(true);
    expect(useStore.getState().filterOpenOnly).toBe(true);
    expect(useStore.getState().filterDirectOnly).toBe(false);
  });
});

describe('deleteReply', () => {
  it('removes the user’s own reply from the thread', () => {
    const post = useStore.getState().posts[0];
    useStore.getState().addReply(post.id, 'Mitt svar');
    const mine = useStore
      .getState()
      .posts.find((p) => p.id === post.id)!
      .replies.find((r) => r.userId === 'me')!;
    useStore.getState().deleteReply(post.id, mine.id);
    expect(
      useStore
        .getState()
        .posts.find((p) => p.id === post.id)!
        .replies.some((r) => r.id === mine.id),
    ).toBe(false);
  });

  it('refuses to delete somebody else’s reply', () => {
    const post = useStore.getState().posts.find((p) => p.replies.some((r) => r.userId !== 'me'))!;
    const theirs = post.replies.find((r) => r.userId !== 'me')!;
    useStore.getState().deleteReply(post.id, theirs.id);
    expect(
      useStore
        .getState()
        .posts.find((p) => p.id === post.id)!
        .replies.some((r) => r.id === theirs.id),
    ).toBe(true);
  });

  it('leaves other threads alone', () => {
    const [a, b] = useStore.getState().posts;
    useStore.getState().addReply(a.id, 'Svar i A');
    const before = useStore.getState().posts.find((p) => p.id === b.id)!.replies.length;
    const mine = useStore
      .getState()
      .posts.find((p) => p.id === a.id)!
      .replies.find((r) => r.userId === 'me')!;
    useStore.getState().deleteReply(a.id, mine.id);
    expect(useStore.getState().posts.find((p) => p.id === b.id)!.replies).toHaveLength(before);
  });
});

describe('updateCompletedExam / removeCompletedExam', () => {
  const log = [
    {
      examId: 'a',
      schoolName: 'Eget',
      subject: 'Matematik',
      course: 'Ma 3b',
      date: '2026-03-01',
      grade: 'C',
    },
    {
      examId: 'b',
      schoolName: 'Eget',
      subject: 'Engelska',
      course: 'Eng 6',
      date: '2026-04-01',
      grade: 'A',
    },
  ];

  it('corrects one row and leaves the rest untouched', () => {
    useStore.getState().updateUser({ completedExams: log });
    useStore.getState().updateCompletedExam(0, { grade: 'B' });
    const { completedExams } = useStore.getState().currentUser;
    expect(completedExams[0]).toMatchObject({ course: 'Ma 3b', grade: 'B' });
    expect(completedExams[1]).toEqual(log[1]);
  });

  it('removes the row at the given index', () => {
    useStore.getState().updateUser({ completedExams: log });
    useStore.getState().removeCompletedExam(0);
    expect(useStore.getState().currentUser.completedExams).toEqual([log[1]]);
  });

  it('ignores an index that is not in the log', () => {
    useStore.getState().updateUser({ completedExams: log });
    useStore.getState().updateCompletedExam(9, { grade: 'F' });
    useStore.getState().removeCompletedExam(9);
    expect(useStore.getState().currentUser.completedExams).toEqual(log);
  });
});

describe('watches', () => {
  it('adds a watch keyed on the ämne and kommun pair', () => {
    useStore.getState().addWatch('Matematik', 'Stockholm');
    expect(useStore.getState().isWatched('Matematik', 'Stockholm')).toBe(true);
    expect(useStore.getState().watches).toEqual([
      expect.objectContaining({ subject: 'Matematik', city: 'Stockholm', seenExamIds: [] }),
    ]);
  });

  it('does not add the same pair twice', () => {
    useStore.getState().addWatch('Matematik', 'Stockholm');
    useStore.getState().addWatch('Matematik', 'Stockholm');
    expect(useStore.getState().watches).toHaveLength(1);
  });

  it('treats a different ämne or kommun as a different watch', () => {
    useStore.getState().addWatch('Matematik', 'Stockholm');
    useStore.getState().addWatch('Matematik', 'Malmö');
    useStore.getState().addWatch('Kemi', 'Stockholm');
    expect(useStore.getState().watches).toHaveLength(3);
    expect(useStore.getState().isWatched('Kemi', 'Malmö')).toBe(false);
  });

  it('removeWatch drops exactly the one asked for', () => {
    useStore.getState().addWatch('Matematik', 'Stockholm');
    useStore.getState().addWatch('Kemi', 'Stockholm');
    useStore.getState().removeWatch('Matematik|Stockholm');
    expect(useStore.getState().watches.map((w) => w.id)).toEqual(['Kemi|Stockholm']);
  });

  /**
   * The news line rests on this: after the user has looked, everything matching
   * is marked shown, so the next listing to appear is the only one that reads
   * as new.
   */
  it('markWatchSeen records every matching listing as already shown', () => {
    useStore.getState().addWatch('Matematik', 'Stockholm');
    useStore.getState().markWatchSeen('Matematik|Stockholm');
    const [watch] = useStore.getState().watches;
    const matching = useStore
      .getState()
      .exams.filter((e) => e.subject === 'Matematik' && e.city === 'Stockholm');
    expect(matching.length).toBeGreaterThan(0);
    expect(watch.seenExamIds.sort()).toEqual(matching.map((e) => e.id).sort());
  });

  it('markWatchSeen on a watch that is gone is a no-op', () => {
    useStore.getState().markWatchSeen('Matematik|Stockholm');
    expect(useStore.getState().watches).toEqual([]);
  });
});
