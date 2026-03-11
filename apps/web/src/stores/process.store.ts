import { create } from 'zustand';
import { IProcess } from '@uniqflow/shared';

interface ProcessState {
  processes: IProcess[];
  currentProcess: IProcess | null;
  isLoading: boolean;
  error: string | null;
  setProcesses: (processes: IProcess[]) => void;
  setCurrentProcess: (process: IProcess | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  upsertProcess: (process: IProcess) => void;
  removeProcess: (id: string) => void;
}

export const useProcessStore = create<ProcessState>((set) => ({
  processes: [],
  currentProcess: null,
  isLoading: false,
  error: null,
  setProcesses: (processes) => set({ processes }),
  setCurrentProcess: (currentProcess) => set({ currentProcess }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  upsertProcess: (process) =>
    set((state) => ({
      processes: state.processes.find((p) => p.id === process.id)
        ? state.processes.map((p) => (p.id === process.id ? process : p))
        : [...state.processes, process],
    })),
  removeProcess: (id) =>
    set((state) => ({ processes: state.processes.filter((p) => p.id !== id) })),
}));
