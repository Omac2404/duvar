import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Telefondan LAN IP ile girildiğinde dev asset'lerinin engellenmemesi için
  allowedDevOrigins: ["192.168.111.10", "192.168.111.*"],
};

export default nextConfig;
