"use client";

import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";

export default function LoginButton() {
  return (
    <Button className="w-full" onClick={(r) => invoke("handle_sign_in")}>
      Sign in
    </Button>
  );
}
