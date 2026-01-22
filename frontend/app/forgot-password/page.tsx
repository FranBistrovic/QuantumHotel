"use client";
import { useState } from "react";
import React from "react"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/auth/request-reset?email=${encodeURIComponent(email)}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setMessage(data.message || "Link za resetiranje lozinke poslan je na vašu email adresu.");
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Došlo je do greške. Pokušajte ponovo.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("⚠️ Server nije dostupan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
    {isLoading && <div className="loading-bar" />}

      <Card className="w-full max-w-md bg-gradient-to-b from-white to-blue-50">
        <CardHeader className="space-y-1 text-black">
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="text-2xl font-bold">Zaboravljena lozinka</CardTitle>
          </div>
          <CardDescription>
            Unesite svoju email adresu i poslat ćemo vam link za resetiranje lozinke.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-black font-semibold text-lg">Provjerite svoju email adresu</h3>
                <p className="text-black text-sm text-muted-foreground mt-2">
                  {message}
                </p>
              </div>
              <Button asChild variant="outline" className="w-full bg-transparent text-black">
                <Link href="/login">Natrag na prijavu</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 text-black">
                <Input
                  type="email"
                  placeholder="Email adresa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {message && !isSuccess && (
                <p className="text-sm text-destructive text-black">{message}</p>
              )}

              <Button type="submit" className="w-full login-button2" disabled={isLoading}>
                {isLoading ? "Slanje..." : "Pošalji link za resetiranje"}
              </Button>

              <div className="text-center text-black">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  Natrag na prijavu
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
