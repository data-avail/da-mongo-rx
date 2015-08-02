/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../dist/index.d.ts"/>
import chai = require('chai'); 
import mongoRx = require('../dist/index');
var expect = chai.expect;

describe("find tests",  () => {

	var coll: mongoRx.Collection;	
	before((done) => {
		var db = new mongoRx.MongoDb(process.env.npm_package_config_MONGO_URI, ["test"]);		
		coll = db.getCollection("test");
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
		}, null, () => done())
																							
	})

	it.only("find records as stream",  (done) => {
						
		coll.find({}).query<any>()
		.subscribe((val) => {
			expect(val).has.property("_id"); 
			expect(val).has.property("name"); 
		}, null, () => done())
																							
	})
		
}) 
