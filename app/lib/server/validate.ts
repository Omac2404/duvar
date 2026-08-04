// ── Sunucu tarafı doğrulamalar — client'taki kurallarla birebir ─────────

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function passwordIssue(pass: string): string | null {
  if (pass.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (!/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(pass) || !/\d/.test(pass))
    return "Şifre en az bir harf ve bir rakam içermeli.";
  return null;
}

export function validManifestCode(code: string): boolean {
  return /^\d{5}[A-Z]{2}$/.test(code);
}

export function bad(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}
