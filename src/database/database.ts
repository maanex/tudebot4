import * as mongo from 'mongodb';
import MongoAdapter from './mongo.adapter';
 
export type dbcollection = 'stats-commands' | 'stats-users' | 'settings';

export default class Database {
  
  public static client: mongo.MongoClient;
 
  constructor() {
  }

  public static init() {
    Database.client = MongoAdapter.client;
  }

  public static get(name: string): mongo.Db | null {
      return this.client ? this.client.db(name) : null;
  }

  public static collection(collection: dbcollection): mongo.Collection | null {
      return this.client ? this.client.db('tudebot').collection(collection) : null;
  }

}