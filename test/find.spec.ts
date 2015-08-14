/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../dist/mongo-rx.d.ts"/>
import chai = require('chai'); 
import mongoRx = require('../dist/mongo-rx');
var expect = chai.expect;

const MONGO_URI = process.env.npm_config_MONGO_URI || process.env.npm_package_config_MONGO_URI;

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
						
		coll.find({}).toArray<any[]>()
		.subscribe((val) => {
			expect(val).has.lengthOf(3); 
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
