
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
            return this.cursor.sort(sort);
        };
        Cursor.prototype.limit = function (count) {
            return this.cursor.limit(count);
        };
        Cursor.prototype.skip = function (count) {
            return this.cursor.limit(count);
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
        Collection.prototype.find = function (query) {
            return new Cursor(this.coll.find(query));
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
        return MongoDb;
    })();
    mongoRx.MongoDb = MongoDb;
})(mongoRx || (mongoRx = {}));
module.exports = mongoRx;
