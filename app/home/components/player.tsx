"use client";
import useStore, { Track } from "@/app/store";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Qt5Be2gcX0X
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/playbackSlider";
import { useEffect } from "react";
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

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      if (!isPaused) {
        setLocation(location + 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, isActive, isPaused, location, setLocation]);

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
            value={[Math.round(location / 1000)]}
            max={Math.round(duration / 1000)}
            step={0.1}
          />
        </div>


      </div>
    </div>
  );
}

function FastForwardIcon(props: any) {
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
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </svg>
  );
}

function RewindIcon(props: any) {
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
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </svg>
  );
}
