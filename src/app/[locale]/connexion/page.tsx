"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Identifiants incorrects.");
    else router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Connexion</h1>
      <p className="mt-2 text-sm text-ink-soft">Accédez à vos analyses et rapports.</p>
      <Card className="mt-8 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            Mot de passe
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
            />
          </label>
          {error ? <p className="text-sm text-clay">{error}</p> : null}
          <Button className="w-full" type="submit">
            Se connecter
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-soft">
          Pas encore de compte ? <Link href="/inscription" className="text-cedar">Créer un compte</Link>
        </p>
      </Card>
    </div>
  );
}
