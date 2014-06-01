// import time library
var tm = require('time');

// open store from def file
var twineLoadStore = qm.store("twineLoadStore");
var twineStore = qm.store("twineMeasurements");
var agregatedStore = qm.store("twineAgregatedMeasurements");

// Log files
var logFile = "./sandbox/twine/coffee.txt";
var twineStoreLogFile = "./sandbox/twine/twineStore.txt";

// Loads logs (if exists)
if (fs.exists(twineStoreLogFile)) qm.load.jsonFile(twineLoadStore, twineStoreLogFile);

// initialize counter
var counter = 0;

// writes to file wehn new rec is added to store
var outFile = fs.openWrite(logFile);
var outTwineStoreFile = fs.openWrite(twineStoreLogFile)
twineStore.addTrigger({
    onAdd: function (rec) {
        // increase counter
        counter++;
        twineStore.add({ $id: rec.$id, Counter: counter });
        // make log in txt format
        var mesagge = "New coffe made at " + rec.DateTime.string;
        outFile.writeLine(mesagge);
        outFile.flush();
        // make log for twineStore
        var val = rec.toJSON();
        delete val.$id;
        outTwineStoreFile.writeLine(JSON.stringify(val));
        outTwineStoreFile.flush();
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
    outStore: agregatedStore.name,
    timestamp: "DateTime",
    fields: [
      { name: "Temperature", interpolator: "previous" }
    ],
    createStore: false,
    interval: 60 * 1000
});

// create agregated store
agregatedStore.addTrigger({
    onAdd: function (rec) {
        //agregatedStore.add(rec);
        agregatedStore.add({ $id: rec.$id, Counter: counter });
        // reset counter
        counter = 0;
    }
});

// Loads data from twineLoadStore to twineStore
for (var ii = 0; ii < twineLoadStore.length; ii++) {
    var rec = twineLoadStore.recs[ii];
    var val = rec.toJSON();
    delete val.$id;
    twineStore.add(val);
}

/////////////////////
// ONLINE SERVICES //
/////////////////////

// http://localhost:8080/twine/query?data={"$from":"twineMeasurements"}
// Query
http.onGet("query", function (req, resp) {
    jsonData = JSON.parse(req.args.data);
    console.log("Query made: " + JSON.stringify(jsonData));
    var recs = qm.search(jsonData);
    return http.jsonp(req, resp, recs);
});

// http://localhost:8080/twine/lastRec
// Query last record
http.onGet("lastRec", function (req, resp) {
    lastRec = twineStore[twineStore.length - 1];
    return http.jsonp(req, resp, lastRec);
});

// http://localhost:8080/twine/add?data={"Temperature":24,"Orientation":"Top","Vibration":"Still"}
// Add measurement from twineStore
http.onGet("add", function (req, resp) {
    rec = JSON.parse(req.args.data);
    // adds timestamp to rec
    rec.DateTime = tm.now.string;
    // adds counter to rec
    twineStore.add(rec);
    console.log("New measurement added: " + JSON.stringify(rec));
    return http.jsonp(req, resp, "OK");
});