"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Loading from "./loading";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Nevažeći link za verifikaciju.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email uspješno verificiran! Sada se možete prijaviti.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verifikacija nije uspjela. Token je nevažeći ili je istekao.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Došlo je do greške prilikom verifikacije. Pokušajte ponovo kasnije.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-gradient-to-b from-white to-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-black">Verifikacija emaila</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-center text-black">
                Verificiramo vaš email...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-center text-black">{message}</p>
              <Button asChild className="w-full login-button2">
                <Link href="/login">Prijavi se</Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive text-red-500" />
              <p className="text-center text-black">{message}</p>
              <Button asChild variant="outline" className="w-full bg-transparent login-button2">
                <Link href="/register">Natrag na registraciju</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
