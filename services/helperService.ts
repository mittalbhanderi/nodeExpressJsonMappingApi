import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const LENGTH_OF_RANDOM_HEX_ID = 4;

export default class HelperService {
  generateId(): number {
    // could have just returned datetime number
    // however, it is predictable
    return parseInt(
      crypto.randomBytes(LENGTH_OF_RANDOM_HEX_ID).toString("hex"),
      16
    );
  }

  readJsonAsync = async (fileName: string) => {
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
          const obj = JSON.parse(data);
          resolve(obj);
        } catch (err) {
          console.error("Parsing JSON failed!", err);
          reject(new Error(`Parsing JSON failed! ${err}`));
        }
      });
    });
  };

  writeJsonAsync = async (fileName: string, jsonObject: Object) => {
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
          resolve(true);
        }
      );
    });
  };

  readDataJsonAsync = async (fileName: string) => {
    return new Promise((resolve, reject) => {
      if (!this.feedBettingData[fileName]) {
        this.readJson(fileName, (err: any, obj: Object) => {
          if (!err) {
            this.feedBettingData[fileName] = obj;
            resolve(obj);
          } else {
            console.error("File read failed!", err);
            reject(new Error(`File read failed! ${err}`));
          }
        });
      }
      resolve(this.feedBettingData[fileName]);
    });
  };

  private readJson(fileName: string, callback: any) {
    fs.readFile(path.resolve("resources", fileName), "utf8", function(
      err,
      data
    ) {
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

  private writeJson(
    fileName: string,
    jsonObject: Object,
    callback: (result: any, success?: boolean) => void
  ) {
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

  memoize: any = {};
  feedBettingData: any = {};

  cacheFeedData(fileName: string, data: Object) {
    if (!this.feedBettingData[fileName]) {
      this.feedBettingData[fileName] = data;
    }
  }

  // private readDataJson(fileName: string, callback: any) {
  //   if (!this.feedBettingData[fileName]) {
  //     this.readJson(fileName, (err: any, obj: Object) => {
  //       if (!err) {
  //         this.feedBettingData[fileName] = obj;
  //         callback(null, obj);
  //       } else {
  //         console.error("File read failed!", err);
  //         callback(new Error(`File read failed! ${err}`));
  //       }
  //     });
  //   }
  //   callback(null, this.feedBettingData[fileName]);
  // }

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
