import HelperService from "./helperService";
const helperService = new HelperService();

// module.exports = {
//   parseJson: parseJson,
//   getIds: getIds
// };

const SYNONYMS_MAPPER: { [key: string]: string } = {
  sport: "category",
  competitions: "event",
  matches: "subevent",
  markets: "market",
  outcomes: "bet",
  odds: "oddsDecimal"
};

const SYNONYMS_TYPE_MAPPER: { [key: string]: string } = {
  category: "category_name",
  event: "event_name",
  subevent: "participant_name",
  market: "market_name",
  bet: "participant_name"
};

const DELIMITERS: Array<string> = [" vs. "];
const NAME_MAPPING_KEYS: Array<string> = ["name", "sport"];

export default class MapperService {
  synonyms: any;
  memoize: any = {};
  ids: Array<number> = [];

  getIds(): Array<number> {
    return this.ids;
  }

  parseJson() {
    return new Promise((resolve, reject) => {
      helperService
        .readJsonAsync("synonyms.json")
        .then(data => {
          this.synonyms = data;
          helperService.readJsonAsync("bookmaker-feed.json").then(obj => {
            let result = {};
            let currentKey = "sport";
            try {
              this.mapData(obj, result, currentKey);
              helperService.cacheFeedData("oddschecker.json", result);
              helperService
                .writeJsonAsync("oddschecker.json", result)
                .then(status => {
                  if (status) {
                    console.info("Data mapping success!");
                    resolve(true);
                  } else {
                    reject(new Error("Data mapping failure"));
                    console.error("Data mapping failure");
                  }
                });
            } catch (err) {
              console.error(err);
              reject(err);
              console.error("Data mapping failure");
            }
          });
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }

  getSynonym(item: string, type: string) {
    let mapper = null;
    if (!this.memoize[`${item}_${type}`]) {
      if (this.synonyms) {
        mapper = this.synonyms.find(
          (t: any) => t.synonyms.includes(item) && t.type == type
        );
      }
      if (mapper) {
        this.memoize[`${item}_${type}`] = mapper;
      }
    } else {
      mapper = this.memoize[`${item}_${type}`];
    }

    return mapper;
  }

  mapData(theObject: any, subObject: any, currentKey: string) {
    let keys = Object.keys(theObject);
    for (let i = 0, length = keys.length; i < length; i++) {
      if (typeof theObject[keys[i]] === "string") {
        let key: string, value: number;
        let synonymType = SYNONYMS_TYPE_MAPPER[SYNONYMS_MAPPER[currentKey]];
        if (NAME_MAPPING_KEYS.includes(keys[i])) {
          key = SYNONYMS_MAPPER[currentKey] + "Name";
          if (synonymType) {
            let delimiter = DELIMITERS.find(
              t => theObject[keys[i]].indexOf(t) >= 0
            );
            if (delimiter) {
              value = theObject[keys[i]]
                .split(delimiter)
                .map((obj: any) => {
                  let mappedObj = this.getSynonym(obj, synonymType);
                  if (mappedObj) {
                    return mappedObj["oddschecker_keyword"];
                  } else {
                    return obj;
                  }
                })
                .join(delimiter);
            } else {
              let mappedObj = this.getSynonym(theObject[keys[i]], synonymType);
              if (mappedObj) {
                value = mappedObj["oddschecker_keyword"];
              } else {
                value = theObject[keys[i]];
              }
            }
          } else {
            value = theObject[keys[i]];
          }

          subObject[key] = value;

          if (!theObject.hasOwnProperty("id")) {
            key = SYNONYMS_MAPPER[currentKey] + "Id";
            value = helperService.generateId();
            this.ids.push(value);
            subObject[key] = value;
          }
        } else {
          if (keys[i] == "odds") {
            key = "oddsDecimal";
          } else {
            key = SYNONYMS_MAPPER[currentKey] + "Id";
            this.ids.push(theObject[keys[i]]);
          }
          subObject[key] = theObject[keys[i]];
        }
      } else {
        if (typeof keys[i] === "string" && isNaN(parseInt(keys[i], 10))) {
          currentKey = keys[i];
          switch (currentKey) {
            case "competitions":
              subObject.events = [];
              this.mapData(theObject[keys[i]], subObject.events, currentKey);
              break;
            case "matches":
              subObject.subevents = [];
              this.mapData(theObject[keys[i]], subObject.subevents, currentKey);
              break;
            case "markets":
              subObject.markets = [];
              this.mapData(theObject[keys[i]], subObject.markets, currentKey);
              break;
            case "outcomes":
              subObject.bets = [];
              this.mapData(theObject[keys[i]], subObject.bets, currentKey);
              break;
          }
        } else {
          let obj = {};
          this.mapData(theObject[keys[i]], obj, currentKey);
          switch (currentKey) {
            case "competitions":
              subObject.push(obj);
              break;
            case "matches":
              subObject.push(obj);
              break;
            case "markets":
              subObject.push(obj);
              break;
            case "outcomes":
              subObject.push(obj);
              break;
          }
        }
      }
    }
  }
}
