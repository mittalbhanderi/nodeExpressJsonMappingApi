"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var crypto_1 = __importDefault(require("crypto"));
var util_1 = require("util");
exports.default = {
    generateId: generateId,
    readJsonAsync: util_1.promisify(readJson),
    writeJsonAsync: util_1.promisify(writeJson),
    readDataJsonAsync: util_1.promisify(readDataJson),
    getObject: getObject,
    cacheFeedData: cacheFeedData
};
var LENGTH_OF_RANDOM_HEX_ID = 4;
function generateId() {
    // could have just returned datetime number
    // however, it is predictable
    return parseInt(crypto_1.default.randomBytes(LENGTH_OF_RANDOM_HEX_ID).toString("hex"), 16);
}
function readJson(fileName, callback) {
    fs_1.default.readFile(path_1.default.resolve("resources", fileName), "utf8", function (err, data) {
        if (err) {
            console.error("File read failed!", err);
            callback(new Error("File read failed! " + err));
        }
        try {
            var obj = JSON.parse(data);
            callback(null, obj);
        }
        catch (err) {
            console.error("Parsing JSON failed!", err);
            callback(new Error("Parsing JSON failed! " + err));
        }
    });
}
function writeJson(fileName, jsonObject, callback) {
    fs_1.default.writeFile(path_1.default.resolve("resources", fileName), JSON.stringify(jsonObject), "utf8", function (err) {
        if (err) {
            console.error("File write failed!", err);
            callback(new Error("File write failed! " + err));
        }
        callback(null, true);
    });
}
var memoize = {};
var feedBettingData = {};
function cacheFeedData(fileName, data) {
    if (!feedBettingData[fileName]) {
        feedBettingData[fileName] = data;
    }
}
function readDataJson(fileName, callback) {
    if (!feedBettingData[fileName]) {
        readJson(fileName, function (err, obj) {
            if (!err) {
                feedBettingData[fileName] = obj;
                callback(null, obj);
            }
            else {
                console.error("File read failed!", err);
                callback(new Error("File read failed! " + err));
            }
        });
    }
    callback(null, feedBettingData[fileName]);
}
function getObject(theObject, property, value) {
    if (!memoize[property + "_" + value]) {
        var result = null;
        if (theObject instanceof Array) {
            for (var i = 0; i < theObject.length; i++) {
                result = getObject(theObject[i], property, value);
                if (result) {
                    break;
                }
            }
        }
        else {
            for (var prop in theObject) {
                if (prop == property) {
                    if (theObject[prop] == value) {
                        memoize[property + "_" + value] = theObject;
                        return theObject;
                    }
                }
                if (theObject[prop] instanceof Object ||
                    theObject[prop] instanceof Array) {
                    result = getObject(theObject[prop], property, value);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    }
    else {
        return memoize[property + "_" + value];
    }
}
