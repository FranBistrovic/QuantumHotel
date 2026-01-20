"use client";
import { useState, Suspense } from "react";
import React from "react"

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Lozinke se ne podudaraju.");
      return;
    }

    if (password.length < 8) {
      setMessage("Lozinka mora imati najmanje 8 znakova.");
      return;
    }

    if (!token) {
      setMessage("Nevažeći token za resetiranje.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/auth/reset-password?token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setMessage(data.message || "Lozinka je uspješno resetirana.");
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Došlo je do greške. Token je možda istekao.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("⚠️ Server nije dostupan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Nevažeći link</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Link za resetiranje lozinke nije valjan ili je istekao.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Zatraži novi link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 ">
      <Card className="w-full max-w-md bg-gradient-to-b from-white to-blue-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-black">Resetiranje lozinke</CardTitle>
          <CardDescription className="text-black">
            Unesite novu lozinku za svoj račun.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-black">
          {isSuccess ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg text-black">Lozinka uspješno resetirana</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {message}
                </p>
              </div>
              <Button asChild className="w-full login-button2">
                <Link href="/login">Prijavi se</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nova lozinka"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregrounds"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Potvrdi lozinku"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {message && !isSuccess && (
                <p className="text-sm text-destructive">{message}</p>
              )}

              <Button type="submit" className="w-full login-button2" disabled={isLoading}>
                {isLoading ? "Resetiranje..." : "Resetiraj lozinku"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Loading() {
  return null;
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-pulse text-muted-foreground">Učitavanje...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
