const puppeteer = require("puppeteer");
const FileSystem = require("fs");

function sleepFor(sleepDuration) {
  var now = new Date().getTime();
  while (new Date().getTime() < now + sleepDuration) {
    /* Do nothing */
  }
}

const cookies = [
  {
    name: "secure_customer_sig",
    value: "",
    domain: "www.shopempire.ca",
    path: "/",
    expires: 1722180192.319418,
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  },
  {
    name: "localization",
    value: "CA",
    domain: "www.shopempire.ca",
    path: "/",
    expires: 1722180192.174716,
    httpOnly: false,
    secure: false,
  },
  {
    name: "cart_currency",
    value: "CAD",
    domain: "www.shopempire.ca",
    path: "/",
    expires: 1691767392.319439,
    httpOnly: false,
    secure: false,
  },
  {
    name: "_cmp_a",
    value:
      "%7B%22purposes%22%3A%7B%22a%22%3Atrue%2C%22p%22%3Atrue%2C%22m%22%3Atrue%2C%22t%22%3Atrue%7D%2C%22display_banner%22%3Afalse%2C%22merchant_geo%22%3A%22CA%22%2C%22sale_of_data_region%22%3Afalse%7D",
    domain: ".shopempire.ca",
    path: "/",
    expires: 1690644192.319457,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "_y",
    value: "ef081904-9005-47f8-9bf8-05df63d50ea9",
    domain: ".shopempire.ca",
    path: "/",
    expires: 1722093792.319479,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "_shopify_y",
    value: "ef081904-9005-47f8-9bf8-05df63d50ea9",
    domain: ".shopempire.ca",
    path: "/",
    expires: 1722093792.319514,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "_orig_referrer",
    value: "",
    domain: ".shopempire.ca",
    path: "/",
    expires: 1691767390.072767,
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "_landing_page",
    value: "%2Fproducts%2Ffx787g%3F_pos%3D1%26_sid%3Dc29519d2d%26_ss%3Dr",
    domain: ".shopempire.ca",
    path: "/",
    expires: 1691767390.072797,
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  },
  {
    name: "_ga",
    value: "GA1.1.980364397.1690557791",
    domain: ".shopempire.ca",
    path: "/",
    expires: 1725117790.679639,
    httpOnly: false,
    secure: false,
  },
  {
    name: "_ga_THRL3ZL2BG",
    value: "GS1.1.1690557790.1.0.1690557790.0.0.0",
    domain: ".shopempire.ca",
    path: "/",
    expires: 1725117790.683715,
    httpOnly: false,
    secure: false,
  },
  {
    name: "_fbp",
    value: "fb.1.1690557790813.322284330",
    domain: ".shopempire.ca",
    path: "/",
    expires: 1698333791,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
];
const browserURL = "http://127.0.0.1:9222";
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

createUrlForEachProductByProductNameWithRegex();
