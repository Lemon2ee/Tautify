"use client";

import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Track = {
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

function WebPlayback() {
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState<Track>(empty_track);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    invoke("get_user_token")
      .catch((error) => console.log(error))
      .then((token) => setToken(JSON.parse(token as string)));
  }, []);

  useEffect(() => {
    if (token) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const new_player = new window.Spotify.Player({
          name: "AAAAATautify Client Test",
          getOAuthToken: (cb) => {
            cb(token);
          },
          volume: 0.5,
          enableMediaSession: true,
        });

        setPlayer(new_player);
      };
    }
  }, [token]);

  useEffect(() => {
    if (player) {
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          console.error(
            "User is not playing music through the Web Playback SDK"
          );
          setActive(false);
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then((state) => {
          !state ? setActive(false) : setActive(true);
        });
      });

      player.connect().then((success) => {
        if (success) {
          console.log(
            "The Web Playback SDK successfully connected to Spotify!"
          );
        }
      });
    }
  }, [player]);

  return is_active ? (
    <>
      <div className="container">
        <div className="main-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current_track ? current_track.album.images[0].url : ""}
            className="now-playing__cover"
            alt=""
          />

          <button
            className="btn-spotify"
            onClick={() => {
              if (player) {
                player
                  .previousTrack()
                  .then(() => console.log("Back to previous track"));
              }
            }}
          >
            &lt;&lt;
          </button>

          <button
            className="btn-spotify"
            onClick={() => {
              if (player) {
                player.togglePlay().then(() => console.log("Toggle Play"));
              }
            }}
          >
            {is_paused ? "PLAY" : "PAUSE"}
          </button>

          <button
            className="btn-spotify"
            onClick={() => {
              if (player) {
                player.getCurrentState().then((state) => console.log(state));
              }
            }}
          >
            check
          </button>

          <button
            className="btn-spotify"
            onClick={() => {
              if (player) {
                player
                  .nextTrack()
                  .then(() => console.log("Skip to next track"));
              }
            }}
          >
            &gt;&gt;
          </button>

          <div className="now-playing__side">
            <div className="now-playing__name">
              {current_track ? current_track.name : ""}
            </div>

            <div className="now-playing__artist">
              {current_track ? current_track.artists[0].name : ""}
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>asdasd</>
  );
}

export default WebPlayback;
