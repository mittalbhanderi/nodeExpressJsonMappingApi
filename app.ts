import * as express from "express";
const app = express();
const HTTP_PORT = 3000;
import apiRoutes from "./routes";
import MapperService from "./services/mapperService";
import * as lodash from "lodash";
import DIContainer from "./di-container";

const mapperService = DIContainer.resolve<MapperService>(MapperService);

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * Math.floor(max));
}

app.use("/api", apiRoutes);

app.get("/", (req:any, res:any) => {
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

