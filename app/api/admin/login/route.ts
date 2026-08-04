// ── Admin girişi — ADMIN_PASSWORD ile; cookie 7 gün geçerli ──────────────

import {
  checkAdminPassword,
  grantAdmin,
  isAdmin,
  revokeAdmin,
} from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function GET() {
  return Response.json({ ok: await isAdmin() });
}

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  if (!password || !checkAdminPassword(password)) return bad("Şifre hatalı.", 401);
  await grantAdmin();
  return Response.json({ ok: true });
}

export async function DELETE() {
  await revokeAdmin();
  return Response.json({ ok: true });
}
