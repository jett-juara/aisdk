"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, User } from "lucide-react";
import { VendorFormValues } from "./form-schema";
import { AnimatedInput } from "@/components/ui/animated-input";

export function Step1Role() {
    const { control, watch } = useFormContext<VendorFormValues>();
    const role = watch("role");

    return (
        <div className="space-y-6">
            <div className="text-start mb-8">
                <h2 className="font-subheading font-medium text-2xl md:text-4xl lg:text-4xl tracking-tighter text-premium-gradient leading-1 pb-3">
                    Welcome, Partner!
                </h2>
                <p className="text-text-200 text-xl">
                    Let&apos;s start by defining your role in the Juara ecosystem.
                </p>
            </div>

            <div className="space-y-4">
                <FormField
                    control={control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-lg mb-1">I am registering as a...</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="company" className="peer sr-only" />
                                        </FormControl>
                                        <FormLabel className="flex flex-row items-center gap-4 rounded-xl border-2 border-border-800 bg-background-800 p-4 hover:bg-background-700 hover:text-text-50 peer-data-[state=checked]:bg-background-600 peer-data-[state=checked]:text-text-50 peer-data-[state=checked]:border-text-50 cursor-pointer transition-all">
                                            <Building2 className="h-12 w-12 flex-shrink-0" />
                                            <div className="text-left">
                                                <span className="block font-bold text-lg">Company</span>
                                                <span className="block text-sm text-text-400 mt-0">
                                                    PT, CV, or other legal entities
                                                </span>
                                            </div>
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem
                                                value="individual"
                                                className="peer sr-only"
                                            />
                                        </FormControl>
                                        <FormLabel className="flex flex-row items-center gap-4 rounded-xl border-2 border-border-800 bg-background-800 p-4 hover:bg-background-700 hover:text-text-50 peer-data-[state=checked]:bg-background-600 peer-data-[state=checked]:text-text-50 peer-data-[state=checked]:border-text-50 cursor-pointer transition-all">
                                            <User className="h-12 w-12 flex-shrink-0" />
                                            <div className="text-left">
                                                <span className="block font-bold text-lg">Individual</span>
                                                <span className="block text-sm text-text-400 mt-0">
                                                    Freelancer, Talent, or Specialist
                                                </span>
                                            </div>
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="bg-background-800/50 p-6 rounded-xl border border-border-800 space-y-4">
                <h3 className="text-lg border-b border-border-800 pb-2 mb-10">
                    Person In Charge Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="picName"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="Full Name"
                                        placeholder="Full Name"
                                        {...field}
                                        value={field.value || "Loading..."}
                                        disabled={true}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Full name must match your official identity card (KTP/SIM/Passport). If it doesn't match, please update it immediately in your <a href="/setting/profile" className="text-text-info-500 hover:underline">Profile Settings</a>.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="picEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="Email Address"
                                        placeholder="Email Address"
                                        {...field}
                                        value={field.value || "Loading..."}
                                        disabled={true}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Registered email address.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="picEmailAlt"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <AnimatedInput
                                        label="Alternative Email (Optional)"
                                        placeholder="alternative@email.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    For backup communication.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="picPhone"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <PhoneInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Mobile Phone *"
                                        defaultCountry="ID"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {role === "company" && (
                        <FormField
                            control={control}
                            name="picPosition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <AnimatedInput
                                            label="Position / Job Title"
                                            placeholder="e.g. Marketing Manager"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
