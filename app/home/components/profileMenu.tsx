"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Image {
  url: string;
  height?: number;
  width?: number;
}

interface SpotifyResponse {
  country: string;
  display_name: string;
  email: string;
  images: Image[];
}

export default function ProfileDropdown() {
  const [userProfile, setUserProfile] = useState<SpotifyResponse | null>(null);

  useEffect(() => {
    invoke("get_user_info")
      .catch((error) => console.log(error))
      .then((user_profile) => setUserProfile(user_profile as SpotifyResponse));
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full focus-visible:ring-0 focus-visible:ring-transparent"
        >
          {/*<CircleUser className="h-5 w-5" />*/}
          <Avatar>
            <AvatarImage src={userProfile?.images[0]?.url || ""} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{userProfile?.display_name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
