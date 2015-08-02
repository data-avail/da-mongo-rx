/// <reference path="../typings/tsd.d.ts" />
import Rx = require("rx");
declare module mongoRx {
    interface ICursor {
        find(query: any): ICursor;
        sort(sort: any): ICursor;
        limit(count: number): ICursor;
        skip(count: number): ICursor;
        query<T>(): Rx.Observable<T>;
        toArray<T>(): Rx.Observable<T[]>;
    }
    interface ICommandResult {
        ok: boolean;
        n: number;
    }
    class Collection {
        private coll;
        constructor(coll: any);
        find<T>(collection: string, query: any): ICursor;
        private fromNode<T>(funcName);
        insert<T>(collection: string, data: any): Rx.Observable<T>;
        remove(filter: any): Rx.Observable<any>;
    }
    class MongoDb {
        private db;
        private collections;
        constructor(connectionString: string, collectionNames: string[]);
        getCollection(name: string): any;
        runCommand(collection: string, command: any): Rx.Observable<ICommandResult>;
    }
}
export = mongoRx;
