import { useMemo, useState } from 'react';
import { MessageSquare, MessageCircle, Trash2, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Post, PostKind } from '../types';
import { initialsOf } from '../lib/avatar';
import { timeAgo } from '../lib/relativeTime';
import {
  KIND_ORDER,
  KIND_TONES,
  countByKind,
  isUnanswered,
  kindOf,
  roomsFrom,
} from '../lib/postKind';

/** Five stable avatar colours, picked from the author's id rather than at
    random so the same person is the same colour on every thread. */
const AVATAR_TONES = [
  'bg-accent2-500',
  'bg-brand-500',
  'bg-trust-500',
  'bg-violet-ink',
  'bg-amber-accent',
];
function avatarTone(userId: string) {
  let h = 0;
  for (const c of userId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

/** Both filters are one-of-or-nothing, and `null` is "everything". */
type KindFilter = PostKind | null;
type RoomFilter = string | null;

function matches(post: Post, kind: KindFilter, room: RoomFilter) {
  if (kind && kindOf(post) !== kind) return false;
  if (room && post.subject !== room) return false;
  return true;
}

export function Community() {
  const { posts, addPost, addReply, deletePost, deleteReply, currentUser } = useStore();
  const [kind, setKind] = useState<KindFilter>(null);
  const [room, setRoom] = useState<RoomFilter>(null);
  const [draft, setDraft] = useState('');
  const [draftKind, setDraftKind] = useState<PostKind>('fråga');
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const kindCounts = useMemo(() => countByKind(posts), [posts]);
  const rooms = useMemo(() => roomsFrom(posts), [posts]);
  const threads = useMemo(() => posts.filter((p) => matches(p, kind, room)), [posts, kind, room]);
  const unanswered = useMemo(() => posts.filter(isUnanswered).length, [posts]);

  const post = () => {
    const text = draft.trim();
    if (!text) return;
    addPost(text, room ?? undefined, draftKind);
    setDraft('');
    // A new thread the filters would hide reads as a post that never landed.
    if (kind && kind !== draftKind) setKind(null);
  };

  const sendReply = (postId: string) => {
    const text = reply.trim();
    if (!text) return;
    addReply(postId, text);
    setReply('');
  };

  const draftTone = KIND_TONES[draftKind];
  // The kind picker appears once there is something to label. At rest the tab
  // opens on one composer bar instead of three rows of controls, and typing is
  // a signal that can't be lost the way a blur between mousedown and click can.
  const composing = draft.length > 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-cream">
      <div className="max-w-screen-xl mx-auto w-full px-4 lg:px-8 py-6 lg:py-8 pt-14 lg:pt-8 flex flex-col gap-[18px] animate-rise-in pb-28 lg:pb-10">
        <div className="flex items-end justify-between gap-5 flex-wrap">
          <h1 className="font-hero-xl text-[38px] sm:text-[48px] lg:text-[56px] leading-none text-ink">
            Forum
          </h1>
          {unanswered > 0 && (
            <p className="text-[13.5px] font-bold text-ink-soft">
              {unanswered} {unanswered === 1 ? 'fråga väntar' : 'frågor väntar'} på svar
            </p>
          )}
        </div>

        {/* Colour by kind. Each chip carries its own colour and its count, and a
            kind nobody has written in is not shown at all — an empty filter is
            a promise of results that do not exist. */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setKind(null)}
            aria-pressed={kind === null}
            className={`flex-shrink-0 rounded-full px-[18px] py-2.5 text-[13.5px] font-bold transition-transform hover:-translate-y-0.5 ${
              kind === null
                ? 'bg-ink text-cream'
                : 'bg-surface text-ink-soft border-[1.5px] border-line hover:border-ink'
            }`}
          >
            Allt <span className="tnum opacity-70">{posts.length}</span>
          </button>
          {KIND_ORDER.filter((k) => kindCounts[k] > 0).map((k) => {
            const tone = KIND_TONES[k];
            const on = kind === k;
            return (
              <button
                key={k}
                onClick={() => setKind(on ? null : k)}
                aria-pressed={on}
                title={tone.meaning}
                className={`flex-shrink-0 rounded-full px-[18px] py-2.5 text-[13.5px] font-bold transition-transform hover:-translate-y-0.5 ${
                  on ? tone.chip : tone.softChip
                }`}
              >
                {tone.label} <span className="tnum opacity-70">{kindCounts[k]}</span>
              </button>
            );
          })}
        </div>

        {/* The rooms, read out of the posts rather than named in code. */}
        {rooms.length > 0 && (
          <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide -mt-2 pb-1">
            <span className="flex-shrink-0 text-[12px] font-bold uppercase tracking-[.06em] text-ink-faint">
              Ämne
            </span>
            <button
              onClick={() => setRoom(null)}
              aria-pressed={room === null}
              className={`flex-shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                room === null ? 'bg-sand text-ink' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Alla
            </button>
            {rooms.map((r) => (
              <button
                key={r.subject}
                onClick={() => setRoom(room === r.subject ? null : r.subject)}
                aria-pressed={room === r.subject}
                className={`flex-shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                  room === r.subject ? 'bg-sand text-ink' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {r.subject} <span className="tnum opacity-60">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Ask — in the colour of the kind being written */}
        <div
          className={`focus-ring-host flex items-center gap-3 rounded-[26px] pl-5 pr-2 py-1.5 border-2 transition-colors ${draftTone.tint} ${draftTone.border}`}
        >
          <MessageSquare size={19} strokeWidth={2.2} className="flex-shrink-0 text-ink-soft" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && post()}
            placeholder={draftTone.placeholder}
            aria-label="Skriv ett inlägg"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[16px] font-semibold text-ink placeholder-ink-faint py-3.5"
          />
          <button
            onClick={post}
            disabled={!draft.trim()}
            className={`disabled:opacity-40 font-bold text-[13.5px] px-5 py-3 rounded-[20px] whitespace-nowrap transition-transform hover:scale-105 disabled:hover:scale-100 ${draftTone.chip}`}
          >
            Posta
          </button>
        </div>

        {/* What kind of post this is — the same four colours as the filters, so
            the chip the author picks is the chip the thread wears. */}
        {composing && (
          <div className="flex gap-2 flex-wrap -mt-2.5 animate-rise-in">
            {KIND_ORDER.map((k) => {
              const tone = KIND_TONES[k];
              const on = draftKind === k;
              return (
                <button
                  key={k}
                  onClick={() => setDraftKind(k)}
                  aria-pressed={on}
                  title={tone.meaning}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                    on
                      ? tone.chip
                      : 'bg-surface text-ink-soft border-[1.5px] border-line hover:border-ink'
                  }`}
                >
                  {tone.label}
                </button>
              );
            })}
            {room && (
              <span className="rounded-full px-3.5 py-1.5 text-[12.5px] font-bold bg-sand text-ink-soft">
                i {room}
              </span>
            )}
          </div>
        )}

        {/* Threads */}
        <div className="flex flex-col gap-3">
          {threads.length === 0 && (
            <div className="bg-surface border-[1.5px] border-dashed border-line rounded-[26px] p-9 text-center font-display italic text-[18px] text-ink-soft">
              {posts.length === 0
                ? 'Inga trådar än — ställ den första frågan.'
                : 'Inga trådar med de filtren. Tryck på det valda filtret igen för att få tillbaka allt.'}
            </div>
          )}
          {threads.map((t) => {
            const open = openId === t.id;
            const mine = t.userId === 'me';
            const tone = KIND_TONES[kindOf(t)];
            const waiting = isUnanswered(t);
            return (
              <div
                key={t.id}
                className={`bg-surface border-[1.5px] rounded-[28px] overflow-hidden flex transition-[transform,border-color] duration-150 ${
                  open ? 'border-ink' : 'border-line hover:-translate-y-0.5 hover:border-ink'
                }`}
              >
                {/* The kind, before any words */}
                <div className={`w-[5px] flex-shrink-0 ${tone.rail}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => setOpenId(open ? null : t.id)}
                    aria-expanded={open}
                    className="flex gap-4 items-start px-[22px] py-5 w-full text-left"
                  >
                    <span
                      className={`w-11 h-11 rounded-[15px] flex items-center justify-center font-bold text-[14.5px] text-white flex-shrink-0 ${avatarTone(t.userId)}`}
                    >
                      {initialsOf(t.userName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-semibold text-[18px] sm:text-[20px] leading-[1.25] text-ink">
                        {t.content}
                      </span>
                      <span className="flex gap-2 flex-wrap mt-2.5">
                        <span
                          className={`font-bold text-[12.5px] px-3.5 py-2 rounded-full ${tone.softChip}`}
                        >
                          {tone.label}
                        </span>
                        {t.subject && (
                          <span className="bg-cream text-ink-soft font-bold text-[12.5px] px-3.5 py-2 rounded-full">
                            {t.subject}
                          </span>
                        )}
                        <span className="bg-cream text-ink-soft font-bold text-[12.5px] px-3.5 py-2 rounded-full">
                          {mine ? 'Du' : t.userName}
                        </span>
                        <span className="bg-cream text-ink-soft font-bold text-[12.5px] px-3.5 py-2 rounded-full">
                          {timeAgo(t.createdAt)}
                        </span>
                      </span>
                    </span>
                    {/* Hollow while a question has no answer, solid once it has
                        one — the "needs you" state is a shape, not a colour,
                        so it cannot argue with the rail next to it. */}
                    <span
                      className={`flex items-center gap-1.5 font-bold text-[13px] px-3.5 py-2.5 rounded-full flex-shrink-0 tnum ${
                        waiting ? 'border-[1.5px] border-ink text-ink' : 'bg-ink text-cream'
                      }`}
                      title={waiting ? 'Obesvarad' : undefined}
                    >
                      <MessageCircle size={14} />
                      {t.replies.length}
                    </span>
                  </button>

                  {open && (
                    <div className="border-t-[1.5px] border-sand bg-cream px-[22px] py-[18px] flex flex-col gap-2.5">
                      {t.replies.length === 0 && (
                        <p className="font-display italic text-[15px] text-ink-soft">
                          Inga svar än. Var först.
                        </p>
                      )}
                      {t.replies.map((r, i) => {
                        const own = r.userId === 'me';
                        const right = own || i % 2 === 1;
                        return (
                          <div
                            key={r.id}
                            className={`max-w-[78%] rounded-[20px] px-[18px] py-3.5 ${
                              right
                                ? 'ml-auto bg-ink text-cream'
                                : 'bg-surface border-[1.5px] border-line text-ink'
                            }`}
                          >
                            <p className="text-[11.5px] font-bold uppercase tracking-[.06em] opacity-70">
                              {own ? 'Du' : r.userName}
                            </p>
                            <p className="text-[15px] font-semibold leading-[1.4] mt-0.5">
                              {r.content}
                            </p>
                            {own && (
                              <button
                                onClick={() => {
                                  if (window.confirm('Ta bort ditt svar?')) deleteReply(t.id, r.id);
                                }}
                                aria-label="Ta bort ditt svar"
                                className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-bold opacity-70 hover:opacity-100"
                              >
                                <Trash2 size={12} /> Ta bort
                              </button>
                            )}
                          </div>
                        );
                      })}

                      <div className="flex items-center gap-2 mt-1">
                        <input
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendReply(t.id)}
                          placeholder="Skriv ett svar…"
                          aria-label="Skriv ett svar"
                          className="flex-1 min-w-0 bg-surface border-[1.5px] border-line rounded-[20px] px-4 py-3 text-[14.5px] font-semibold text-ink outline-none focus:border-ink"
                        />
                        <button
                          onClick={() => sendReply(t.id)}
                          disabled={!reply.trim()}
                          aria-label="Skicka svar"
                          className="w-11 h-11 rounded-[16px] bg-ink text-cream flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                        >
                          <Send size={16} />
                        </button>
                      </div>

                      {mine && (
                        <button
                          onClick={() => {
                            if (window.confirm('Ta bort ditt inlägg?')) {
                              deletePost(t.id);
                              setOpenId(null);
                            }
                          }}
                          className="self-start inline-flex items-center gap-1.5 text-[12.5px] font-bold text-ink-soft hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={13} /> Ta bort inlägget
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11.5px] text-ink-faint leading-relaxed">
          Profilbilder i forumet är alltid ritade monogram — {currentUser.name} inkluderad. Appen
          visar aldrig porträtt av påhittade personer.
        </p>
      </div>
    </div>
  );
}
