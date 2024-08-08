"use client";

import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import useStore from "@/app/store";
import { listen } from "@tauri-apps/api/event";
import { tauri_store } from "@/app/store";

function WebPlayback() {
  const [token, setToken] = useState<string | null>(null);

  const spotifyPlayer = useStore((state) => state.spotifyPlayer);
  const setSpotifyPlayer = useStore((state) => state.setSpotifyPlayer);
  const setSpotifyPlayerID = useStore((state) => state.setSpotifyPlayerID);
  const setTrack = useStore((state) => state.setCurrentTrack);
  const setPaused = useStore((state) => state.setIsPaused);
  const setActive = useStore((state) => state.setIsActive);
  const setDuration = useStore((state) => state.setTrackDuration);
  const setLocation = useStore((state) => state.setTrackLocation);

  const [deviceName, setDeviceName] = useState<string>("Tautify Client");

  useEffect(() => {
    invoke("get_user_token")
      .catch((error) => console.log(error))
      .then((token) => setToken(JSON.parse(token as string)));

    invoke("get_device_name")
      .catch((error) => console.log(error))
      .then((value) => setDeviceName(value as string));
  }, []);

  useEffect(() => {
    const unlisten = listen("app_closed", () => {
      spotifyPlayer?.disconnect();
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [spotifyPlayer]);

  useEffect(() => {
    if (token) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const new_player = new window.Spotify.Player({
          name: deviceName,
          getOAuthToken: (cb) => {
            invoke("get_user_token")
              .catch((error) => console.log(error))
              .then((token) => {
                cb(JSON.parse(token as string));
              });
          },
          volume: 0.5,
          enableMediaSession: true,
        });

        setSpotifyPlayer(new_player);
      };
    }
  }, [setSpotifyPlayer, token, deviceName]);

  useEffect(() => {
    if (spotifyPlayer) {
      spotifyPlayer.addListener("ready", ({ device_id }) => {
        setSpotifyPlayerID(device_id);
        console.log("Ready with Device ID", device_id);
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      spotifyPlayer.addListener("player_state_changed", (state) => {
        if (!state) {
          console.error(
            "User is not playing music through the Web Playback SDK"
          );
          setActive(false);
          return;
        }

        console.log(state);

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        setLocation(state.position);
        setDuration(state.duration);

        spotifyPlayer.getCurrentState().then((state) => {
          !state ? setActive(false) : setActive(true);
        });
      });

      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log(
            "The Web Playback SDK successfully connected to Spotify!"
          );
        }
      });
    }
  }, [
    setActive,
    setDuration,
    setLocation,
    setPaused,
    setSpotifyPlayerID,
    setTrack,
    spotifyPlayer,
  ]);

  return <></>;
}

export default WebPlayback;
