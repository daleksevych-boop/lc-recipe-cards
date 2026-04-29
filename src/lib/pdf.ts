// PDF generation. Uses local puppeteer in dev, @sparticuz/chromium +
// puppeteer-core in serverless production (Vercel).

export async function renderPdfFromUrl(url: string): Promise<Buffer> {
  const isProd = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME;

  let browser: import("puppeteer").Browser | import("puppeteer-core").Browser;
  if (isProd) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    chromium.setHeadlessMode = true;
    chromium.setGraphicsMode = false;
    browser = await puppeteer.launch({
      args: [...chromium.args, "--font-render-hinting=none"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = await import("puppeteer");
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--font-render-hinting=none",
      ],
    });
  }

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.addStyleTag({
      content: `
        nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog-overlay],
        .__next-build-watcher, [id^="__next-build-"] { display: none !important; }
      `,
    });
    await page.evaluateHandle("document.fonts.ready");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
