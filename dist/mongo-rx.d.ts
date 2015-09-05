/// <reference path="../typings/tsd.d.ts" />
import Rx = require("rx");
/**
 * Every method (even write action) must be subscribed to be executed.
 */
declare module mongoRx {
    /**
     * Chinable query object.
     */
    interface ICursor {
        sort(sort: any): ICursor;
        limit(count: number): ICursor;
        skip(count: number): ICursor;
        /**
         * Create stream of resulted query objects.
         * @return
         * Observable with streamed object
         */
        query<T>(): Rx.Observable<T>;
        /**
         * Return collection of resulted query objects at once.
         * @return
         * Collection of results
         */
        toArray<T>(): Rx.Observable<T[]>;
    }
    interface IBulkFind {
        remove(): any;
        removeOne(): any;
        replaceOne(): any;
        update(updaterParam: any): any;
        updateOne(updaterParam: any): any;
        upsert(upsertParam: any): any;
    }
    interface IBulkResult {
        writeErrors: any[];
        writeConcernErrors: any[];
        nInserted: number;
        nUpserted: number;
        nMatched: number;
        nModified: number;
        nRemoved: number;
        upserted: any[];
        ok: number;
    }
    interface IBulk {
        execute(): Rx.Observable<any>;
        find(query: any): IBulkFind;
        insert(document: any): any;
        toString(): string;
    }
    interface ICommandResult {
        ok: boolean;
        n: number;
    }
    interface IFindAndModifyResult {
        doc: any;
        command: ICommandResult;
    }
    /**
     * Collection object.
     */
    class Collection {
        private coll;
        /**
         * Create collection object from mongojs collection.
         * @param coll
         * mongojs collection
         */
        constructor(coll: any);
        /**
         * Create query cursor object.
         * @param query
         * Mongo query json
         * @return Cursor object
         */
        find(query: any, select?: any): ICursor;
        /**
         * Convert nodeCallback collection function to Rx.Observable object
         */
        private fromNode<T>(funcName);
        /**
         * Insert object into collection.
         * @param data
         * Object to insert
         * @return
         * Observable with created object
         */
        insert<T>(data: any): Rx.Observable<T>;
        /**
         * Remove objects by filter.
         * @param filter
         * Mongo filter json object.
         */
        remove(filter: any): Rx.Observable<any>;
        update(query: any, upd: any): Rx.Observable<any>;
        findAndModify(upd: any): Rx.Observable<IFindAndModifyResult>;
        /**
         * Start bulk operation
         */
        bulk(): IBulk;
    }
    /**
     * Database connection and operations
     */
    class MongoDb {
        private db;
        private collections;
        /**
         * Create database connection.
         * @param connectionString
         * Mongo db connection uri
         * @param collectionNames
         * Name of used collections
         */
        constructor(connectionString: string, collectionNames: string[]);
        /**
         * Get collection by name.
         * @param name
         * Name of the collection
         * @return Collection object.
         */
        getCollection(name: string): Collection;
        /**
         * Run some mongo command.
         */
        runCommand(command: any): Rx.Observable<ICommandResult>;
        /**Create record in collection
         * Returns true if record was created and not exists before
         * Returns false if record already existed.
         * params
         * @id Record Id.
         * @collName collection name.
         * @replicas number of replicas to write record (default 1).
         */
        lock(id: string, collName: string, replicas?: number): Rx.Observable<boolean>;
        /**
         * Key field must be unique on target collection
         */
        insertUniqueDocumentWithKey(_id: string, targetCollection: string, keySelector?: (prevKey: any) => any): Rx.Observable<number>;
    }
}
export = mongoRx;
