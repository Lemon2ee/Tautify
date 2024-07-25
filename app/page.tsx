"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function Init() {
  const router = useRouter();

  useEffect(() => {
    invoke("get_user_info")
      .then(() => router.push("/home"))
      .catch(() => router.push("/login"));
  }, [router]);

  return <>Hello</>;
}
