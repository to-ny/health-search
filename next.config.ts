import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old ID-only routes to new slug routes (default to NL)
      // The page component will then redirect to the proper slug URL
      { source: '/vtm/:code', destination: '/nl/substances/:code', permanent: true },
      { source: '/vmp/:code', destination: '/nl/generics/:code', permanent: true },
      { source: '/amp/:code', destination: '/nl/medications/:code', permanent: true },
      { source: '/ampp/:code', destination: '/nl/packages/:code', permanent: true },
      { source: '/company/:code', destination: '/nl/companies/:code', permanent: true },
      { source: '/vmp-group/:code', destination: '/nl/therapeutic-groups/:code', permanent: true },
      { source: '/atc/:code', destination: '/nl/classifications/:code', permanent: true },
      { source: '/chapter-iv/:chapter/:paragraph', destination: '/nl/chapter-iv/:chapter/:paragraph', permanent: true },
      { source: '/search', destination: '/nl/search', permanent: true },
    ];
  },
};

export default nextConfig;
