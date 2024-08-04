"use client"

import { useRef, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Dot } from 'lucide-react';
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import useStore, { tauri_store } from "../../store";

interface Image {
  url: string;
  height?: number;
  width?: number;
}

interface Followers {
  total: number;
}

interface SpotifyUserProfile {
  country: string;
  display_name: string;
  email: string;
  images: Image[];
  followers: Followers;
}


export default function Content() {
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const defaultVolume = useStore((state) => state.defaultVolume);
  const setDefaultVolume = useStore((state) => state.setDefaultVolume);

  const [configVolume, setConfigVolume] = useState<number>(defaultVolume * 100);

  useEffect(() => {
    setConfigVolume(defaultVolume * 100);
  }, [defaultVolume]);

  const handleConfigVolumeChange = (newValue: number) => {
    setConfigVolume(newValue);
  };

  const handleConfigVolumeCommit = async (newValue: number) => {
    await tauri_store.set('defaultVolume', newValue / 100);
    setDefaultVolume(newValue / 100);
  };

  const [userProfile, setUserProfile] =
    useState<SpotifyUserProfile | null>(null);

  useEffect(() => {
    invoke("get_user_info")
      .catch((error) => console.log(error))
      .then((user_profile) =>
        setUserProfile(user_profile as SpotifyUserProfile)
      );
  }, []);

  return (
    // flex row for playlist details
    <div className="grid min-h-0 gap-2 lg:gap-4 p-3">
      <div className="overflow-y-auto rounded-sm scrollbar-hide bg-zinc-700/30" ref={scrollableContainerRef}>
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="grid-flow-col gap-8 inline-grid">
            <Avatar className="h-40 w-40">
              <AvatarImage src={userProfile?.images?.[1]?.url || ""} className="object-cover h-full w-full" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid min-h-0 gap-2">
              <span className="text-zinc-300">Profile</span>
              <span className="text-5xl font-bold ">{userProfile?.display_name}</span>
              <span className="text-zinc-300">Region: {userProfile?.country} <Dot className="inline-block" /> Followers: {userProfile?.followers?.total}</span>
            </div>
          </div>

          <div className="py-8">
            <span className="text-2xl text-bold">
              Settings
            </span>

            <div className="grid pt-8 gap-2">
              <span className="font-semibold">
                Playback
              </span>

              <div className="flex justify-between">
                <span className="text-zinc-300">
                  Default Volume
                </span>
                <div className="w-40 flex gap-4">
                  {configVolume}
                  <Slider className="max-w-40" value={[configVolume]} onValueChange={(e) => handleConfigVolumeChange(e[0])} onValueCommit={(e) => handleConfigVolumeCommit(e[0])} max={100} step={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
