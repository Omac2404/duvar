// ── Gizlilik ve KVKK Aydınlatma Metni ───────────────────────────────────

import LegalPage from "../components/LegalPage";
import { getDb } from "../lib/server/db";
import { getLegal } from "../lib/server/content";

export const metadata = { title: "Gizlilik ve KVKK Aydınlatma Metni" };

export default async function PrivacyPage() {
  const legal = await getLegal(await getDb());
  return (
    <LegalPage
      title="Gizlilik ve KVKK Aydınlatma Metni"
      content={legal.privacy}
    />
  );
}
