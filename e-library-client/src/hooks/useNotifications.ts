import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications"; // Adjust path as needed
import { queryKeys } from "@/lib/queryClient"; // Assume you added the keys above
import { toast } from "sonner";
import { Notification } from "@/types/api";

export const useNotifications = (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) => {
    return useQuery({
        queryKey: queryKeys.notifications.list(params),
        queryFn: () => notificationsApi.getAll(params),
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: queryKeys.notifications.unreadCount,
        queryFn: async () => {
            const res = await notificationsApi.getUnreadCount();
            return res.data?.unreadCount || 0;
        },
        refetchInterval: 60 * 1000, // Refetch every minute
    });
};

// OPTIMISTIC UPDATE APPLIED HERE
export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.markAsRead,
        onMutate: async (notificationId) => {
            // Cancel outgoing refetches so they don't overwrite optimistic state
            await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

            // Snapshot previous value for rollback on error
            const previousNotifications = queryClient.getQueriesData({ queryKey: queryKeys.notifications.all });

            // Optimistically update all cached lists containing this notification
            queryClient.setQueriesData(
                { queryKey: queryKeys.notifications.all },
                (oldData: any) => {
                    if (!oldData || !oldData.data) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.map((notif: Notification) =>
                            notif.id === notificationId ? { ...notif, read: true } : notif
                        ),
                        unreadCount: Math.max(0, (oldData.unreadCount || 0) - 1),
                    };
                }
            );

            // Optimistically update the unread count specifically
            queryClient.setQueryData(queryKeys.notifications.unreadCount, (old: number | undefined) => 
                Math.max(0, (old || 0) - 1)
            );

            return { previousNotifications };
        },
        onError: (_err, _newNotif, context) => {
            // Rollback on failure
            if (context?.previousNotifications) {
                context.previousNotifications.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error("Failed to mark notification as read.");
        },
        onSettled: () => {
            // Sync with server in background just to be safe
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
};

// OPTIMISTIC UPDATE APPLIED HERE
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.delete,
        onMutate: async (notificationId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
            const previousNotifications = queryClient.getQueriesData({ queryKey: queryKeys.notifications.all });

            queryClient.setQueriesData(
                { queryKey: queryKeys.notifications.all },
                (oldData: any) => {
                    if (!oldData || !oldData.data) return oldData;
                    
                    // We need to check if the deleted notification was unread to accurately adjust the count optimistically
                    const targetNotif = oldData.data.find((n: Notification) => n.id === notificationId);
                    const wasUnread = targetNotif && !targetNotif.read;

                    return {
                        ...oldData,
                        data: oldData.data.filter((notif: Notification) => notif.id !== notificationId),
                        unreadCount: wasUnread ? Math.max(0, (oldData.unreadCount || 0) - 1) : oldData.unreadCount,
                    };
                }
            );

            return { previousNotifications };
        },
        onError: (_err, _newNotif, context) => {
            if (context?.previousNotifications) {
                context.previousNotifications.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error("Failed to delete notification.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
            toast.success("All notifications marked as read");
        },
        onError: () => toast.error("Failed to mark all as read"),
    });
};

export const useClearReadNotifications = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.clearRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
            toast.success("Read notifications cleared");
        },
        onError: () => toast.error("Failed to clear notifications"),
    });
};