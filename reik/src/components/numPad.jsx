import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import {useStore} from '@/store';

export default function NumPad() {
    const { isOpen, setIsOpen } = useStore();
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const handleNumberClick = (num) => {
        setInvoiceNumber(prev => prev + num);
    };

    const handleClear = () => {
        setInvoiceNumber('');
    };

    const handleBackspace = () => {
        setInvoiceNumber(prev => prev.slice(0, -1));
    };

    const handleOK = () => {
        console.log('Invoice Number:', invoiceNumber);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setInvoiceNumber('');
        setIsOpen(false);
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
        <>
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
                            <Input
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                autoFocus       
                                className="text-center text-lg h-12"
                                placeholder=""
                            />
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {/* Row 1 */}
                            <KeypadButton onClick={() => handleNumberClick('7')}>7</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('8')}>8</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('9')}>9</KeypadButton>
                            <KeypadButton
                                onClick={handleOK}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-800"
                            >
                                OK
                            </KeypadButton>

                            {/* Row 2 */}
                            <KeypadButton onClick={() => handleNumberClick('4')}>4</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('5')}>5</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('6')}>6</KeypadButton>
                            <KeypadButton
                                onClick={handleCancel}
                                className="bg-red-100 hover:bg-red-200 text-red-700"
                            >
                                Cancel
                            </KeypadButton>

                            {/* Row 3 */}
                            <KeypadButton onClick={() => handleNumberClick('1')}>1</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('2')}>2</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('3')}>3</KeypadButton>
                            <KeypadButton
                                onClick={handleClear}
                                className="bg-gray-100 hover:bg-gray-200"
                            >
                                CLEAR
                            </KeypadButton>

                            {/* Row 4 */}
                            <KeypadButton onClick={() => handleNumberClick('0')}>0</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('00')}>00</KeypadButton>
                            <KeypadButton onClick={() => handleNumberClick('+/-')}>+/-</KeypadButton>
                            <KeypadButton
                                onClick={handleBackspace}
                                className="bg-gray-100 hover:bg-gray-200"
                            >
                                Back
                            </KeypadButton>

                            {/* Row 5 - Navigation arrows */}
                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                <KeypadButton className="bg-gray-100 hover:bg-gray-200">
                                    <LuArrowLeft size={20} />
                                </KeypadButton>
                                <KeypadButton className="bg-gray-100 hover:bg-gray-200">
                                    <LuArrowRight size={20} />
                                </KeypadButton>
                            </div>
                            <div className="col-span-2"></div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}