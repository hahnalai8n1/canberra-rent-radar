import { create } from 'zustand';

interface FormState {
  budget: number;
  minTransportScore: number;
  preferredVibe: string;
  workplace: string;
  commuteMode: string;

  setBudget: (budget: number) => void;
  setMinTransportScore: (score: number) => void;
  setPreferredVibe: (vibe: string) => void;
  setWorkplace: (workplace: string) => void;
  setCommuteMode: (mode: string) => void;
}

export const useFormStore = create<FormState>((set) => ({
  budget: 500,
  minTransportScore: 1,
  preferredVibe: 'Any',
  workplace: 'Canberra Centre, Canberra ACT',
  commuteMode: 'transit',

  setBudget: (budget) => set({ budget }),
  setMinTransportScore: (minTransportScore) => set({ minTransportScore }),
  setPreferredVibe: (preferredVibe) => set({ preferredVibe }),
  setWorkplace: (workplace) => set({ workplace }),
  setCommuteMode: (commuteMode) => set({ commuteMode }),
}));
