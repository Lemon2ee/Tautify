"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export default function Init() {
  const router = useRouter();

  useEffect(() => {
    invoke("get_user_info")
      .then(() => router.push("/home/playlists"))
      .catch(() => router.push("/login"));
    // const unlisten = listen("login_complete", () => {
    //   router.push("/home");
    // });

    // return () => {
    //   unlisten.then((fn) => fn());
    // };
  }, [router]);

  return <>Hello</>;
}
