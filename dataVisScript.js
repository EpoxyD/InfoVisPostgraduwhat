var margin = {top: 20, right: 20, bottom: 20, left: 20};

var outerWidth = 1400;
var outerHeight = 300;

var width = outerWidth - margin.left - margin.right;

var height = outerHeight - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width",outerWidth)
    .attr("height",outerHeight  )
    .style("border","solid black")
    .append("g")
    .attr("transform", "translate(" + ( margin.left + 10 )+ "," + margin.top + ")");

d3.csv("Libertad_Electricity.csv", function(data) {
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
    var minCons = d3.min(data, function(d) {return d.consumption;});
    var maxCons = d3.max(data, function(d) {return d.consumption;});

    var blockWidth = width/168;
    var blockheight = height/52;

    var calculateWeekNr = function getWeekNumber(d) {
        // Copy date so don't modify original
        d = new Date(+d);
        d.setHours(0,0,0);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setDate(d.getDate() + 4 - (d.getDay()||7));
        // Get first day of year
        var yearStart = new Date(d.getFullYear(),0,1);
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        // Return array of year and week number
        return [d.getFullYear(), weekNo];
    };

    var calculateXCoordinate = function (day, hour) {
        return day * 24 * blockWidth + hour*blockWidth;
    };

    var calculateYCoordinate = function (date) {
        console.log(calculateWeekNr(date)[1]);
        return blockheight * calculateWeekNr(date)[1];
    };

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
            return calculateYCoordinate(d.date);
        })
        .attr("width", blockWidth)
        .attr("height", blockheight)
        .style("opacity",.7)
        .style("fill", function(d){
            return colorScale(d.consumption);
            })
        .on("mouseover",function(d) {
            tooltipDiv
                .style("opacity",.9);
            tooltipDiv.html("Week number = " + calculateWeekNr(d.date)[1] + "</br>" +"Day number = " + d.dayNumber + "</br>" + "Hour = " + d.hour + "</br>" + "Consumption = " + d.consumption)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
            .on("mouseout", function(d) {
                tooltipDiv
                    .style("opacity",0);
            });
});