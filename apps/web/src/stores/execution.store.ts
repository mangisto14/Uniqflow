import { create } from 'zustand';
import { IExecution } from '@uniqflow/shared';

interface ExecutionState {
  executions: IExecution[];
  currentExecution: IExecution | null;
  isLoading: boolean;
  setExecutions: (executions: IExecution[]) => void;
  setCurrentExecution: (execution: IExecution | null) => void;
  setLoading: (loading: boolean) => void;
  upsertExecution: (execution: IExecution) => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  executions: [],
  currentExecution: null,
  isLoading: false,
  setExecutions: (executions) => set({ executions }),
  setCurrentExecution: (currentExecution) => set({ currentExecution }),
  setLoading: (isLoading) => set({ isLoading }),
  upsertExecution: (execution) =>
    set((state) => ({
      executions: state.executions.find((e) => e.id === execution.id)
        ? state.executions.map((e) => (e.id === execution.id ? execution : e))
        : [...state.executions, execution],
    })),
}));
