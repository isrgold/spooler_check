import { create } from 'zustand'

export const useStore = create((set, get) => ({
    isOpen: false,
    setIsOpen: (v) => set({ isOpen: v }),

    padInput: '',
    setPadInput: (value) => set({ padInput: value }),

    handleNumberClick: (num) => {
        const { padInput } = get();
        set({ padInput: padInput + num });
    },

    handleBackspace: () => {
        const { padInput } = get();
        set({ padInput: padInput.slice(0, -1) });
    },

    handleOK: () => {
        const { padInput } = get();
        console.log('Invoice Number:', padInput);
        set({ isOpen: false });
    },

    insertAtCursor: (value) => {
        const { padInput } = get();
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const newValue =
            padInput.substring(0, start) +
            value +
            padInput.substring(end);

        setPadInput(newValue);

        // update cursor position after input update
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + value.length, start + value.length);
        }, 0);
    },
}));
