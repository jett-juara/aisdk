"use client";

import React from "react";
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
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ value, onChange, placeholder = "Enter phone number", disabled, className, defaultCountry = "ID" }, ref) => {
        return (
            <PhoneInputBase
                international={false}
                defaultCountry={defaultCountry}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                flags={flags}
                labels={en}
                countrySelectComponent={CountrySelector}
                className={cn(
                    "phone-input-custom",
                    className
                )}
                inputComponent={React.forwardRef<HTMLInputElement>((props, inputRef) => (
                    <input
                        {...props}
                        ref={inputRef}
                        className="h-12 w-full px-4 bg-glass-bg border-glass-border text-text-50 text-md md:text-xl lg:text-sm font-body font-semibold placeholder:text-input-placeholder-400 placeholder:opacity-0 placeholder-shown:placeholder:opacity-100 focus:placeholder:opacity-0 disabled:opacity-100 disabled:cursor-not-allowed selection:bg-brand-500/20 selection:text-text-900 rounded-md backdrop-blur-md border focus:bg-input-focus-bg focus:text-text-900 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                    />
                ))}
            />
        );
    }
);

PhoneInput.displayName = "PhoneInput";
