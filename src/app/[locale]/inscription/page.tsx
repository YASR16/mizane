"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Créer un compte</h1>
      <p className="mt-2 text-sm text-ink-soft">Uniquement e-mail, nom et langue. Rien d’autre n’est exigé.</p>
      <Card className="mt-8 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Nom
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium">
            E-mail
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium">
            Mot de passe
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5" />
          </label>
          {error ? <p className="text-sm text-clay">{error}</p> : null}
          <Button className="w-full" type="submit">
            Créer mon compte
          </Button>
        </form>
      </Card>
    </div>
  );
}
