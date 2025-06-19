import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { useStore } from '@/store';
import InputField from './inputField';

export default function NumPad() {
    const inputRef = useRef(null);
    const {
        isOpen, setIsOpen, setPadInput,
        handleNumberClick, handleBackspace, handleOK
    } = useStore();

    const moveCursor = (direction) => {
        const input = inputRef.current;
        if (!input) return;

        const pos = input.selectionStart || 0;
        const newPos = direction === 'left' ? Math.max(0, pos - 1) : pos + 1;

        input.setSelectionRange(newPos, newPos);
        input.focus();
    };

    const handleCancel = () => {
        setPadInput('');
        setIsOpen(false);
    };

    const handleClear = () => {
        setPadInput('');
    };

    const insertAtCursor = (value) => {
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
    };

    const KeypadButton = ({ children, onClick, className = "", variant = "outline" }) => (
        <Button
            variant={variant}
            onClick={onClick}
            className={`h-12 text-lg font-medium ${className}`}
        >
            {children}
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md p-0">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle className="text-sm font-normal text-gray-600">
                        Invoice #
                    </DialogTitle>
                </DialogHeader>

                <div className="px-4">
                    <div className="mb-4">
                        <div className="text-center text-sm font-medium mb-2">
                            ENTER Invoice #:
                        </div>
                        <InputField ref={inputRef} />
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {['7', '8', '9'].map(num => (
                            <KeypadButton key={num} onClick={() => insertAtCursor(num)}>{num}</KeypadButton>
                        ))}
                        <KeypadButton
                            onClick={handleOK}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800"
                        >
                            OK
                        </KeypadButton>

                        {['4', '5', '6'].map(num => (
                            <KeypadButton key={num} onClick={() => insertAtCursor(num)}>{num}</KeypadButton>
                        ))}
                        <KeypadButton
                            onClick={handleCancel}
                            className="bg-red-100 hover:bg-red-200 text-red-700"
                        >
                            Cancel
                        </KeypadButton>

                        {['1', '2', '3'].map(num => (
                            <KeypadButton key={num} onClick={() => insertAtCursor(num)}>{num}</KeypadButton>
                        ))}
                        <KeypadButton
                            onClick={handleClear}
                            className="bg-gray-100 hover:bg-gray-200"
                        >
                            CLEAR
                        </KeypadButton>

                        {['0', '00', '+/-'].map(val => (
                            <KeypadButton key={val} onClick={() => insertAtCursor(val)}>{val}</KeypadButton>
                        ))}
                        <KeypadButton
                            onClick={handleBackspace}
                            className="bg-gray-100 hover:bg-gray-200"
                        >
                            Back
                        </KeypadButton>

                        <div className="col-span-2 grid grid-cols-2 gap-2">
                            <KeypadButton
                                onClick={() => moveCursor('left')}
                                className="bg-gray-100 hover:bg-gray-200"
                            >
                                <LuArrowLeft size={20} />
                            </KeypadButton>
                            <KeypadButton
                                onClick={() => moveCursor('right')}
                                className="bg-gray-100 hover:bg-gray-200"
                            >
                                <LuArrowRight size={20} />
                            </KeypadButton>
                        </div>
                        <div className="col-span-2"></div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}