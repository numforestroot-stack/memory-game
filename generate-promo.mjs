import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'promo-card.html');
const outputPath = path.join(__dirname, 'promo-card.png');

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.goto(`file://${htmlPath}`);
await page.screenshot({ path: outputPath, type: 'png' });
await browser.close();

console.log(`Promo image saved to: ${outputPath}`);
