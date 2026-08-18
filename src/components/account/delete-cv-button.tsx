"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function DeleteCvButton({ analysisId, onDeleted }: { analysisId: string; onDeleted?: () => void }) {
  const t = useTranslations("deleteCv");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/account/cv?analysisId=${encodeURIComponent(analysisId)}`, {
      method: "DELETE",
      credentials: "include",
    });
    setBusy(false);
    if (!res.ok) {
      setError(t("error"));
      return;
    }
    setDone(true);
    setOpen(false);
    onDeleted?.();
  }

  if (done) {
    return <p className="text-sm text-cedar">{t("done")}</p>;
  }

  return (
    <div>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {t("button")}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
          <div className="max-w-md rounded-2xl bg-paper p-6">
            <p className="font-medium">{t("confirm")}</p>
            {error ? <p className="mt-2 text-sm text-clay">{error}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={confirm} disabled={busy}>
                {t("yes")}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
