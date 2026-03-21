"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
    useNotifications, 
    useUnreadCount, 
    useMarkAsRead, 
    useMarkAllAsRead, 
    useDeleteNotification 
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
    Bell,
    Check,
    Trash2,
    BookOpen,
    AlertCircle,
    Info,
    CheckCircle2,
    Loader2
} from "lucide-react";

export function NotificationsPopover() {
    const [open, setOpen] = useState(false);
    
    const { data: notificationsData, isLoading } = useNotifications({ limit: 20 });
    
    // UPDATED: The refactored hook now directly returns the number
    const { data: unreadCount = 0 } = useUnreadCount();

    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const deleteNotification = useDeleteNotification();

    const notifications = notificationsData?.data || [];

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the wrapper's onClick
        markAsRead.mutate(id);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteNotification.mutate(id);
    };

    // UPDATED: Matches backend lowercase NotificationType ENUM
    const getIcon = (type: string) => {
        switch (type) {
            case "request_update":
            case "success":
                return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
            case "resource_added":
                return <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />;
            case "warning":
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />;
            case "system":
            case "info":
            default:
                return <Info className="h-4 w-4 text-blue-900 shrink-0" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-blue-900 hover:bg-zinc-100">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white"></span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            
            {/* UPDATED: Styled to match your global app theme */}
            <PopoverContent className="w-80 p-0 border-2 border-zinc-100 shadow-xl font-titillium rounded-xl overflow-hidden" align="end">
                <div className="flex items-center justify-between p-4 bg-zinc-50/80 border-b-2 border-zinc-100">
                    <h4 className="font-black text-sm uppercase tracking-widest text-zinc-900">Notifications</h4>
                    {unreadCount > 0 && (
                        <Badge className="bg-blue-900 hover:bg-blue-900 text-white text-[10px] font-bold px-2 py-0 uppercase tracking-widest">
                            {unreadCount} New
                        </Badge>
                    )}
                </div>
                
                <div className="px-2 py-1 flex justify-end bg-white">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] font-bold uppercase tracking-widest h-8 px-3 text-zinc-500 hover:text-blue-900"
                        onClick={() => markAllAsRead.mutate()}
                        disabled={unreadCount === 0 || markAllAsRead.isPending}
                    >
                        {markAllAsRead.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                        Mark all as read
                    </Button>
                </div>
                
                <Separator className="bg-zinc-100" />
                
                <ScrollArea className="h-[350px] bg-white">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
                            <Bell className="h-10 w-10 mb-4 text-zinc-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">No notifications yet</span>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-zinc-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    // UPDATED: Added "group" class so hover actions work properly
                                    className={cn(
                                        "group flex flex-col gap-1.5 p-4 transition-colors cursor-pointer relative overflow-hidden",
                                        !notification.read ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-zinc-50"
                                    )}
                                    onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                                >
                                    {/* Unread Indicator Bar */}
                                    {!notification.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                    )}

                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 font-bold text-sm">
                                            {getIcon(notification.type)}
                                            <span className={cn(
                                                "leading-tight line-clamp-1 text-xs",
                                                notification.read ? "text-zinc-600" : "text-zinc-900"
                                            )}>
                                                {notification.title}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur rounded">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={(e) => handleDelete(notification.id, e)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <p className={cn(
                                        "text-[11px] leading-relaxed line-clamp-2 pr-6",
                                        notification.read ? "text-zinc-500 font-medium" : "text-zinc-700 font-semibold"
                                    )}>
                                        {notification.message}
                                    </p>
                                    
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}