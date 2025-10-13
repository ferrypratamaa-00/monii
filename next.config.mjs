// next.config.mjs
import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { allowedOrigins: ["*"] }, // sesuaikan kebutuhan
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // runtimeCaching bisa ditambah jika perlu kontrol cache lebih rinci
})(nextConfig);
