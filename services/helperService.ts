import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { injectable } from "inversify";
import "reflect-metadata";
import { json } from "express";

const LENGTH_OF_RANDOM_HEX_ID = 4;

@injectable()
export default class HelperService {
  private memoize: any;
  private feedBettingData: any;

  constructor() {
    this.memoize = {};
    this.feedBettingData = {};
  }

  generateId(): number {
    // could have just returned datetime number
    // however, it is predictable
    return parseInt(
      crypto.randomBytes(LENGTH_OF_RANDOM_HEX_ID).toString("hex"),
      16
    );
  }

  readJsonAsync = (fileName: string) => {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve("resources", fileName), "utf8", function(
        err,
        data
      ) {
        if (err) {
          console.error("File read failed!", err);
          reject(new Error(`File read failed! ${err}`));
        }
        try {
          let obj = JSON.parse(data);
          resolve(obj);
        } catch (err) {
          console.error("Parsing JSON failed!", err);
          reject(new Error(`Parsing JSON failed! ${err}`));
        }
      });
    });
  };

  writeJsonAsync = (fileName: string, jsonObject: Object) => {
    const _self = this;
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.resolve("resources", fileName),
        JSON.stringify(jsonObject),
        "utf8",
        function(err) {
          if (err) {
            console.error("File write failed!", err);
            reject(new Error(`File write failed! ${err}`));
          }
          _self.feedBettingData[fileName] = jsonObject;
          console.log(`Cached ${fileName} data to the object`);
          resolve(true);
        }
      );
    });
  };

  readDataJsonAsync = (fileName: string): Promise<any> => {
    const _self = this;
    return new Promise((resolve, reject) => {
      if (!this.feedBettingData[fileName]) {
        fs.readFile(path.resolve("resources", fileName), "utf8", function(
          err,
          data
        ) {
          if (err) {
            console.error("File read failed!", err);
            reject(new Error(`File read failed! ${err}`));
          }
          try {
            let obj = JSON.parse(data);
            _self.cacheFeedData(fileName, obj);
            resolve(obj);
          } catch (err) {
            console.error("Parsing JSON failed!", err);
            reject(new Error(`Parsing JSON failed! ${err}`));
          }
        });
      } else {
       resolve(this.feedBettingData[fileName]);
      }
    });
  };

  cacheFeedData(fileName: string, data: Object) {
    if (!this.feedBettingData[fileName]) {
      this.feedBettingData[fileName] = data;
    }
  }

  getObject(theObject: any, property?: string, value?: string | number): any {
    if (!this.memoize[`${property}_${value}`]) {
      let result = null;
      if (theObject instanceof Array) {
        for (var i = 0; i < theObject.length; i++) {
          result = this.getObject(theObject[i], property, value);
          if (result) {
            break;
          }
        }
      } else {
        for (var prop in theObject) {
          if (prop == property) {
            if (theObject[prop] == value) {
              this.memoize[`${property}_${value}`] = theObject;
              return theObject;
            }
          }
          if (
            theObject[prop] instanceof Object ||
            theObject[prop] instanceof Array
          ) {
            result = this.getObject(theObject[prop], property, value);
            if (result) {
              break;
            }
          }
        }
      }
      return result;
    } else {
      return this.memoize[`${property}_${value}`];
    }
  }
}
