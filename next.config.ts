import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => [
    {
      source: '/api/contact',
      destination: `${process.env.NEXT_PUBLIC_API_URL}contact/`,
    },
  ],
};

export default nextConfig;
