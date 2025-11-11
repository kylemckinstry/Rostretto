export interface TrainingCourse {
  id: string;
  title: string;
  tag: string;
  duration: string;
  blurb: string;
}

export const TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 't1',
    title: 'Advanced Coffee Making',
    tag: 'Coffee',
    duration: '3 hours',
    blurb: 'Master the art of crafting professional-quality espresso beverages through precision, technique, and flavour balance.',
  },
  {
    id: 't2',
    title: 'Effective Conflict Resolution',
    tag: 'Soft Skills',
    duration: '2.5 hours',
    blurb: 'Develop practical communication and problem-solving skills to manage and resolve workplace conflicts constructively.',
  },
  {
    id: 't3',
    title: 'Cash Register Training',
    tag: 'Tech',
    duration: '4 hours',
    blurb: 'Learn to process transactions accurately and efficiently while providing smooth, customer-focused service.',
  },
];
