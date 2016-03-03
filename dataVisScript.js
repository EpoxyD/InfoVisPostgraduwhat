var margin = {top: 20, right: 20, bottom: 20, left: 20};

var outerWidth = 1000;
var outerHeight = outerWidth;

var width = outerWidth - margin.left - margin.right;

var height = outerHeight - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width",outerWidth)
    .attr("height",outerHeight  )
    .style("border","solid black")
    .append("g")
    .attr("transform", "translate(" + ( margin.left + 10 )+ "," + margin.top + ")");

d3.csv("MOCK_DATA.csv", function(data) {
    data.forEach(function(d) {
        // hier map je de data uit de csv aan het "data" object (de '+' is om aan te geven dat het een getalwaarde is
        d.timeStamp = d.TS;
        d.consumption = +d.Cons;
        d.dateParts = d.TS.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/);
        d.date = new Date(d.dateParts[1], d.dateParts[2], d.dateParts[3], d.dateParts[4], d.dateParts[5], d.dateParts[6], d.dateParts[6]);
        d.hour = d.date.getHours();
        d.dayNumber = d.date.getDay();
    });

    // Get the extrema of the consumption
    var minCons = d3.min(data, function(d) {return d.consumption;})
    var maxCons = d3.max(data, function(d) {return d.consumption;})
    var deltaCons = (maxCons - minCons);

    var blockWidth = width/168;

    var calculateXCoordinate = function (day, hour) {
        return blockWidth * (day+1) * hour - blockWidth;
    }

    // Set the scales
    var y = d3.scale.linear()
        .domain([minCons,maxCons])
        .range([height,0]);

    var x = d3.scale.linear()
        .domain([minCons,maxCons])
        .range([width,0]);

    var colorScale =d3.scale.linear().domain([minCons,maxCons]).range(["#E61A1A","#5C0A0A"]);

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return calculateXCoordinate(d.dayNumber, d.hour);
        })
        .attr("y", function(d) {
            return height/2;
        })
        .attr("width", blockWidth)
        .attr("height", 20)
        .style("opacity",.7)
        .style("fill", function(d){
            return colorScale(d.consumption);
        });
});