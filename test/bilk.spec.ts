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

describe("bulk tests",  () => {
	
	var coll: mongoRx.Collection;	
	before((done) => {
		var db = new mongoRx.MongoDb(MONGO_URI, ["bulk"]);		
		coll = db.getCollection("bulk");
		coll.remove({}).subscribe(() => {}, done, done);
	});
	
	
	it("create portf / insert pos / remove zero pos",  (done) => {						
		var bulk = coll.bulk();

		//insert new portf 1		
		bulk.insert({_id : "1", val : 0, positions : [] } );
		//insert new pos A
		bulk.find({_id : "1", "positions.ticket": {$ne: "A"}}).update( {$push: {positions: {ticket : "A", vals : []}}});
		//modify position
		bulk.find({_id : "1", "positions.ticket": "A"}).update({$inc : {val : 10}, $push: {"positions.$.vals": -10}});
		
		//remove positions with val == 0
		bulk.find({_id : "1", "positions.vals" : 0}).update({$pull: {positions : {vals: 0 } }});
		
		bulk.execute().subscribe((val: mongoRx.IBulkResult) => {
			expect(val.ok).eq(1);
			expect(val.nUpserted).eq(2);
			expect(val.nInserted).eq(1);
		}, done, done)																							
	})


	
	it("insert portf / create portf / insert pos / remove zero pos",  (done) => {

		var bulk = coll.bulk();
		
		//insert new portf 1		
		bulk.insert({_id : "2", val : 0, positions : [] } );
		//insert new pos A
		bulk.find({_id : "2", "positions.ticket": {$ne: "A"}}).update( {$push: {positions: {ticket : "A", vals : []}}});
		//modify position
		bulk.find({_id : "2", "positions.ticket": "A"}).update({$inc : {val : 10}, $push: {"positions.$.vals": -10}});
		
		//remove positions with val == 0
		bulk.find({_id : "2", "positions.vals" : 0}).update({$pull: {positions : {vals: 0 } }});
		
		coll.insert({_id : "2", val : -10, positions : [{positions: {ticket : "A", vals : [10]}}] })
		.concat(bulk.execute())
		.skip(1).subscribe((val: mongoRx.IBulkResult) => {
			expect(val.ok).eq(1);
			expect(val.nUpserted).eq(2);
			expect(val.nInserted).eq(0);
		}, done, done)																							
	})
	

			
}) 
