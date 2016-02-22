d3.csv("dataSet.csv", function(data) {
    data.forEach(function(d) {
        // hier map je de data uit de csv aan het "data" object (de '+' is om aan te geven dat het een getalwaarde is
        d.id = +d.id;
        d.objectid = +d.objectid;
        d.point_lat = +d.point_lat;
        d.point_lng = +d.point_lng;
        d.straatnaam = d.straatnaam;
        d.huisnummer = +d.huisnummer;
        d.district = d.district;
        d.postcode = +d.postcode
    });


    // hierin komt het script, de dataset is aan te spreken als data of in een functie als d.disctrict etc

});