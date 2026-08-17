// Generates brand icons and the social share image from on-brand SVG sources.
// Run once (and whenever the mark changes): `node scripts/gen-assets.mjs`.
// Uses the same Nocturne tokens (dark ground #161826, accent #9184d9).
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("public/assets", { recursive: true });

// --- Favicon: a Nocturne-accent rhombus (a die/gem) on the dark ground ---
const faviconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="104" fill="#161826"/>
  <path d="M256 92 L404 256 L256 420 L108 256 Z" fill="none" stroke="#9184d9" stroke-width="26" stroke-linejoin="round"/>
  <path d="M256 178 L334 256 L256 334 L178 256 Z" fill="#9184d9"/>
</svg>`;
writeFileSync("public/favicon.svg", faviconSvg);
const fav = Buffer.from(faviconSvg);
await sharp(fav).resize(32, 32).png().toFile("public/favicon-32.png");
await sharp(fav).resize(180, 180).png().toFile("public/assets/apple-touch-icon.png");
await sharp(fav).resize(192, 192).png().toFile("public/assets/icon-192.png");
await sharp(fav).resize(512, 512).png().toFile("public/assets/icon-512.png");

// --- Social share image (1200x630) ---
const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#161826"/>
      <stop offset="1" stop-color="#20213a"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="-0.05" r="0.7">
      <stop offset="0" stop-color="#2b2741"/>
      <stop offset="1" stop-color="#161826" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <path d="M1040 120 L1128 220 L1040 320 L952 220 Z" fill="none" stroke="#9184d9" stroke-width="10" stroke-linejoin="round" opacity="0.9"/>
  <path d="M1040 168 L1088 220 L1040 272 L992 220 Z" fill="#9184d9" opacity="0.9"/>
  <text x="90" y="150" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="6" fill="#9184d9">DARKTIER STUDIOS &#183; EST. 2013</text>
  <text x="84" y="300" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="100" fill="#e9e9ed">Roll initiative.</text>
  <text x="84" y="410" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="100" fill="#d2cefd">The dark tier awaits.</text>
  <text x="90" y="540" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#9397ab">Board games &#183; TTRPGs &#183; tools &#8212; darktierstudios.com</text>
</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile("public/assets/og-default.png");

console.log("Generated favicons + og-default.png");
