import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata;

export default function PrivateSectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
