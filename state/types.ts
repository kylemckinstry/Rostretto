export type Employee = {
  id: string;
  name: string;
  score?: number;     // for the modal
  fairnessColor?: 'green' | 'yellow' | 'red';
};

export type Role = 'Coffee' | 'Sandwich' | 'Cashier' | 'Closer';

export type ShiftEvent = {
  id: string;
  employeeId: string;
  role: Role;
  start: Date;
  end: Date;
};

export type DayIndicators = {
  mismatches: number;    // e.g., skill gaps count for the day
  demand: 'Coffee' | 'Sandwich' | 'Mixed';
  traffic: 'low' | 'medium' | 'high';
};
