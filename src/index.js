///<reference path="../typings/tsd.d.ts"/>
var Rx = require("rx");
var mongojs = require('mongojs');
var mongoRx;
(function (mongoRx) {
    var MongoDb = (function () {
        function MongoDb(connectionString, collections) {
            this.db = mongojs(connectionString, collections);
        }
        MongoDb.prototype.runCommand = function (collection, command) {
            return Rx.Observable.fromNodeCallback(this.db.runCommand)(command);
        };
        /**
         * Create query stream
         */
        MongoDb.prototype.find = function (collection, query) {
            return null;
        };
        MongoDb.prototype.insert = function (collection, data) {
            return Rx.Observable.fromNodeCallback(this.db[collection].insert)(data);
        };
        return MongoDb;
    })();
    mongoRx.MongoDb = MongoDb;
})(mongoRx || (mongoRx = {}));
module.exports = mongoRx;
