"use client";

import Link from "next/link";
import { Disc3, Home, UserRoundCog } from "lucide-react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <div className="hidden md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Disc3 className="h-6 w-6" />
            <span className="">Tauri-Spotify</span>
          </Link>
        </div>

        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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

        <ScrollArea className="rounded-md h-full border m-2 p-2 lg:m-4 bg-zinc-900/30">
            Jokester began sneaking into the castle in the middle of the night
            and leaving jokes all over the place: under the king's pillow, in
            his soup, even in the royal toilet. The king was furious, but he
            couldn't seem to stop Jokester. And then, one day, the people of the
            kingdom discovered that the jokes left by Jokester were so funny
            that they couldn't help but laugh. And once they started laughing,
            they couldn't stop. Jokester began sneaking into the castle in the
            middle of the night and leaving jokes all over the place: under the
            king's pillow, in his soup, even in the royal toilet. The king was
            furious, but he couldn't seem to stop Jokester. And then, one day,
            the people of the kingdom discovered that the jokes left by Jokester
            were so funny that they couldn't help but laugh. And once they
            started laughing, they couldn't stop.Jokester began sneaking into
            the castle in the middle of the night and leaving jokes all over the
            place: under the king's pillow, in his soup, even in the royal
            toilet. The king was furious, but he couldn't seem to stop Jokester.
            And then, one day, the people of the kingdom discovered that the
            jokes left by Jokester were so funny that they couldn't help but
            laugh. And once they started laughing, they couldn't stop.Jokester
            began sneaking into the castle in the middle of the night and
            leaving jokes all over the place: under the king's pillow, in his
            soup, even in the royal toilet. The king was furious, but he
            couldn't seem to stop Jokester. And then, one day, the people of the
            kingdom discovered that the jokes left by Jokester were so funny
            that they couldn't help but laugh. And once they started laughing,
            they couldn't stop.
          </ScrollArea>
      </div>
    </div>
  );
}
