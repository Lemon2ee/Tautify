"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

const YourComponent = () => {
  const [userInfo, setUserInfo] = useState("");

  useEffect(() => {
    const unlisten = listen<string>("login_complete", (event) => {
      setUserInfo(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleLogin = async () => {
    await invoke("handle_sign_in");
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Spotify</button>
      {userInfo && (
        <div>
          <h2>User Info</h2>
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default YourComponent;
