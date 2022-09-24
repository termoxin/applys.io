import { NextApiRequest, NextApiResponse } from "next";
import { Page, Protocol } from "puppeteer";
import applyVacancies from "../../helpers/djinni/applyVacancies";
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
      ...chrome.args,
      "--no-sandbox",
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

    console.log(req.body);

    const { category, message, sessionId } = JSON.parse(req.body);

    const cookies: Protocol.Network.CookieParam[] = [
      {
        name: "sessionid",
        // should djinni user session, but for test purposes it's okay to have this
        // value: process.env.TEST_DJINNI_SESSION || "",
        value: sessionId,
      },
    ];

    await page.setCookie(...cookies);

    const vacancies = await getVacanciesByCategory(page, {
      category,
    });

    await applyVacancies(page, message, vacancies);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return null;
  }
}
