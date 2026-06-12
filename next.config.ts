import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /@metamask\/sdk/, message: /@react-native-async-storage\/async-storage/ },
      { module: /pino/, message: /pino-pretty/ }
    ];
    return config;
  }
};

export default nextConfig;
