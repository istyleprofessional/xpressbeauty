import axios from "axios";
import * as puppeteer from "puppeteer";

export const cosmoLogin = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.goto(`https://www.cosmoprofbeauty.ca/login/`);
  const f = await page.$('input[name="csrf_token"]');
  const crfToken = await f?.evaluate((el) => {
    // const cs = el.getAttribute("value");
    // console.log(cs);
    return el.getAttribute("value");
  });
  console.log(crfToken);

  await browser.close();
  const form = {
    loginEmail: "Royalschoolhairdressing@gmail.com",
    loginPassword: "Royal@234",
    csrf_token: crfToken,
  };
  if (!crfToken) return console.log("no crfToken");
  const response = await axios.post(
    "https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Account-Login?rurl=1",
    form,
    {
      headers: {
        Authority: "www.cosmoprofbeauty.ca",
        scheme: "https",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  );
  console.log(response.data);
  const cookie = response.headers["set-cookie"];
  return cookie;
};
