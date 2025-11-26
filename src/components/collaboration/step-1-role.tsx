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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, User } from "lucide-react";
import { VendorFormValues } from "./form-schema";

export function Step1Role() {
    const { control, watch } = useFormContext<VendorFormValues>();
    const role = watch("role");

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-text-50">
                    Welcome, Partner
                </h2>
                <p className="text-text-200 mt-2">
                    Let&apos;s start by defining your role in the Juara ecosystem.
                </p>
            </div>

            <div className="space-y-4">
                <FormField
                    control={control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>I am registering as a...</FormLabel>
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
                                        <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-border-800 bg-background-800 p-4 hover:bg-background-700 hover:text-text-50 peer-data-[state=checked]:border-brand-500 peer-data-[state=checked]:text-brand-500 [&:has([data-state=checked])]:border-brand-500 cursor-pointer transition-all">
                                            <Building2 className="mb-3 h-8 w-8" />
                                            <div className="text-center">
                                                <span className="block font-bold text-lg">Company</span>
                                                <span className="block text-sm text-text-400 mt-1">
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
                                        <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-border-800 bg-background-800 p-4 hover:bg-background-700 hover:text-text-50 peer-data-[state=checked]:border-brand-500 peer-data-[state=checked]:text-brand-500 [&:has([data-state=checked])]:border-brand-500 cursor-pointer transition-all">
                                            <User className="mb-3 h-8 w-8" />
                                            <div className="text-center">
                                                <span className="block font-bold text-lg">Individual</span>
                                                <span className="block text-sm text-text-400 mt-1">
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
                <h3 className="font-semibold text-lg border-b border-border-800 pb-2 mb-4">
                    PIC Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="picName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name (PIC)</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Person in charge for this account.
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
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="john@example.com" {...field} readOnly className="bg-background-900/50 opacity-70 cursor-not-allowed" />
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
                        name="picPhone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+62..." {...field} />
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
                                    <FormLabel>Position / Job Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Marketing Manager" {...field} />
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
