/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../dist/mongo-rx.d.ts"/>
import chai = require('chai'); 
import mongoRx = require('../dist/mongo-rx');
var expect = chai.expect;

function getEnvVar(name: string) : string {
	return process.env[name] || 
	process.env["npm_config_" + name] || 
	process.env["npm_package_config_" + name];	
}

const MONGO_URI = getEnvVar("MONGO_URI_TEST");

console.log(MONGO_URI);

describe("insert-uniq-doc test",  () => {
	
	var db: mongoRx.MongoDb;	
	
	before((done) => {
		db = new mongoRx.MongoDb(MONGO_URI, ["uniq", "uniq2"]);
		db.getCollection("uniq").remove({}).merge(
		db.getCollection("uniq2").remove({}))
		.subscribeOnCompleted(done);
				
	});
		
	it("insert doc with key field",  (done) => {
		db.insertUniqueDocumentWithKey("111", "uniq")
		.subscribe(val =>
			expect(val).eql(1) 
			, done, done);																																			
	})
	

	it("insert 2 docs",  (done) => {
		db.insertUniqueDocumentWithKey("111", "uniq2")
		.concat(db.insertUniqueDocumentWithKey("222", "uniq2"))
		.bufferWithCount(2)
		.subscribe(val =>
			expect(val).eql([1, 2]) 
			, done, done);																																			
	})

	
});