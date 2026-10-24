export const USERS_COLLECTION = 'users';

export const FITNESS_GOAL_OPTIONS = [
  { value: 'naberanie-svalov', label: 'Naberanie svalov' },
  { value: 'regeneracia', label: 'Regenerácia' },
  { value: 'spanok', label: 'Spánok' },
  { value: 'lepsie-travenie', label: 'Lepšie trávenie' },
  { value: 'imunita', label: 'Imunita' },
  { value: 'energia', label: 'Energia' },
] as const;

export type FitnessGoal = (typeof FITNESS_GOAL_OPTIONS)[number]['value'];

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  fitnessGoals: FitnessGoal[];
  allergies: string[];
  shopifyCustomerId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export function createDefaultProfile(input: {
  uid: string;
  email: string;
  displayName?: string | null;
}): Omit<UserProfile, 'createdAt' | 'updatedAt'> {
  return {
    uid: input.uid,
    email: input.email,
    displayName: input.displayName?.trim() || input.email.split('@')[0] || 'Zákazník',
    fitnessGoals: [],
    allergies: [],
    shopifyCustomerId: null,
  };
}
