import { create } from 'zustand'

export const useStore = create((set) => ({
  isOpen: false,
  setIsOpen: (v) => set({ isOpen: v }),
}))