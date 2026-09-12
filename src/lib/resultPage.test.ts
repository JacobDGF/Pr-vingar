import { describe, it, expect } from 'vitest';
import { PAGE_SIZE, pageStatus, resultPage } from './resultPage';

describe('resultPage', () => {
  it('shows a first page and keeps the rest behind the button', () => {
    const page = resultPage(215, PAGE_SIZE);
    expect(page.visible).toBe(PAGE_SIZE);
    expect(page.remaining).toBe(215 - PAGE_SIZE);
    expect(page.nextStep).toBe(PAGE_SIZE);
  });

  it('never asks for more than there is', () => {
    const page = resultPage(5, PAGE_SIZE);
    expect(page).toEqual({ visible: 5, remaining: 0, nextStep: 0 });
  });

  /** The last press hands over what is left, not a full page of nothing. */
  it('shrinks the last step to the remainder', () => {
    const page = resultPage(30, PAGE_SIZE);
    expect(page.nextStep).toBe(30 - PAGE_SIZE);
  });

  it('walks to the end without overshooting', () => {
    let shown = PAGE_SIZE;
    let guard = 0;
    let page = resultPage(100, shown);
    while (page.remaining > 0 && guard++ < 20) {
      shown += page.nextStep;
      page = resultPage(100, shown);
    }
    expect(page.visible).toBe(100);
    expect(page.remaining).toBe(0);
  });

  it('survives an empty result and a nonsense count', () => {
    expect(resultPage(0, PAGE_SIZE)).toEqual({ visible: 0, remaining: 0, nextStep: 0 });
    expect(resultPage(10, NaN)).toEqual({ visible: 0, remaining: 10, nextStep: 10 });
    expect(resultPage(-3, PAGE_SIZE)).toEqual({ visible: 0, remaining: 0, nextStep: 0 });
  });
});

describe('pageStatus', () => {
  it('counts what is on screen while something is held back', () => {
    expect(pageStatus(24, 215)).toBe('24 av 215 prövningar visas.');
  });

  it('says so once the list has run out', () => {
    expect(pageStatus(215, 215)).toBe('Alla 215 prövningar visas.');
  });

  /** A list that fits on one page gets no line under it at all. */
  it('stays quiet when everything fit anyway', () => {
    expect(pageStatus(6, 6)).toBe('');
    expect(pageStatus(0, 0)).toBe('');
    expect(pageStatus(PAGE_SIZE, PAGE_SIZE)).toBe('');
  });
});
