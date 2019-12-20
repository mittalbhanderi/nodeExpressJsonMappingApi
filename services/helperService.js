const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { promisify } = require("util");

module.exports = {
  generateId: generateId,
  readJsonAsync: promisify(readJson),
  writeJsonAsync: promisify(writeJson),
  readDataJsonAsync: promisify(readDataJson),
  cacheFeedData: cacheFeedData
};

const LENGTH_OF_RANDOM_HEX_ID = 4;

function generateId() {
  // could have just returned datetime number
  // however, it is predictable
  return parseInt(
    crypto.randomBytes(LENGTH_OF_RANDOM_HEX_ID).toString("hex"),
    16
  );
}

function readJson(fileName, callback) {
  fs.readFile(path.resolve("resources", fileName), "utf8", function(err, data) {
    if (err) {
      console.error("File read failed!", err);
      callback(new Error(`File read failed! ${err}`));
    }
    try {
      const obj = JSON.parse(data);
      callback(null, obj);
    } catch (err) {
      console.error("Parsing JSON failed!", err);
      callback(new Error(`Parsing JSON failed! ${err}`));
    }
  });
}

function writeJson(fileName, jsonObject, callback) {
  fs.writeFile(
    path.resolve("resources", fileName),
    JSON.stringify(jsonObject),
    "utf8",
    function(err) {
      if (err) {
        console.error("File write failed!", err);
        callback(new Error(`File write failed! ${err}`));
      }
      callback(null, true);
    }
  );
}

let memoize = {};
let feedBettingData = {};


function cacheFeedData(fileName, data) {
  if (!feedBettingData[fileName]) {
        feedBettingData[fileName] = data;
  }
}

function readDataJson(fileName, callback) {
  if (!feedBettingData[fileName]) {
    readJson(fileName, (err, obj) => {
      if (!err) {
        feedBettingData[fileName] = obj;
        callback(null, obj);
      } else {
        console.error("File read failed!", err);
        callback(new Error(`File read failed! ${err}`));
      }
    });
  }
  callback(null, feedBettingData[fileName]);
}

function getObject(theObject, property, value) {
  if (!memoize[`${property}_${value}`]) {
    let result = null;
    if (theObject instanceof Array) {
      for (var i = 0; i < theObject.length; i++) {
        result = getObject(theObject[i], property, value);
        if (result) {
          break;
        }
      }
    } else {
      for (var prop in theObject) {
        if (prop == property) {
          if (theObject[prop] == value) {
            memoize[`${property}_${value}`] = theObject;
            return theObject;
          }
        }
        if (
          theObject[prop] instanceof Object ||
          theObject[prop] instanceof Array
        ) {
          result = getObject(theObject[prop], property, value);
          if (result) {
            break;
          }
        }
      }
    }
    return result;
  } else {
    return memoize[`${property}_${value}`];
  }
}
