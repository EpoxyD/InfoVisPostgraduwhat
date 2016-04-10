var restaurantName;
var meterType = "Gas";
var x_pos;
var ts;
var height;

var RestaurantHouses = {

    settings: {},

    init : function () {
        RestaurantHouses.showHouses();
        RestaurantHouses.weatherDashboard();
        //RestaurantHouses.targetConsumption();
        RestaurantHouses.averageConsumption();
        RestaurantHouses.showClouds();
    },

    showHouses : function () {

        var margin = {top: 20, right: 20, bottom: 20, left: 60};

        var outerWidth = 1400;
        var outerHeight =400;

        var width = outerWidth - margin.left - margin.right;

        height = outerHeight - margin.top - margin.bottom;

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
            .attr('id', 'group_houses')
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

                var no_data = g.append('g')
                    .attr('id', 'no_data' + id)
                    .style('visibility', 'hidden')
                    .attr('opacity', 0);

                no_data.append('rect')
                    .attr('y', height - (w * 0.45))
                    .attr('x', w * 0.25)
                    .attr('width', w * 0.05)
                    .attr('height', w * 0.45)
                    .attr('fill', '#A18568');

                no_data.append('rect')
                    .attr('y', height - (w * 0.45))
                    .attr('x', w * 0.70)
                    .attr('width', w * 0.05)
                    .attr('height', w * 0.45)
                    .attr('fill', '#A18568');

                no_data.append('rect')
                    .attr('y', height - (w * 0.4))
                    .attr('x', w * 0.2)
                    .attr('width', w * 0.6)
                    .attr('height', w * 0.3)
                    .attr('fill', '#AB855F')
                    .style('stroke-width', 2)
                    .style('stroke', '#A18568');

                no_data.append('text')
                    .attr('x', w * 0.5)
                    .attr('y', height - (w * 0.2))
                    .attr('text-anchor', 'middle')
                    .text('No Data')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', 15)
                    .attr('fill', '#DDDDDD');

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

                var no_data = g.append('g')
                    .attr('id', 'no_data' + id)
                    .style('visibility', 'hidden')
                    .attr('opacity', 0);

                no_data.append('rect')
                    .attr('y', height - (w * 0.45))
                    .attr('x', w * 0.25)
                    .attr('width', w * 0.05)
                    .attr('height', w * 0.45)
                    .attr('fill', '#A18568');

                no_data.append('rect')
                    .attr('y', height - (w * 0.45))
                    .attr('x', w * 0.70)
                    .attr('width', w * 0.05)
                    .attr('height', w * 0.45)
                    .attr('fill', '#A18568');

                no_data.append('rect')
                    .attr('y', height - (w * 0.4))
                    .attr('x', w * 0.2)
                    .attr('width', w * 0.6)
                    .attr('height', w * 0.3)
                    .attr('fill', '#AB855F')
                    .style('stroke-width', 2)
                    .style('stroke', '#A18568');

                no_data.append('text')
                    .attr('x', w * 0.5)
                    .attr('y', height - (w * 0.2))
                    .attr('text-anchor', 'middle')
                    .text('No Data')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', 15)
                    .attr('fill', '#DDDDDD');

                return g;
            }
        };

        x_pos = d3.scale.linear().domain([0, 7]).range([0, width]);
        // De hoogte moet nog gescaled worden naar de hoogste waarde
        var y_scale = d3.scale.log()
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

                ProgressDialog();

                setTimeout(function(){ CarpetPlotConsumption.showDataFromFile(restaurantName, meterType); }, 1800);

            });
    },

    weatherDashboard : function (){

        var dashboard = d3.select('#svg_houses');

        //Date
        dashboard.append('rect')
            .attr('x', x_pos(6.3))
            .attr('y', 20)
            .attr('height', 40)
            .attr('width', 200)
            .attr('fill', '#74828F');

        dashboard.append('circle')
            .attr('cx', x_pos(6.3))
            .attr('cy', 40)
            .attr('r', 25)
            .attr('fill', '#96C0CE');

        dashboard.append("image")
            .attr("xlink:href", "img/ic_day.png")
            .attr("x", x_pos(6.3) - 17.5)
            .attr("y", 22.5)
            .attr("width", 35)
            .attr("height", 35);

        dashboard.append('text')
            .attr('id', 'date')
            .attr('x', x_pos(6.3) + 112.5)
            .attr('y', 45)
            .attr('font-size', 15)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('fill', '#EEEEEE')
            .text(' Date ');

        //time
        dashboard.append('rect')
            .attr('x', x_pos(6.3))
            .attr('y', 90)
            .attr('height', 40)
            .attr('width', 200)
            .attr('fill', '#74828F');

        dashboard.append('circle')
            .attr('cx', x_pos(6.3))
            .attr('cy', 110)
            .attr('r', 25)
            .attr('fill', '#96C0CE');

        dashboard.append("image")
            .attr("xlink:href", "img/ic_time.png")
            .attr("x", x_pos(6.3) - 17.5)
            .attr("y", 92.5)
            .attr("width", 35)
            .attr("height", 35);

        dashboard.append('text')
            .attr('id', 'time')
            .attr('x', x_pos(6.3) + 112.5)
            .attr('y', 115)
            .attr('font-size', 15)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('fill', '#EEEEEE')
            .text(' Time ');

        //temperature
        dashboard.append('rect')
            .attr('x', x_pos(6.3))
            .attr('y', 160)
            .attr('height', 40)
            .attr('width', 200)
            .attr('fill', '#749079');

        dashboard.append('circle')
            .attr('cx', x_pos(6.3))
            .attr('cy', 180)
            .attr('r', 25)
            .attr('fill', '#97CEA0');

        dashboard.append("image")
            .attr("xlink:href", "img/ic_temperature.png")
            .attr("x", x_pos(6.3) - 17.5)
            .attr("y", 162.5)
            .attr("width", 35)
            .attr("height", 35);

        dashboard.append('text')
            .attr('id', 'time')
            .attr('x', x_pos(6.3) + 112.5)
            .attr('y', 185)
            .attr('font-size', 15)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('fill', '#EEEEEE')
            .text(' Temperature ');
    },

    averageConsumption : function (){

        var height = d3.select('#svg_houses').attr('height') - 20;

        var avg = d3.select('#svg_houses');

        var flags = avg.append('g')
            .attr('id', 'average');

            var flagScale = d3.scale.linear().domain([0, 20]).range([0.1, 6]);

            var triangle = function(){
                var points = [ [10,0], [25,0], [5,15], [10,0] ];
                return d3.svg.line()(points);
            };

            var colors = ['#EF8AB1', '#EFBD8A', '#EF8A8A'];

            //add the flags
            for (var i = 0; i < 20; i++){
                flags.append("svg:path")
                    .attr("d", function() { return triangle();})
                    .attr("fill", function(){
                        return colors[i % 3];
                    })
                    .attr("transform", function() {
                        var x = x_pos(flagScale(i)) + 15;
                        var y = height - 200 + 5;
                        return "translate(" + x + "," + y + ")"
                    });
            }

            flags.append('rect')
                .attr('x', x_pos(0.05) + 4)
                .attr('y', height - 200 + 4)
                .attr('height', 2)
                .attr('width', function() {
                    return x_pos(6) - x_pos(0.05);
                })
                .attr('fill', '#888888');

            flags.append('circle')
                .attr('cx', x_pos(0.05) + 4)
                .attr('cy', height - 200)
                .attr('r', 6)
                .attr('fill', '#666666');

            flags.append('circle')
                .attr('cx', x_pos(6) + 4)
                .attr('cy', height - 200)
                .attr('r', 6)
                .attr('fill', '#666666');

        avg.append('rect')
            .attr('id', 'pole1')
            .attr('x', x_pos(0.05))
            .attr('y', height - 200)
            .attr('height', 200)
            .attr('width', 8)
            .attr('fill', '#666666');

        avg.append('rect')
            .attr('id', 'pole2')
            .attr('x', x_pos(6))
            .attr('y', height - 200)
            .attr('height', 200)
            .attr('width', 8)
            .attr('fill', '#666666');
    },

    targetConsumption : function (){

        var height = d3.select('#svg_houses').attr('height') - 20;

        var trgt = d3.select('#svg_houses');

        var lamps = trgt.append('g')
            .attr('id', 'target');

        var lampScale = d3.scale.linear().domain([0, 15]).range([0.1, 6]);

        //add the lamps
        for (var i = 0; i < 15; i++){
            lamps.append("circle")
                .attr("fill", '#FFFF66')
                .attr('r', 4)
                .attr("transform", function() {
                    var x = x_pos(lampScale(i)) + 15 + 3;
                    var y = height - 200 + 5 + 9;
                    return "translate(" + x + "," + y + ")"
                });

            lamps.append("rect")
                .attr("fill", '#666666')
                .attr('height', 6)
                .attr('width', 6)
                .attr("transform", function() {
                    var x = x_pos(lampScale(i)) + 15;
                    var y = height - 200 + 5;
                    return "translate(" + x + "," + y + ")"
                });
        }

        lamps.append('rect')
            .attr('x', x_pos(0.05) + 4)
            .attr('y', height - 200 + 4)
            .attr('height', 2)
            .attr('width', function() {
                return x_pos(6) - x_pos(0.05);
            })
            .attr('fill', '#888888');
    },

    showClouds: function(){
        /**
         *  Append the clouds
         */

        var cloud = function(w, h, text, id){

            var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
                g = d3.select(e)
                    .attr('id', 'cloud' + id)
                    .attr('class','node');

            //var color = '#000000';
            var color = '#666666';

            g.append('circle')
                .attr('cx', w/2.5)
                .attr('cy', h/3)
                .attr('r', w/3)
                .attr('fill', color);

            g.append('circle')
                .attr('cx', w/3)
                .attr('cy', 2.5 * h/3)
                .attr('r', w/3)
                .attr('fill', color);

            g.append('circle')
                .attr('cx', w/7)
                .attr('cy', h/3)
                .attr('r', w/4)
                .attr('fill', color);

            g.append('circle')
                .attr('cx', 3.5 * w/5)
                .attr('cy', 3.3 * h/4)
                .attr('r', 1.5 * w/5)
                .attr('fill', color);

            g.append('circle')
                .attr('cx', 3.5 * w/5)
                .attr('cy', h/2.5)
                .attr('r', w/4)
                .attr('fill', color);

            g.append('text')
                .attr('x', w/2.1)
                .attr('y', h/1.5)
                .attr('text-anchor', 'middle')
                .text(text)
                .attr('font-family', 'sans-serif')
                .attr('fill', '#FFFFFF');

            return g;
        };

        svg_houses = d3.select('#svg_houses');

        svg_houses.append(function(){
                var v = cloud(90, 40, 'Elektriciteit', 2);
                return v.node();
            })
            .attr("transform", function () {
                return "translate(" + x_pos(2.7) + "," + 30 + ")";
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

                    ProgressDialog();

                    setTimeout(function(){ CarpetPlotConsumption.showDataFromFile(restaurantName, meterType); }, 1000);

                    if (ts != null){
                        CarpetPlotConsumption.adjustHouses(ts);
                    }

                }
            });

        svg_houses.append(function(){
                var v = cloud(60, 30, 'Gas', 0);
                return v.node();
            })
            .attr("transform", function () {
                return "translate(" + x_pos(4.2) + "," + 45 + ")";
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
                    ProgressDialog();

                    setTimeout(function(){ CarpetPlotConsumption.showDataFromFile(restaurantName, meterType); }, 1800);

                    if (ts != null){
                        CarpetPlotConsumption.adjustHouses(ts);
                    }
                }
            });

        svg_houses.append(function(){
                var v = cloud(70, 35, 'Water', 1);
                return v.node();
            })
            .attr("transform", function () {
                return "translate(" + x_pos(0.5) + "," + 35 + ")";
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
                    ProgressDialog();

                    setTimeout(function(){ CarpetPlotConsumption.showDataFromFile(restaurantName, meterType); }, 1800);

                    if (ts != null){
                        CarpetPlotConsumption.adjustHouses(ts);
                    }
                }
            });


    }
};

var ProgressDialog = function(){

    var el = document.getElementById("overlay");

    d3.select('#overlay')
        .transition()
        .duration(500)
        .style('visibility', function(){
            return (el.style.visibility == "visible") ? "hidden" : "visible";
        });
};
