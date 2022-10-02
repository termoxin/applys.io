import { Page } from "puppeteer";
import { getSocket } from "../../socket";

const FREE_USER_LIMIT = 50;

const wait = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

const applyVacancies = async (page: Page, message: string, vacancies: any) => {
  const socket = await getSocket();

  if (socket) {
    for await (let vacancy of vacancies.slice(0, FREE_USER_LIMIT)) {
      try {
        await wait();

        await await page.goto(vacancy.url, { waitUntil: "networkidle2" });

        const button = await page.$(".js-inbox-toggle-reply-form");
        await button?.click();

        const submitButton = await page.$("#job_apply");

        await page.waitForSelector("#message", { timeout: 3000 });

        await page.type("#message", message, { delay: 300 });

        await submitButton?.click();

        console.log(`DONE -> ${vacancy.title} applied`);
        socket.emit("apply-log", {
          error: false,
          date: new Date(),
          message: `DONE -> ${vacancy.title} applied`,
        });
      } catch (err) {
        console.log(err);
        console.log(`${vacancy.title} application failed`);

        socket.emit("apply-log", {
          error: true,
          date: new Date(),
          message: `${vacancy.title} application failed`,
        });
      }
    }
  }
};

export default applyVacancies;
