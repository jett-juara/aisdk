import { motion } from "framer-motion";
import { useRef, useState, forwardRef, useEffect, useId } from "react";

const EASE_IN_OUT_CUBIC_X1 = 0.4;
const EASE_IN_OUT_CUBIC_Y1 = 0;
const EASE_IN_OUT_CUBIC_X2 = 0.2;
const EASE_IN_OUT_CUBIC_Y2 = 1;
const RADIX_BASE_36 = 36;
const RANDOM_ID_START_INDEX = 2;
const RANDOM_ID_LENGTH = 9;

const LABEL_TRANSITION = {
    duration: 0.28,
    ease: [
        EASE_IN_OUT_CUBIC_X1,
        EASE_IN_OUT_CUBIC_Y1,
        EASE_IN_OUT_CUBIC_X2,
        EASE_IN_OUT_CUBIC_Y2,
    ], // standard material easing
};

export type AnimatedInputProps = {
    value?: string;
    defaultValue?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
    (
        {
            value,
            defaultValue = "",
            onChange,
            onBlur,
            onFocus,
            label,
            placeholder = "",
            disabled = false,
            className = "",
            inputClassName = "",
            labelClassName = "",
            icon,
            ...props
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState(defaultValue);
        const isControlled = value !== undefined;
        const val = isControlled ? value : internalValue;
        const [isFocused, setIsFocused] = useState(false);
        const [hasContent, setHasContent] = useState(
            val !== undefined && val !== null && String(val).trim().length > 0
        );

        // Sync local content state with external value changes
        useEffect(() => {
            setHasContent(val !== undefined && val !== null && String(val).trim().length > 0);
        }, [val]);

        const isFloating = isFocused || hasContent;

        const uniqueId = useId();
        const inputId = `animated-input-${uniqueId}`;

        return (
            <div className={`relative flex items-center ${className}`}>
                {icon && (
                    <span className="-translate-y-1/2 absolute top-1/2 left-3 text-text-400">
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    className={`peer w-full h-12 px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold outline-none transition-all duration-200 focus:bg-input-focus-bg focus:text-text-900 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md backdrop-blur-md border ${icon ? "pl-10" : ""
                        } ${inputClassName}`}
                    disabled={disabled}
                    id={inputId}
                    onBlur={(e) => {
                        setIsFocused(false);
                        // Double check content on blur
                        setHasContent(e.target.value.trim().length > 0);
                        onBlur?.(e);
                    }}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setHasContent(newValue.trim().length > 0);
                        if (!isControlled) {
                            setInternalValue(newValue);
                        }
                        onChange?.(e);
                    }}
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    placeholder={isFloating ? placeholder : ""}
                    type="text"
                    value={val ?? ""}
                    {...props}
                />
                <motion.label
                    animate={
                        isFloating
                            ? {
                                y: -40, // Move up from center (0 is center due to top-1/2)
                                x: 10,
                                scale: 0.85,
                                color: "#ffffff",
                            }
                            : { y: "-50%", x: 0, scale: 1, color: "var(--color-text-400)" }
                    }
                    className={`absolute left-3 origin-left pointer-events-none top-1/2 ${isFloating
                        ? "bg-brand-600 px-2 py-0.5 rounded-full shadow-md z-10"
                        : ""
                        } ${icon ? "left-10" : ""} ${labelClassName}`}
                    htmlFor={inputId}
                    transition={{
                        duration: 0.2,
                        ease: "easeOut"
                    }}
                >
                    {label}
                </motion.label>
            </div>
        );
    }
);

AnimatedInput.displayName = "AnimatedInput";

export { AnimatedInput };
