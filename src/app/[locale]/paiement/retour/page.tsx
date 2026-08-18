"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<p className="px-4 py-24 text-center text-ink-soft">…</p>}>
      <PaymentReturnInner />
    </Suspense>
  );
}

function PaymentReturnInner() {
  const params = useSearchParams();
  const t = useTranslations("payment");
  const orderId = params.get("orderId");
  const [state, setState] = useState<"checking" | "success" | "failed" | "pending" | "forbidden" | "missing">(
    "checking",
  );
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setState("missing");
      return;
    }
    void (async () => {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (res.status === 403) {
        setState("forbidden");
        return;
      }
      if (json.status === "SUCCEEDED" && json.analysisId) {
        setAnalysisId(json.analysisId);
        setState("success");
        return;
      }
      if (json.status === "PENDING" || json.status === "REQUIRES_ACTION") {
        setState("pending");
        return;
      }
      setReason(json.reason ?? null);
      setState("failed");
    })();
  }, [orderId]);

  const title =
    state === "checking"
      ? t("checking")
      : state === "success"
        ? t("success")
        : state === "pending"
          ? t("pending")
          : state === "forbidden"
            ? t("forbidden")
            : state === "missing"
              ? t("missing")
              : t("failed");

  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <Card className="p-8 text-center">
        {state === "checking" ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-cedar" /> : null}
        <h1 className="mt-4 font-display text-3xl">{title}</h1>
        {reason ? <p className="mt-2 text-sm text-ink-soft">{reason}</p> : null}
        {state === "success" && analysisId ? (
          <Button className="mt-6" asChild>
            <Link href={`/rapport/${analysisId}`}>{t("openReport")}</Link>
          </Button>
        ) : null}
        {state === "failed" || state === "pending" ? (
          <Button className="mt-6" variant="secondary" asChild>
            <Link href="/">{t("retry")}</Link>
          </Button>
        ) : null}
      </Card>
    </div>
  );
}
