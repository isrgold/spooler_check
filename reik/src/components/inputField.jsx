import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store';

const InputField = React.forwardRef((props, ref) => {
    const { padInput, setPadInput } = useStore();

    return (
        <Input
            ref={ref}
            value={padInput}
            onChange={(e) => setPadInput(e.target.value)}
            autoFocus
            className="text-center text-lg h-12"
            {...props}
        />
    );
});
InputField.displayName = 'InputField';

export default InputField;
