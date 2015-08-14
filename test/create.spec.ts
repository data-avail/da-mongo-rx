/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../dist/mongo-rx.d.ts"/>
import chai = require('chai');
import mongoRx = require('../dist/mongo-rx');
var expect = chai.expect;
import Rx = require("rx");

const MONGO_URI = process.env.npm_config_MONGO_URI || process.env.npm_package_config_MONGO_URI;

describe("create / remove tests",  () => {

	var db: mongoRx.MongoDb;
	var coll: mongoRx.Collection;	
	before((done) => {
		db = new mongoRx.MongoDb(MONGO_URI, ["create", "locker"]);		
		coll = db.getCollection("create")		
		coll.remove({}).concat(db.getCollection("locker").remove({})).subscribeOnCompleted(done);
	});
	
	it("create some test record",  (done) => {
						
		coll.insert({test : "some"})
		.subscribe((val: any) => {
			expect(val).is.exist;
			expect(val.test).to.eq("some");  
		}, null, done);
		
		it("findAnModify",  (done) => {				
			coll.findAndModify({query : {test: "some"}, update : {test : "some1"}, new : true})
			.subscribe((val) => {
				expect(val).has.property("doc");
				expect(val.doc).has.property("test", "some1");
				}, 
			done, done);
			
			
			it("remove all tests record",  (done) => {				
				coll.remove({})
				.subscribe(() => {}, done, done)
																	
			})																
		})
																
	})
	
	
	it("lock record",  (done) => {
		Rx.Observable.concat(
			db.lock("111", "locker"),
			db.lock("111", "locker"),
			db.lock("111", "locker")
		)
		.toArray()
		.subscribe((val) => {
			expect(val).eqls([true, false, false]);
		}, done, done);						
																											
	})


			
}) 
