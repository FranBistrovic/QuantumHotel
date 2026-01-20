import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

type MeResponse = {
  role: string;
};

export default async function AdminLayout({
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
    `${process.env.API_INTERNAL_URL}/api/users/me`,
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

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
