///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
var mongojs = require('mongojs');
var RxNode = require("rx-node");
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
    var Collection = (function () {
        function Collection(coll) {
            this.coll = coll;
        }
        Collection.prototype.find = function (query) {
            return new Cursor(this.coll.find(query));
        };
        Collection.prototype.fromNode = function (funcName) {
            return Rx.Observable.fromNodeCallback(this.coll[funcName], this.coll);
        };
        Collection.prototype.insert = function (data) {
            return this.fromNode("insert")(data);
        };
        Collection.prototype.remove = function (filter) {
            return this.fromNode("remove")(filter);
        };
        return Collection;
    })();
    mongoRx.Collection = Collection;
    var MongoDb = (function () {
        function MongoDb(connectionString, collectionNames) {
            var _this = this;
            this.collections = {};
            this.db = mongojs(connectionString, collectionNames);
            collectionNames.forEach(function (x) { return _this.collections[x] = new Collection(_this.db[x]); });
        }
        MongoDb.prototype.getCollection = function (name) {
            return this.collections[name];
        };
        MongoDb.prototype.runCommand = function (collection, command) {
            return Rx.Observable.fromNodeCallback(this.db.runCommand)(command);
        };
        return MongoDb;
    })();
    mongoRx.MongoDb = MongoDb;
})(mongoRx || (mongoRx = {}));
module.exports = mongoRx;
