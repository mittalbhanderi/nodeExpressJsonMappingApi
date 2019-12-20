const express = require("express");
const app = express();
const HTTP_PORT = 3000;
const apiRoutes = require("./routes");
const mapperService = require("./services/mapperService");
const _ = require("lodash");

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  let endPoints = ['events', 'subevents', 'markets', 'bets'];
  res.redirect(`/api/${lodash.sampleSize(endPoints)}/${lodash.sampleSize(mapperService.getIds(), getRandomInt(100) + 1).join(",")}`);
});

try {
  mapperService.parseJson().then(() => {
    console.log(mapperService.getIds());
    app.listen(HTTP_PORT, () => {
      console.log(`Feed Processing App listening on port ${HTTP_PORT}!`);
    });
  });
} catch (err) {
  console.error(`Error parsing bookmaker feed! ${err}`);
}

