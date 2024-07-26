import React from "react";
import Sidebar from "@/app/home/components/sidebar";
import WebPlayback from "./spotify/webPlayback";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <WebPlayback />
        <div className="flex flex-col overflow-hidden gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col flex-1 overflow-y-auto items-start rounded-md border bg-zinc-900/30">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
