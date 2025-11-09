import { SchedulerRole } from '../../state/types'; // TODO: remove later

type MockEmployee = {
  id: string;
  employee_id: number;
  first_name: string;
  last_name: string;
  name: string;
  primary_role: SchedulerRole | string;
  skill_coffee: number;
  skill_sandwich: number;
  customer_service_rating: number;
  skill_speed: number;
  availability: number;
  teamwork: number;
  score: number; // 0..1 in mocks
  fairnessColor: 'green' | 'yellow' | 'red';
  updated_at_iso: string;
};

const mkEmp = (
  id: string,
  employee_id: number,
  first: string,
  last: string,
  role: SchedulerRole,
  score01: number,
  color: 'green' | 'yellow' | 'red',
  skills: {
    coffee: number; sandwich: number; customerService: number;
    speed: number; availability: number; teamwork: number;
  }
): MockEmployee => ({
  id,
  employee_id,
  first_name: first,
  last_name: last,
  name: `${first} ${last}`,
  primary_role: role,
  skill_coffee: skills.coffee,
  skill_sandwich: skills.sandwich,
  customer_service_rating: skills.customerService,
  skill_speed: skills.speed,
  availability: skills.availability,
  teamwork: skills.teamwork,
  score: score01,
  fairnessColor: color,
  updated_at_iso: new Date().toISOString(),
});

const INITIAL: MockEmployee[] = [
  mkEmp('1', 1, 'Emil', 'Avanesov', 'BARISTA', 0.72, 'green', { coffee: 0.85, sandwich: 0.62, customerService: 0.74, speed: 0.81, availability: 0.88, teamwork: 0.76 }),
  mkEmp('2', 2, 'Kyle', 'McKinstry', 'MANAGER', 0.88, 'green', { coffee: 0.71, sandwich: 0.49, customerService: 0.89, speed: 0.73, availability: 0.92, teamwork: 0.87 }),
  mkEmp('3', 3, 'Mat', 'Blackwood', 'WAITER', 0.68, 'yellow', { coffee: 0.58, sandwich: 0.54, customerService: 0.82, speed: 0.67, availability: 0.79, teamwork: 0.71 }),
  mkEmp('4', 4, 'Jason', 'Yay', 'SANDWICH', 0.91, 'red', { coffee: 0.63, sandwich: 0.88, customerService: 0.56, speed: 0.84, availability: 0.65, teamwork: 0.52 }),
];

// Exported mock employee data
export const MOCK_EMPLOYEES = INITIAL;
