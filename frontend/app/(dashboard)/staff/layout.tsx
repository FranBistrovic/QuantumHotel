import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

type MeResponse = {
  role: string;
};

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const jsessionid = cookieStore.get("JSESSIONID")?.value;

  if (!jsessionid) {
    redirect("/login");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
    {
      method: "GET",
      headers: {
        Cookie: `JSESSIONID=${jsessionid}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    redirect("/login");
  }

  const user: MeResponse = await res.json();

  if (!["STAFF", "ADMIN"].includes(user.role)) redirect("/");

  return <>{children}</>;
}
