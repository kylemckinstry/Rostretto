import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';
import { employeeSchema, Employee } from '../models/schemas';

export function subscribeEmployees(cb: (emps: Employee[]) => void) {
  const q = query(collection(db, 'employees'));
  return onSnapshot(q, (snap) => {
    const emps: Employee[] = [];
    snap.forEach((doc) => {
      try {
        emps.push(employeeSchema.parse({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn('Invalid employee doc', doc.id, e);
      }
    });
    cb(emps);
  });
}
