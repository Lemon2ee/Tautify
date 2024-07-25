"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginButton from "@/app/login/loginButton";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useRouter } from "next/navigation";

export default function LoginPop() {
  const router = useRouter();

  useEffect(() => {
    const unlisten = listen("login_complete", () => {
      router.push("/home");
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [router]);

  return (
    <Card className="w-full max-w-sm m-auto">
      <CardHeader>
        <CardTitle className="text-2xl centered">Login</CardTitle>
        <CardDescription>
          Click the button below to open Spotify login page.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <LoginButton />
      </CardFooter>
    </Card>
  );
}
