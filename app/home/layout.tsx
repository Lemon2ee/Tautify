import React from "react";
import Sidebar from "@/app/home/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        {children}
      </div>
    </>
  );
  // return <section>{children}</section>;
}
