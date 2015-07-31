var mongojs = require('mongojs');
var da;
(function (da) {
    var mongo;
    (function (mongo) {
        var rx;
        (function (rx) {
            var MongoDb = (function () {
                function MongoDb() {
                }
                MongoDb.connect = function (connectionString, collections) {
                    var db = mongojs(connectionString, [collections]);
                    return null;
                };
                return MongoDb;
            })();
            rx.MongoDb = MongoDb;
        })(rx = mongo.rx || (mongo.rx = {}));
    })(mongo = da.mongo || (da.mongo = {}));
})(da || (da = {}));
