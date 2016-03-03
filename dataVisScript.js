d3.csv("MOCK_DATA.csv", function(data) {
    data.forEach(function(d) {
        // hier map je de data uit de csv aan het "data" object (de '+' is om aan te geven dat het een getalwaarde is
        d.timeStamp = d.TS;
        d.consumption = +d.Cons;
    });


    // hierin komt het script, de dataset is aan te spreken als data of in een functie als d.disctrict etc

});