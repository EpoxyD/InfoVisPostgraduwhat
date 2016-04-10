var CarpetPlotConsumption = {

    settings: {

    },

    init: function() {
        d3.select("body").append("p")
            .attr("id","nothingToShowMessage")
            .text("Click on a restaurant to show it's data!")
            .attr('fill', '#666666')
            .attr('font-family', 'sans-serif');
    },

    showDataFromFile : function (restaurant, type){
        var filename = "DataSet/" + restaurant + "_" + type + ".csv";
        CarpetPlotConsumption.showDataFromFileName(filename )
    },

    showDataFromFileName: function (dataSetFileName) {

        var margin = {top: 20, right: 20, bottom: 20, left: 70};

        var outerWidth = 1400;
        var outerHeight =400;

        var width = outerWidth - margin.left - margin.right;

        var height = outerHeight - margin.top - margin.bottom;

        var totalOnHour = new Array(168);
        for(var i = 0; i < totalOnHour.length; i++){
            totalOnHour[i] = 0;
        }

        d3.select("#hourPlot").remove();
        d3.select("#carpetplot").remove();
        d3.select("#tooltip").remove();
        d3.select("#nothingToShowMessage").remove();

        var svg = d3.select("body")
            .append("svg")
            .attr("width",outerWidth)
            .attr("height",outerHeight)
            .attr("id", "carpetplot")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.select("#carpetplot").style('visibility', 'hidden');

        /**
         * Draw a carpetplot based on the selected house and metertype
         */

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
            var lineheight = 1;

            var calculateXCoordinate = function (day, hour, sundayBeforeMonday) {
                // this two strange lines are to make sure sunday is put behind saturday instead of being the first in line
                if(sundayBeforeMonday) {
                    day = day - 1;
                    if (day == -1) day = 6;
                }
                return day * 24 * blockWidth + hour * blockWidth;
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
                //.range(["#ffebe6","#ff3300","#330a00"]); RED
                .range(["#ebfaeb","#33cc33","#0a290a"]); //Green

            // create tooltip div
            var tooltipDiv = d3.select("body").append("div")
                .attr("class","tooltip")
                .attr("id", "tooltip")
                .style("opacity",0);

            var lastYCoord = 0;

            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    var x  = Math.round((calculateXCoordinate(d.dayNumber, d.hour,true))/blockWidth);
                    totalOnHour[x] += d.consumption;
                    return (x*blockWidth + blockWidth/2);
                })
                .attr("cy", function(d) {
                    var y = calculateYCoordinate(d.date) + blockheight/2;
                    lastYCoord = y + blockheight/2;
                    return y;
                })
                .attr('r', function(){
                    if (blockheight < blockWidth){
                        return (blockheight/2) * 0.85;
                    }
                    return (blockWidth/2) * 0.85;
                })
                .style("opacity",.9)
                .style("fill", function(d){
                    return colorScale(d.consumption);
                })
                .on("mouseover",function(d) {
                    //adjust the tooltip
                    tooltipDiv
                        .style("opacity",.9);
                    tooltipDiv.html(d.date.toDateString() + "</br>Time: " + d.date.getHours() + ":0" + d.date.getMinutes() + "</br>"  + "Consumption = " + Math.round(d.consumption))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");

                    //adjust the restaurants
                    CarpetPlotConsumption.adjustHouses(d.timeStamp);

                    //adjust the date
                    d3.select('#date')
                        .transition()
                        .duration(1000)
                        .text(function(){
                            return (d.date.toDateString());
                        });

                    //adjust the date
                    d3.select('#time')
                        .transition()
                        .duration(1000)
                        .text(function(){
                            return (d.date.getHours() + ":0" + d.date.getMinutes());
                        });

                })
                .on("mouseout", function() {
                    tooltipDiv
                        .style("opacity",0);
                });

            d3.select('#carpetplot')
                .style('height', lastYCoord + 3 * blockheight);

            var weekdays = [['Maandag', 0], ['Dinsdag', 1], ['Woensdag', 2], ['Donderdag', 3], ['Vrijdag', 4], ['Zaterdag', 5], ['Zondag', 6]];
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
                .range([0,totaalColumnWidth - blockWidth]);

            svg.append("g").
                selectAll("rect")
                .data(weekTotals)
                .enter()
                .append("rect")
                .attr("x", function(d) {
                    return calculateXCoordinate(7, 0,false) + blockWidth;
                })
                .attr("y", function(d) {
                    return d.ycoordinate + blockheight * 0.1 + blockheight/4;
                })
                .attr("width", function (d) {
                    return  totalScale(d.total);
                })
                .attr("height", blockWidth - 5)
                .attr('fill', '#666666')
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
                .attr('fill', '#666666')
                .attr('font-family', 'sans-serif')
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
                    .attr('x', -totaalColumnWidth )
                    .attr('y', function(){
                        if (i == 0) {
                            return 20 - lineheight;
                        }
                        else {
                            return 30 + (53 - firstWeek) * blockheight;
                        }
                    })
                    .attr('height', lineheight)
                    .attr('width', width)
                    .attr('fill', '#666666');

                svg.append('text')
                    .attr('fill', '#666666')
                    .attr('font-family', 'sans-serif')
                    .attr('x', -65)
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

            //Maandnamen
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            var firstDay = data[0].date.getDate();

            var firstMonth = data[0].date.getMonth();

            var firstMonth_offset = (30 - firstDay) % 7;

            for(var i = firstMonth; i < monthNames.length; i++ ){
                svg.append('text')
                    .attr('fill', '#666666')
                    .attr('font-family', 'sans-serif')
                    .attr('x', -20)
                    .attr('y', ((firstMonth_offset * blockheight / 2) + (i - firstMonth) * 4 * blockheight) + 30 )
                    .attr('font-size', 10)
                    .text(monthNames[i]);
            }

            firstMonth_offset = ((firstMonth_offset * blockheight / 2) + (11 - firstMonth) * 4 * blockheight) + 30;

            if(lastYear != startYear) {
                for (var i = 0; i < 3; i++) {
                    svg.append('text')
                        .attr('fill', '#666666')
                        .attr('font-family', 'sans-serif')
                        .attr('x', -20)
                        .attr('y', (firstMonth_offset + i * 4 * blockheight + blockheight) + 30)
                        .attr('font-size', 10)
                        .text(monthNames[i]);
                }
            }

            d3.select("#carpetplot").style('visibility', 'visible');

            var totalHourMin = d3.min(totalOnHour, function(d) {return d;});
            var totalHourMax = d3.max(totalOnHour, function(d) {return d;});

            var verticalScale = d3.scale.linear()
                .domain([totalHourMin,totalHourMax])
                .range([0,height / 4]);

            var svg2 = d3.select("body")
                .append("svg")
                .attr("width",outerWidth)
                .attr("height",outerHeight / 4)
                .attr("id", "hourPlot")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + 0 + ")");

            for (var i = 0; i < totalOnHour.length; i++){
                svg2.append('rect')
                    .attr('width', blockWidth - 5)
                    .attr('height', function(){
                        return verticalScale(totalOnHour[i]);
                    })
                    .attr('y', 0)
                    .attr('x', function(){
                        return ((i) * blockWidth + 2.5);
                    })
                    .attr('fill', '#666666');
            }

            ProgressDialog();

        });
    },

    /**
     * Function to adjust the houses to their consumption on that date and time.
     * Dataset is converted to json in CSVtoJSON.js where the timestamps are used as json-object names
     *
     * @param timestamp
     */

    adjustHouses : function(timestamp) {

        ts = timestamp;

        //make an empty array
        var consumptions = [];

        //fill the array with the consumption of each house at that time
        //push -1 in case no data is available
        for (var i = 0; i < restaurants.length; i++) {
            var value = restaurants[i][meterType][timestamp];
            if (value == null || value < 0) {
                consumptions.push(-1);
            }
            else {
                consumptions.push(value);
            }
        }

        console.log(consumptions);

        //calculate the maximum of the 6 values to scale the heights
        var max = d3.max(consumptions, function (d) {
            return +d;
        });

        var y_scale = d3.scale.linear().domain([0, max + 1]).range([70, height]);

        //adjust the average line (the flags)
        //calculate the average
        var total = 0;
        var number = 0;

        for (var i = 0; i < consumptions.length; i++) {
            if (+consumptions[i] != -1) {
                number++;
                total += +consumptions[i];
            }
        }

        var average = total / number;

        //move the flags to the correct height
        d3.select('#average')
            .transition()
            .duration(1000)
            .attr('transform', function () {
                var y = ((height - 164) - y_scale(average));
                return 'translate(0,' + y + ')';
            });

        //adjust the pole height
        for (var i = 1; i < 3; i++) {
            d3.select('#pole' + i)
                .transition()
                .duration(1000)
                .attr('height', y_scale(average))
                .attr('y', height + 20 - y_scale(average));
        }

        //make the transition of every house to its new value
        for (var i = 0; i < restaurants.length; i++) {
            var h = d3.select('#house' + i).attr('height');

            //Check if there's data or not
            if (consumptions[i] != -1) {
                //check if it's previous value was data or no data available
                if (h == 0) {
                    //do the transition from no data available to new data

                    d3.select('#no_data' + i)
                        .transition()
                        .duration(500)
                        .attr('opacity', 0);

                    d3.select('#no_data' + i)
                        .transition()
                        .delay(500)
                        .style('visibility', 'hidden');

                    d3.select('#house' + i)
                        .transition()
                        .duration(100)
                        .delay(500)
                        .attr('height', 60)
                        .attr('y', function () {
                            return height - 60;
                        });

                    d3.select('#house' + i)
                        .transition()
                        .duration(400)
                        .delay(600)
                        .attr('height', function () {
                            return y_scale(consumptions[i]);
                        })
                        .attr('y', function () {
                            return height - y_scale(consumptions[i]);
                        });

                    d3.select('#door' + i)
                        .transition()
                        .duration(150)
                        .delay(550)
                        .style('visibility', 'visible');

                    d3.select('#window' + i)
                        .transition()
                        .duration(150)
                        .delay(550)
                        .style('visibility', 'visible');
                }

                else {
                    //do the transition from data to new data

                    d3.select('#no_data' + i)
                        .style('visibility', 'hidden');

                    d3.select('#door' + i)
                        .style('visibility', 'visible');

                    d3.select('#window' + i)
                        .style('visibility', 'visible');

                    d3.select('#house' + i)
                        .transition()
                        .duration(1000)
                        .attr('height', function () {
                            return y_scale(consumptions[i]);
                        })
                        .attr('y', function () {
                            return height - y_scale(consumptions[i]);
                        });
                }
            }
            else {
                if (h != 0) {
                    //do the transition from data to no data available

                    d3.select('#house' + i)
                        .transition()
                        .duration(400)
                        .attr('height', 70)
                        .attr('y', function () {
                            return height - 70;
                        });

                    d3.select('#house' + i)
                        .transition()
                        .duration(100)
                        .delay(400)
                        .attr('height', 0)
                        .attr('y', function () {
                            return height;
                        });

                    d3.select('#door' + i)
                        .transition()
                        .duration(150)
                        .delay(350)
                        .style('visibility', 'hidden');

                    d3.select('#window' + i)
                        .transition()
                        .duration(300)
                        .delay(350)
                        .style('visibility', 'hidden');
                }

                d3.select('#no_data' + i)
                    .style('visibility', 'visible')
                    .transition()
                    .duration(500)
                    .delay(500)
                    .attr('opacity', 0.9);
            }
        }
    }
};
