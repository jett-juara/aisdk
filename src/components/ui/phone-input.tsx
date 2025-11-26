import { motion } from "framer-motion";
import { useState, useEffect, forwardRef, useId } from "react";
import PhoneInputBase, { Country, Value } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import en from "react-phone-number-input/locale/en";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import { CountrySelector } from "./country-selector";

export interface PhoneInputProps {
    value?: string;
    onChange: (value?: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    defaultCountry?: Country;
    label?: string;
}

const PhoneInputInternal = forwardRef<HTMLInputElement, any>(({ className, label, onFocus, onBlur, onChange, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasContent, setHasContent] = useState(
        value !== undefined && value !== null && String(value).trim().length > 0
    );

    useEffect(() => {
        setHasContent(value !== undefined && value !== null && String(value).trim().length > 0);
    }, [value]);

    const isFloating = isFocused || hasContent;
    const uniqueId = useId();
    const inputId = `phone-input-${uniqueId}`;

    return (
        <div className="relative flex items-center w-full">
            <input
                {...props}
                ref={ref}
                id={inputId}
                value={value}
                className={cn(
                    "h-12 w-full px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold outline-none transition-all duration-200 focus:bg-input-focus-bg focus:text-text-900 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md backdrop-blur-md border focus-visible:ring-0 focus-visible:ring-offset-0",
                    className
                )}
                onFocus={(e) => {
                    setIsFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    setHasContent(e.target.value.trim().length > 0);
                    onBlur?.(e);
                }}
                onChange={(e) => {
                    setHasContent(e.target.value.trim().length > 0);
                    onChange?.(e);
                }}
            />
            {label && (
                <motion.label
                    animate={
                        isFloating
                            ? {
                                y: -40,
                                x: 10,
                                scale: 0.85,
                                color: "#ffffff",
                            }
                            : { y: "-50%", x: 0, scale: 1, color: "var(--color-text-400)" }
                    }
                    className={`absolute left-3 origin-left pointer-events-none top-1/2 ${isFloating
                        ? "bg-brand-600 px-2 py-0.5 rounded-full shadow-md z-10"
                        : ""
                        }`}
                    htmlFor={inputId}
                    transition={{
                        duration: 0.2,
                        ease: "easeOut"
                    }}
                >
                    {label}
                </motion.label>
            )}
        </div>
    );
});

PhoneInputInternal.displayName = "PhoneInputInternal";

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ value, onChange, placeholder = "Enter phone number", disabled, className, defaultCountry = "ID", label }, ref) => {
        return (
            <PhoneInputBase
                international={false}
                defaultCountry={defaultCountry}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={label ? "" : placeholder} // Hide placeholder if label exists (label acts as placeholder)
                flags={flags}
                labels={en}
                countrySelectComponent={CountrySelector}
                className={cn(
                    "phone-input-custom",
                    className
                )}
                // Pass label to the input component
                // @ts-ignore - PhoneInputBase types might not explicitly allow extra props but they are passed down
                label={label}
                inputComponent={PhoneInputInternal}
            />
        );
    }
);

PhoneInput.displayName = "PhoneInput";
