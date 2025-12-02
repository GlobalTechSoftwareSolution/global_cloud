import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => [
    {
      source: '/api/contact',
      destination: 'http://hrms.globaltechsoftwaresolutions.cloud/api/accounts/contact/',
    },
  ],
};

export default nextConfig;
