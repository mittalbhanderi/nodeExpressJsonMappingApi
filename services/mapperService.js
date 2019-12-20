const helperService = require("./helperService");

module.exports = {
  parseJson: parseJson,
  getIds: getIds
};

const SYNONYMS_MAPPER = {
  sport: "category",
  competitions: "event",
  matches: "subevent",
  markets: "market",
  outcomes: "bet",
  odds: "oddsDecimal"
};

const SYNONYMS_TYPE_MAPPER = {
  category: "category_name",
  event: "event_name",
  subevent: "participant_name",
  market: "market_name",
  bet: "participant_name"
};

const DELIMITERS = [" vs. "];
const NAME_MAPPING_KEYS = ["name", "sport"];

let synonyms;
let memoize = {};
let ids = [];

function getIds() { 
  return ids; 
}

function parseJson() {
  return new Promise((resolve, reject) => {
    helperService
      .readJsonAsync("synonyms.json")
      .then(data => {
        synonyms = data;
        helperService.readJsonAsync("bookmaker-feed.json").then(obj => {
          let result = {};
          let currentKey = "sport";
          try {
            mapData(obj, result, currentKey);
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
            reject(err)
            console.error("Data mapping failure");
          }
        });
      })
      .catch(err => {console.error(err); reject(err) });
  })
}

function getSynonym(item, type) {
  let mapper = null;
  if (!memoize[`${item}_${type}`]) {
    if (synonyms) {
      mapper = synonyms.find(t => t.synonyms.includes(item) && t.type == type);
    }
    if (mapper) {
      memoize[`${item}_${type}`] = mapper;
    }
  } else {
    mapper = memoize[`${item}_${type}`];
  }

  return mapper;
}

function mapData(theObject, subObject, currentKey) {
  let keys = Object.keys(theObject);
  for (let i = 0, length = keys.length; i < length; i++) {
    if (typeof theObject[keys[i]] === "string") {
      let key, value;
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
              .map(obj => {
                let mappedObj = getSynonym(obj, synonymType);
                if (mappedObj) {
                  return mappedObj["oddschecker_keyword"];
                } else {
                  return obj;
                }
              })
              .join(delimiter);
          } else {
            let mappedObj = getSynonym(theObject[keys[i]], synonymType);
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
          ids.push(value);
          subObject[key] = value;
        }
      } else {
        if (keys[i] == "odds") {
          key = "oddsDecimal";
        } else {
          key = SYNONYMS_MAPPER[currentKey] + "Id";
          ids.push(theObject[keys[i]]);
        }
        subObject[key] = theObject[keys[i]];
      }
    } else {
      if (typeof keys[i] === "string" && isNaN(keys[i])) {
        currentKey = keys[i];
        switch (currentKey) {
          case "competitions":
            subObject.events = [];
            mapData(theObject[keys[i]], subObject.events, currentKey);
            break;
          case "matches":
            subObject.subevents = [];
            mapData(theObject[keys[i]], subObject.subevents, currentKey);
            break;
          case "markets":
            subObject.markets = [];
            mapData(theObject[keys[i]], subObject.markets, currentKey);
            break;
          case "outcomes":
            subObject.bets = [];
            mapData(theObject[keys[i]], subObject.bets, currentKey);
            break;
        }
      } else {
        let obj = {};
        mapData(theObject[keys[i]], obj, currentKey);
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
