import { create } from "zustand";
import { Store } from '@tauri-apps/plugin-store';
import { listen } from '@tauri-apps/api/event'


export type Track = {
  name: string;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
};

const empty_track: Track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

interface AppState {
  selectedPlaylistID: string;
  setSelectedPlaylistID: (playlistID: string) => void;
  spotifyPlayer: Spotify.Player | null;
  setSpotifyPlayer: (spotifyPlayer: Spotify.Player) => void;
  spotifyPlayerID: string;
  setSpotifyPlayerID: (spotifyPlayerID: string) => void;
  currentTrack: Track;
  setCurrentTrack: (currentTrack: Track) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  trackDuration: number;
  setTrackDuration: (trackDuration: number) => void;
  trackLocation: number;
  setTrackLocation: (trackLocation: number) => void;
  defaultVolume: number;
  setDefaultVolume: (defaultVolume: number) => void;
}

const useStore = create<AppState>((set) => ({
  selectedPlaylistID: "",
  setSelectedPlaylistID: (playlistID: string) =>
    set({ selectedPlaylistID: playlistID }),
  spotifyPlayer: null,
  setSpotifyPlayer: (spotifyPlayer: Spotify.Player) =>
    set({ spotifyPlayer: spotifyPlayer }),
  spotifyPlayerID: "",
  setSpotifyPlayerID: (spotifyPlayerID: string) =>
    set({ spotifyPlayerID: spotifyPlayerID }),
  currentTrack: empty_track,
  setCurrentTrack: (currentTrack: Track) => set({ currentTrack: currentTrack }),
  isPaused: false,
  setIsPaused: (isPaused: boolean) => set({ isPaused: isPaused }),
  isActive: false,
  setIsActive: (isActive: boolean) => set({ isActive: isActive }),
  trackDuration: 0,
  setTrackDuration: (trackDuration: number) =>
    set({ trackDuration: trackDuration }),
  trackLocation: 0,
  setTrackLocation: (trackLocation: number) =>
    set({ trackLocation: trackLocation }),
  defaultVolume: 0,
  setDefaultVolume: (defaultVolume: number) =>
    set({ defaultVolume: defaultVolume }),
}));

const tauri_store = new Store('frontend_store.bin');

// Create an async function to handle the store operations
async function initializeStore() {
  if (!await tauri_store.has('defaultVolume')) {
    await tauri_store.set('defaultVolume', 0.5);
  } else {
    const defaultVolume = await tauri_store.get('defaultVolume') as number;
    useStore.setState({ defaultVolume });
    console.log(defaultVolume)
  }
}

// Call the async function to initialize the store
initializeStore().catch((err) => {
  console.error('Failed to initialize store:', err);
});

export { tauri_store };
export default useStore;
