import { create } from 'zustand';

interface DepartmentStore {
    selectedDepartment: string | null;
    setSelectedDepartment: (dept: string) => void;
}

export const useDepartmentStore = create<DepartmentStore>((set) => ({
    selectedDepartment: null,
    setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
}));