import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseUnitsApi, CourseUnitData } from "@/lib/api/courseUnits";
import { toast } from "sonner";

export function useCourseUnits(courseId: string, filters?: any) {
    return useQuery({
        queryKey: ['courseUnits', courseId, filters],
        queryFn: async () => {
            const res = await courseUnitsApi.findByCourse(courseId, filters);
            if (!res.success) throw new Error(res.message);
            return res;
        },
        enabled: !!courseId,
    });
}

export function useCreateCourseUnit(courseId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CourseUnitData) => {
            const response = await courseUnitsApi.create(courseId, data);
            if (!response.success) throw new Error(response.message || "Failed to create module");
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseUnits', courseId] });
            toast.success("Module created successfully!");
        },
        onError: (error: Error) => toast.error(error.message),
    });
}

export function useUpdateCourseUnit(courseId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ unitId, data }: { unitId: string, data: Partial<CourseUnitData> }) => {
            const response = await courseUnitsApi.update(unitId, data);
            if (!response.success) throw new Error(response.message || "Failed to update module");
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseUnits', courseId] });
            toast.success("Module updated successfully!");
        },
        onError: (error: Error) => toast.error(error.message),
    });
}

export function useDeleteCourseUnit(courseId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (unitId: string) => {
            const response = await courseUnitsApi.delete(unitId);
            if (!response.success) throw new Error(response.message || "Failed to delete module");
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseUnits', courseId] });
            toast.success("Module deleted successfully!");
        },
        onError: (error: Error) => toast.error(error.message),
    });
}