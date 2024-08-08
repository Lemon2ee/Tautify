"use client";
import useStore, { Track } from "@/app/store";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Qt5Be2gcX0X
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';


const TrackInfo = ({ track }: { track: Track }) => {
  const isValidTrack =
    track ? track.album.images[0].url && track.name && track.artists[0].name : false;
  return (
    <>
      {isValidTrack ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.album.images[0].url || ""}
            alt="Album cover"
            width={40}
            height={40}
            className="rounded-md"
          />
          <div>
            <h3 className="text-sm font-medium">{track.name || ""}</h3>
            <p className="text-xs text-muted-foreground">
              {track.artists[0].name || ""}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="rounded-md bg-muted opacity-50 w-[40px] h-[40px]" />
          <div>
            <h3 className="text-sm font-medium">{"Inactive"}</h3>
            <p className="text-xs text-muted-foreground">
              {"Transfer playback or click to play"}
            </p>
          </div>
        </> // render your placeholder component
      )}
    </>
  );
};

export default function Player() {
  const track: Track = useStore((state) => state.currentTrack);
  const isPaused = useStore((state) => state.isPaused);
  const isActive = useStore((state) => state.isActive);
  const duration = useStore((state) => state.trackDuration);
  const setLocation = useStore((state) => state.setTrackLocation);
  const location = useStore((state) => state.trackLocation);

  const player = useStore((state) => state.spotifyPlayer);

  const [configVolume, setConfigVolume] = useState<number>(Math.round(location / 1000));
  const [changing, setChanging] = useState<boolean>(false);


  useEffect(() => {
    if (!isActive || changing) {
      return;
    }

    const interval = setInterval(() => {
      if (!isPaused) {
        setLocation(location + 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, isActive, isPaused, location, setLocation, configVolume, setConfigVolume, changing]);

  useEffect(() => {
    setConfigVolume(Math.round(location / 1000))
  }, [location]);

  return (
    <div className={`bg-background shadow-lg z-50`}>
      <div className="w-full mx-auto px-4 py-3 flex items-center gap-10 ">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-40 truncate">
            <TrackInfo track={track} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (player) {
                player
                  .previousTrack()
                  .then(() => console.log("Back to previous track"));
              }
            }}
            variant="ghost"
            size="icon"
          >
            <SkipBack className="w-4 h-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            onClick={() => {
              if (player) {
                player.togglePlay().then(() => console.log("Toggle Play"));
              }
            }}
            variant="ghost"
            size="icon"
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            <span className="sr-only">Play/Pause</span>
          </Button>
          <Button
            onClick={() => {
              if (player) {
                player
                  .nextTrack()
                  .then(() => console.log("Skip to next track"));
              }
            }}
            variant="ghost"
            size="icon"
          >
            <SkipForward className="w-4 h-4" />
            <span className="sr-only">Next</span>
          </Button>
          {/* <div className="w-40 md:w-64">
              <Progress value={40} />
            </div> */}
        </div>

        <div className="flex flex-1 items-center gap-4">
          <Slider
            defaultValue={[0]}
            value={[configVolume]}
            onValueChange={(e) => {
              setChanging(true);
              setConfigVolume(e[0])
            }}
            onValueCommit={(e) => {
              setChanging(false);
              setConfigVolume(e[0]);
              if (player) {
                player.seek(configVolume * 1000).then(() => {
                  console.log('Changed position!');
                });
              }
            }}
            max={Math.round(duration / 1000)}
            step={1} />
        </div>
      </div>
    </div>
  );
}
