require("dotenv").config();
const searchConsole = require("@googleapis/searchconsole");
console.log(process.env.CLIENT_EMAIL);
const auth = new searchConsole.auth.GoogleAuth({
  credentials: {
    private_key: process.env.PRIVATE_KEY.replaceAll("\\n", "\n"),
    client_email: process.env.CLIENT_EMAIL,
  },
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

const client = searchConsole.searchconsole({
  version: "v1",
  auth,
});

client.searchanalytics
  .query({
    siteUrl: "https://xpressbeauty.ca",
    startDate: "2023-09-01",
    endDate: "2023-09-05",
  })
  .then((response) => console.log(response.data))
  .catch((reason) => console.log(reason));
