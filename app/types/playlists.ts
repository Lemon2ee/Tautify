export interface CurrentUserPlaylistsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: CurrentUserPlaylistsResponsePlaylist[];
}

export interface CurrentUserPlaylistsResponsePlaylist {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[] | null;
  name: string;
  owner: Owner;
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: Tracks;
  type: string;
  uri: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Owner {
  display_name: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
}

export interface Tracks {
  href: string;
  total: number;
}

export interface Image {
  url: string;
  height: number | null;
  width: number | null;
}
