const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfWeek(d: Date): Date {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = dt.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // make Monday=0
  return new Date(dt.getTime() - diff * DAY_MS);
}

export function addDays(d: Date, n: number): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

export function addWeeks(d: Date, n: number): Date {
  return addDays(d, n * 7);
}

export function fmtDayLabel(d: Date): string {
  return ['S','M','T','W','T','F','S'][d.getDay()];
}

export function fmtShortDate(d: Date): string {
  return `${d.getDate()}`;
}

export function weekRangeLabel(anchor: Date): string {
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[start.getMonth()]} ${start.getDate()} – ${m[end.getMonth()]} ${end.getDate()}`;
}

export function dayLabelLong(d: Date): string {
  const wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  return `${wd}, ${m} ${d.getDate()}`;
}
