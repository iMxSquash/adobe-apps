import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Condition d'existence de ces apps : elles vivent en iframe dans le
          // portfolio (elwen.dev). Ne jamais retirer, ne jamais ajouter X-Frame-Options.
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://elwen.dev https://www.elwen.dev",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
