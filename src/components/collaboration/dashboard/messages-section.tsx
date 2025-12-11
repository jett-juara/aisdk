"use client";

import { VendorMessage } from "@/lib/collaboration/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { markMessageAsRead } from "@/lib/collaboration/actions";

interface MessagesSectionProps {
    messages: VendorMessage[];
}

export function VendorMessagesSection({ messages }: MessagesSectionProps) {
    if (messages.length === 0) {
        return (
            <div className="p-12 border border-dashed border-border rounded-xl text-center bg-card/30">
                <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No Messages</h3>
                <p className="text-muted-foreground mt-2">
                    Your inbox is empty. Important notifications will appear here.
                </p>
            </div>
        );
    }

    return (
        <Card className="bg-card border-border">
            <ScrollArea className="h-[600px] w-full rounded-md">
                <div className="p-4 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-4 rounded-lg border transition-colors cursor-pointer ${msg.is_read ? 'bg-background border-border opacity-70 hover:opacity-100' : 'bg-card border-l-4 border-l-primary border-y-border border-r-border shadow-sm hover:bg-card/80'}`}
                            onClick={async () => {
                                if (!msg.is_read) {
                                    await markMessageAsRead(msg.id);
                                }
                            }}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 w-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {!msg.is_read && (
                                                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                                            )}
                                            <h4 className={`text-base font-semibold ${msg.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                {msg.subject}
                                            </h4>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                        </div>
                                    </div>

                                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                        {msg.body}
                                    </p>

                                    {msg.action_url && (
                                        <div className="pt-3">
                                            <Button size="sm" variant="secondary" className="h-8" asChild onClick={(e) => e.stopPropagation()}>
                                                <a href={msg.action_url} target="_blank" rel="noopener noreferrer">
                                                    {msg.action_label || "View Action"} <ExternalLink className="ml-2 h-3 w-3" />
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    );
}
