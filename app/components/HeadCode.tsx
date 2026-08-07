// ── Head kod enjeksiyonu — admin Ayarlar > SEO'daki serbest kod ─────────
// Search Console doğrulama meta'sı, analytics scripti gibi parçalar admin
// panelden yapıştırılır; burada meta/link/script etiketlerine ayrıştırılıp
// JSX olarak render edilir. React 19, gövdede render edilen meta/link ve
// async/src script etiketlerini otomatik olarak <head>'e taşır.

type Props = Record<string, string | boolean>;

function parseAttrs(raw: string): Props {
  const props: Props = {};
  const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const name = m[1].toLowerCase();
    const val = m[2] ?? m[3];
    if (name === "class") props.className = val ?? "";
    else props[name] = val === undefined ? true : val;
  }
  return props;
}

export default function HeadCode({ code }: { code: string }) {
  if (!code.trim()) return null;
  const nodes: React.ReactNode[] = [];
  const re =
    /<meta\s+([^>]*?)\/?>|<link\s+([^>]*?)\/?>|<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(code))) {
    if (m[1] !== undefined) {
      nodes.push(<meta key={i++} {...parseAttrs(m[1])} />);
    } else if (m[2] !== undefined) {
      nodes.push(<link key={i++} {...parseAttrs(m[2])} />);
    } else {
      const attrs = parseAttrs(m[3] ?? "");
      const body = (m[4] ?? "").trim();
      nodes.push(
        body ? (
          <script
            key={i++}
            {...attrs}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <script key={i++} {...attrs} />
        ),
      );
    }
  }
  return <>{nodes}</>;
}
