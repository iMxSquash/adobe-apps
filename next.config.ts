import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      ...(supabaseUrl
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(supabaseUrl).hostname,
              pathname: "/storage/v1/object/public/artworks/**",
            },
          ]
        : []),
    ],
  },
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
