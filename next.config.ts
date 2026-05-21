import type { NextConfig } from "next";
import { baseUrl } from "./lib/baseUrl";

const nextConfig: NextConfig = {
  /* config options here */
  assetPrefix: baseUrl,
};

export default nextConfig;
