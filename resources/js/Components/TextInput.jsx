import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl border-[#024A7D]/20 shadow-sm focus:border-[#00ADEE] focus:ring-[#00ADEE]/20 ' +
                className
            }
            ref={input}
        />
    );
});
