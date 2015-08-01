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
    class MongoDb {
        private db;
        constructor(connectionString: string, collections: string[]);
        runCommand(collection: string, command: any): Rx.Observable<ICommandResult>;
        find<T>(collection: string, query: any): ICursor;
        insert<T>(collection: string, data: any): Rx.Observable<any>;
    }
}
export = mongoRx;
