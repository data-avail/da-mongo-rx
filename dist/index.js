///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
var mongojs = require('mongojs');
var mongoRx;
(function (mongoRx) {
    var Collection = (function () {
        function Collection(coll) {
            this.coll = coll;
        }
        Collection.prototype.find = function (collection, query) {
            return null;
        };
        Collection.prototype.fromNode = function (funcName) {
            return Rx.Observable.fromNodeCallback(this.coll[funcName], this.coll);
        };
        Collection.prototype.insert = function (collection, data) {
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
