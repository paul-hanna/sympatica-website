type WithOrderYear = { data: { order: number; year: number } };
type WithOrder = { data: { order: number } };

export function byOrderThenYear(a: WithOrderYear, b: WithOrderYear): number {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  return b.data.year - a.data.year;
}

export function byOrder(a: WithOrder, b: WithOrder): number {
  return a.data.order - b.data.order;
}
