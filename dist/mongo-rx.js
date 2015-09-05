///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
var mongojs = require('mongojs');
var RxNode = require("rx-node");
/**
 * Every method (even write action) must be subscribed to be executed.
 */
var mongoRx;
(function (mongoRx) {
    var Cursor = (function () {
        function Cursor(cursor) {
            this.cursor = cursor;
        }
        Cursor.prototype.fromNode = function (funcName) {
            return Rx.Observable.fromNodeCallback(this.cursor[funcName], this.cursor);
        };
        Cursor.prototype.sort = function (sort) {
            this.cursor.sort(sort);
            return this;
        };
        Cursor.prototype.limit = function (count) {
            this.cursor.limit(count);
            return this;
        };
        Cursor.prototype.skip = function (count) {
            this.cursor.skip(count);
            return this;
        };
        Cursor.prototype.query = function () {
            return RxNode.fromReadableStream(this.cursor);
        };
        Cursor.prototype.toArray = function () {
            return this.fromNode("toArray")();
        };
        return Cursor;
    })();
    var Bulk = (function () {
        function Bulk(coll) {
            this.bulk = coll.initializeOrderedBulkOp();
        }
        /**
         * Convert nodeCallback collection function to Rx.Observable object
         */
        Bulk.prototype.fromNode = function (funcName) {
            return Rx.Observable.fromNodeCallback(this.bulk[funcName], this.bulk);
        };
        Bulk.prototype.execute = function () {
            return this.fromNode("execute")();
        };
        Bulk.prototype.find = function (query) {
            return this.bulk.find(query);
        };
        Bulk.prototype.insert = function (document) {
            return this.bulk.insert(document);
        };
        Bulk.prototype.toString = function () {
            return this.bulk.toString();
        };
        return Bulk;
    })();
    /**
     * Collection object.
     */
    var Collection = (function () {
        /**
         * Create collection object from mongojs collection.
         * @param coll
         * mongojs collection
         */
        function Collection(coll) {
            this.coll = coll;
        }
        /**
         * Create query cursor object.
         * @param query
         * Mongo query json
         * @return Cursor object
         */
        Collection.prototype.find = function (query, select) {
            return new Cursor(this.coll.find(query, select));
        };
        /**
         * Convert nodeCallback collection function to Rx.Observable object
         */
        Collection.prototype.fromNode = function (funcName) {
            return Rx.Observable.fromNodeCallback(this.coll[funcName], this.coll);
        };
        /**
         * Insert object into collection.
         * @param data
         * Object to insert
         * @return
         * Observable with created object
         */
        Collection.prototype.insert = function (data) {
            return this.fromNode("insert")(data);
        };
        /**
         * Remove objects by filter.
         * @param filter
         * Mongo filter json object.
         */
        Collection.prototype.remove = function (filter) {
            return this.fromNode("remove")(filter);
        };
        Collection.prototype.update = function (query, upd) {
            return this.fromNode("update")(query, upd);
        };
        Collection.prototype.findAndModify = function (upd) {
            return this.fromNode("findAndModify")(upd)
                .map(function (val) {
                return { doc: val[0], command: val[1] };
            });
        };
        /**
         * Start bulk operation
         */
        Collection.prototype.bulk = function () {
            return new Bulk(this.coll);
        };
        return Collection;
    })();
    mongoRx.Collection = Collection;
    /**
     * Database connection and operations
     */
    var MongoDb = (function () {
        /**
         * Create database connection.
         * @param connectionString
         * Mongo db connection uri
         * @param collectionNames
         * Name of used collections
         */
        function MongoDb(connectionString, collectionNames) {
            var _this = this;
            this.collections = {};
            this.db = mongojs(connectionString, collectionNames);
            collectionNames.forEach(function (x) { return _this.collections[x] = new Collection(_this.db[x]); });
        }
        /**
         * Get collection by name.
         * @param name
         * Name of the collection
         * @return Collection object.
         */
        MongoDb.prototype.getCollection = function (name) {
            return this.collections[name];
        };
        /**
         * Run some mongo command.
         */
        MongoDb.prototype.runCommand = function (command) {
            return Rx.Observable.fromNodeCallback(this.db.runCommand, this.db)(command);
        };
        /**Create record in collection
         * Returns true if record was created and not exists before
         * Returns false if record already existed.
         * params
         * @id Record Id.
         * @collName collection name.
         * @replicas number of replicas to write record (default 1).
         */
        MongoDb.prototype.lock = function (id, collName, replicas) {
            if (replicas === void 0) { replicas = 1; }
            var command = {
                insert: collName,
                documents: [{ _id: id }],
                ordered: false,
                writeConcern: { w: replicas }
            };
            return this.runCommand(command)
                .map(function (r) { return r.ok && r.n == 1; });
        };
        //http://docs.mongodb.org/master/tutorial/create-an-auto-incrementing-field/
        /*
        insertDocumentWithNumberId(doc: any, targetCollection: string) : Rx.Observable<any> {
            
            var coll = this.getCollection(targetCollection);

            return coll.find({}, { _id: 1 }).sort( { _id: -1 } ).limit(1)
            .toArray()
            .map((val: number[]) => {doc._id = val[0] + 1; return doc})
            .flatMap(val => coll.insert(val))
            //.doWhile((res: any) => res.writeError.code == 11000)
            .map((res: any) => res.writeError ? Rx.Observable.throw(res) : res);
        }
        */
        /**
         * Key field must be unique on target collection
         */
        MongoDb.prototype.insertUniqueDocumentWithKey = function (key, targetCollection, keySelector) {
            var coll = this.getCollection(targetCollection);
            var selector = function (val) { return keySelector ? keySelector(val) : (val ? val + 1 : 1); };
            var cursor = coll.find({}, { _id: 1 }).sort({ _id: -1 }).limit(1);
            return cursor.query()
                .defaultIfEmpty({ _id: null })
                .first()
                .map(function (val) { return selector(val._id); })
                .map(function (val) { return { _id: val, key: key }; })
                .flatMap(function (val) { return coll.insert(val); })
                .map(function (res) { return res.writeError ? Rx.Observable.throw(res) : res._id; })
                .retryWhen(function (errs) { return errs.some(function (val) { return val.writeError.code == 11000; }); });
        };
        return MongoDb;
    })();
    mongoRx.MongoDb = MongoDb;
})(mongoRx || (mongoRx = {}));
module.exports = mongoRx;
