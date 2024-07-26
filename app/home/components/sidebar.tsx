"use client";

import Link from "next/link";
import { ListMusic, Home, UserRoundCog } from "lucide-react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CurrentUserPlaylistsResponse,
  CurrentUserPlaylistsResponsePlaylist,
} from "@/app/types/playlists";
import useStore from "@/app/store";

const navItems = [
  {
    href: "#",
    icon: <Home className="h-4 w-4" />,
    text: "Home",
    badge: null,
    path: "/home",
  },
  {
    href: "#",
    icon: <UserRoundCog className="h-4 w-4" />,
    text: "Profile",
    badge: null,
    path: "/profile",
  },
];

export default function Sidebar() {
  const currentPath = usePathname();
  const [playlists, setPlaylists] =
    useState<CurrentUserPlaylistsResponse | null>(null);

  const setSelectedPlaylist = useStore((state) => state.setSelectedPlaylistID);

  const handleClick = (playlist: string) => {
    setSelectedPlaylist(playlist);
  };

  useEffect(() => {
    invoke("get_user_playlists")
      .catch((error) => console.log(error))
      .then((user_profile) =>
        setPlaylists(user_profile as CurrentUserPlaylistsResponse)
      );
  }, []);

  return (
    <div className="hidden md:block">
      <div className="flex h-full max-h-screen flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Disc3 className="h-6 w-6" />
            <span className="">Tauri-Spotify</span>
          </Link>
        </div> */}

        <div className="flex-1">
          <nav className="grid items-start text-sm font-medium">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 ${
                  item.path === "/"
                    ? currentPath === item.path
                    : currentPath.startsWith(item.path)
                      ? "bg-zinc-700/80 shadow text-primary"
                      : ""
                }
                text-muted-foreground transition-all hover:text-primary`}
              >
                {item.icon}
                {item.text}
                {item.badge}
              </Link>
            ))}
          </nav>
        </div>

        <ScrollArea className="rounded-md h-full border bg-zinc-900/30">
          {playlists ? (
            <>
              <div className="grid grid-cols-1 items-start">
                {playlists.items.map(
                  (playlist: CurrentUserPlaylistsResponsePlaylist, index) => (
                    <Link
                      key={index}
                      href={"#"}
                      onClick={() => handleClick(playlist.id)}
                      className={`flex items-center gap-3 rounded px-3 py-2
                  text-muted-foreground transition-all hover:text-primary`}
                    >
                      <Avatar className="!rounded-sm">
                        <AvatarImage src={playlist.images?.[0]?.url || ""} />
                        <AvatarFallback className="!rounded-sm">
                          <ListMusic className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      {playlist.name}
                    </Link>
                  )
                )}
              </div>
            </>
          ) : (
            <>Loading</>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
