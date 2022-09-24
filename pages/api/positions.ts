import type { NextApiRequest, NextApiResponse } from "next";
import { Page, Protocol, Puppeteer } from "puppeteer";
import getVacanciesByCategory from "../../helpers/djinni/getVacanciesByCategory";

let chrome: any = {};
let puppeteer: any;
let options = {};

(async () => {
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
  } else {
    puppeteer = require("puppeteer");
  }

  options = {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--hide-scrollbars",
      "--disable-web-security",
    ],
    defaultViewport: chrome.defaultViewport,
    executablePath: await chrome.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  };
})();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let browser = await puppeteer.launch(options);

    let page: Page = await browser.newPage();

    await page.goto("https://djinni.co");

    const cookies: Protocol.Network.CookieParam[] = [
      {
        name: "sessionid",
        // should djinni user session, but for test purposes it's okay to have this
        value: process.env.TEST_DJINNI_SESSION || "",
      },
    ];

    await page.setCookie(...cookies);

    const vacancies = await getVacanciesByCategory(page, {
      category: req.query.category as string,
    });

    return res.status(200).json(vacancies);
  } catch (err) {
    console.error(err);
    return null;
  }
}
