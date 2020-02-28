import NodeCache = require("node-cache");
import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export default class Cache {
  cache: NodeCache;
  private readonly ttlSeconds: number = 60 * 60 * 1;
  
  constructor() {
    console.log('Cache constructor');    
    this.cache = new NodeCache({
      stdTTL: this.ttlSeconds,
      checkperiod: this.ttlSeconds * 0.2,
      useClones: false
    });
  }

  get(key: string) {
    const value = this.cache.get(key);
    if (value) {
      return value;
    }
    return null;
  }

  set(key: string, obj: any) {
    this.del(key);
    this.cache.set(key, obj);
  }

  del(keys: string | number | NodeCache.Key[]) {
    this.cache.del(keys);
  }

  delStartWith(startStr: string = "") {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key);
      }
    }
  }

  flush() {
    this.cache.flushAll();
  }
}
