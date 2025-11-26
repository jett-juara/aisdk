"use client";

import React, { useState, useRef, useEffect } from "react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
    value?: string;
    onChange: (value: string) => void;
    labels?: { [key: string]: string };
    iconComponent?: React.ComponentType<{ country: string; label: string }>;
}

export function CountrySelector({ value, onChange, labels = en, iconComponent: Icon }: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const countries = getCountries();

    // Only show countries when user types at least 3 characters
    // And limit to top 2 results to keep dropdown small
    const filteredCountries = search.length >= 3
        ? countries.filter((country) => {
            const label = labels[country] || country;
            return label.toLowerCase().includes(search.toLowerCase());
        }).slice(0, 2)
        : [];

    const selectedCountry = value || "ID";
    const selectedLabel = labels[selectedCountry] || selectedCountry;

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Country Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 h-12 bg-glass-bg border border-glass-border rounded-md hover:bg-white/5 transition-all backdrop-blur-md"
            >
                {Icon && selectedCountry && (
                    <div className="w-6 h-4 overflow-hidden rounded-[2px]">
                        <Icon country={selectedCountry} label={selectedLabel} />
                    </div>
                )}
                <span className="text-sm text-text-200 font-medium">+{getCountryCallingCode(selectedCountry as any)}</span>
                <svg
                    className={`w-4 h-4 text-text-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-72 bg-[#121f28] border border-border-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-border-800 bg-[#121f28]">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Type 3 chars..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 bg-[#1e3442] border border-border-800 rounded text-text-50 text-sm placeholder:text-text-400 focus:outline-none focus:border-border-700"
                        />
                    </div>

                    {/* Country List */}
                    <div className="overflow-hidden">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                                <button
                                    key={country}
                                    type="button"
                                    onClick={() => {
                                        onChange(country);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[#1e3442] transition-colors ${country === selectedCountry ? "bg-[#1e3442]" : ""
                                        }`}
                                >
                                    {Icon && (
                                        <div className="w-6 h-4 overflow-hidden rounded-[2px] flex-shrink-0">
                                            <Icon country={country} label={labels[country]} />
                                        </div>
                                    )}
                                    <span className="text-sm text-text-50 flex-1 truncate">{labels[country]}</span>
                                    <span className="text-xs text-text-400">+{getCountryCallingCode(country)}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-text-400 text-center">
                                {search.length < 3 ? (
                                    <div className="flex items-center justify-center space-x-1">
                                        <div className="text-xs font-medium text-text-500 animate-pulse">Matching...</div>
                                    </div>
                                ) : (
                                    "No country found"
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
