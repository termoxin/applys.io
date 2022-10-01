import { Page } from "puppeteer";
import { socket } from "./applyVacancies";

interface Options {
  category: string;
}

const getVacanciesByCategory = async (page: Page, options?: Options) => {
  let vacancies = [];

  await page.goto(`https://djinni.co/jobs/keyword-${options?.category}`);

  const elements = await page.$$(".page-item .page-link");

  if (elements) {
    // Get number of page
    const pageItems = await elements.map((element) =>
      element.evaluate((el) => el.textContent)
    );

    const resolvedPageItems = await Promise.all(pageItems);
    const numberOfPages = resolvedPageItems?.at(-2);

    // Get the array of pages for getting pages from each pagination page
    const pages = new Array(Number(numberOfPages)).fill(0).map((_, i) => i + 1);

    for await (let pageIndex of pages) {
      await page.goto(
        `https://djinni.co/jobs/keyword-${options?.category}?page=${pageIndex}`
      );

      socket.emit("apply-log", {
        error: false,
        date: new Date(),
        message: `Fetched vacancy pages ${pageIndex}/${pages.length}`,
      });

      const vacanciesElements = await page
        .$$(".list-jobs__item")
        .then((elements) => {
          return elements.map(async (element) => {
            const evaluatedElement = await element.evaluate((el) => {
              return {
                url: `https://djinni.co${el
                  .querySelector(".profile")
                  ?.getAttribute("href")}`,
                title: el.querySelector(".profile")?.textContent?.trim(),
                description: el
                  .querySelector(".list-jobs__description")
                  ?.textContent?.trim(),
                salary:
                  el.querySelector(".public-salary-item")?.textContent || "TBD",
              };
            });

            return evaluatedElement;
          });
        });

      vacancies.push(...(await Promise.all(vacanciesElements)));
    }

    return vacancies;
  }

  return { json: "Element is not found" };
};

export default getVacanciesByCategory;
