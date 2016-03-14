var CarpetPlotConsumption = {

    settings: {

    },

    init: function() {
        CarpetPlotConsumption.showDataFromFile("DataSet/WabiSabi_Gas.csv");
    }
    ,

    showDataFromFile: function (dataSetFileName) {

        var margin = {top: 20, right: 20, bottom: 20, left: 40};

        var outerWidth = 1400;
        var outerHeight =400;

        var width = outerWidth - margin.left - margin.right;

        var height = outerHeight - margin.top - margin.bottom;

        d3.select("#carpetplot").remove();
        d3.select("#tooltip").remove();

        var svg = d3.select("body")
            .append("svg")
            .attr("width",outerWidth)
            .attr("height",outerHeight)
            .attr("id", "carpetplot")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv(dataSetFileName, function(data) {
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


            //Start- en lastYear
            var startYear = d3.min(data, function(d){return d.date.getYear() + 1900;});
            var lastYear = d3.max(data, function(d){return d.date.getYear() + 1900;});

            //first measured month
            var firstWeek = d3.min(data, function(d){
                if (d.date.getYear() + 1900 == startYear){
                    return calculateWeekNr(d.date)[1];
                }
            });

            var totaalColumnWidth = width/8;
            var blockWidth = (totaalColumnWidth*7)/168;
            var blockheight = height/52;
            var lineheight = 2;

            var calculateXCoordinate = function (day, hour, sundayBeforeMonday) {
                // this two strange lines are to make sure sunday is put behind saturday instead of being the first in line
                if(sundayBeforeMonday) {
                    day = day - 1;
                    if (day == -1) day = 6;
                }
                return day * 24 * blockWidth + hour*blockWidth;
            };

            var calculateYCoordinate = function (date) {

                var yearOffset = date.getFullYear() - startYear;

                if (yearOffset == 0){
                    return blockheight * (calculateWeekNr(date)[1] - firstWeek) + 20;
                }
                else {
                    if (calculateWeekNr(date)[1] == 53){
                        return blockheight * ( 53 - firstWeek + (yearOffset - 1) * 52) + yearOffset * lineheight + 30 ;
                    }
                    else {
                        return blockheight * (calculateWeekNr(date)[1] + 52 - firstWeek + (yearOffset - 1) * 52) + yearOffset * lineheight + 30;
                    }
                }

            };

            var half = (maxCons - minCons)/2;
            var colorScale =d3.scale.linear()
                .domain([minCons,(minCons+half) ,maxCons])
                .range(["green","yellow","red"]);

            // create tooltip div
            var tooltipDiv = d3.select("body").append("div")
                .attr("class","tooltip")
                .attr("id", "tooltip")
                .style("opacity",0);

            svg.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function(d) {
                    return calculateXCoordinate(d.dayNumber, d.hour,true);
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
                    tooltipDiv.html(d.date.toDateString() + "</br>Time: " + d.date.getHours() + ":0" + d.date.getMinutes() + "</br>"  + "Consumption = " + Math.round(d.consumption))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");

                })
                .on("mouseout", function() {
                    tooltipDiv
                        .style("opacity",0);
                });

            var weekdays = [['Maandag', 0], ['Dinsdag', 1], ['Woensdag', 2], ['Donderdag', 3], ['Vrijdag', 4], ['Zaterdag', 5], ['Zondag', 6],['Totaal',7]];
            var weekTotals = [];
            // add all the week-y coordinates to the array
            for (i = 0; i < data.length; i++) {
                var ycoord = calculateYCoordinate(data[i].date);
                if (!(weekTotals.filter(function(e) { return e.ycoordinate == ycoord; }).length > 0)) {
                    var temp = {ycoordinate: ycoord, total: 0};
                    weekTotals.push(temp);
                }
            }
            // add up the totals
            for (i = 0; i < data.length; i++) {
                var ycoord = calculateYCoordinate(data[i].date);
                var pos = weekTotals.map(function(e) { return e.ycoordinate; }).indexOf(ycoord);
                var total = weekTotals[pos].total;
                total += data[i].consumption;
                weekTotals[pos].total = total;
            }

            var totalWeekMin = d3.min(weekTotals, function(d) {return d.total;});
            var totalWeekMax = d3.max(weekTotals, function(d) {return d.total;});

            var totalScale = d3.scale.linear()
                .domain([totalWeekMin,totalWeekMax])
                .range([0,totaalColumnWidth]);

            svg.append("g").
                selectAll("rect")
                .data(weekTotals)
                .enter()
                .append("rect")
                .attr("x", function(d) {
                    return calculateXCoordinate(7, 0,false);
                })
                .attr("y", function(d) {
                    return d.ycoordinate;
                })
                .attr("width", function (d) {
                    return  totalScale(d.total);
                })
                .attr("height", blockheight)
                .style("opacity",.7)
                .style("fill", "#009999")
                .on("mouseover",function(d) {
                    tooltipDiv
                        .style("opacity",.9);
                    tooltipDiv.html("Total this week = " + Math.round(d.total))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");

                })
                .on("mouseout", function() {
                    tooltipDiv
                        .style("opacity",0);
                });

            svg.selectAll('text')
                .data(weekdays)
                .enter()
                .append('text')
                .attr('y', 0)
                .attr('x', function(d){
                    return calculateXCoordinate(d[1],12,false);
                    //return d[1] *24 * blockWidth + 12 * blockWidth;
                })
                .attr('text-anchor', 'middle')
                .text(function(d){
                    return d[0];
                });

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
    }

};