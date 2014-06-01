var WIDTH = 450, HEIGHT = 260;
var Y_AXIS_LABEL = "Number of Coffees";
var X_DATA_PARSE = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
//var Y_DATA_PARSE = vida.number;
var X_AXIS_COLUMN = "DateTime";
var Y_AXIS_COLUMN = "Counter";

var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = WIDTH - margin.left - margin.right,
    height = HEIGHT - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    //.ticks(d3.time.minutes, 60)
    .ticks(5)
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function (d) { return x(d.x_axis); })
    .y(function (d) { return y(d.y_axis); });


/*
var svg = d3.select("#canvas-svg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .style("border-syle", "solid")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
*/

var drawD3Document = function (data) {
    // first delete the old graph
    d3.select("#canvas-svg").select("svg").remove();
    // create graph
    var svg = d3.select("#canvas-svg").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    data.forEach(function (d) {
        d.x_axis = X_DATA_PARSE(d[X_AXIS_COLUMN]);
        d.y_axis = d[Y_AXIS_COLUMN];
    });

    x.domain(d3.extent(data, function (d) { return d.x_axis; }));
    y.domain(d3.extent(data, function (d) { return d.y_axis; }));

    //svg.append("g")
    //    .attr("class", "title")
    //    .append("text")
    //    .attr("x", width / 2)
    //    .attr("y", 10)
    //    .text("Coffee Graph");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(Y_AXIS_LABEL);


    svg.append("path")
        .datum(data)
        //.data([data])
        .attr("class", "line")
        .attr("d", line);

    /*
    // draw circles on the graph
    svg.selectAll("circle").data(data).enter()
        .append("circle")
        .attr("r", 3.5)
        .attr("cx", function (d) { return x(d.x_axis); })
        .attr("cy", function (d) { return y(d.y_axis); })
        .style("fill", "red");
    */

};