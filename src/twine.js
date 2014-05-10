// import time library
var tm = require('time');

// open store from def file
var twineStore = qm.store("twineMeasurements");

// testing querying
var recs = qm.search({"$from":"twineMeasurements"});
console.say(JSON.stringify(recs));

//add test record
var rec = {"Temperature":24,"Orientation":"Top","Vibration":1345};
twineStore.add(rec);

// check if the record was added
console.say(JSON.stringify(twineStore.recs));

// testing out time library
console.say("String: " + tm.string);
console.say("Timestamp: " + tm.timestamp);
console.say("Now: " + tm.now.string);
console.say("NowUTC: " + tm.nowUTC.string);
console.say("JSON: " + JSON.stringify(tm.toJSON(tm.now)));

// ONLINE SERVICES
// http://localhost:8080/twine/query?data={"$from":"twineMeasurements"}
// Query
http.onGet("query", function (req, resp) {
  jsonData = JSON.parse(req.args.data);
  console.log("Query made: " + JSON.stringify(jsonData));
  var recs = qm.search(jsonData);
  return jsonp(req, resp, recs);
});

// http://localhost:8080/twine/add?data={"Temperature":24,"Orientation":"Top","Vibration":1345}
// Add measurement from twineStore
http.onGet("add", function (req, resp) {
  rec = JSON.parse(req.args.data);
  twineStore.add(rec);
  console.log("New measurement added: " + JSON.stringify(rec));
  return jsonp(req, resp, "OK");
});