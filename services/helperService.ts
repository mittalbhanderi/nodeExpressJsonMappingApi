import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { injectable, inject } from "inversify";
import CacheService from "./cacheService";
import "reflect-metadata";

const LENGTH_OF_RANDOM_HEX_ID = 4;

@injectable()
export default class HelperService {
  private memoize: any;

  protected cacheService: CacheService;

  constructor(@inject(CacheService) _cacheService: CacheService) {
    this.cacheService = _cacheService;
    this.memoize = {};
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
          const cacheName = fileName.split(".")[0];
          _self.cacheService.set(cacheName, jsonObject);
          console.log(`Cached ${cacheName} data to the object`);
          resolve(true);
        }
      );
    });
  };

  readDataJsonAsync = (fileName: string): Promise<any> => {
    const _self = this;
    const cacheName = fileName.split(".")[0];
    return new Promise((resolve, reject) => {
      if (!this.cacheService.get(cacheName)) {
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
            console.log("Writing to cache again!!!");
            _self.cacheService.set(cacheName, obj);
            resolve(obj);
          } catch (err) {
            console.error("Parsing JSON failed!", err);
            reject(new Error(`Parsing JSON failed! ${err}`));
          }
        });
      } else {
        console.log("Reading from cache!!!");
        resolve(this.cacheService.get(cacheName));
      }
    });
  };

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
