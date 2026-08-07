// ── Çerez Politikası ────────────────────────────────────────────────────

import LegalPage from "../components/LegalPage";
import { getDb } from "../lib/server/db";
import { getLegal } from "../lib/server/content";

export const metadata = { title: "Çerez Politikası" };

export default async function CookiesPage() {
  const legal = await getLegal(await getDb());
  return <LegalPage title="Çerez Politikası" content={legal.cookies} />;
}
