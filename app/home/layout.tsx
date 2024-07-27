import React from "react";
import Sidebar from "@/app/home/components/sidebar";
import WebPlayback from "./spotify/webPlayback";
import Player from "./components/player";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-rows-[1fr_auto] min-h-0 h-full">
      <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] h-full min-h-0">
        <Sidebar />
        {children}
      </div>

      <WebPlayback />
      <Player />
    </div>
  );
}
