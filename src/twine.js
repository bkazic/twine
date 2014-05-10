// import time library
var tm = require('time');

// open store from def file
var twineStore = qm.store("twineMeasurements");

//add test record
var rec = {"Temperature":24,"Orientation":"Top","Vibration": "Still"};
twineStore.add(rec);

// initialize counter
var counter = 0;

// adding timestamp to record
twineStore.addTrigger({
  onAdd: function (rec) {
    // get current timestamp and add it
    var time = tm.now.string;
    twineStore.add({ $id: rec.$id, DateTime: time});

    // updating and adding counter
    counter++;
    twineStore.add({ $id: rec.$id, Counter: counter});
  }
});

// ONLINE SERVICES
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
  twineStore.add(rec);
  console.log("New measurement added: " + JSON.stringify(rec));
  return jsonp(req, resp, "OK");
});