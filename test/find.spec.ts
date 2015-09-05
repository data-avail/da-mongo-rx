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

describe("find tests",  () => {
	
	var coll: mongoRx.Collection;	
	before((done) => {
		var db = new mongoRx.MongoDb(MONGO_URI, ["find"]);		
		coll = db.getCollection("find");
		coll.insert({name : "aaa"})
		.concat(coll.insert({name : "bbb"}))
		.concat(coll.insert({name : "ccc"}))
		.subscribeOnCompleted(done);			
	});
	
	after((done) => {
		coll.remove({}).subscribeOnCompleted(done);
	});
	
	it("find records as array",  (done) => {
						
		coll.find({}).sort({name: 1}).toArray<any[]>()
		.subscribe((val) => {
			expect(val).has.lengthOf(3); 
			console.log(val);
			expect(val[0]).has.property("name");
			expect((<any>val[0]).name).to.eq("aaa"); 
		}, null, done)
																							
	})

	it("find records as stream",  (done) => {
						
		coll.find({}).query<any>()
		.subscribe((val) => {
			expect(val).has.property("_id"); 
			expect(val).has.property("name"); 
		}, null, done)
																							
	})
			
}) 
