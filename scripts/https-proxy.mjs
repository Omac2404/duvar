// ── HTTPS yönlendirici — telefon erişimi için ───────────────────────────
// Next dev sunucusu HTTP :3000'de çalışırken bu proxy :3001'i HTTPS
// dinler ve istekleri aynen 3000'e aktarır. Böylece masaüstü her zamanki
// http://localhost:3000 adresini kullanmaya devam eder; telefon aynı
// Wi-Fi'dan https://<bilgisayar-ip>:3001 ile girer (paylaşım/kopyalama
// gibi özellikler telefonda HTTPS ister). Sertifikalar `npm run
// dev:https`in ürettiği certificates/ klasöründen okunur.
//
// Çalıştır: node scripts/https-proxy.mjs

import https from "node:https";
import http from "node:http";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = { host: "127.0.0.1", port: 3000 };
const PORT = 3001;

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(root, "certificates", "localhost-key.pem")),
    cert: fs.readFileSync(path.join(root, "certificates", "localhost.pem")),
  },
  (req, res) => {
    const fwd = http.request(
      {
        ...TARGET,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `localhost:${TARGET.port}` },
      },
      (r) => {
        res.writeHead(r.statusCode ?? 502, r.headers);
        r.pipe(res);
      },
    );
    fwd.on("error", () => {
      res.writeHead(502);
      res.end("Dev sunucusuna ulaşılamadı (npm run dev çalışıyor mu?)");
    });
    req.pipe(fwd);
  },
);

// HMR websocket'i de aktar (canlı yenileme telefonda da çalışsın)
server.on("upgrade", (req, socket, head) => {
  const up = net.connect(TARGET.port, TARGET.host, () => {
    up.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
        Object.entries(req.headers)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\r\n") +
        "\r\n\r\n",
    );
    up.write(head);
    up.pipe(socket);
    socket.pipe(up);
  });
  up.on("error", () => socket.destroy());
  socket.on("error", () => up.destroy());
});

server.listen(PORT, () => {
  console.log(`HTTPS proxy hazır: https://localhost:${PORT} → http://localhost:${TARGET.port}`);
});
