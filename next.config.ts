import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker/Coolify image.
  output: "standalone",
  // Synology terminates TLS and reverse-proxies to this app; trust its headers.
  poweredByHeader: false,
};

export default nextConfig;
