/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../dist/mongo-rx.d.ts"/>
import chai = require('chai');
import mongoRx = require('../dist/mongo-rx');
var expect = chai.expect;
import Rx = require("rx");

function getEnvVar(name: string) : string {
	return process.env[name] || 
	process.env["npm_config_" + name] || 
	process.env["npm_package_config_" + name];	
}

const MONGO_URI = getEnvVar("MONGO_URI_TEST");


describe("create / remove tests",  () => {

	var db: mongoRx.MongoDb;
	var coll: mongoRx.Collection;	
	before((done) => {
		db = new mongoRx.MongoDb(MONGO_URI, ["create", "locker"]);		
		coll = db.getCollection("create");		
		coll.remove({}).concat(db.getCollection("locker").remove({})).subscribe(
			() => {}, done, done);
	});
	
	it("create some test record",  (done) => {
						
		coll.insert({test : "some"})
		.subscribe((val: any) => {
			expect(val).is.exist;
			expect(val.test).to.eq("some");  
		}, null, done);
		
		describe("find and modify", () => {
		
			it("findAnModify",  (done) => {				
				coll.findAndModify({query : {test: "some"}, update : {test : "some1"}, new : true})
				.subscribe((val) => {
					expect(val).has.property("doc");
					expect(val.doc).has.property("test", "some1");
					}, 
				done, done);
								
				describe("remove records", () => {
					
					it("remove all tests record",  (done) => {				
						coll.remove({})
						.subscribe(() => {}, done, done)
																			
					})								
				})								
			})			
		})
																
	})
	
	
	it("lock record",  (done) => {
		
		Rx.Observable.concat(
			db.lock("111", "locker"),
			db.lock("111", "locker"),
			db.lock("111", "locker")
		)
		.bufferWithCount(3)	
		.subscribe((val) => {
			expect(val).eqls([true, false, false]);
		}, done, done);						
																											
	})


			
}) 
