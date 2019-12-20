"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var helperService_1 = __importDefault(require("./helperService"));
exports.default = {
    parseJson: parseJson,
    getIds: getIds
};
var SYNONYMS_MAPPER = {
    sport: "category",
    competitions: "event",
    matches: "subevent",
    markets: "market",
    outcomes: "bet",
    odds: "oddsDecimal"
};
var SYNONYMS_TYPE_MAPPER = {
    category: "category_name",
    event: "event_name",
    subevent: "participant_name",
    market: "market_name",
    bet: "participant_name"
};
var DELIMITERS = [" vs. "];
var NAME_MAPPING_KEYS = ["name", "sport"];
var synonyms;
var memoize = {};
var ids = [];
function getIds() {
    return ids;
}
function parseJson() {
    return new Promise(function (resolve, reject) {
        helperService_1.default
            .readJsonAsync("synonyms.json")
            .then(function (data) {
            synonyms = data;
            helperService_1.default.readJsonAsync("bookmaker-feed.json").then(function (obj) {
                var result = {};
                var currentKey = "sport";
                try {
                    mapData(obj, result, currentKey);
                    helperService_1.default.cacheFeedData("oddschecker.json", result);
                    helperService_1.default
                        .writeJsonAsync("oddschecker.json", result)
                        .then(function (status) {
                        if (status) {
                            console.info("Data mapping success!");
                            resolve(true);
                        }
                        else {
                            reject(new Error("Data mapping failure"));
                            console.error("Data mapping failure");
                        }
                    });
                }
                catch (err) {
                    console.error(err);
                    reject(err);
                    console.error("Data mapping failure");
                }
            });
        })
            .catch(function (err) { console.error(err); reject(err); });
    });
}
function getSynonym(item, type) {
    var mapper = null;
    if (!memoize[item + "_" + type]) {
        if (synonyms) {
            mapper = synonyms.find(function (t) { return t.synonyms.includes(item) && t.type == type; });
        }
        if (mapper) {
            memoize[item + "_" + type] = mapper;
        }
    }
    else {
        mapper = memoize[item + "_" + type];
    }
    return mapper;
}
function mapData(theObject, subObject, currentKey) {
    var keys = Object.keys(theObject);
    var _loop_1 = function (i, length_1) {
        if (typeof theObject[keys[i]] === "string") {
            var key = void 0, value = void 0;
            var synonymType_1 = SYNONYMS_TYPE_MAPPER[SYNONYMS_MAPPER[currentKey]];
            if (NAME_MAPPING_KEYS.includes(keys[i])) {
                key = SYNONYMS_MAPPER[currentKey] + "Name";
                if (synonymType_1) {
                    var delimiter = DELIMITERS.find(function (t) { return theObject[keys[i]].indexOf(t) >= 0; });
                    if (delimiter) {
                        value = theObject[keys[i]]
                            .split(delimiter)
                            .map(function (obj) {
                            var mappedObj = getSynonym(obj, synonymType_1);
                            if (mappedObj) {
                                return mappedObj["oddschecker_keyword"];
                            }
                            else {
                                return obj;
                            }
                        })
                            .join(delimiter);
                    }
                    else {
                        var mappedObj = getSynonym(theObject[keys[i]], synonymType_1);
                        if (mappedObj) {
                            value = mappedObj["oddschecker_keyword"];
                        }
                        else {
                            value = theObject[keys[i]];
                        }
                    }
                }
                else {
                    value = theObject[keys[i]];
                }
                subObject[key] = value;
                if (!theObject.hasOwnProperty("id")) {
                    key = SYNONYMS_MAPPER[currentKey] + "Id";
                    value = helperService_1.default.generateId();
                    ids.push(value);
                    subObject[key] = value;
                }
            }
            else {
                if (keys[i] == "odds") {
                    key = "oddsDecimal";
                }
                else {
                    key = SYNONYMS_MAPPER[currentKey] + "Id";
                    ids.push(theObject[keys[i]]);
                }
                subObject[key] = theObject[keys[i]];
            }
        }
        else {
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
            }
            else {
                var obj = {};
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
    };
    for (var i = 0, length_1 = keys.length; i < length_1; i++) {
        _loop_1(i, length_1);
    }
}
