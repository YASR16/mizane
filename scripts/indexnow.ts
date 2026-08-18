import { articles } from "../src/content/articles";
import { intentPages } from "../src/content/intent-pages";
import { publicAppUrl } from "../src/lib/app-url";
import { submitIndexNow } from "../src/lib/indexnow";

async function main() {
  if (!process.env.INDEXNOW_KEY) {
    console.log("INDEXNOW_KEY missing — skip (do not spam IndexNow).");
    return;
  }
  const base = publicAppUrl();
  const urls = [
    `${base}/`,
    ...intentPages.map((p) => `${base}/${p.slug}`),
    ...articles.map((a) => `${base}/blog/${a.slug}`),
  ];
  const result = await submitIndexNow(urls);
  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
