window.onload = function () {
// create charts
d3.json('nnWells.json', function (error, data) {
    var wellData = data.feature;
    _.each(wellData, function (d) {
        d.count = +d.count;
        // round to the nearest 100
        d.ca = Math.floor(+d.beer.beer_ibu / 100) * 100;

    });
// set crossfilter
    var ndx = crossfilter(wellData);
    
    caDim = ndx.dimesion(function (d) { return d.properties.ca; });
    // create groups (y-axis values)
    var countPerca = caDim.group().reduceCount();
    
    //specify charts
    var caCountChart = dc.barChart('#histogram1');

    caCountChart
        .width(300)
        .height(180)
        .dimesion(caDim)
        .group(countPerca)
        .x(d3.scale.linear().domain([0,970]))
        .elasticY(false)
        .centerBar(true)
        .barPadding(3)
        .xAxisLabel('Calcium')
        .yAxisLabel('Quantity')
        .margins({ top:10, right:20, bottom: 50, left: 50});
    caCountChart.xAxis().tickValues([0, 200, 400, 600, 800, 1000]);
    
    dc.renderAll();

});

}