import { publicAppUrl } from "@/lib/app-url";

export async function submitIndexNow(urls: string[]) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || urls.length === 0) return { ok: false as const, reason: "disabled" as const };
  const host = new URL(publicAppUrl()).host;
  const unique = [...new Set(urls)].slice(0, 20);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${publicAppUrl()}/indexnow.txt`,
      urlList: unique,
    }),
  });
  return { ok: res.ok, status: res.status };
}
