var margin = {top: 20, right: 20, bottom: 20, left: 40};

var outerWidth = 1400;
var outerHeight = 400;

var width = outerWidth - margin.left - margin.right;

var height = outerHeight - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width",outerWidth)
    .attr("height",outerHeight  )
    //.style("border","solid black")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("RestaurantCSV/WabiSabi_Gas.csv", function(data) {
    data.forEach(function(d) {
        // hier map je de data uit de csv aan het "data" object (de '+' is om aan te geven dat het een getalwaarde is
        d.timeStamp = d.Timestamp;
        d.consumption = +d.Consumption;
        d.dateParts = d.Timestamp.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/);
        d.date = new Date(d.dateParts[1], d.dateParts[2], d.dateParts[3], d.dateParts[4], d.dateParts[5], d.dateParts[6], d.dateParts[6]);
        d.hour = d.date.getHours();
        d.dayNumber = d.date.getDay();
    });

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

    // Get the extrema of the consumption
    var minCons = d3.min(data, function(d) {return d.consumption;});
    var maxCons = d3.max(data, function(d) {return d.consumption;});
    var midCons = minCons + (maxCons - minCons)/2;

    //Start- en lastYear
    var startYear = d3.min(data, function(d){return d.date.getYear() + 1900;});
    var lastYear = d3.max(data, function(d){return d.date.getYear() + 1900;});

    //first measured month
    var firstWeek = d3.min(data, function(d){
        if (d.date.getYear() + 1900 == startYear){
            return calculateWeekNr(d.date)[1];
        }
    });

    var blockWidth = width/168;
    var blockheight = height/52;
    var lineheight = 2;

    var calculateXCoordinate = function (day, hour) {
        // this two strange lines are to make sure sunday is put behind saturday instead of being the first in line
        day = day-1;
        if (day == -1) day = 6;
        return day * 24 * blockWidth + hour*blockWidth;
    };

    var calculateYCoordinate = function (date) {

        var yearOffset = date.getFullYear() - startYear;

        if (yearOffset == 0){
            return blockheight * (calculateWeekNr(date)[1] - firstWeek) + 20;
        }
        else {
            return blockheight * (calculateWeekNr(date)[1] + 52 - firstWeek + (yearOffset - 1) * 52) + yearOffset * lineheight + 30 ;
        }

    };

    var colorScale =d3.scale.linear().domain([minCons, midCons,maxCons]).range(['green','yellow','red']);

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
            tooltipDiv.html(d.date.toDateString() + "</br>" +"Week number = " + calculateWeekNr(d.date)[1] + "</br>" +"Day number = " + d.dayNumber + "</br>" + "Hour = " + d.hour + "</br>" + "Consumption = " + d.consumption)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function(d) {
            tooltipDiv
                .style("opacity",0);
        });

    var weekdays = [['Maandag', 0], ['Dinsdag', 1], ['Woensdag', 2], ['Donderdag', 3], ['Vrijdag', 4], ['Zaterdag', 5], ['Zondag', 6]];

    svg.selectAll('text')
        .data(weekdays)
        .enter()
        .append('text')
        .attr('y', 0)
        .attr('x', function(d){
            return d[1] *24 * blockWidth + 12 * blockWidth;
        })
        .attr('anchor', 'center')
        .text(function(d){
            return d[0];
        });

    console.log(lastYear-startYear);

    for(var i = 0; i < (lastYear - startYear + 1); i++){

        svg.append('rect')
            .attr('x', -35 )
            .attr('y', function(){
                    if (i == 0) {
                        return 20 - lineheight;
                    }
                    else {
                        return 30 + (53 - firstWeek) * blockheight;
                    }
            })
            .attr('height', lineheight)
            .attr('width', width + 35);

        svg.append('text')
            .attr('x', -35)
            .attr('y', function(){
                if (i == 0) {
                    return 35 - lineheight;
                }
                else {
                    return 45 + (53 - firstWeek) * blockheight;
                }
            })
            .text(startYear + i);
    }
});