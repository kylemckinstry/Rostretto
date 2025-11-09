import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase'; // existing firebase export

export type WeekAssignment = {
  id: string;
  shiftId: number;
  employeeId: number;
  role: 'BARISTA' | 'SANDWICH' | 'MANAGER' | 'WAITER' | string;
};

export function subscribeWeekAssignments(weekId: string, cb: (rows: WeekAssignment[]) => void) {
  const col = collection(db, 'weeks', weekId, 'assignments');
  const q = query(col);
  return onSnapshot(q, (snap) => {
    const rows: WeekAssignment[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    cb(rows);
  });
}
