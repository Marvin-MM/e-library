import { create } from "zustand";
import { resourcesApi } from "@/lib/api";
import { Resource, ResourceFilters, PaginationMeta } from "@/types/api";
import { toast } from "sonner";

interface ResourceState {
  // --- Resources ---
  resources: Resource[];
  resourcesPagination: PaginationMeta | null;
  isResourcesLoading: boolean;
  resourcesError: string | null;

  // --- Favourites ---
  favourites: Resource[];
  favouritesPagination: PaginationMeta | null;
  isFavouritesLoading: boolean;
  favouritesError: string | null;

  // --- Filters & Pagination ---
  filters: ResourceFilters;

  // --- Actions ---
  setFilters: (filters: Partial<ResourceFilters>) => void;
  resetFilters: () => void;
  
  fetchResources: () => Promise<void>;
  fetchFavourites: () => Promise<void>;
  
  toggleFavourite: (resourceId: string, isCurrentlyFavorite: boolean) => Promise<boolean>;
}

const defaultFilters: ResourceFilters = {
  page: 1,
  limit: 20,
  search: "",
};

export const useResourceStore = create<ResourceState>((set, get) => ({
  // Resources
  resources: [],
  resourcesPagination: null,
  isResourcesLoading: false,
  resourcesError: null,

  // Favourites
  favourites: [],
  favouritesPagination: null,
  isFavouritesLoading: false,
  favouritesError: null,

  // Filters
  filters: defaultFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
    }));
    // Auto-fetch data when filters change
    get().fetchResources();
    get().fetchFavourites();
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchResources();
    get().fetchFavourites();
  },

  fetchResources: async () => {
    const { filters } = get();
    set({ isResourcesLoading: true, resourcesError: null });
    try {
      const response = await resourcesApi.list(filters);
      if (response.success) {
        set({
          resources: response.data,
          resourcesPagination: response.pagination,
        });
      } else {
        set({ resourcesError: "Failed to fetch resources." });
      }
    } catch (error: any) {
      set({ resourcesError: error.message || "Failed to fetch resources." });
    } finally {
      set({ isResourcesLoading: false });
    }
  },

  fetchFavourites: async () => {
    const { filters } = get();
    set({ isFavouritesLoading: true, favouritesError: null });
    try {
      const response = await resourcesApi.getFavorites(filters);
      if (response.success) {
        set({
          favourites: response.data,
          favouritesPagination: response.pagination,
        });
      } else {
        set({ favouritesError: "Failed to fetch favourites." });
      }
    } catch (error: any) {
      set({ favouritesError: error.message || "Failed to fetch favourites." });
    } finally {
      set({ isFavouritesLoading: false });
    }
  },

  toggleFavourite: async (resourceId, isCurrentlyFavorite) => {
    try {
      if (isCurrentlyFavorite) {
        const response = await resourcesApi.removeFavorite(resourceId);
        if (response.success) {
          // Optimistic update
          set((state) => ({
            favourites: state.favourites.filter((fav) => fav.id !== resourceId),
          }));
          toast.success("Removed from favourites");
          return false;
        }
      } else {
        const response = await resourcesApi.addFavorite(resourceId);
        if (response.success) {
          // We need to fetch favorites again because addFavorite just returns a success message
          get().fetchFavourites();
          toast.success("Added to favourites");
          return true;
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update favorites");
    }
    return isCurrentlyFavorite; // Return initial state if failed
  },
}));
