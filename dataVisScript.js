var margin = {top: 20, right: 20, bottom: 20, left: 20};

var outerWidth = 1400;
var outerHeight = 300;

var width = outerWidth - margin.left - margin.right;

var height = outerHeight - margin.top - margin.bottom;

var days = [
     { "Day": "Monday", "DayNumber": 0},
     { "Day": "Tuesday", "DayNumber": 1},
     { "Day": "Wednesday", "DayNumber": 2},
     { "Day": "Thursday", "DayNumber": 3},
     { "Day": "Friday", "DayNumber": 4},
     { "Day": "Saturday", "DayNumber": 5},
     { "Day": "Sunday", "DayNumber": 6}];

var svg = d3.select("body").append("svg")
    .attr("width",outerWidth)
    .attr("height",outerHeight  )
    .style("border","solid black")
    .append("g")
    .attr("transform", "translate(" + ( margin.left + 10 )+ "," + margin.top + ")");

d3.csv("MOCK_DATA.csv", function(data) {
    data.forEach(function(d) {
        // hier map je de data uit de csv aan het "data" object (de '+' is om aan te geven dat het een getalwaarde is
        d.timeStamp = d.Timestamp;
        d.consumption = +d.Consumption;
        d.dateParts = d.Timestamp.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/);
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
        return day * 24 * blockWidth + hour*blockWidth;
    }

    var colorScale =d3.scale.linear().domain([minCons,maxCons]).range(["#E61A1A","#5C0A0A"]);

    // create tooltip div
    var tooltipDiv = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return calculateXCoordinate(d.dayNumber, d.hour);
        })
        .attr("y", function(d) {
            return 0;
        })
        .attr("width", blockWidth)
        .attr("height", 20)
        .style("opacity",.7)
        .style("fill", function(d){
            return colorScale(d.consumption);
            })
        .on("mouseover",function(d) {
            tooltipDiv
                .style("opacity",.9);
            tooltipDiv.html("Day number = " + d.dayNumber + "</br>" + "Hour = " + d.hour + "</br>" + "Consumption = " + d.consumption)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
            .on("mouseout", function(d) {
                tooltipDiv
                    .style("opacity",0);
            });
});