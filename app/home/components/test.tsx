"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/BKeInIziSho
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { useEffect, useState, useRef } from "react";
import useStore from "../../store";
import { invoke } from "@tauri-apps/api/core";
import { IndividualPlaylist } from "../../types/individualPlaylist";
import { listen } from "@tauri-apps/api/event";

export default function Component() {
  const selectedPlaylist = useStore((state) => state.selectedPlaylistID);
  const deviceId = useStore((state) => state.spotifyPlayerID);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);


  const [playlistData, setPlaylistData] = useState<IndividualPlaylist | null>(
    null
  );

  const handleTrackPlay = (trackUri: string) => {
    invoke("post_play_track", { trackUri, deviceId }).catch((error) =>
      console.log(error)
    );
  };

  useEffect(() => {
    if (selectedPlaylist !== "") {
      invoke("get_playlist_info", { playlistId: selectedPlaylist })
        .catch((error) => console.log(error))
        .then((playlist_info) =>
          setPlaylistData(
            JSON.parse(playlist_info as string) as IndividualPlaylist
          )
        );
    }

    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = 0;
    }
  }, [selectedPlaylist]);

  return (
    // flex row for playlist details
    <div className="grid min-h-0 gap-2 lg:gap-4 p-3">
      <div className="overflow-y-auto rounded-sm scrollbar-hide bg-zinc-700/30" ref={scrollableContainerRef}>
        {playlistData ? (
          <div className="grid gap-8 max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12 w-full">
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={playlistData.images?.[0]?.url || ""}
                  alt="Playlist Cover"
                  width={120}
                  height={120}
                  className="rounded-lg"
                />
                <div className="grid gap-2">
                  <h1 className="text-2xl font-bold">{playlistData.name}</h1>
                  <p className="text-muted-foreground">
                    {playlistData.description || "No description available"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playlistData.tracks.items?.map((item) => (
                    <TableRow key={item.track.id}>
                      <TableCell className="font-medium">
                        {item.track.name}
                      </TableCell>
                      <TableCell>{item.track.artists?.[0].name}</TableCell>
                      <TableCell>
                        {convertMsToMinutesAndSeconds(item.track.duration_ms)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleTrackPlay(item.track.uri);
                          }}
                        >
                          <PlayIcon className="h-4 w-4" />
                          <span className="sr-only">Play</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex w-full h-full justify-center items-center">
            <span>Select a playlist to get started</span>
          </div>
        )}
      </div>
    </div>
  );
}

function convertMsToMinutesAndSeconds(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();
  return `${minutes}:${formattedSeconds}`;
}

function PlayIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function ShuffleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
      <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
      <path d="m18 14 4 4-4 4" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
