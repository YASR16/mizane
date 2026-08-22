import { noindexMetadata } from "@/lib/seo";

export const metadata = {
  ...noindexMetadata,
  title: "Retour bêta — Mizane",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
