"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {};

  const handleGoogle = async () => {};

  return (
    <div className="min-h-dvh bg-background text-foreground p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">
            ← Back to terminal
          </Link>
          <h1 className="mt-4 text-2xl font-display font-bold tracking-tighter">
            FUEL_QUANT.VN <span className="text-primary">/ ACCESS</span>
          </h1>
          <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
            {mode === "signin" ? "Authenticate operator" : "Provision new credentials"}
          </p>
        </div>

        <div className="bg-card border border-border p-6 scan-line">
          <div className="flex border border-border mb-6 text-xs uppercase tracking-widest">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 transition-colors ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 transition-colors ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="font-mono"
              />
              {mode === "signup" && (
                <p className="text-[10px] text-muted-foreground">Min 8 characters. New accounts start at FREE tier.</p>
              )}
            </div>
            <Button type="submit" disabled={busy} className="w-full uppercase tracking-widest text-xs">
              {busy ? "Processing..." : mode === "signin" ? "Authenticate" : "Provision Account"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full uppercase tracking-widest text-xs"
          >
            Continue with Google
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-1 text-[10px] uppercase tracking-widest text-center">
          <div className="border border-border bg-card/40 p-3">
            <div className="text-muted-foreground">Tier</div>
            <div className="text-foreground mt-1">Free</div>
          </div>
          <div className="border border-border bg-card/40 p-3">
            <div className="text-muted-foreground">Tier</div>
            <div className="text-accent mt-1">Pre</div>
          </div>
          <div className="border border-border bg-card/40 p-3">
            <div className="text-muted-foreground">Tier</div>
            <div className="text-primary mt-1">Pre+</div>
          </div>
        </div>
      </div>
    </div>
  );
}
