"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Upload, FileCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fileLimits } from "@/lib/brand";

export function CvUploader({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("upload");
  const locale = useLocale();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [jd, setJd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(-1);
  const [busy, setBusy] = useState(false);
  const steps = t.raw("steps") as string[];

  function onFile(f: File | undefined) {
    setError(null);
    if (!f) return;
    const okExt = fileLimits.extensions.some((e) => f.name.toLowerCase().endsWith(e));
    if (!okExt) {
      setError(t("formats"));
      return;
    }
    if (f.size > fileLimits.maxSizeBytes) {
      setError(`${t("max")}`);
      return;
    }
    setFile(f);
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "upload_started" }),
    });
  }

  async function submit() {
    if (!file) {
      setError(t("choose"));
      return;
    }
    setBusy(true);
    setStep(0);
    const form = new FormData();
    form.append("file", file);
    form.append("targetRole", role);
    form.append("jobDescription", jd);
    form.append("locale", locale);
    form.append("targetCountry", country);
    const timers = steps.map((_, i) => window.setTimeout(() => setStep(i), 280 * i));
    try {
      const res = await fetch("/api/analyses", { method: "POST", body: form, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analyse impossible");
      setStep(steps.length - 1);
      router.push(`/resultats/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur serveur");
      setBusy(false);
      setStep(-1);
    } finally {
      timers.forEach(clearTimeout);
    }
  }

  return (
    <Card className={compact ? "p-4 md:p-6" : "p-6 md:p-8"}>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
        className={`grid cursor-pointer place-items-center rounded-2xl border border-dashed border-cedar/30 bg-cedar-light/50 px-4 text-center ${compact ? "py-8" : "py-12"}`}
      >
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {file ? (
          <>
            <FileCheck className="h-8 w-8 text-cedar" />
            <p className="mt-3 font-medium">{file.name}</p>
            <p className="text-sm text-ink-soft">{Math.round(file.size / 1024)} Ko</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-cedar" />
            <p className={`mt-3 font-display ${compact ? "text-xl" : "text-2xl"}`}>{t("title")}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {t("or")} <span className="font-medium text-cedar">{t("choose")}</span>
            </p>
          </>
        )}
        <p className="mt-4 text-xs text-ink-soft">
          {t("formats")} · {t("max")}
        </p>
      </label>

      <div className="mt-6 grid gap-4">
        <label className="text-sm font-medium">
          {t("role")}
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder={t("rolePlaceholder")}
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
          />
        </label>
        <label className="text-sm font-medium">
          {t("country")}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
          >
            <option value="">{t("countryUnset")}</option>
            <option value="MA">Maroc</option>
            <option value="FR">France</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AE">UAE</option>
            <option value="US">United States</option>
          </select>
        </label>
        {compact ? null : (
          <label className="text-sm font-medium">
            {t("jd")}
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder={t("jdPlaceholder")}
              rows={5}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
            />
          </label>
        )}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-[#f8ebe6] px-3 py-2 text-sm text-clay" role="alert">
          {error}
        </p>
      ) : null}

      {busy ? (
        <ol className="mt-6 space-y-2 text-sm">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              {i <= step ? (
                <span className="text-cedar">✓</span>
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-soft" />
              )}
              <span className={i <= step ? "" : "text-ink-soft"}>{s}</span>
            </li>
          ))}
        </ol>
      ) : (
        <Button className="mt-6 w-full" size="lg" onClick={submit}>
          {t("submit")}
        </Button>
      )}
    </Card>
  );
}
