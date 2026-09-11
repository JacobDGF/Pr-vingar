import {
  Bell,
  MapPin,
  ShieldCheck,
  Download,
  LogOut,
  HelpCircle,
  Camera,
  ImagePlus,
  Trash2,
  X,
  Check,
  Pencil,
  Plus,
  BarChart3,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { fileToAvatarDataUrl, initialsOf } from '../lib/avatar';
import { CompletedExamSheet, CompletedExamDraft } from '../components/CompletedExamSheet';
import { summarizeGrades, gradeBadgeClass } from '../lib/grades';
import { useConsent } from '../hooks/useConsent';

function SettingRow({
  icon,
  tint,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 bg-surface border-[1.5px] border-line rounded-[26px] px-[22px] py-[18px] text-left transition-[transform,border-color] duration-150 hover:translate-x-1 hover:border-ink"
    >
      <span
        className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${tint}`}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0 text-[16px] font-bold text-ink">{label}</span>
      <span className="text-[13.5px] font-bold text-ink-soft truncate max-w-[45%]">{value}</span>
    </button>
  );
}

export function Profile() {
  const {
    currentUser,
    updateUser,
    savedExams,
    setActiveTab,
    setShowingFaq,
    setShowingConsent,
    updateCompletedExam,
    removeCompletedExam,
  } = useStore();
  const consent = useConsent();
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [examEditor, setExamEditor] = useState<'new' | number | null>(null);
  const [editing, setEditing] = useState<null | 'name' | 'email' | 'goal' | 'location'>(null);
  const [draft, setDraft] = useState('');

  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);

  useEscapeKey(
    useCallback(() => setShowPhotoSheet(false), []),
    showPhotoSheet,
  );

  const grades = summarizeGrades(currentUser.completedExams);
  const completed = currentUser.completedExams;

  const startEdit = (field: NonNullable<typeof editing>, value: string) => {
    setEditing(field);
    setDraft(value);
  };
  const commit = () => {
    const v = draft.trim();
    if (editing && v) updateUser({ [editing]: v } as never);
    setEditing(null);
  };

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Filen är inte en bild. Välj en bild eller ta ett foto.');
      return;
    }
    try {
      updateUser({ avatar: await fileToAvatarDataUrl(file) });
      setShowPhotoSheet(false);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Bilden kunde inte läsas.');
    }
  };

  const saveCompletedExam = (d: CompletedExamDraft) => {
    if (examEditor === 'new') {
      updateUser({
        completedExams: [
          ...currentUser.completedExams,
          { examId: `manual-${Date.now()}`, schoolName: 'Eget', ...d },
        ],
      });
    } else if (typeof examEditor === 'number') {
      updateCompletedExam(examEditor, d);
    }
    setExamEditor(null);
  };

  const exportData = () => {
    const payload = {
      exporteradFrån: 'Hitta prövningar',
      exporteradDen: new Date().toISOString(),
      profil: currentUser,
      sparadePrövningar: savedExams,
      // Samtycket är också något appen vet om dig, och den enda plats det står
      // utanför den här filen är en rad i localStorage.
      statistiksamtycke: consent.choice,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `provningar-mina-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const resetApp = () => {
    if (
      window.confirm(
        'Är du säker? Sparade prövningar, betyg och inlägg raderas från den här enheten och går ' +
          'inte att få tillbaka. Exportera dina data först om du vill ha en kopia.',
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const inlineField = (field: NonNullable<typeof editing>, value: string, cls: string) =>
    editing === field ? (
      <span className="inline-flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(null);
          }}
          aria-label={field}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- user just tapped edit
          autoFocus
          className={`bg-white/20 rounded-xl px-3 py-1 outline-none border border-white/30 ${cls}`}
        />
        <button onClick={commit} aria-label="Spara">
          <Check size={18} />
        </button>
        <button onClick={() => setEditing(null)} aria-label="Avbryt">
          <X size={18} className="opacity-70" />
        </button>
      </span>
    ) : (
      <button
        onClick={() => startEdit(field, value)}
        className={`inline-flex items-center gap-2 ${cls}`}
      >
        {value}
        <Pencil size={14} className="opacity-60 flex-shrink-0" />
      </button>
    );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-cream">
      <div className="max-w-screen-xl mx-auto w-full px-4 lg:px-8 py-6 lg:py-8 pt-14 lg:pt-8 flex flex-col gap-[18px] animate-rise-in pb-28 lg:pb-10">
        {/* Header */}
        <div className="flex items-center gap-5 bg-gradient-to-br from-brand-500 to-accent2-500 rounded-[34px] px-6 sm:px-8 py-7 text-white flex-wrap">
          <button
            onClick={() => {
              setPhotoError(null);
              setShowPhotoSheet(true);
            }}
            aria-label={currentUser.avatar ? 'Byt profilbild' : 'Lägg till profilbild'}
            className="relative w-[74px] h-[74px] flex-shrink-0 rounded-[26px] overflow-hidden"
          >
            {currentUser.avatar ? (
              <Avatar name={currentUser.name} src={currentUser.avatar} seed="me" size={74} />
            ) : (
              <span className="w-full h-full rounded-[26px] bg-white/[.22] flex items-center justify-center font-hero text-[32px]">
                {initialsOf(currentUser.name)}
              </span>
            )}
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Camera size={12} className="text-brand-600" />
            </span>
          </button>

          <div className="min-w-[200px]">
            <div className="font-hero text-[34px] sm:text-[44px] leading-none">
              {inlineField('name', currentUser.name, 'font-hero text-[34px] sm:text-[44px]')}
            </div>
            <div className="font-display italic text-[16px] sm:text-[18px] text-brand-100 mt-0.5">
              {inlineField(
                'email',
                currentUser.email,
                'font-display italic text-[16px] sm:text-[18px] text-brand-100',
              )}
            </div>
          </div>

          <div className="sm:ml-auto flex gap-2.5 flex-wrap">
            <div className="bg-white/[.16] rounded-[22px] px-[18px] py-3.5 min-w-[112px]">
              <p className="text-[10.5px] font-bold uppercase tracking-[.1em] text-brand-100">
                Snitt
              </p>
              <p className="font-hero text-[30px] leading-[1.1] tnum">
                {grades.average !== null ? grades.average.toString().replace('.', ',') : '–'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('exams')}
              className="bg-white/[.16] hover:bg-white/25 transition-colors rounded-[22px] px-[18px] py-3.5 min-w-[112px] text-left"
            >
              <p className="text-[10.5px] font-bold uppercase tracking-[.1em] text-brand-100">
                Sparade
              </p>
              <p className="font-hero text-[30px] leading-[1.1] tnum">{savedExams.length}</p>
            </button>
          </div>
        </div>

        {/* Goal */}
        <div className="bg-surface border-[1.5px] border-line rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[.1em] text-ink-soft">
                Ditt mål
              </p>
              <div className="font-hero text-[26px] sm:text-[34px] leading-[1.05] mt-0.5 text-ink">
                {inlineField(
                  'goal',
                  currentUser.goal || 'Sätt ett mål',
                  'font-hero text-[26px] sm:text-[34px] text-ink',
                )}
              </div>
            </div>
            <span className="bg-brand-50 text-brand-700 font-bold text-[13.5px] px-[18px] py-2.5 rounded-full">
              {grades.passed} av {completed.length || 0} klara
            </span>
          </div>
          {completed.length > 0 && (
            <div className="flex gap-1.5 mt-[18px]">
              {completed.map((c, i) => (
                <span
                  key={i}
                  className={`h-2.5 flex-1 rounded-full ${
                    c.grade && c.grade.toUpperCase() !== 'F' ? 'bg-trust-500' : 'bg-brand-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Grades */}
        <div className="flex items-center justify-between gap-4 mt-1">
          <h2 className="font-hero text-[30px] sm:text-[38px] leading-none text-ink">Mina betyg</h2>
          <button
            onClick={() => setExamEditor('new')}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-brand-700 bg-brand-50 px-4 py-2.5 rounded-full"
          >
            <Plus size={15} /> Lägg till
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {completed.length === 0 ? (
            <div className="bg-surface border-[1.5px] border-dashed border-line rounded-[26px] p-8 text-center font-display italic text-[18px] text-ink-soft">
              Inga betyg inlagda än.
            </div>
          ) : (
            completed.map((c, index) => (
              <button
                key={index}
                onClick={() => setExamEditor(index)}
                aria-label={`Ändra ${c.course}`}
                className="flex items-center gap-[18px] bg-surface border-[1.5px] border-line rounded-[26px] px-[22px] py-[18px] flex-wrap text-left transition-[transform,border-color] duration-150 hover:translate-x-1 hover:border-ink"
              >
                <span
                  className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center font-hero text-2xl flex-shrink-0 ${gradeBadgeClass(c.grade)}`}
                >
                  {c.grade || '?'}
                </span>
                <span className="flex-1 min-w-[180px]">
                  <span className="block font-display font-semibold text-[19px] text-ink">
                    {c.course}
                  </span>
                  <span className="block text-[13.5px] text-ink-soft mt-px">
                    {c.subject} ·{' '}
                    {new Date(c.date).toLocaleDateString('sv-SE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </span>
                <span className="font-bold text-[13.5px] px-4 py-2.5 rounded-full whitespace-nowrap bg-cream text-ink-soft">
                  {c.grade && c.grade.toUpperCase() === 'F' ? 'Pröva igen' : 'Klar'}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-3 mt-1">
          <SettingRow
            icon={<Bell size={18} className="text-brand-500" />}
            tint="bg-brand-50"
            label="Påminnelser"
            value="via kalenderfil"
            onClick={() => setActiveTab('exams')}
          />
          <SettingRow
            icon={<MapPin size={18} className="text-accent2-500" />}
            tint="bg-accent2-50"
            label="Ort"
            value={currentUser.location}
            onClick={() => startEdit('location', currentUser.location)}
          />
          <SettingRow
            icon={<ShieldCheck size={18} className="text-trust-600" />}
            tint="bg-trust-50"
            label="Mina uppgifter"
            value="bara i den här webbläsaren"
            onClick={exportData}
          />
          <SettingRow
            icon={<HelpCircle size={18} className="text-violet-ink" />}
            tint="bg-violet-tint"
            label="Vanliga frågor"
            value="kostnad, regler, anmälan"
            onClick={() => setShowingFaq(true)}
          />
          <SettingRow
            icon={<BarChart3 size={18} className="text-brand-500" />}
            tint="bg-brand-50"
            label="Statistik om användningen"
            value={
              consent.source === 'signal'
                ? 'av, enligt din webbläsare'
                : consent.choice === 'granted'
                  ? 'du har sagt ja'
                  : consent.choice === 'denied'
                    ? 'du har sagt nej'
                    : 'inte besvarad'
            }
            onClick={() => setShowingConsent(true)}
          />
          <SettingRow
            icon={<Download size={18} className="text-ink-soft" />}
            tint="bg-cream"
            label="Exportera mina data"
            value="JSON"
            onClick={exportData}
          />
          <button
            onClick={resetApp}
            className="flex items-center gap-4 bg-surface border-[1.5px] border-line rounded-[26px] px-[22px] py-[18px] text-left transition-colors hover:bg-red-50 hover:border-red-600"
          >
            <span className="w-10 h-10 rounded-[14px] bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut size={18} className="text-red-600" />
            </span>
            <span className="flex-1 text-[16px] font-bold text-red-600">Återställ appen</span>
          </button>
        </div>

        <p className="text-[11.5px] text-ink-faint leading-relaxed">
          Allt du fyller i här sparas bara i den här webbläsaren. Ingenting skickas till någon
          server, och appen tar aldrig emot din anmälan — den görs alltid hos skolan.
        </p>
      </div>

      {/* Photo sheet */}
      {showPhotoSheet && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center lg:justify-center"
          onClick={() => setShowPhotoSheet(false)}
        >
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- keeps the backdrop close from firing inside the sheet */}
          <div
            className="bg-cream w-full lg:max-w-md rounded-t-[32px] lg:rounded-[32px] p-6 animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-hero text-[28px] text-ink">Profilbild</h2>
              <button
                onClick={() => setShowPhotoSheet(false)}
                aria-label="Stäng"
                className="w-9 h-9 bg-sand rounded-full flex items-center justify-center"
              >
                <X size={16} className="text-ink-soft" />
              </button>
            </div>
            <p className="text-ink-soft text-[14px] leading-relaxed mb-4">
              Använd en bild du tar eller väljer själv. Bilden stannar i den här webbläsaren och
              laddas aldrig upp någonstans.
            </p>

            {photoError && (
              <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-3 mb-3">
                {photoError}
              </p>
            )}

            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => {
                void pickPhoto(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <input
              ref={libraryInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void pickPhoto(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            <div className="space-y-2">
              <button
                onClick={() => cameraInput.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-[20px] transition-colors"
              >
                <Camera size={18} /> Ta ett foto
              </button>
              <button
                onClick={() => libraryInput.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-surface border-[1.5px] border-line hover:border-ink text-ink font-bold py-3.5 rounded-[20px] transition-colors"
              >
                <ImagePlus size={18} className="text-brand-600" /> Välj en bild
              </button>
              {currentUser.avatar && (
                <button
                  onClick={() => {
                    updateUser({ avatar: '' });
                    setShowPhotoSheet(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-600 font-bold py-3 rounded-[20px] hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} /> Ta bort bilden
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {examEditor !== null && (
        <CompletedExamSheet
          initial={typeof examEditor === 'number' ? completed[examEditor] : undefined}
          onSave={saveCompletedExam}
          onDelete={
            typeof examEditor === 'number'
              ? () => {
                  removeCompletedExam(examEditor);
                  setExamEditor(null);
                }
              : undefined
          }
          onClose={() => setExamEditor(null)}
        />
      )}
    </div>
  );
}
