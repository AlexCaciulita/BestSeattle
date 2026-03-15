import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "s1.ticketm.net" },
      { protocol: "https", hostname: "s2.ticketm.net" },
      { protocol: "https", hostname: "s3.ticketm.net" },
      { protocol: "https", hostname: "media.ticketmaster.com" },
      { protocol: "https", hostname: "*.ticketmaster.com" },
      { protocol: "https", hostname: "images.universe.com" },
    ],
  },
};

export default nextConfig;
