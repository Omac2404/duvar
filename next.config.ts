import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Telefondan LAN IP ile girildiğinde dev asset'lerinin engellenmemesi için
  allowedDevOrigins: ["192.168.1.11", "192.168.1.*"],
};

export default nextConfig;
