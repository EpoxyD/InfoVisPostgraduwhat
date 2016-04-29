var CarpetPlotConsumption = {

    settings: {

    },

    init: function() {
        d3.select("body").append("p")
            .attr("id","nothingToShowMessage")
            .text("Selecteer een restaurant om het verbruik te zien")
            .style('color', '#444444')
            .style('font-family', 'sans-serif');
    },

    showDataFromFile : function (restaurant, type){
        var filename = "DataSet/" + restaurant + "_" + type + ".csv";
        CarpetPlotConsumption.showDataFromFileName(filename )
    },

    showDataFromFileName: function (dataSetFileName) {

        var margin = {top: 20, right: 15, bottom: 20, left: 70};

        var outerWidth = 1400;
        var outerHeight = 500;

        var width = outerWidth  - margin.left - margin.right;

        var height = outerHeight - margin.top - margin.bottom - 100;

        var totalOnHour = new Array(168);
        for(var i = 0; i < totalOnHour.length; i++){
            totalOnHour[i] = 0;
        }

        d3.select("#hourPlot").remove();
        d3.select("#carpetplot").remove();
        d3.select("#tooltip").remove();
        d3.select("#nothingToShowMessage").remove();

        var outersvg = d3.select("body")
            .append("svg")
            .attr("width",outerWidth)
            .attr("height",outerHeight)
            .attr("id", "carpetplot");

        var svg = outersvg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.select("#carpetplot").style('visibility', 'hidden');

        /**
         * Draw a carpetplot based on the selected house and metertype
         */

        d3.csv(dataSetFileName, function(data) {
            var radius = 100;
            var fisheye = d3.fisheye.circular().radius(radius);

            data.forEach(function(d) {
                // hier map je de data uit de csv aan het "data" object (de '+' is om aan te geven dat het een getalwaarde is
                d.timeStamp = d.Timestamp;
                d.consumption = +d.Consumption;
                d.degreeDays = +d.heatingDegreeDays;
                d.temp = +d.temperature;
                d.dateParts = d.Timestamp.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/);
                d.date = new Date(d.dateParts[3], d.dateParts[2], d.dateParts[1], d.dateParts[4], d.dateParts[5], d.dateParts[5], d.dateParts[5]);
                d.hour = d.date.getHours();
                d.dayNumber = d.date.getDay();
                d.x;
                d.y;
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

            /*
             *  Calculations to make the positioning of the circles in the carpetplot easier
             */

            // Get the extrema of the consumption
            var minDegreeCons = d3.min(data, function(d) {
                if (d.degreeDays < 1 ){
                    d.degreeDays = 1;
                }

                if (meterType == 'Water'){
                    d.degreeConsumption = d.consumption;
                    return d.degreeConsumption;
                }
                else {
                    d.degreeConsumption = d.consumption / d.degreeDays;
                    return d.degreeConsumption;
                }
            });
            var maxDegreeCons = d3.max(data, function(d) {
                return d.degreeConsumption;
            });

            var minCons = d3.min(data, function(d) {
                return d.consumption;
            });
            var maxCons = d3.max(data, function(d) {
                return d.consumption;
            });

            //Start- en lastYear
            var startYear = d3.min(data, function(d){return d.date.getYear() + 1900;});
            var lastYear = d3.max(data, function(d){return d.date.getYear() + 1900;});

            //first measured month
            var firstWeek = d3.min(data, function(d){
                if (d.date.getYear() + 1900 == startYear){
                    return calculateWeekNr(d.date)[1];
                }
            });

            var totaalColumnWidth = (1300 - 85)/8;
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

            var degreeHalf = (maxDegreeCons - minDegreeCons)/2;
            var degreeColorScale =d3.scale.linear()
                .domain([minDegreeCons,(minDegreeCons+degreeHalf) ,maxDegreeCons])
                .range(["#ebfaeb","#33cc33","#0a290a"]); //Green

            var half = (maxCons - minCons)/2;
            var colorScale =d3.scale.linear()
                .domain([minCons,(minCons+half) ,maxCons])
                .range(["#ebfaeb","#33cc33","#0a290a"]); //Green

            // create tooltip div
            var tooltipDiv = d3.select("body").append("div")
                .attr("class","tooltip")
                .attr("id", "tooltip")
                .style("opacity",0);

            var lastYCoord = 0;

            /*
             *  Highlights to show the selected horizontal and vertical lines
             */

            var moveHighlights = true;

            var highlightHorizontal = svg
                .append("rect")
                .attr("x",0)
                .attr("y",10)
                .attr("width",width)
                .attr("height",blockheight)
                .style("fill","#F0E68C")
                .style("opacity",0);

            var highlightVertical = svg
                .append("rect")
                .attr("x",100)
                .attr("y",margin.top)
                .attr("width",blockWidth)
                .attr("height",height + 100)
                .style("fill","#F0E68C")
                .style("opacity",0);

            /*
             *  The actual adding of the circles to the carpetplot
             */

            var circles = svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    var x  = Math.round((calculateXCoordinate(d.dayNumber, d.hour,true))/blockWidth);
                    totalOnHour[x] += d.degreeConsumption;
                    d.x = (x*blockWidth + blockWidth/2);
                    return d.x;
                })
                .attr("cy", function(d) {
                    var y = calculateYCoordinate(d.date) + blockheight/2;
                    lastYCoord = y + blockheight/2;
                    d.y = y;
                    return d.y;
                })
                .attr('r', function(){
                    if (blockheight < blockWidth){
                        return (blockheight/2) * 0.85;
                    }
                    return (blockWidth/2) * 0.85;
                })
                .style("opacity",.9)
                .style("fill", function(d){
                    return degreeColorScale(d.degreeConsumption);
                });

            /*
             *  Adding invisible squares on top to make hovering easier
             */

            var squares = svg.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function(d) {
                    var x  = Math.round((calculateXCoordinate(d.dayNumber, d.hour,true))/blockWidth);
                    totalOnHour[x] += d.degreeConsumption;
                    d.x = (x*blockWidth + blockWidth/2);
                    return d.x;
                })
                .attr("y",function(d) {
                    var y = calculateYCoordinate(d.date) + blockheight/2;
                    lastYCoord = y + blockheight/2;
                    d.y = y;
                    return d.y;
                })
                .attr("width",blockWidth)
                .attr("height",blockheight)
                .style("fill","rgba(255, 255, 255, 0)") // uncomment this line to make the squares visible
                .on("mouseover",function(d) {
                    //adjust the tooltip
                    tooltipDiv
                        .style("opacity",.9);

                    //Get this circle's x/y values, then augment for the tooltip
                    var xPosition = parseFloat(d3.select(this).attr("x"));
                    var restHeight = +d3.select('#svg_houses').attr('height');
                    var yPosition = parseFloat(d3.select(this).attr("y")) + restHeight - radius;

                    //getdate in dutch
                    var day = weekdays_short[d.date.getDay()];
                    var date = d.date.getDate();
                    var month = monthNames[d.date.getMonth()];
                    var year = +d.date.getYear() + 1900;

                    tooltipDiv.html(day + ' ' + date + ' ' + month + ' ' + year + "</br>Tijd: " + d.date.getHours() + ":0" + d.date.getMinutes() + "</br>"  + "Verbruik = " + Math.round(d.degreeConsumption))
                        .style("left", xPosition + "px")
                        .style("top", (yPosition+radius*2.5) + "px");

                    if (moveHighlights == true) {

                        highlightHorizontal
                            .attr("y", function () {
                                var y = calculateYCoordinate(d.date) + blockheight / 2;
                                lastYCoord = y + blockheight / 2;
                                d.y = y;
                                return d.y - blockheight / 2;
                            })
                            .style("opacity", 0.7);

                        highlightVertical
                            .attr("x", function () {
                                var x = Math.round((calculateXCoordinate(d.dayNumber, d.hour, true)) / blockWidth);
                                totalOnHour[x] += d.degreeConsumption;
                                d.x = (x * blockWidth + blockWidth / 2);
                                return d.x - blockWidth / 2;
                            })
                            .style("opacity", 0.7);
                    }
                })
                .on("click", function(d){
                    //adjust the restaurants
                    CarpetPlotConsumption.adjustHouses(d.timeStamp);

                    //adjust the date
                    d3.select('#date')
                        .transition()
                        .duration(1000)
                        .text(function(){
                            var day = weekdays_short[d.date.getDay()];
                            var date = d.date.getDate();
                            var month = monthNames[d.date.getMonth()];
                            var year = +d.date.getYear() + 1900;

                            return( day + ' ' + date + ' ' + month + ' ' + year);
                        });

                    //adjust the time
                    d3.select('#time')
                        .transition()
                        .duration(1000)
                        .text(function(){
                            return (d.date.getHours() + ":0" + d.date.getMinutes());
                        });

                    //adjust the temperature
                    d3.select('#temperature')
                        .transition()
                        .duration(1000)
                        .text(function(){
                            return (d.temp + ' °C');
                        });

                    //Highlights
                    moveHighlights = false;

                    highlightHorizontal
                        .transition()
                        .duration(600)
                        .attr("y", function () {
                            var y = calculateYCoordinate(d.date) + blockheight / 2;
                            lastYCoord = y + blockheight / 2;
                            d.y = y;
                            return d.y - blockheight / 2;
                        })
                        .style("opacity", 0.7);

                    highlightVertical
                        .transition()
                        .duration(600)
                        .attr("x", function () {
                            var x = Math.round((calculateXCoordinate(d.dayNumber, d.hour, true)) / blockWidth);
                            totalOnHour[x] += d.degreeConsumption;
                            d.x = (x * blockWidth + blockWidth / 2);
                            return d.x - blockWidth / 2;
                        })
                        .style("opacity", 0.7);

                })
                .on("mouseout", function() {
                    tooltipDiv
                        .style("opacity",0);
                    if (moveHighlights == true) {
                        highlightHorizontal.style("opacity", 0);
                        highlightVertical.style("opacity", 0);
                    }
                });

            var weekdays_short = ['Zon', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Zat'];

            // Resize the svg to fit all the content
            d3.select('#carpetplot')
                .style('height', lastYCoord + 3 * blockheight + height / 4);

            /*
             *  Fisheye
             */
            var enableFisheye = true;

            //Add a toggle button to turn the fisheye on or off
            var toggle = d3.select('#carpetplot').append('g')
                .on('click', function(){
                    if(enableFisheye == true){
                        enableFisheye = false;
                        d3.select('#toggle_button')
                            .transition()
                            .duration(600)
                            .attr('transform', function(){
                                return "translate(" + (-30) + "," + 0 + ")";
                            });
                    }
                    else{
                        enableFisheye = true;
                        d3.select('#toggle_button')
                            .transition()
                            .duration(600)
                            .attr('transform', function(){
                                return "translate(" + (0) + "," + 0 + ")";
                            });
                    }
                })
                .attr("transform","translate(" + (outerWidth - 70) + "," + 0 + ")");

            toggle.append('rect')
                .attr('x', 17.5)
                .attr('y', 0)
                .attr('width', 30)
                .attr('height', 30)
                .attr('fill', '#888888');

            toggle.append('circle')
                .attr('cx', 17.5)
                .attr('cy', 15)
                .attr('r', 15)
                .attr('fill', '#888888');

            toggle.append("text")
                .style("fill", "white")
                .attr("x", 17.5)
                .attr("y", 19.5)
                .attr('font-family', 'sans-serif')
                .attr('font-size', '11')
                .attr("text-anchor", "middle")
                .text("ON");

            toggle.append('circle')
                .attr('cx', 47.5)
                .attr('cy', 15)
                .attr('r', 15)
                .attr('fill', '#888888');

            toggle.append("text")
                .style("fill", "white")
                .attr("x", 47.5)
                .attr("y", 19.5)
                .attr('font-family', 'sans-serif')
                .attr('font-size', '11')
                .attr("text-anchor", "middle")
                .text("OFF");

            var toggle_button = toggle.append('g')
                .attr('id', 'toggle_button');

            toggle_button.append('circle')
                .attr('cx', 47.5)
                .attr('cy', 15)
                .attr('r', 14)
                .attr('fill', '#444444');

            toggle_button.append("image")
                .attr("xlink:href", "img/ic_magnifying_glass.png")
                .attr("x", 47.5 - 7)
                .attr("y", 15 - 7)
                .attr("width", 14)
                .attr("height", 14);

            // Implement the fisheye
            d3.select('#carpetplot').on("mousemove", function() {
                if(enableFisheye == true) {
                    fisheye.focus([d3.mouse(this)[0] - margin.left, d3.mouse(this)[1] - 10]);

                    circles.each(function (d) {
                            d.fisheye = fisheye(d);
                        })
                        .attr("cx", function (d) {
                            return d.fisheye.x;
                        })
                        .attr("cy", function (d) {
                            return d.fisheye.y;
                        })
                        .attr("r", function (d) {
                            return d.fisheye.z * 2.75;
                        });
                }
            });

            // Remove the fisheye
            d3.select('#carpetplot').on("mouseout", function() {
                fisheye.focus([d3.select('#carpetplot').width + 4 * radius, d3.select('#carpetplot').height + 4 * radius]);

                circles.each(function (d) {
                        d.fisheye = fisheye(d);
                    })
                    .attr("cx", function (d) {
                        return d.fisheye.x;
                    })
                    .attr("cy", function (d) {
                        return d.fisheye.y;
                    })
                    .attr("r", function (d) {
                        return d.fisheye.z * 2.75;
                    });
            });

            d3.select('#carpetplot').on('mouseenter', function(){
                moveHighlights = true;
            });

            /*
             *  Add the Weektotals on the right
             */

            var weekdays = [['Maandag', 0], ['Dinsdag', 1], ['Woensdag', 2], ['Donderdag', 3], ['Vrijdag', 4], ['Zaterdag', 5], ['Zondag', 6]];
            var weekTotals = [];
            // add all the week-y coordinates to the array
            for (i = 0; i < data.length; i++) {
                var ycoord = calculateYCoordinate(data[i].date);
                if (!(weekTotals.filter(function(e) { return e.ycoordinate == ycoord; }).length > 0)) {
                    var temp = {ycoordinate: ycoord, total: 0 , realTotal: 0};
                    weekTotals.push(temp);
                }
            }
            // add up the totals (total = relative, realTotal = absolute measurement)
            for (i = 0; i < data.length; i++) {
                var ycoord = calculateYCoordinate(data[i].date);
                var pos = weekTotals.map(function(e) { return e.ycoordinate; }).indexOf(ycoord);
                var total = weekTotals[pos].total;
                var realTotal = weekTotals[pos].realTotal;
                total += data[i].degreeConsumption;
                realTotal += data[i].consumption;
                weekTotals[pos].total = total;
                weekTotals[pos].realTotal = realTotal;
            }

            var totalWeekMin = d3.min(weekTotals, function(d) {return d.total;});
            var totalWeekMax = d3.max(weekTotals, function(d) {return d.total;});

            var realTotalWeekMin = d3.min(weekTotals, function(d) {return d.realTotal;});
            var realTotalWeekMax = d3.max(weekTotals, function(d) {return d.realTotal;});

            var totalScale = d3.scale.linear()
                .domain([totalWeekMin,totalWeekMax])
                .range([0,totaalColumnWidth - blockWidth]);
            var realTotalScale = d3.scale.linear()
                .domain([realTotalWeekMin,realTotalWeekMax])
                .range([0,totaalColumnWidth - blockWidth]);

            var weekTotRects = svg.append("g").
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
                    .attr('width', 1300 - 85)
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

            /*
             *  Add vertical separator lines
             */

            var verticalDaySeperatorLines = [1,2,3,4,5,6];

            var verticalDaySeperators = svg.append("g").selectAll("rect")
                .data(verticalDaySeperatorLines)
                .enter()
                .append("rect")
                .attr("x", function(d) {
                  return d * 24 * blockWidth;
                })
                .attr("y",margin.top - blockheight)
                .attr("width",lineheight)
                .attr("height", 2*blockheight )//lastYCoord - 3*blockheight)
                .attr("fill","#666666");


            // #######################################################################################################################################################################################


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

            var svgHourTotals = outersvg
                .append("g")
                .attr("transform","translate(" + margin.left + "," + (margin.top + lastYCoord + blockheight) + ")");

            for (var i = 0; i < totalOnHour.length; i++){
                svgHourTotals.append('rect')
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


            /*
             *  function to adjust the carpet plot
             */

            var adjustPlot = function(toDegreeDays){

                if (toDegreeDays != false) {
                    //show relative measurements
                    weekTotRects.each(function (d) {
                        d3.select(this)
                            .transition()
                            .duration(600)
                            .attr('width', totalScale(d.total));
                    });

                    circles.each(function (d) {
                        d3.select(this)
                            .transition()
                            .duration(600)
                            .style('fill', degreeColorScale(d.degreeConsumption));
                    });
                } else {
                    //show Absolute measurements
                    weekTotRects.each(function (d) {
                        d3.select(this)
                            .transition()
                            .duration(600)
                            .attr('width', realTotalScale(d.realTotal));
                    });

                    circles.each(function (d) {
                        d3.select(this)
                            .transition()
                            .duration(600)
                            .style('fill', colorScale(d.consumption));
                    });
                }
            };



            /*
             *  Add a toggle button to show absolute or relative consumption
             */

            if (meterType != 'Water') {

                var degreeDaysOn = true;

                var toggle2 = d3.select('#carpetplot').append('g')
                    .on('click', function () {
                        if (degreeDaysOn == true) {
                            degreeDaysOn = false;
                            d3.select('#toggle2_button')
                                .transition()
                                .duration(600)
                                .attr('transform', function () {
                                    return "translate(" + (-30) + "," + 0 + ")";
                                });
                        }
                        else {
                            degreeDaysOn = true;
                            d3.select('#toggle2_button')
                                .transition()
                                .duration(600)
                                .attr('transform', function () {
                                    return "translate(" + (0) + "," + 0 + ")";
                                });
                        }

                        adjustPlot(degreeDaysOn);

                    })
                    .attr("transform", "translate(" + (outerWidth - 140) + "," + 0 + ")");

                toggle2.append('rect')
                    .attr('x', 17.5)
                    .attr('y', 0)
                    .attr('width', 30)
                    .attr('height', 30)
                    .attr('fill', '#888888');

                toggle2.append('circle')
                    .attr('cx', 17.5)
                    .attr('cy', 15)
                    .attr('r', 15)
                    .attr('fill', '#888888');

                toggle2.append("text")
                    .style("fill", "white")
                    .attr("x", 17.5)
                    .attr("y", 19.5)
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', '11')
                    .attr("text-anchor", "middle")
                    .text("ON");

                toggle2.append('circle')
                    .attr('cx', 47.5)
                    .attr('cy', 15)
                    .attr('r', 15)
                    .attr('fill', '#888888');

                toggle2.append("text")
                    .style("fill", "white")
                    .attr("x", 47.5)
                    .attr("y", 19.5)
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', '11')
                    .attr("text-anchor", "middle")
                    .text("OFF");

                var toggle2_button = toggle2.append('g')
                    .attr('id', 'toggle2_button');

                toggle2_button.append('circle')
                    .attr('cx', 47.5)
                    .attr('cy', 15)
                    .attr('r', 14)
                    .attr('fill', '#444444');

                toggle2_button.append("image")
                    .attr("xlink:href", "img/ic_temperature.png")
                    .attr("x", 47.5 - 9)
                    .attr("y", 15 - 9)
                    .attr("width", 18)
                    .attr("height", 18);

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

        //calculate the maximum of the 6 values to scale the heights
        var max = d3.max(consumptions, function (d) {
            return +d;
        });

        var y_scale = d3.scale.linear().domain([0, max + 1]).range([70, +d3.select('#svg_houses').attr('height') - 40]);

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
                var y = (height - (y_scale(average) + 15));
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
