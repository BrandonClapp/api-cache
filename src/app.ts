import puppeteer from "puppeteer";
import fs from "fs/promises";

async function start() {
  const url = "https://app.shtarko.com/login/sso";
  const gw = "/graphql/query";

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--start-fullscreen"],
    });

    const page = await browser.newPage();
    page.setViewport({ width: 1920, height: 1080 });

    page.on("response", async (response) => {
      // Get the request
      const req = response.request();

      if (req.url().includes(gw)) {
        // Avoid processing pre-flight requests
        if (req.method() !== "POST") {
          return;
        }

        // Avoid processing failed responses
        if (!response.ok()) {
          return;
        }

        const postedJson = JSON.parse(req.postData() || "");
        const operationName = postedJson.operationName;

        try {
          const responseJson = await response.json();
          const content = JSON.stringify(responseJson);

          // Write response json to ${operationName}.json
          await fs.writeFile(
            `${__dirname}/../gql/${operationName}.json`,
            content,
            {
              flag: "w+",
            }
          );
        } catch (e) {
          console.log("Error handling response", e);
        }
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });
  } catch (e) {
    console.error("error", e);
  }
}

start();
