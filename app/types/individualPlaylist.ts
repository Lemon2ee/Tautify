export interface IndividualPlaylist {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images?: ImagesEntity[] | null;
  name: string;
  owner: Owner;
  public: boolean;
  snapshot_id: string;
  tracks: Tracks;
  type: string;
  uri: string;
}
export interface ExternalUrls {
  spotify: string;
}
export interface Followers {
  href: string;
  total: number;
}
export interface ImagesEntity {
  url: string;
  height: number;
  width: number;
}
export interface Owner {
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string;
}

export interface Tracks {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items?: ItemsEntity[] | null;
}

export interface ItemsEntity {
  added_at: string;
  added_by: AddedBy;
  is_local: boolean;
  track: Track;
}

export interface AddedBy {
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  type: string;
  uri: string;
}

export interface Track {
  album: Album;
  artists?: ArtistsEntity[] | null;
  available_markets?: string[] | null;
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: LinkedFrom;
  restrictions: Restrictions;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}
export interface Album {
  album_type: string;
  total_tracks: number;
  available_markets?: string[] | null;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images?: ImagesEntity[] | null;
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions: Restrictions;
  type: string;
  uri: string;
  artists?: ArtistsEntity[] | null;
}
export interface Restrictions {
  reason: string;
}
export interface ArtistsEntity {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}
export interface ExternalIds {
  isrc: string;
  ean: string;
  upc: string;
}
export interface LinkedFrom {}
