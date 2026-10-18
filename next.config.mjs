/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets you test the dev server from a phone on the same Wi-Fi (dev only)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};
export default nextConfig;
