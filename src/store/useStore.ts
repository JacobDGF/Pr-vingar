import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompletedExam, Exam, SavedExam, ViewedExam, Post, User, TabId, Watch } from '../types';
import { EXAMS } from '../data/exams';
import { INITIAL_POSTS } from '../data/community';
import { isOwnPhoto } from '../lib/avatar';
import { StatusKey } from '../lib/examStatusColor';
import { makeWatch, matchesWatch, watchKey } from '../lib/watches';

interface AppState {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Exams
  exams: Exam[];
  savedExams: SavedExam[];
  saveExam: (examId: string) => void;
  unsaveExam: (examId: string) => void;
  updateExamStatus: (examId: string, status: SavedExam['status']) => void;
  isExamSaved: (examId: string) => boolean;

  /**
   * Watched ämne + kommun pairs.
   *
   * A saved listing answers "which round do I want"; a watch answers the
   * question underneath it, which outlives any single round: "when can I pröva
   * this subject, here". The store keeps them because they are the user's own
   * words about their errand, and the only place they can be kept is this
   * browser — the site is static and has nowhere to push a notification from.
   */
  watches: Watch[];
  addWatch: (subject: string, city: string) => void;
  removeWatch: (id: string) => void;
  isWatched: (subject: string, city: string) => boolean;
  /** Records that the user has now been shown everything under this watch. */
  markWatchSeen: (id: string) => void;

  // View history
  viewedExams: ViewedExam[];
  clearHistory: () => void;
  /** Drop one row from "Nyligen visade" — the list is a convenience, and a
      convenience you can't tidy becomes a nag. */
  removeViewed: (examId: string) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterSubject: string;
  setFilterSubject: (s: string) => void;
  filterRegion: string;
  setFilterRegion: (r: string) => void;
  /**
   * One kommun, or '' for the whole country.
   *
   * Lived in Discover as local state until watches arrived. A watch is an ämne
   * *and* a kommun, and opening one has to be able to set both — a filter only
   * one tab can reach is a filter the rest of the app can't honour.
   */
  filterCity: string;
  setFilterCity: (c: string) => void;
  filterSortBy: 'date' | 'name' | 'distance';
  setFilterSortBy: (s: 'date' | 'name' | 'distance') => void;
  /** Only listings whose link lands on the booking itself, not a page about it. */
  filterDirectOnly: boolean;
  setFilterDirectOnly: (v: boolean) => void;
  /** Only listings whose application window is open today (green *and* amber —
      "stänger om 3 dagar" is still something you can book). */
  filterOpenOnly: boolean;
  setFilterOpenOnly: (v: boolean) => void;
  /**
   * One colour from the status legend, or '' for all of them.
   *
   * Deliberately narrower than `filterOpenOnly`: this picks exactly one bucket
   * of the palette, so the chip's count and the list it produces are the same
   * number. Both can be set; a contradiction ("öppna" + "fullbokat") shows an
   * empty list with the clear-filters button, which is the honest answer.
   */
  filterStatus: StatusKey | '';
  setFilterStatus: (s: StatusKey | '') => void;

  // Location / GPS
  userLocation: { lat: number; lng: number } | null;
  locationStatus: 'idle' | 'pending' | 'granted' | 'denied' | 'error';
  requestLocation: () => void;

  // Community
  posts: Post[];
  addPost: (content: string, subject?: string, kind?: Post['kind'], tags?: string[]) => void;
  addReply: (postId: string, content: string) => void;
  /** Only ever called for the user's own posts — the UI hides it on everyone else's. */
  deletePost: (postId: string) => void;
  /** Same rule as `deletePost`: only the user's own replies, and only from the UI that hides it elsewhere. */
  deleteReply: (postId: string, replyId: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleLikeReply: (postId: string, replyId: string) => void;

  // User
  currentUser: User;
  updateUser: (updates: Partial<User>) => void;
  toggleFollow: (userId: string) => void;
  /**
   * Correct or remove a logged prövning, by its position in `completedExams`.
   *
   * The list was append-only, and it feeds the meritvärde average on the
   * profile. A grade typed into the wrong row therefore skewed the one number
   * the user came for, with no way back except wiping the whole app — so these
   * two exist to make the log something you can keep honest.
   */
  updateCompletedExam: (index: number, updates: Partial<CompletedExam>) => void;
  removeCompletedExam: (index: number) => void;

  // UI
  showingExamDetail: string | null;
  setShowingExamDetail: (id: string | null) => void;
  showingFaq: boolean;
  setShowingFaq: (v: boolean) => void;
}

export const DEFAULT_USER: User = {
  id: 'me',
  name: 'Du',
  email: 'din@email.com',
  // Empty by design: a face here is one the user took themselves, or none.
  avatar: '',
  bio: 'Pluggar för att höja mina betyg och nå mitt drömprogram.',
  following: [],
  // Nobody follows a brand-new account. Seeding two was invented social proof.
  followers: [],
  completedExams: [],
  joinedAt: '2026-01-15',
  location: 'Stockholm',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'discover',
      setActiveTab: (tab) => set({ activeTab: tab }),

      exams: EXAMS,
      savedExams: [],

      saveExam: (examId) => {
        const existing = get().savedExams.find((e) => e.examId === examId);
        if (!existing) {
          set((s) => ({
            savedExams: [
              ...s.savedExams,
              {
                examId,
                savedAt: new Date().toISOString(),
                status: 'interested',
              },
            ],
          }));
        }
      },

      unsaveExam: (examId) =>
        set((s) => ({ savedExams: s.savedExams.filter((e) => e.examId !== examId) })),

      updateExamStatus: (examId, status) =>
        set((s) => ({
          savedExams: s.savedExams.map((e) => (e.examId === examId ? { ...e, status } : e)),
        })),

      isExamSaved: (examId) => get().savedExams.some((e) => e.examId === examId),

      watches: [],

      addWatch: (subject, city) =>
        set((s) =>
          s.watches.some((w) => w.id === watchKey(subject, city))
            ? s
            : { watches: [...s.watches, makeWatch(subject, city)] },
        ),

      removeWatch: (id) => set((s) => ({ watches: s.watches.filter((w) => w.id !== id) })),

      isWatched: (subject, city) => get().watches.some((w) => w.id === watchKey(subject, city)),

      markWatchSeen: (id) =>
        set((s) => ({
          watches: s.watches.map((w) =>
            w.id === id
              ? {
                  ...w,
                  seenExamIds: s.exams.filter((e) => matchesWatch(e, w)).map((e) => e.id),
                  seenAt: new Date().toISOString(),
                }
              : w,
          ),
        })),

      viewedExams: [],
      clearHistory: () => set({ viewedExams: [] }),
      removeViewed: (examId) =>
        set((s) => ({ viewedExams: s.viewedExams.filter((v) => v.examId !== examId) })),

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      filterSubject: '',
      setFilterSubject: (s) => set({ filterSubject: s }),
      filterRegion: '',
      setFilterRegion: (r) => set({ filterRegion: r }),
      filterCity: '',
      setFilterCity: (c) => set({ filterCity: c }),
      filterSortBy: 'date',
      setFilterSortBy: (s) => set({ filterSortBy: s }),
      filterDirectOnly: false,
      setFilterDirectOnly: (v) => set({ filterDirectOnly: v }),
      filterOpenOnly: false,
      setFilterOpenOnly: (v) => set({ filterOpenOnly: v }),
      filterStatus: '',
      setFilterStatus: (s) => set({ filterStatus: s }),

      userLocation: null,
      locationStatus: 'idle',
      requestLocation: () => {
        if (!('geolocation' in navigator)) {
          set({ locationStatus: 'error' });
          return;
        }
        set({ locationStatus: 'pending' });
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            set({
              userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
              locationStatus: 'granted',
              filterSortBy: 'distance',
            });
          },
          () => set({ locationStatus: 'denied' }),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
        );
      },

      posts: INITIAL_POSTS,

      addPost: (content, subject, kind, tags) =>
        set((s) => ({
          posts: [
            {
              id: `p${Date.now()}`,
              userId: 'me',
              userName: s.currentUser.name,
              userAvatar: s.currentUser.avatar,
              content,
              subject,
              kind,
              createdAt: new Date().toISOString(),
              likes: 0,
              likedBy: [],
              replies: [],
              tags: tags || [],
            },
            ...s.posts,
          ],
        })),

      addReply: (postId, content) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  replies: [
                    ...p.replies,
                    {
                      id: `r${Date.now()}`,
                      userId: 'me',
                      userName: s.currentUser.name,
                      userAvatar: s.currentUser.avatar,
                      content,
                      createdAt: new Date().toISOString(),
                      likes: 0,
                      likedBy: [],
                    },
                  ],
                }
              : p,
          ),
        })),

      deletePost: (postId) =>
        set((s) => ({
          posts: s.posts.filter((p) => !(p.id === postId && p.userId === 'me')),
        })),

      deleteReply: (postId, replyId) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  replies: p.replies.filter((r) => !(r.id === replyId && r.userId === 'me')),
                }
              : p,
          ),
        })),

      toggleLikePost: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const liked = p.likedBy.includes('me');
            return {
              ...p,
              likes: liked ? p.likes - 1 : p.likes + 1,
              likedBy: liked ? p.likedBy.filter((id) => id !== 'me') : [...p.likedBy, 'me'],
            };
          }),
        })),

      toggleLikeReply: (postId, replyId) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              replies: p.replies.map((r) => {
                if (r.id !== replyId) return r;
                const liked = r.likedBy.includes('me');
                return {
                  ...r,
                  likes: liked ? r.likes - 1 : r.likes + 1,
                  likedBy: liked ? r.likedBy.filter((id) => id !== 'me') : [...r.likedBy, 'me'],
                };
              }),
            };
          }),
        })),

      currentUser: DEFAULT_USER,
      updateUser: (updates) => set((s) => ({ currentUser: { ...s.currentUser, ...updates } })),

      updateCompletedExam: (index, updates) =>
        set((s) => ({
          currentUser: {
            ...s.currentUser,
            completedExams: s.currentUser.completedExams.map((ce, i) =>
              i === index ? { ...ce, ...updates } : ce,
            ),
          },
        })),

      removeCompletedExam: (index) =>
        set((s) => ({
          currentUser: {
            ...s.currentUser,
            completedExams: s.currentUser.completedExams.filter((_, i) => i !== index),
          },
        })),

      toggleFollow: (userId) =>
        set((s) => {
          const following = s.currentUser.following.includes(userId)
            ? s.currentUser.following.filter((id) => id !== userId)
            : [...s.currentUser.following, userId];
          return { currentUser: { ...s.currentUser, following } };
        }),

      showingExamDetail: null,
      setShowingExamDetail: (id) => {
        if (id) {
          set((s) => ({
            showingExamDetail: id,
            viewedExams: [
              { examId: id, viewedAt: new Date().toISOString() },
              ...s.viewedExams.filter((v) => v.examId !== id),
            ].slice(0, 40),
          }));
        } else {
          set({ showingExamDetail: null });
        }
      },
      showingFaq: false,
      setShowingFaq: (v) => set({ showingFaq: v }),
    }),
    {
      name: 'provningar-storage',
      version: 1,
      partialize: (s) => ({
        savedExams: s.savedExams,
        watches: s.watches,
        viewedExams: s.viewedExams,
        currentUser: s.currentUser,
        posts: s.posts,
      }),
      migrate: (persisted, version) => (version < 1 ? stripStockAvatars(persisted) : persisted),
    },
  ),
);

/**
 * v0 → v1: drop the stock photographs.
 *
 * Posts and the user's own profile are persisted, so returning users still have
 * pravatar URLs of strangers sitting in localStorage. Removing them from the
 * source data alone would leave those faces on screen forever, so the stored
 * copy gets the same rule applied on load: keep the photo only if the user
 * supplied it themselves.
 */
export function stripStockAvatars(persisted: unknown): unknown {
  if (!persisted || typeof persisted !== 'object') return persisted;
  const state = persisted as {
    currentUser?: Partial<User>;
    posts?: Post[];
  };
  const clean = (src?: string) => (isOwnPhoto(src) ? src : undefined);

  return {
    ...state,
    currentUser: state.currentUser
      ? { ...state.currentUser, avatar: clean(state.currentUser.avatar) ?? '' }
      : state.currentUser,
    posts: state.posts?.map((p) => ({
      ...p,
      userAvatar: clean(p.userAvatar),
      replies: p.replies?.map((r) => ({ ...r, userAvatar: clean(r.userAvatar) })) ?? [],
    })),
  };
}
