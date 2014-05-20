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

// writes to file wehn new rec is added to store
var logFile = "./sandbox/twine/coffee.txt";
if (fs.exists(logFile)) fs.del(logFile);
var outFile = fs.openAppend(logFile);
twineStore.addTrigger({
  onAdd: function (rec) {
    var mesagge = "New coffe made at " + rec.DateTime.string;
    outFile.writeLine(mesagge);
    outFile.flush();
  }
});

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
    { name: "Temperature", interpolator: "previous" }
  ],
  createStore: false,
  interval: 60*1000
});

// function to create url
function makeUrl (http, key, field) {
  //var url = "";
  var http = http || "http://api.thingspeak.com";
  var key = key || "BKUYCZHY03YZC443";
  var field = field || 0;
  var url = http + "/update?" + "key=" + key + "&field1=" + field;
  return url;
}

// initialize counter
var counter = 0;
// calculate sum of counters
resampledStore.addTrigger({
  onAdd: function (rec) {
    resampledStore.add({ $id: rec.$id, Counter: counter});
    var url = makeUrl("http://api.thingspeak.com", "BKUYCZHY03YZC443", rec.Counter);
    http.get(url);
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

// http://localhost:8080/twine/lastRec
// Query last record
http.onGet("lastRec", function (req, resp) {
    lastRec = twineStore[twineStore.length - 1];
    return jsonp(req, resp, lastRec);
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