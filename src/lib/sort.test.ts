import { describe, it, expect } from 'vitest';
import { byOrderThenYear, byOrder } from './sort';

describe('byOrderThenYear', () => {
  it('orders by `order` ascending', () => {
    const items = [
      { data: { order: 3, year: 2025 } },
      { data: { order: 1, year: 2024 } },
      { data: { order: 2, year: 2026 } },
    ];
    const sorted = items.toSorted(byOrderThenYear);
    expect(sorted.map((i) => i.data.order)).toEqual([1, 2, 3]);
  });

  it('breaks ties by year descending', () => {
    const items = [
      { data: { order: 1, year: 2023 } },
      { data: { order: 1, year: 2025 } },
      { data: { order: 1, year: 2024 } },
    ];
    const sorted = items.toSorted(byOrderThenYear);
    expect(sorted.map((i) => i.data.year)).toEqual([2025, 2024, 2023]);
  });
});

describe('byOrder', () => {
  it('orders by `order` ascending', () => {
    const items = [
      { data: { order: 5 } },
      { data: { order: 1 } },
      { data: { order: 3 } },
    ];
    const sorted = items.toSorted(byOrder);
    expect(sorted.map((i) => i.data.order)).toEqual([1, 3, 5]);
  });
});
