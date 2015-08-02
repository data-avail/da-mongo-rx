/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../dist/index.d.ts"/>
import chai = require('chai');
import mongoRx = require('../dist/index');
var expect = chai.expect;

describe("create / remove tests",  () => {

	var coll: mongoRx.Collection;	
	before(() => {
		var db = new mongoRx.MongoDb(process.env.npm_package_config_MONGO_URI, ["test"]);		
		coll = db.getCollection("test")		
	});
	
	it("create some test record",  (done) => {
						
		coll.insert("test", {test : "some"})
		.subscribe((val: any) => {
			expect(val).is.exist;
			expect(val.test).to.eq("some1"); 
			console.log(val);
			done(null); 
		});																
	})

	it.skip("remove all tests record",  (done) => {				
		coll.remove({})
		.subscribe((val) => done(null));																
	})
		
}) 
