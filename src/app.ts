const puppeteer = require("puppeteer");

async function start() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://app.shtarko.com");
}

start();
