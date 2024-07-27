import { create } from "zustand";

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
}));

export default useStore;
