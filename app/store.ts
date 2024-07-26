import { create } from "zustand";

interface AppState {
  selectedPlaylistID: string;
  setSelectedPlaylistID: (playlistID: string) => void;
}

const useStore = create<AppState>((set) => ({
  selectedPlaylistID: "",
  setSelectedPlaylistID: (playlistID: string) =>
    set({ selectedPlaylistID: playlistID }),
}));

export default useStore;
