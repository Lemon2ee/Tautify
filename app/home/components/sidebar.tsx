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
    <div className="grid min-h-0 gap-2 p-4 lg:gap-4 lg:p-6">
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
      <div className="overflow-y-auto min-h-0 min-w-0">
        {playlists ? (
          <div className="grid h-full overflow-y-auto scrollbar-hide items-start rounded-md border bg-zinc-900/30">
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
        ) : (
          <></>
        )}
      </div>
    </div>
  );

  // return (
  //   <div>
  //     {/* <div className="flex-1 max-h-screen">
  //       <nav className="grid items-start text-sm font-medium">
  //         {navItems.map((item, index) => (
  //           <Link
  //             key={index}
  //             href={item.href}
  //             className={`flex items-center gap-3 rounded px-3 py-2 ${
  //               item.path === "/"
  //                 ? currentPath === item.path
  //                 : currentPath.startsWith(item.path)
  //                   ? "bg-zinc-700/80 shadow text-primary"
  //                   : ""
  //             }
  //               text-muted-foreground transition-all hover:text-primary`}
  //           >
  //             {item.icon}
  //             {item.text}
  //             {item.badge}
  //           </Link>
  //         ))}
  //       </nav>
  //     </div> */}

  //     {playlists ? (
  //       // <div className="grid h-full overflow-y-auto items-start rounded-md border bg-zinc-900/30">
  //       //   {playlists.items.map(
  //       //     (playlist: CurrentUserPlaylistsResponsePlaylist, index) => (
  //       //       <Link
  //       //         key={index}
  //       //         href={"#"}
  //       //         onClick={() => handleClick(playlist.id)}
  //       //         className={`flex items-center gap-3 rounded px-3 py-2
  //       //           text-muted-foreground transition-all hover:text-primary`}
  //       //       >
  //       //         <Avatar className="!rounded-sm">
  //       //           <AvatarImage src={playlist.images?.[0]?.url || ""} />
  //       //           <AvatarFallback className="!rounded-sm">
  //       //             <ListMusic className="h-5 w-5" />
  //       //           </AvatarFallback>
  //       //         </Avatar>
  //       //         {playlist.name}
  //       //       </Link>
  //       //     )
  //       //   )}
  //       // </div>
  //       <div className="grid min-h-0">
  //         <div>First</div>
  //         <div>Second</div>
  //         <div className="overflow-y-auto min-h-0 min-w-0">
  //           Ullamcorper iaculis nisi non ac aenean. Cubilia mattis ultrices
  //           aliquam curae molestie. Senectus lobortis vehicula metus accumsan
  //           elementum lacus. Cubilia tempus eleifend aenean orci mattis pharetra
  //           Ullamcorper iaculis nisi non ac aenean. Cubilia mattis ultrices
  //           aliquam curae molestie. Senectus lobortis vehicula metus accumsan
  //           elementum lacus. Cubilia tempus eleifend aenean orci mattis
  //           pharetraUllamcorper iaculis nisi non ac aenean. Cubilia mattis
  //           ultrices aliquam curae molestie. Senectus lobortis vehicula metus
  //           accumsan elementum lacus. Cubilia tempus eleifend aenean orci mattis
  //           pharetra
  //         </div>
  //       </div>
  //     ) : (
  //       <>Loading</>
  //     )}
  //   </div>
  // );
}
