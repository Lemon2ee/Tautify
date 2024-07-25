"use client";

import Link from "next/link";
import { Disc3, Home, Package } from "lucide-react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

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
    icon: <Package className="h-4 w-4" />,
    text: "Products",
    badge: null,
    path: "/product",
  },
];
export default function Sidebar() {
  const currentPath = usePathname();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Disc3 className="h-6 w-6" />
            <span className="">Tauri-Spotify</span>
          </Link>
          {/*<Button variant="outline" size="icon" className="ml-auto h-8 w-8">*/}
          {/*  <Bell className="h-4 w-4" />*/}
          {/*  <span className="sr-only">Toggle notifications</span>*/}
          {/*</Button>*/}
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
                      ? "bg-muted text-primary"
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
          <Separator className={"mt-1"} />
        </div>
      </div>
    </div>
  );
}
