/**
 * Hur många av träffarna listan ritar på en gång.
 *
 * Datan växer med en kommun per omgång — 689 listningar i dag, 215 av dem i en
 * enda stad — och Upptäck ritade varje träff direkt. En telefon som söker i
 * hela Sverige fick alltså bygga tiotusentals DOM-noder innan det första kortet
 * gick att läsa, för en lista ingen människa scrollar igenom. Sidan visar
 * första knippet och en enda knapp som hämtar nästa.
 *
 * Kartan ovanför listan är oförändrad och ritar fortfarande alla träffar:
 * kartans hela uppgift är att svara "var finns de här", och "24 av 215" hade
 * varit fel svar på den frågan.
 */
export const PAGE_SIZE = 24;

export interface ResultPage {
  /** Antal träffar som ska renderas nu. */
  visible: number;
  /** Antal träffar som ligger kvar bakom knappen. */
  remaining: number;
  /** Hur många knappen hämtar nästa gång — aldrig fler än som finns kvar. */
  nextStep: number;
}

/**
 * @param total  antal träffar filtren gav
 * @param shown  hur många användaren har bett om (PAGE_SIZE, sedan mer)
 */
export function resultPage(total: number, shown: number): ResultPage {
  const safeTotal = Math.max(0, Math.floor(total) || 0);
  const asked = Math.max(0, Math.floor(shown) || 0);
  const visible = Math.min(safeTotal, asked);
  const remaining = safeTotal - visible;
  return { visible, remaining, nextStep: Math.min(remaining, PAGE_SIZE) };
}

/**
 * Raden under listan, för både öga och skärmläsare.
 *
 * Tyst när hela träfflistan ändå fick plats på en sida: en rad som säger "6 av
 * 6 visas" är inte information, den är dekoration under sex kort man redan ser.
 */
export function pageStatus(visible: number, total: number): string {
  if (total === 0 || total <= PAGE_SIZE) return '';
  if (visible >= total) return `Alla ${total} prövningar visas.`;
  return `${visible} av ${total} prövningar visas.`;
}
