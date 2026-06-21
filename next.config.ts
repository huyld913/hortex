import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next-themes injects an inline <script> to detect the system theme before
  // hydration. React 19 strict mode throws a console error for script tags
  // inside components in dev. This is a dev-only warning — production is
  // unaffected. Disabling strict mode silences it until next-themes ships
  // a React 19-compatible fix.
  reactStrictMode: false,
};

export default nextConfig;
