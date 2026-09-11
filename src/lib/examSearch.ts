import { Exam } from '../types';
import { courseCounterpart } from './courseSystems';

/**
 * Which fields the free-text search reads.
 *
 * It lived inline in Discover, which is why it could quietly disagree with the
 * README for as long as it did: the docs promised that a landskap left behind
 * as a `tag` keeps a search for it working ("småland" covers Jönköping, Kalmar
 * and Kronoberg, which `region` cannot say), and the predicate never looked at
 * `tags` at all. A search for the very thing the tag exists for returned
 * nothing. Out here it is one function with a test, so the next field added to
 * the dataset either joins this list on purpose or is knowingly left out.
 *
 * `tags` is the field that earns its place least obviously and most: it is
 * where the dataset keeps what has no column — the landskap under the län, the
 * curriculum a course belongs to (gy11/gy25) — and every one of those is a word
 * a user would type.
 *
 * The last pair of fields aren't the listning's own. Since Gy25 the same
 * prövning is published under two names, and the user knows the one that stood
 * on their own betyg: someone typing "Matematik 3b" means the course now called
 * Matematik – fortsättning Nivå 1b just as much, and half the prövningar that
 * examine their course would otherwise never appear. `courseSystems` holds the
 * pairs a provider has published side by side, so the match is a fact from the
 * data rather than a guess from the course code.
 */
export function matchesQuery(exam: Exam, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const other = courseCounterpart(exam.courseCode)?.other;
  return (
    exam.schoolName.toLowerCase().includes(q) ||
    exam.subject.toLowerCase().includes(q) ||
    exam.course.toLowerCase().includes(q) ||
    exam.city.toLowerCase().includes(q) ||
    exam.courseCode.toLowerCase().includes(q) ||
    exam.provider.toLowerCase().includes(q) ||
    exam.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    (other !== undefined &&
      (other.name.toLowerCase().includes(q) || other.code.toLowerCase().includes(q)))
  );
}
