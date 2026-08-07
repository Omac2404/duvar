// ── Kullanım Koşulları ──────────────────────────────────────────────────

import LegalPage from "../components/LegalPage";
import { getDb } from "../lib/server/db";
import { getLegal } from "../lib/server/content";

export const metadata = { title: "Kullanım Koşulları" };

export default async function TermsPage() {
  const legal = await getLegal(await getDb());
  return <LegalPage title="Kullanım Koşulları" content={legal.terms} />;
}
