/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../dist/mongo-rx.d.ts"/>
import chai = require('chai');
import mongoRx = require('../dist/mongo-rx');
var expect = chai.expect;

const MONGO_URI = process.env.npm_config_MONGO_URI || process.env.npm_package_config_MONGO_URI;

describe("create / remove tests",  () => {

	var coll: mongoRx.Collection;	
	before(() => {
		var db = new mongoRx.MongoDb(MONGO_URI, ["create"]);		
		coll = db.getCollection("create")		
	});
	
	it("create some test record",  (done) => {
						
		coll.insert({test : "some"})
		.subscribe((val: any) => {
			expect(val).is.exist;
			expect(val.test).to.eq("some");  
		}, null, done);																
	})

	it("remove all tests record",  (done) => {				
		coll.remove({})
		.subscribeOnCompleted(done)																
	})
		
}) 
