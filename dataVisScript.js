var margin = {top: 20, right: 20, bottom: 20, left: 40};

var outerWidth = 1400;
var outerHeight = 400;

var width = outerWidth - margin.left - margin.right;

var height = outerHeight - margin.top - margin.bottom;

var restaurantName;
var meterType = 'Gas';

var myBlue = "#324aff";
var myCyan = "#32ffff";
var myGreen = "#32ff32";
var myYellow = "#ffff32";
var myRed = "#ff3232";

/**
 *  Carpet Plot
 */

var carpetplot = function(name, type){
    d3.select("#carpetplot").remove();
    d3.select("#tooltip").remove();

    var svg = d3.select("body")
        .append("svg")
        .attr("width",outerWidth)
        .attr("height",outerHeight)
        .attr("id", "carpetplot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("RestaurantCSV/" + name + "_" + type + ".csv", function(data) {
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

        var oneFifth = (maxCons - minCons)/5;
        var colorScale =d3.scale.linear()
            .domain([minCons,(minCons+oneFifth),(minCons+2*oneFifth),(minCons+3*oneFifth),(minCons+4*oneFifth) ,maxCons])
            .range([myBlue,myCyan,myGreen,myYellow,myRed]);

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
};

/**
 *  Street view
 */

var restaurants = [
    {
        id: 0,
        naam: 'WabiSabi',
        type: 'restaurant',
        max: 5479.025764895603
    },
    {
        id: 1,
        naam: 'MusiCafe',
        type: 'café',
        max: 11587.807881773915
    },
    {
        id: 2,
        naam: 'Libertad',
        type: 'café',
        max: 903410
    },
    {
        id: 3,
        naam: 'Tr3s',
        type: 'restaurant',
        max: 8436.770186335314
    },
    {
        id: 4,
        naam: 'Aquasanta',
        type: 'restaurant',
        max: 890.5
    },
    {
        id: 5,
        naam: 'Troubadour',
        type: 'restaurant',
        max: 468000
    }
];

var svg_houses = d3.select('body').append('svg')
    .attr('width', outerWidth)
    .attr('height', outerHeight)
    .attr('id', 'svg_houses')
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var houses = {
    restaurant: function(h, w, id){

        var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
            g = d3.select(e)
                .attr('class','node');

        //Create first floor
        g.append('rect')
            .attr('y', height - h)
            .attr('x', 0)
            .attr('height', h)
            .attr('width', w)
            .attr('fill', '#359FD4')
            .attr('id', 'house' + id);
        //door
        g.append('rect')
            .attr('y', height - (w * 0.5))
            .attr('x', w * 0.1)
            .attr('height', (w * 0.5))
            .attr('width', (w * 0.2))
            .attr('fill', '#35D49F')
            .attr('id', 'door' + id);
        //window
        g.append('rect')
            .attr('y', height - (w * 0.5))
            .attr('x', w * 0.5)
            .attr('height', (w * 0.3))
            .attr('width', (w * 0.4))
            .attr('fill', '#FFFFFF')
            .attr('id', 'window'+ id);

        return g;
    },
    café:function(h, w, id){

        var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
            g = d3.select(e)
                .attr('class','node');

        //Create first floor
        g.append('rect')
            .attr('y', height - h)
            .attr('x', 0)
            .attr('height', h)
            .attr('width', w)
            .attr('fill', '#D4BA35')
            .attr('id', 'house' + id);
        //door
        g.append('rect')
            .attr('y', height - (w * 0.5))
            .attr('x', w * 0.1)
            .attr('height', (w * 0.5))
            .attr('width', (w * 0.2))
            .attr('fill', '#D46A35')
            .attr('id', 'door' + id);
        //window
        g.append('rect')
            .attr('y', height - (w * 0.5))
            .attr('x', w * 0.5)
            .attr('height', (w * 0.3))
            .attr('width', (w * 0.4))
            .attr('fill', '#FFFFFF')
            .attr('id', 'window' + id);

        return g;
    }
};

var x_pos = d3.scale.linear().domain([0, 9]).range([0, width]);
// De hoogte moet nog gescaled worden naar de hoogste waarde
var y_scale = d3.scale.linear().domain([0, d3.max(restaurants, function(d) { return d.max; })]).
rangeRound([0, height]);

y_scale = d3.scale.log()
    .base(Math.E)
    .domain([Math.exp(0), d3.max(restaurants, function(d) { return d.max; })])
    .range([0, height]);


svg_houses.selectAll('g')
    .data(restaurants)
    .enter()
    .append(function(d){
        var v;
        if (d.type == 'café'){
            v = houses.café(y_scale(d.max), 100, d.id);
        }
        else{
            v = houses.restaurant(y_scale(d.max), 100, d.id);
        }
        return v.node();
    })
    .attr('id', function(d){return d.id;})
    .attr("transform", function(d){return "translate(" + x_pos(d.id) + "," + 0 + ")";})
    .on('click', function(d){

        for(var i = 0; i < restaurants.length; i++) {
            if ( i != d.id) {
                d3.select('#door' + i )
                    .transition()
                    .duration(1000)
                    .style('opacity', 0.3);
                d3.select('#house' + i )
                    .transition()
                    .duration(1000)
                    .style('opacity', 0.3);
            }
            else{
                d3.select('#door' + i)
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
                d3.select('#house' + i)
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
            }
        }

        var coords = d3.mouse(this);
        console.log(coords);

        for (var i = 0; i < 3 ; i++){
            var wolk = d3.select('#cloud' + i);

            var targetx = x_pos(d.id) + coords[0] - 60;
            var targety = coords[1];

            if (i == 1) {
                targetx = x_pos(d.id) + coords[0] + 10;
                targety = coords[1] + 30;
            }
            else if (i == 2) {
                targetx = x_pos(d.id) + coords[0];
                targety = coords[1] - 30;
            }

            wolk.transition()
                .duration(600 * (i+1))
                .attr('transform', function(){
                    return "translate(" + targetx + "," + targety + ")";
                });
        }

        restaurantName = d.naam;
        carpetplot(restaurantName, meterType);
    });

var cloud = function(w, h, text, id){

    var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
        g = d3.select(e)
            .attr('id', 'cloud' + id)
            .attr('class','node');

    g.append('circle')
        .attr('cx', w/2.5)
        .attr('cy', h/3)
        .attr('r', w/3)
        .attr('fill', '#000000');

    g.append('circle')
        .attr('cx', w/3)
        .attr('cy', 2.5 * h/3)
        .attr('r', w/3)
        .attr('fill', '#000000');

    g.append('circle')
        .attr('cx', w/7)
        .attr('cy', h/3)
        .attr('r', w/4)
        .attr('fill', '#000000');

    g.append('circle')
        .attr('cx', 3.5 * w/5)
        .attr('cy', 3.3 * h/4)
        .attr('r', 1.5 * w/5)
        .attr('fill', '#000000');

    g.append('circle')
        .attr('cx', 3.5 * w/5)
        .attr('cy', h/2.5)
        .attr('r', w/4)
        .attr('fill', '#000000');

    g.append('text')
        .attr('x', w/2.1)
        .attr('y', h/1.5)
        .attr('text-anchor', 'middle')
        .text(text)
        .attr('fill', '#FFFFFF');

    return g;
};

/**
 *  Append the clouds
 */

svg_houses.append(function(){
        var v = cloud(80, 40, 'Electricity', 2);
        return v.node();
    })
    .attr("transform", function () {
        return "translate(" + x_pos(2.7) + "," + 0 + ")";
    })
    .attr('opacity', 0.3)
    .on('click', function(){
        for(var i = 0; i < 3 ; i++){
            if (i != 2) {
                d3.select('#cloud' + i)
                    .transition()
                    .duration(1000)
                    .style('opacity', 0.3);
            }
            else{
                d3.select('#cloud' + i)
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
            }
        }
        meterType = 'Electricity';
        if (restaurantName != null){
            carpetplot(restaurantName, meterType);
        }
    });

svg_houses.append(function(){
        var v = cloud(60, 30, 'Gas', 0);
        return v.node();
    })
    .attr("transform", function () {
        return "translate(" + x_pos(4.2) + "," + 0 + ")";
    })
    .attr('opacity', 1)
    .on('click', function(){
        for(var i = 0; i < 3 ; i++){
            if (i != 0) {
                d3.select('#cloud' + i)
                    .transition()
                    .duration(1000)
                    .style('opacity', 0.3);
            }
            else{
                d3.select('#cloud' + i)
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
            }
        }
        meterType = 'Gas';
        if (restaurantName != null){
            carpetplot(restaurantName, meterType);
        }
    });

svg_houses.append(function(){
        var v = cloud(70, 35, 'Water', 1);
        return v.node();
    })
    .attr("transform", function () {
        return "translate(" + x_pos(0.5) + "," + 0 + ")";
    })
    .attr('opacity', 0.3)
    .on('click', function(){
        for(var i = 0; i < 3 ; i++){
            if (i != 1) {
                d3.select('#cloud' + i)
                    .transition()
                    .duration(1000)
                    .style('opacity', 0.3);
            }
            else{
                d3.select('#cloud' + i)
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
            }
        }
        meterType = 'Water';
        if (restaurantName != null){
            carpetplot(restaurantName, meterType);
        }
    });

