import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const res = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const user = await res.json();

    console.log(user);

    if (user.role === "ADMIN") {
      redirect("/admin/stats");
    } else {
      redirect("/staff/reservations");
    }
  } catch (e) {
    redirect("/login");
  }
}
