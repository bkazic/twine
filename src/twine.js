// import time library
var tm = require('time');

// create resampled store
qm.createStore([{
     "name" : "twineResampledMeasurements",
     "fields" : [
          { "name" : "DateTime", "type" : "datetime", "null" : true },
          { "name" : "Temperature", "type" : "float", "null" : true },
          { "name" : "Counter", "type" : "float", "null" : true }
      ]
}]);

// open store from def file
var twineStore = qm.store("twineMeasurements");
var resampledStore = qm.store("twineResampledMeasurements");
//var resampledStore = qm.store("twineMeasurements");

console.say(resampledStore.name);
//add test record
var rec = {"Temperature":24,"Orientation":"Top","Vibration": "Still"};
twineStore.add(rec);

/*
// adding stream aggregate
// I want to get how many times twineStore has been triggered in last 15 min
twineStore.addStreamAggr({
  name: "sum",
  type: "count",
  store: "twineStore",
  timeField: "DateTime",
  window: [ { $unit: "minute", $value: 15} ]
});
*/

// create resample aggregator
twineStore.addStreamAggr({
  name: "Resampled",
  type: "resampler",
  outStore: resampledStore.name,
  timestamp: "DateTime",
  fields: [
    { name: "Temperature", interpolator: "previous"}
  ],
  createStore: false,
  interval: 60*1000
});


// initialize counter
var counter = 0;
// calculate sum of counters
resampledStore.addTrigger({
  onAdd: function (rec) {
    resampledStore.add({ $id: rec.$id, Counter: counter});
    http.get("http://api.thingspeak.com/update?key=BKUYCZHY03YZC443&field1=99");
    counter = 0;
  }
});


/////////////////////
// ONLINE SERVICES //
/////////////////////

// http://localhost:8080/twine/query?data={"$from":"twineMeasurements"}
// Query
http.onGet("query", function (req, resp) {
  jsonData = JSON.parse(req.args.data);
  console.log("Query made: " + JSON.stringify(jsonData));
  var recs = qm.search(jsonData);
  return jsonp(req, resp, recs);
});

// http://localhost:8080/twine/add?data={"Temperature":24,"Orientation":"Top","Vibration":"Still"}
// Add measurement from twineStore
http.onGet("add", function (req, resp) {
  rec = JSON.parse(req.args.data);
  rec.DateTime = tm.now.string;
  counter++;
  rec.Counter = counter;
  twineStore.add(rec);
  console.log("New measurement added: " + JSON.stringify(rec));
  return jsonp(req, resp, "OK");
});