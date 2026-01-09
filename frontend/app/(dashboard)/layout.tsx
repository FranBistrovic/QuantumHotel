"use client";

import React from "react";
import "./globals.css";
import { DashboardLayout } from "../components/DashboardLayout";
import { usePathname } from "next/navigation";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStaff = pathname.startsWith("/staff");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      <DashboardLayout isStaff={isStaff}>
        <div
          style={{
            height: "100vh",
            overflowY: "auto",
            width: "100%",
            padding: "0",
          }}
        >
          {children}
        </div>
      </DashboardLayout>
    </div>
  );
}
