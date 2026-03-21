import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi, CreateBookPayload } from "@/lib/api/catalog";
import { toast } from "sonner";

export function useCampuses() {
    return useQuery({
        queryKey: ['campuses'],
        queryFn: catalogApi.getCampuses,
        staleTime: 10 * 60 * 1000,
    });
}

export function useCreateCampus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.createCampus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campuses'] });
            toast.success("Campus added successfully!");
        },
        onError: (error: Error) => toast.error(error.message),
    });
}

export function useBooks(filters?: any) {
    return useQuery({
        queryKey: ['catalogBooks', filters],
        queryFn: () => catalogApi.getBooks(filters),
        staleTime: 60 * 1000,
    });
}

export function useBook(id: string) {
    return useQuery({
        queryKey: ['catalogBook', id],
        queryFn: async () => {
            const res = await catalogApi.getBookById(id);
            if (!res.success) throw new Error(res.message);
            return res.data!;
        },
        enabled: !!id,
    });
}

export function useCreateBook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateBookPayload) => catalogApi.createBook(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalogBooks'] });
            toast.success("Book cataloged successfully!");
        },
        onError: (error: Error) => toast.error(error.message),
    });
}

export function useUpdateBook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<CreateBookPayload> }) => catalogApi.updateBook(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['catalogBooks'] });
            queryClient.invalidateQueries({ queryKey: ['catalogBook', variables.id] });
            toast.success("Book updated successfully!");
        },
        onError: (error: Error) => toast.error(error.message),
    });
}

export function useDeleteBook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.deleteBook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalogBooks'] });
            toast.success("Book removed from catalog.");
        },
        onError: (error: Error) => toast.error(error.message),
    });
}