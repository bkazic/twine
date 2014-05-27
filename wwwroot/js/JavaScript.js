var textarea = document.getElementById("TextArea1");
console.log("test");

// Draw graph
getHttpResponse('http://localhost:8080/twine/query?data={"$from":"twineResampledMeasurements"}', function (data) {
    drawD3Document(data.records);
});

/*
// Draw update graph
var graphIfNew = new ifNew();
setInterval(function () {
    getHttpResponse('http://localhost:8080/twine/query?data={"$from":"twineResampledMeasurements"}', function (data) {
        var last = data.records.length - 1;
        if (graphIfNew.check(data.records[last].$id)) {
            console.log("New resampled data! id$: " + data.records[last].$id)
            drawD3Document(data.records);
        }
        // update graph
    });
}, 3000) 
*/
/*
// You have to use a callback function
getHttpResponse('http://localhost:8080/twine/lastRec', function (data) {
    console.log("Test 0: " + JSON.stringify(data));
});
*/

// Do something every 3s
var textIfNew = new ifNew();
var graphIfNew = new ifNew();
setInterval(function () {
    //displayText();
    getHttpResponse('http://localhost:8080/twine/lastRec', function (data) {
        // on new data
        //if (checkIfNew(data.$id)) {
        if (textIfNew.check(data.$id)) {
            console.log("Yes, new data! id$:"+data.$id);
            displayText();

            getHttpResponse('http://localhost:8080/twine/query?data={"$from":"twineResampledMeasurements"}', function (data) {
                var last = data.records.length - 1;
                if (graphIfNew.check(data.records[last].$id)) {
                    console.log("New resampled data! id$: " + data.records[last].$id)
                    drawD3Document(data.records);
                }
                // update graph
            });

        };
    });
    textarea.scrollTop = textarea.scrollHeight;
}, 3000) //timer interval set to 3000ms


// Fetch url response
function getHttpResponse(url, onResponse) {
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            console.log(data); // Just for testing
            onResponse(data);
        }
    });
}


// so we can create several instances of this function
function ifNew() {
    this.old;
    // "method" of this function (object)
    this.check = function(data) {
        // if old is not defined, define it
        (typeof this.old === 'undefined') && (this.old = data);

        if (this.old !== data) {
            this.old = data;
            return true;
        }
        return false;
    }
}

// TODO limit length of text to 10 lines
function displayText() {
    var date = new Date();
    var today = date.toLocaleDateString();
    var currentTime = date.toLocaleTimeString();
    var text = 'New coffee made on ' + today + ' @ ' + currentTime;
    textarea.innerHTML += text + "\n";
};

$("#dialog").dialog({
    position: {at: "right top"},
    autoOpen: false,
    modal: true,
    open: function (ev, ui) {
        $('#sensorData').attr({ frameBorder:'0', height: "400", scrolling:'no', src: 'https://twine.cc/00001c0d446f8765/widget/?access_key=fa2f09cf7de346b5b2f1f60e3344' });
    }
});

$('#opener').click(function () {
    $('#dialog').dialog('open');
});