import { create } from 'zustand';
import { Place, PlaceCategory } from '@/types';

interface PlacesState {
  places: Place[];
  selectedPlace: Place | null;
  activeCategoryFilter: PlaceCategory | null;
  searchQuery: string;
  searchHistory: string[];
  isLoading: boolean;
  isCheckinModalVisible: boolean;

  setPlaces: (places: Place[]) => void;
  setSelectedPlace: (place: Place | null) => void;
  setActiveCategoryFilter: (category: PlaceCategory | null) => void;
  setSearchQuery: (query: string) => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsCheckinModalVisible: (visible: boolean) => void;
  addPlace: (place: Place) => void;
  incrementCheckinCount: (placeId: string) => void;
}

export const usePlacesStore = create<PlacesState>((set, get) => ({
  places: [],
  selectedPlace: null,
  activeCategoryFilter: null,
  searchQuery: '',
  searchHistory: ['Hồ Gươm', 'Landmark 81', 'Cà phê', 'Cầu Rồng'],
  isLoading: false,
  isCheckinModalVisible: false,

  setPlaces: (places) => set({ places }),
  addPlace: (place) =>
    set((state) => {
      const exists = state.places.some((p) => p.id === place.id);
      return {
        places: exists ? state.places : [place, ...state.places],
      };
    }),
  incrementCheckinCount: (placeId: string) =>
    set((state) => ({
      places: state.places.map((p) =>
        p.id === placeId ? { ...p, checkin_count: (p.checkin_count || 0) + 1 } : p
      ),
      selectedPlace:
        state.selectedPlace?.id === placeId
          ? {
              ...state.selectedPlace,
              checkin_count: (state.selectedPlace.checkin_count || 0) + 1,
            }
          : state.selectedPlace,
    })),
  setSelectedPlace: (selectedPlace) => set({ selectedPlace }),
  setActiveCategoryFilter: (activeCategoryFilter) => set({ activeCategoryFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  addSearchHistory: (query) => {
    if (!query.trim()) return;
    const current = get().searchHistory.filter((item) => item !== query.trim());
    set({ searchHistory: [query.trim(), ...current].slice(0, 10) });
  },
  clearSearchHistory: () => set({ searchHistory: [] }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsCheckinModalVisible: (isCheckinModalVisible) => set({ isCheckinModalVisible }),
}));
