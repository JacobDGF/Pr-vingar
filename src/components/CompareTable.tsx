import { Exam } from '../types';
import { useStore } from '../store/useStore';
import { buildComparison, countDifferences } from '../lib/compareExams';
import { getExamStatus } from '../lib/examStatusColor';

/** Row-label column, in px. Wide enough for "Prövningsperiod" on two lines. */
const LABEL_COL = 152;
/** One listing's column, in px. Same for every listing — see the table below. */
const VALUE_COL = 232;

/**
 * The saved prövningar as one table, read across instead of one at a time.
 *
 * Two decisions carry the whole view.
 *
 * The first is that rows where every listing says the same thing are dimmed.
 * A comparison of four Malmökurser is nine rows deep and seven of them read
 * "500 kr", "Komvux Malmö, Malmö", "26 okt – 25 nov" four times over. Printing
 * those at the same weight as the two rows that actually differ is what makes
 * a comparison table something people stop using: the work of finding the
 * difference is left entirely to the reader, on every visit. Here the app does
 * that work once and says so in a line above the table.
 *
 * The second is that no cell is a button. The comparison answers one question —
 * which of these do I want — and the answer is a listing, so the column heading
 * is the only thing you can press and it opens that listing, where the anmälan
 * button already lives. A "Anmäl dig" in every column would put five primary
 * buttons on a screen whose purpose is to help you choose one.
 */
export function CompareTable({ exams }: { exams: Exam[] }) {
  const { setShowingExamDetail } = useStore();
  const rows = buildComparison(exams);

  if (rows.length === 0) {
    return (
      <div className="bg-surface border-[1.5px] border-dashed border-line rounded-[26px] p-9 text-center">
        <p className="font-display italic text-[18px] text-ink-soft">
          Spara två prövningar så ställer vi dem sida vid sida här.
        </p>
      </div>
    );
  }

  const differing = countDifferences(rows);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-[17px] text-ink-soft">
        {differing === 0 ? (
          <>Ingenting skiljer de här {exams.length} prövningarna åt — välj den som passar dig.</>
        ) : (
          <>
            <span className="font-semibold text-ink">
              {differing} av {rows.length} rader
            </span>{' '}
            skiljer dem åt. Resten är dämpade.
          </>
        )}
      </p>

      {/* The table is wider than a phone by design — a comparison of four needs
          four columns. It scrolls inside its own box so the page never does.
          Every column is the same fixed width: a provider with a paragraph
          about its avgift would otherwise stretch its own column to twice the
          others, and a row you cannot read across is not a comparison. */}
      <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
        <table
          className="border-separate border-spacing-0 table-fixed"
          style={{ width: LABEL_COL + exams.length * VALUE_COL }}
        >
          <colgroup>
            <col style={{ width: LABEL_COL }} />
            {exams.map((exam) => (
              <col key={exam.id} style={{ width: VALUE_COL }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-cream text-left align-bottom pb-3 pr-4" />
              {exams.map((exam) => {
                const status = getExamStatus(exam);
                return (
                  <th key={exam.id} className="align-bottom pb-3 px-2">
                    <button
                      onClick={() => setShowingExamDetail(exam.id)}
                      className="w-full text-left bg-surface border-[1.5px] border-line rounded-[22px] overflow-hidden transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-ink"
                    >
                      <span className={`block h-[7px] ${status.tone.rail}`} />
                      <span className="block px-4 pt-3 pb-3.5">
                        <span className="block font-display font-semibold text-[17px] leading-tight text-ink">
                          {exam.course}
                        </span>
                        <span className="block text-[13px] text-ink-soft mt-1 truncate">
                          {exam.schoolName}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 mt-2.5 text-[12px] font-bold px-2.5 py-1 rounded-full ${status.tone.softChip}`}
                        >
                          {status.label}
                        </span>
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th
                  scope="row"
                  className={`sticky left-0 z-10 bg-cream text-left align-top py-3 pr-4 text-[12.5px] font-bold uppercase tracking-[.06em] ${
                    row.differs ? 'text-ink' : 'text-ink-faint'
                  }`}
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={exams[i].id}
                    className={`align-top py-3 px-4 text-[14.5px] leading-snug border-t-[1.5px] border-line ${
                      row.differs ? 'text-ink font-medium' : 'text-ink-faint'
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
