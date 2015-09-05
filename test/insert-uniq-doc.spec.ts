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

describe.only("insert-uniq-doc test",  () => {
	
	var db: mongoRx.MongoDb;	
	
	before((done) => {
		db = new mongoRx.MongoDb(MONGO_URI, ["uniq"]);
		db.getCollection("uniq").remove({})
		.subscribeOnCompleted(done);
				
	});
		
	it("insert doc with key field",  (done) => {
		db.insertUniqueDocumentWithKey("111", "uniq")
		.subscribe(val =>
			expect(val).eql(1) 
			, done, done);																																			
	})
	
	/*
	it("insert 2 docs with the same key",  (done) => {
		db.insertUniqueDocumentWithKey("111", "uniq2")
		.subscribe(val =>
			expect(val).eql({ _id: '111', key: 1 }) 
			, done, done);																																			
	})
	*/
	
});