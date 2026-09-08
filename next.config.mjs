/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static. Every page is prerendered at build time, so there is no
  // reason to ship a server: the build emits plain HTML/JS into out/ and Vercel
  // serves it as static files. This also removes the serverless-function
  // packaging step, which is where a build can fail without any log output.
  output: 'export',
  images: { unoptimized: true },
};
export default nextConfig;
