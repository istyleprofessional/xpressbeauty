const puppeteer = require("puppeteer-extra");
const FileSystem = require("fs");
const axios = require("axios");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

function sleepFor(sleepDuration) {
  var now = new Date().getTime();
  while (new Date().getTime() < now + sleepDuration) {
    /* Do nothing */
  }
}

const cookies = [
  {
    name: "dwanonymous_60557644c23bbf654391d7a2f0c3d5b5",
    value: "bcQe0KaBAeKZyszvA1MjGdsAUm",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: 1700669166.466825,
    httpOnly: false,
    secure: true,
  },
  {
    name: "_pxvid",
    value: "380c6fe5-fbdf-11ed-925b-fc6cdad18ee1",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: 1716653169,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "__cq_uuid",
    value: "bcQe0KaBAeKZyszvA1MjGdsAUm",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: 1728580803.452635,
    httpOnly: false,
    secure: false,
  },
  {
    name: "QuantumMetricUserID",
    value: "0aaa61307e1087c52e33b58690ee9f7b",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: 1716664139,
    httpOnly: false,
    secure: true,
  },
  {
    name: "loginRememberMe",
    value: "false",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: 1716232071.315845,
    httpOnly: false,
    secure: true,
  },
  {
    name: "_pxhd",
    value:
      "fd93a41b5747683b9d1a57b093792ccfaeaf93f042c6f5b70e82c5646e7eb695:380c6fe5-fbdf-11ed-925b-fad5dd3c59e8",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: 1726009753.460751,
    httpOnly: false,
    secure: true,
  },
  {
    name: "dwac_ba948fb989cc8c4ca46cbdd013",
    value:
      "aYrxQe6SZ6auYkOiNyArHuHBFgunZCMMMKI%3D|dw-only|||CAD|false|US%2FCentral|true",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: true,
  },
  {
    name: "cqcid",
    value: "bcQe0KaBAeKZyszvA1MjGdsAUm",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: true,
  },
  {
    name: "cquid",
    value: "||",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: true,
  },
  {
    name: "sid",
    value: "aYrxQe6SZ6auYkOiNyArHuHBFgunZCMMMKI",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: true,
  },
  {
    name: "__cq_dnt",
    value: "0",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: true,
  },
  {
    name: "dw_dnt",
    value: "0",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: true,
  },
  {
    name: "dwsid",
    value:
      "mrqiulWC677NXpatXQIl9RLxRfAcdK8UU55mPeC0Ne1NkQe1OCVp2VHnVAkw4CKJk6YnAQwY1wAbKrswdg4JzQ==",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: -1,
    httpOnly: true,
    secure: true,
  },
  {
    name: "pxcts",
    value: "71aaf378-50c7-11ee-84c5-5ebe3e911f85",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "OptanonConsent",
    value:
      "isGpcEnabled=0&datestamp=Mon+Sep+11+2023+13%3A20%3A03+GMT-0400+(Eastern+Daylight+Time)&version=202306.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=https%3A%2F%2Fwww.cosmoprofbeauty.ca%2F&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A0%2CC0004%3A0",
    domain: "www.cosmoprofbeauty.ca",
    path: "/",
    expires: 1725988803,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "_ga_KRX40SQC5X",
    value: "GS1.1.1694452803.4.0.1694452803.0.0.0",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: 1729012803.289163,
    httpOnly: false,
    secure: false,
  },
  {
    name: "_ga",
    value: "GA1.2.464516814.1685117169",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: 1729012803.314306,
    httpOnly: false,
    secure: false,
  },
  {
    name: "_gid",
    value: "GA1.2.2123198582.1694452803",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: 1694539203,
    httpOnly: false,
    secure: false,
  },
  {
    name: "_px3",
    value:
      "18e62ac4de022ab18d6661cc13cd3e4c0771b46fc71fb1560cd5626ede3530e1:AovXVG90OGTgEYJ+qt+MLvmEY92F9LjQXe5AGZJ2Hr+RobCluEbmUFL9njKnmnwEn5u8TsG5TQ2xmfIlsjCCjw==:1000:DhQj3H8eF2KuqqnmPZSPwJl/IECUjJ93uA8CPMiST1H1YaF2zWMQI7bHrz8ckmLAgSeKACDng3uCVCCOHoZR/3rkxTe80U9taNLasmJt46lb+vUQj4spycgk+Q5GNW0+lwKCj5owr18JfoiTak7GYhpTXFL3MDXqp1hfMsqOt2GKtkNxMfu0w1J2nyI2Y+95t4j7h2QxCiJkf6w0tCY2WQ==",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: 1694453133,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "__cq_seg",
    value:
      "0~0.00!1~0.00!2~0.00!3~0.00!4~0.00!5~0.00!6~0.00!7~0.00!8~0.00!9~0.00",
    domain: ".cosmoprofbeauty.ca",
    path: "/",
    expires: 1697044803.452758,
    httpOnly: false,
    secure: false,
  },
];
// const browserURL = "http://127.0.0.1:9222";
async function prices() {
  const json = require("F:/xpress_beauty/xpress_beauty/file.json");
  try {
    const browser = await puppeteer.connect({
      browserURL,
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    const page = await browser.newPage();
    await page.setCookie(...cookies);
    for (let i = 0; i < json.length; i++) {
      if (json[i].category.includes("Hair")) {
        if (!json[i].hasOwnProperty("price")) {
          let url = `https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid=${json[i].id}`;
          await page.setBypassCSP(true);
          const res = await page.goto(url);
          const response = await res.json();
          if (response["product"]["price"]["type"] == "range") {
            json[
              i
            ].price = `$${response["product"]["price"]["min"]["sales"]["value"]}-${response["product"]["price"]["max"]["sales"]["value"]}`;
          } else if (response["product"]["price"]["type"] == "tiered") {
            json[
              i
            ].price = `$${response["product"]["price"]["tiers"][0]["price"]["sales"]["value"]}`;
          } else if (response["product"]["price"]["list"] !== null) {
            json[i].price = `$${response["product"]["price"]["list"]["value"]}`;
          } else {
            json[
              i
            ].price = `$${response["product"]["price"]["sales"]["value"]}`;
          }

          sleepFor(10000);
        }

        if (json[i].hasOwnProperty("variations")) {
          for (let j = 0; j < json[i]["variations"].length; j++) {
            if (!json[i]["variations"][j].hasOwnProperty("variation_id")) {
              let url = `https://www.cosmoprofbeauty.ca/${json[i].id}.html`;
              await page.goto(url);
              if (json[i]["variation_type"] === "Size") {
                await page.waitForSelector(
                  `[data-attr-value="Size: ${json[i]["variations"][j].variation_name}"]`
                );
                const pid = await page.$eval(
                  `[data-attr-value="Size: ${json[i]["variations"][j].variation_name}"]`,
                  (el) => el.getAttribute("data-pid")
                );
                json[i]["variations"][j].variation_id = pid;
                sleepFor(5000);
              } else {
                await page.waitForSelector(".variation-pid");
                const pid = await page.$eval(".variation-pid", (el) =>
                  el.textContent.trim()
                );
                json[i]["variations"][j].variation_id = pid;
                sleepFor(5000);
              }
            }

            if (json[i]["variations"][j].hasOwnProperty("price")) continue;
            let url = `https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-Variation?pid=${json[i]["variations"][j].variation_id}`;
            const varres = await page.goto(url);
            const varresponse = await varres.json();
            if (varresponse["product"]["price"]["type"] == "tiered") {
              json[i]["variations"][
                j
              ].price = `$${varresponse["product"]["price"]["tiers"][0]["price"]["sales"]["value"]}`;
            } else if (varresponse["product"]["price"]["list"] !== null) {
              json[i]["variations"][
                j
              ].price = `$${varresponse["product"]["price"]["list"]["value"]}`;
            } else {
              json[i]["variations"][
                j
              ].price = `$${varresponse["product"]["price"]["sales"]["value"]}`;
            }
            sleepFor(10000);
          }
        }
        console.log(json[i]);
      }
    }
    await page.close();
    await browser.close();
  } catch (error) {
    console.log(error);
    FileSystem.writeFile("file.json", JSON.stringify(json), (error) => {
      if (error) throw error;
    });
  }
  FileSystem.writeFile("file.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
}

async function brand() {
  const json = require("F:/xpress_beauty/xpress_beauty/file.json");
  const browser = await puppeteer.connect({
    browserURL,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();
  await page.setCookie(...cookies);
  try {
    for (let i = 0; i < json.length; i++) {
      try {
        if (json[i].category.includes("Hair")) {
          if (json[i].hasOwnProperty("companyName")) continue;
          const url = `https://www.cosmoprofbeauty.ca/${json[i].id}.html`;
          await page.goto(url);
          await page.waitForSelector(".pdp-brand");
          const brand = await page.evaluate(() => {
            const texts = document.querySelectorAll(".pdp-brand");
            return Array.from(texts).map((v) => v.textContent.trim());
          });
          json[i].companyName = brand[1];
          json[i].lineName = brand[0];
          delete json[i].brand;
          sleepFor(5000);
        }
      } catch (error) {
        console.log(error);
        continue;
      }
    }
    FileSystem.writeFile("file.json", JSON.stringify(json), (error) => {
      if (error) throw error;
    });
    await page.close();
    await browser.close();
  } catch (error) {
    await page.close();
    await browser.close();
    console.log(error);
    FileSystem.writeFile("file.json", JSON.stringify(json), (error) => {
      if (error) throw error;
    });
  }
}

async function getToolsImages() {
  const json = require("F:/xpress_beauty/xpress_beauty/file.json");
  const browser = await puppeteer.connect({
    browserURL,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();
  await page.setCookie(...cookies);
  try {
    for (let i = 0; i < json.length; i++) {
      if (
        json[i].category.includes("Trimmer") ||
        json[i].category.includes("Clipper")
      ) {
        await page.goto("https://shopempire.ca/");
        await page.waitForSelector(".search-bar__input");
        await page.type(".search-bar__input", json[i].product_name);
        await page.keyboard.press("Enter");
        try {
          await page.waitForSelector(".product-item__image-wrapper");
          const a = await page.$eval(".product-item__image-wrapper", (el) =>
            el.getAttribute("href")
          );
          await page.goto(`https://shopempire.ca${a}`);
        } catch (error) {
          await page.goto("https://empirebarber.ca/");
          await page.waitForSelector(".search-bar__input");
          await page.type(".search-bar__input", json[i].product_name);
          await page.keyboard.press("Enter");
          await page.waitForSelector(".product-item__image-wrapper");
          const a = await page.$eval(".product-item__image-wrapper", (el) =>
            el.getAttribute("href")
          );
          await page.goto(`https://empirebarber.ca${a}`);
        }

        await page.waitForSelector(".product-gallery__image");
        const image = await page.$eval(".product-gallery__image", (el) =>
          el.getAttribute("data-zoom")
        );
        //download image
        const viewSource = await page.goto(`https:${image}`);
        // create a folder if it doesn't exist yet
        if (
          !FileSystem.existsSync(
            `F:/xpress_beauty/xpress_beauty/products-images-2/${json[
              i
            ].product_name
              .replace(/[^a-zA-Z ]/g, "")
              .replace(/ /g, "")}`
          )
        ) {
          FileSystem.mkdirSync(
            `F:/xpress_beauty/xpress_beauty/products-images-2/${json[
              i
            ].product_name
              .replace(/[^a-zA-Z ]/g, "")
              .replace(/ /g, "")}`,
            { recursive: true }
          );
        }

        FileSystem.writeFile(
          `F:/xpress_beauty/xpress_beauty/products-images-2/${json[
            i
          ].product_name
            .replace(/[^a-zA-Z ]/g, "")
            .replace(/ /g, "")}/${json[i].product_name
            .replace(/[^a-zA-Z ]/g, "")
            .replace(/ /g, "")}.webp`,
          await viewSource.buffer(),
          function (err) {
            if (err) {
              return console.log(err);
            }
            console.log("The file was saved!");
          }
        );
        sleepFor(5000);
        console.log(json[i].category);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function cleanupToolsImages() {
  const json = require("F:/xpress_beauty/xpress_beauty/file.json");
  for (let i = 0; i < json.length; i++) {
    if (
      json[i].category.includes("Trimmer") ||
      json[i].category.includes("Clipper")
    ) {
      if (
        FileSystem.existsSync(
          `F:/xpress_beauty/xpress_beauty/products-images-2/${json[
            i
          ].product_name
            .replace(/[^a-zA-Z ]/g, "")
            .replace(/ /g, "")}`
        )
      ) {
        delete json[i].data_widths;
        json[i].imgs = [];
        json[i].imgs.push(
          `/products-images-2/${json[i].product_name
            .replace(/[^a-zA-Z ]/g, "")
            .replace(/ /g, "")}/${json[i].product_name
            .replace(/[^a-zA-Z ]/g, "")
            .replace(/ /g, "")}.webp`
        );
      }
    }
  }
  FileSystem.writeFile("file-2.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
}

function deleteAllWholeSalePrice() {
  const json = require("F:/xpress_beauty/xpress_beauty/file-2.json");
  for (let i = 0; i < json.length; i++) {
    if (
      json[i].hasOwnProperty("wholesale_price") ||
      json[i].hasOwnProperty("wholesale_sale_price")
    ) {
      delete json[i].wholesale_sale_price;
      delete json[i].wholesale_price;
    }
  }
  FileSystem.writeFile("file-3.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
}

function createUrlForEachProductByProductNameWithRegex() {
  const json = require("./backups/product-data-4.json");
  for (let i = 0; i < json.length; i++) {
    let url = json[i].product_name
      .replace(/[^a-zA-Z ]/g, "")
      .replace(/ /g, "-");
    json[i].perfix = url.toLowerCase();
  }
  FileSystem.writeFile("file-4.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
}

function generateRandomNumber() {
  // Generate a random number between 0 and 1
  const randomFraction = Math.random();

  // Scale the random fraction to the desired range (10,000 to 50,000)
  const min = 10000;
  const max = 30000;
  const randomNumber = Math.floor(randomFraction * (max - min + 1)) + min;

  return randomNumber;
}

async function getQuantityonHand() {
  const json = require("./backups/file-7.json");

  for (let i = 0; i < json.length; i++) {
    if (json[i].categories.join(",").includes("Hair")) {
      if (
        json[i].hasOwnProperty("variations") &&
        json[i].variations.length > 0
      ) {
        // let url = `https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-AvailabilityJson?pids=${json[i].id}&page=pdp`;
        let url = "https://www.cosmoprofbeauty.ca/";
        // will do axios request to that url and get the cookie from the response

        try {
          const reqCookie = await axios.get(url, {
            headers: {
              
          });
          const cookie = reqCookie.headers["set-cookie"];

          console.log(cookie);
          const newCookie = [];
          for (const cookieItem of cookie) {
            if (!cookieItem.includes("comment")) {
              newCookie.push(cookieItem);
            }
          }
          // console.log(cookie.join(";"));
          // will set the cookie array to the next axios request
          const responseAxios = await axios.get(
            `https://www.cosmoprofbeauty.ca/on/demandware.store/Sites-CosmoProf-CA-Site/default/Product-AvailabilityJson?pids=${json[i].id}&page=pdp`,
            {
              headers: {
                accept: "application/json",
                "access-control-allow-credentials": "true",
                "access-control-allow-origin": "https://www.cosmoprofbeauty.ca",
                "Accept-Encoding": "gzip, compress, deflate, br",
                "Content-Length": "0",
                "Content-Type": "application/json",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.69",
                "Sec-Ch-Ua":
                  '"Chromium";v="94", "Microsoft Edge";v="94", ";Not A Brand";v="99"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": "Windows",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                Cookie: newCookie.join(";"),
              },
            }
          );
          console.log(responseAxios.data);
          // if (
          //   responseAxios.data.productVariant &&
          //   responseAxios.data.productVariant.length > 0
          // ) {
          //   for (product of responseAxios.data.productVariant) {
          //     const quantity = product.availability.estimatedQty;
          //     const data = {
          //       secret: "myTotallySecretKey",
          //       id: json[i].perfix,
          //       variation_id: product.id,
          //       quantity: quantity,
          //       isVariation: true,
          //     };
          //     await axios.put(
          //       "https://xpressbeauty.ca/api/products/update/",
          //       data
          //     );
          //   }
          //   sleepFor(generateRandomNumber());
          // } else {
          //   const data = {
          //     secret: "myTotallySecretKey",
          //     id: json[i].perfix,
          //     quantity:
          //       responseAxios.data.products[0].availability.estimatedQty,
          //     isVariation: false,
          //   };
          //   await axios.put(
          //     "https://xpressbeauty.ca/api/products/update/",
          //     data
          //   );
          // }
          // sleepFor(generateRandomNumber());
          // console.log(responseAxios.data);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
}

getQuantityonHand();
