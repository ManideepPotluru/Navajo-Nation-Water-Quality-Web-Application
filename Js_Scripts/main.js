



window.onload = function () {

    // Call leaflet map into map frame
    //base map
    //Global Variables - Map
    window.map = L.map('map').setView([36.292, -110.090], 8);
    //Global Variable - wellMarkers
    window.wellMarkers = new L.FeatureGroup();
    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    OpenStreetMap_Mapnik.addTo(map);

    "use strict"; //JS strict mode
    // Add control.scale to map
    L.control.scale().addTo(map);
    // Add chapters layer to map -- need to render underneath circleMarkers
    var myStyle = {
        "color": "#dbc38f",
        "fillColor": "white",
        "weight": 0.6,
        "fillOpacity": 0.4
    }

    $.getJSON("data/nnChapters.geojson", function (data) {
        // L.geoJson(data).addTo(map);
        var geojson = L.geoJson(data, {
            style: myStyle,
            onEachFeature: function (feature, layer) {
                var chPopup = "<b>Chapter: <b><br>" + feature.properties.Chapter
                layer.bindPopup(chPopup);
            }
        });

        geojson.addTo(map)
        geojson.bringToBack();
    });

    // Modal window 
    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // create charts
    d3.json('data/nnWells.json', function (error, data) {
        var wellData = data.features;
        _.each(wellData, function (d) {
            d.count = +d.count;
            // round to the nearest 200
            d.As_ = Math.round(+d.properties.As_ / 50) * 50;
            d.Ca = Math.round(+d.properties.Ca / 100) * 100;
            d.Ra_Total = Math.round(+d.properties.Ra_Total / 1) * 1;
            d.U = Math.round(+d.properties.U / 100) * 100;

        });
        // set crossfilter
        var ndx = crossfilter(wellData);

        //Dimensions
        var As_Dim = ndx.dimension(function (d) { return d.properties.As_; });
        var CaDim = ndx.dimension(function (d) { return d.properties.Ca; });
        var Ra_TotalDim = ndx.dimension(function (d) { return d.properties.Ra_Total; });
        var UDim = ndx.dimension(function (d) { return d.properties.U; });

        var allDim = ndx.dimension(function (d) { return d; });

        // create groups (y-axis values)
        var all = ndx.groupAll();

        //
        var countPerAs_ = As_Dim.group().reduceCount();
        var countPerCa = CaDim.group().reduceCount();
        var countPerRa_Total = Ra_TotalDim.group().reduceCount();
        var countPerU = UDim.group().reduceCount();

        //specify charts

        var as_CountChart = dc.barChart('#histogram1');
        var caCountChart = dc.barChart('#histogram2');
        var ra_TotalCountChart = dc.barChart('#histogram3');
        var uCountChart = dc.barChart('#histogram4');
        var dataCount = dc.dataCount('#data-count');

        //data table declare
        var dataTable = dc.dataTable('#data-table');

        // Default histograms
        caCountChart
            .width(250)
            .height(250)
            .dimension(CaDim)
            .group(countPerCa)
            .x(d3.scale.linear().domain([0, 976]))
            // .x(d3.scale.linear().range([0,90]))
            .y(d3.scale.linear().domain([0, 13]))
            .elasticY(false)
            .centerBar(true)
            .barPadding(3)
            // .xAxisLabel('Calcium')
            .yAxisLabel('Count')
            .margins({ top: 10, right: 20, bottom: 50, left: 50 });
        caCountChart.xAxis().tickValues([0, 200, 400, 600, 800, 1000]);
        caCountChart.yAxis().tickValues([0, 3, 6, 9, 12]);

        uCountChart
            .width(250)
            .height(250)
            .dimension(UDim)
            .group(countPerU)
            .x(d3.scale.linear().domain([0, 700]))
            .y(d3.scale.linear().domain([0, 20]))
            .elasticY(false)
            .centerBar(true)
            .barPadding(3)
            // .xAxisLabel('Uranium')
            .yAxisLabel('Count')
            .margins({ top: 10, right: 20, bottom: 50, left: 50 });
        uCountChart.xAxis().tickValues([0, 200, 400, 600]);
        uCountChart.yAxis().tickValues([0, 5, 10, 15, 20]);


        as_CountChart
            .width(250)
            .height(250)
            .dimension(As_Dim)
            .group(countPerAs_)
            .x(d3.scale.linear().domain([0, 282]))
            .y(d3.scale.linear().domain([0, 30]))
            .elasticY(false)
            .centerBar(true)
            .barPadding(3)
            // .xAxisLabel('Arsenic')
            .yAxisLabel('Count')
            .margins({ top: 10, right: 20, bottom: 50, left: 50 });
        as_CountChart.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
        as_CountChart.yAxis().tickValues([0, 10, 20, 30]);

        ra_TotalCountChart
            .width(250)
            .height(250)
            .dimension(Ra_TotalDim)
            .group(countPerRa_Total)
            .x(d3.scale.linear().domain([0, 1]))
            .elasticY(false)
            .centerBar(true)
            .barPadding(3)
            // .xAxisLabel('Radium_Total')
            .yAxisLabel('Count')
            .margins({ top: 10, right: 20, bottom: 50, left: 50 });
        ra_TotalCountChart.xAxis().tickValues([0.2, 0.4, 0.6, 0.8, 1]);

        var column2 = function (d) { return d.properties.As_; };
        var column3 = function (d) { return d.properties.Ca; };
        var column4 = function (d) { return d.properties.Ra_Total; };
        var column5 = function (d) { return d.properties.U; };

        dataCount
            .dimension(ndx)
            .group(all);

        //default dataTable
        dataTable
            .dimension(allDim)
            .group(function (d) { return 'dc.js insists on putting a row here so I remove it using JS'; })
            .size(1000)
            .columns([
                function (d) { return d.properties.well_id; },
                column2,
                column3,
                column4,
                column5
            ])
            .on('renderlet', function (table) {
                // each time table is rendered remove nasty extra row dc.js insists on adding
                table.select('tr.dc-table-group').remove();

                wellMarkers.clearLayers();
                _.each(allDim.top(Infinity), function (d) {
                    var filLoc = d.properties;
                    // var id = d.properties.well_id;

                    // Color based on well use
                    function getColor(wUse) {
                        switch (wUse) {
                            case "Independent":
                                return "#8c510a";
                            case "Agriculture":
                                return "#bf812d";
                            case "Domestic":
                                return "#dfc27d";
                            case "Livestock":
                                return "#f6e8c3";
                            case "Other":
                                return "#01665e";
                            case "Municipal":
                                return "#c7eae5";
                            case "Domestic Irrigation":
                                return "#80cdc1";
                            case "Recreation":
                                return "#35978f";
                            default:
                                return "#01665e";
                        }
                    }

                    var markerOptions = {
                        radius: 3.5,
                        fillColor: getColor(d.properties.USE),
                        color: "black",
                        weight: 0.4,
                        opacity: 1,
                        fillOpacity: 0.7
                    };

                    // Add circle markers
                    var marker = L.circleMarker([filLoc.lat, filLoc.long], markerOptions);

                    marker.bindPopup(
                        "<dl><dt> <h5><b><i>WELL INFORMATION- NAVAJO NATION WELL</i></b></h5><br>"
                        + "<dl>"
                        + "<dt><span style='font-weight:bolder'>FID: </span> </dt> <dd>" + d.properties.FID + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Well No.: </span> </dt> <dd>" + d.properties.well_no + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Well ID: </span> </dt> <dd>" + d.properties.well_id + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Well Name: </span> </dt> <dd>" + d.properties.well_name + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Owner: </span> </dt> <dd>" + d.properties.owner + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Depth: </span> </dt> <dd>" + d.properties.depth + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Public Water Sys. ID: </span> </dt> <dd>" + d.properties.pwsid + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>USGS ID: </span> </dt> <dd>" + d.properties.usgs_id + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Data Source: </span> </dt> <dd>" + d.properties.data_sourc + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Comment(s): </span> </dt> <dd>" + d.properties.comments + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Alternate Name 1: </span> </dt> <dd>" + d.properties.aka2 + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Alternate Name 2: </span> </dt> <dd>" + d.properties.aka3 + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Status: </span> </dt> <dd>" + d.properties.well_statu + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Agency: </span> </dt> <dd>" + d.properties.nn_agency + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Well Use: </span> </dt> <dd>" + d.properties.USE + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Alkalinity: </span> </dt> <dd>" + d.properties.Alkalinity + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Total Alkalinity: </span> </dt> <dd>" + d.properties.Alkalinity_Total + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>As (&mu;g/L): </span> </dt> <dd>" + d.properties.As_ + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Ba (&mu;g/L): </span> </dt> <dd>" + d.properties.Ba + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Be (&mu;g/L): </span> </dt> <dd>" + d.properties.Be + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Br (mg/L): </span> </dt> <dd>" + d.properties.Br_ + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Ca (mg/L): </span> </dt> <dd>" + d.properties.Ca + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Cd (&mu;g/L): </span> </dt> <dd>" + d.properties.Cd + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Cl (mg/L): </span> </dt> <dd>" + d.properties.Cl_ + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Conductivity (&mu;s/cm): </span> </dt> <dd>" + d.properties.Conductivity + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Cr (&mu;g/L): </span> </dt> <dd>" + d.properties.Cr + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>DO (mg/L): </span> </dt> <dd>" + d.properties.DO + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Electrical Conductivity: </span> </dt> <dd>" + d.properties.ElectricalConductivity + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Gross Alpha 2 Sigma Comb. Uncertainty (pCi/L): </span> </dt> <dd>" + d.properties.Gross_alpha__2_sigma_combined_uncertainty + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Gross Alpha (pCi/L): </span> </dt> <dd>" + d.properties.GrossAlpha + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Gross Alpha: U Nat (pCi/L): </span> </dt> <dd>" + d.properties.GrossAlpha_U_Nat + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Gross Beta 1 (pCi/L): </span> </dt> <dd>" + d.properties.GrossBeta + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Gross Beta: Cs 137 (pCi/L): </span> </dt> <dd>" + d.properties.GrossBeta_Cs137 + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Gross Beta: Sr Y90 (pCi/L): </span> </dt> <dd>" + d.properties.GrossBeta_Sr_Y90 + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Hardness (mg/L as CaCO3): </span> </dt> <dd>" + d.properties.Hardness + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Total Hardness (mg/L): </span> </dt> <dd>" + d.properties.Hardness_Total + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Hg (&mu;g/L): </span> </dt> <dd>" + d.properties.Hg + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Hydroxide (mg/L): </span> </dt> <dd>" + d.properties.Hydroxide + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>K (mg/L): </span> </dt> <dd>" + d.properties.K + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Mg (mg/L): </span> </dt> <dd>" + d.properties.Mg + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Mn (&mu;g/L): </span> </dt> <dd>" + d.properties.Mn + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Na (mg/L): </span> </dt> <dd>" + d.properties.Na + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Na Adsorption Ratio: </span> </dt> <dd>" + d.properties.Na_AdsorptionRatio + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Na Fraction Cations (%): </span> </dt> <dd>" + d.properties.Na_FractionCations + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Na_K (mg/L as Na): </span> </dt> <dd>" + d.properties.Na_K + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Nitrate (mg/L): </span> </dt> <dd>" + d.properties.Nitrate + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Nitrate_Nitrite (mg/L): </span> </dt> <dd>" + d.properties.Nitrate_Nitrite + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>NO2 (mg/L as N): </span> </dt> <dd>" + d.properties.NO2_ + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>NO3 (mg/L as N): </span> </dt> <dd>" + d.properties.NO3_ + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>ORP (mV): </span> </dt> <dd>" + d.properties.ORP + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Pb (&mu;g/L): </span> </dt> <dd>" + d.properties.Pb + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Ra 226 (pCi/L): </span> </dt> <dd>" + d.properties.Ra_226 + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Ra 228 (pCi/L): </span> </dt> <dd>" + d.properties.Ra_228 + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Ra Total (pCi/L): </span> </dt> <dd>" + d.properties.Ra_Total + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Sb (&mu;g/L): </span> </dt> <dd>" + d.properties.Sb + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Se (&mu;g/L): </span> </dt> <dd>" + d.properties.Se + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Temperature (&deg;C): </span> </dt> <dd>" + d.properties.Temperature + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Tl (&mu;g/L): </span> </dt> <dd>" + d.properties.Tl + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>Turbidity (NTU): </span> </dt> <dd>" + d.properties.Turbidity + ";<dd>"
                        + "<dt><span style='font-weight:bolder'>U  (&mu;g/L): </span> </dt> <dd>" + d.properties.U + "<dt><dl>"
                        + "</dl>"
                    );
                    wellMarkers.addLayer(marker);
                });
                // New Map pane so markers render on top of geojson (chapters)
                map.createPane('markers');
                map.getPane('markers').style.zIndex = 650;
                // Add markers to map:
                map.addLayer(wellMarkers);
                map.fitBounds(wellMarkers.getBounds());

            });
        dc.renderAll();
    });

    //global variable that have initial inputs of default analytes and will have the dropdown analytes after click.
    window.input1 = "As_";
    window.input2 = "Ca";
    window.input3 = "Ra_Total";
    window.input4 = "U";

    //event listeners to update after clicking "update plots button".
    plotBtn_eventlisteners = document.getElementById("updatePlot_btn");
    plotBtn_eventlisteners.addEventListener("click", () => {

        selectAnalyte();
        updateScatterplotMatrix();
        
         });

    // Scatterplot matrix
    // Event handler for d3 version
    window.updateScatterplotMatrix = function () {

        require.config({
            paths: {
                "d3": "JS_CSS_downladed_libraries/d3.v.6.3.1",
                "dc": "JS_CSS_downladed_libraries/dc.v.4.2.4"
            },
        });

        require(["d3", "dc"], function (d3, dc) {
            // var fields = [];
            var fields = [input1, input2, input3, input4];
            var rows = [],
                cols = [];
            var rows = ['heading'].concat(fields.slice(0).reverse()),
                cols = ['heading'].concat(fields);

            if (location.search.indexOf('nowait') !== -1) {
                dc.constants.EVENT_DELAY = 0;
                d3.select('#wait-verb').text('remove')
                d3.select('#wait-prep').text('with');
                d3.select('#wait-url').attr('href', location.origin + location.pathname);
            } else {
                d3.select('#wait-url').attr('href', location.origin + location.pathname + '?nowait');
            }

            d3.csv('data/dataScatter.csv').then(function (analyte) {
                analyte.forEach(function (d) {
                    Object.keys(fields).forEach(function (ab) {
                        d[fields[ab]] = +d[fields[ab]];
                    });
                });
                var data = crossfilter(analyte);

                function make_dimension(var1, var2) {
                    return data.dimension(function (d) {
                        return [d[var1], d[var2], d.wellUse];
                    });
                }
                function key_part(i) {
                    return function (kv) {
                        return kv.key[i];
                    };
                }

                var charts = [];

                d3.select('#content')
                .selectAll('tr')
                .data(data)
                .exit()
                .remove();

                d3.select('#content')
                    .selectAll('tr').data(rows)
                    .enter().append('tr').attr('class', function (d) {
                        return d === 'heading' ? 'heading row' : 'row';
                    })
                    .each(function (row, y) {
                        d3.select(this).selectAll('td').data(cols)
                            .enter().append('td').attr('class', function (d) {
                                return d === 'heading' ? 'heading entry' : 'entry';
                            })
                            .each(function (col, x) {
                                var cdiv = d3.select(this).append('div')
                                if (row === 'heading') {
                                    if (col !== 'heading')
                                        cdiv.text(col.replace('_', ' '))
                                    return;
                                }
                                else if (col === 'heading') {
                                    cdiv.text(row.replace('_', ' '))
                                    return;
                                }
                                cdiv.attr('class', 'chart-holder');
                                var chart = new dc.ScatterPlot(cdiv);
                                var dim = make_dimension(col, row),
                                    group = dim.group();
                                var showYAxis = x === 1, showXAxis = y === 4;
                                chart
                                    .transitionDuration(0)
                                    .width(125 + (showYAxis ? 25 : 0))
                                    .height(125 + (showXAxis ? 20 : 0))
                                    .margins({
                                        left: showYAxis ? 25 : 8,
                                        top: 5,
                                        right: 2.75,
                                        bottom: showXAxis ? 20 : 5
                                    })
                                    .dimension(dim).group(group)
                                    .keyAccessor(key_part(0))
                                    .valueAccessor(key_part(1))
                                    .colorAccessor(key_part(2))
                                    .colorDomain(["Livestock", "Unknown", "Domestic", "Municipal", "Agriculture", "Other", "Independent", "Recreation", "Domestic Irrigation"])
                                    .ordinalColors(["#f6e8c3", "#01665e", "#dfc27d", "#c7eae5", "#bf812d", "#01665e", "#8c510a", "#35978f", "#80cdc1"])
                                    .x(d3.scaleLinear()).xAxisPadding("0.001%")
                                    .y(d3.scaleLinear()).yAxisPadding("0.001%")
                                    .brushOn(true)
                                    .elasticX(true)
                                    .elasticY(true)
                                    .symbolSize(5)
                                    .nonemptyOpacity(0.7)
                                    .emptySize(1)
                                    .emptyColor('#000000')
                                    .emptyOpacity(0.7)
                                    .excludedSize(1)
                                    .excludedColor('#000000')
                                    .excludedOpacity(0.7)
                                    .renderHorizontalGridLines(true)
                                    .renderVerticalGridLines(true);
                                chart.xAxis().ticks(3)
                                chart.yAxis().ticks(6);
                                chart.on('postRender', function (chart) {
                                    // remove axes unless at left or bottom
                                    if (!showXAxis)
                                        chart.select('.x.axis').attr('display', 'none');
                                    if (!showYAxis)
                                        chart.select('.y.axis').attr('display', 'none');
                                    // remove clip path, allow dots to display outside
                                    chart.select('.chart-body').attr('clip-path', null);
                                });
                                // only filter on one chart at a time
                                chart.on('filtered', function (_, filter) {
                                    if (!filter)
                                        return;
                                    charts.forEach(function (c) {
                                        if (c !== chart)
                                            c.filter(null);
                                    });
                                });
                                charts.push(chart);
                            });
                    });
                dc.renderAll();
            });
        });
    }

    //Call function to render scatterplot
    updateScatterplotMatrix();

    // Scatterplot matrix //
    // source: https://observablehq.com/@d3/brushable-scatterplot-matrix

    // This function is triggered on clicking the button
    window.selectAnalyte = function () {

        //the value if selected analyte from dropwdown 1 is stored in input 1
        selected1 = document.getElementById("selectbox1");
        input1 = selected1.options[selected1.selectedIndex].value;

        //the value if selected analyte from dropwdown 2 is stored in input 2
        selected2 = document.getElementById("selectbox2");
        input2 = selected2.options[selected2.selectedIndex].value;

        //the value if selected analyte from dropwdown 3 is stored in input 3
        selected3 = document.getElementById("selectbox3");
        input3 = selected3.options[selected3.selectedIndex].value;

        //the value if selected analyte from dropwdown 4 is stored in input 4
        selected4 = document.getElementById("selectbox4");
        input4 = selected4.options[selected4.selectedIndex].value;

        //new wellMarkers2 for updated analytes after dropdown selection
        // var wellMarkers2 = new L.FeatureGroup();

        d3.json('data/nnWells.json', function (error, data) {
            var wellData = data.features;
            _.each(wellData, function (d) {
                d.count = +d.count;
                d.As_ = Math.round(+d.properties.As_ / 50) * 50;
                d.Ba = Math.round(+d.properties.Ba / 1) * 1;
                d.Ca = Math.round(+d.properties.Ca / 100) * 100;
                d.Cl_ = Math.round(+d.properties.Cl_ / 1) * 1;
                d.Cr = Math.round(+d.properties.Cr / 1) * 1;
                d.GrossAlpha_U_Nat = Math.round(+d.properties.GrossAlpha_U_Nat / 1) * 1;
                d.Nitrate = Math.round(+d.properties.Nitrate / 1) * 1;
                d.Pb = Math.round(+d.properties.Pb / 1) * 1;
                d.Ra_Total = Math.round(+d.properties.Ra_Total / 1) * 1;
                d.Se = Math.round(+d.properties.Se / 1) * 1;
                d.U = Math.round(+d.properties.U / 100) * 100;
                d.None = 0;
            });

            //Crossfilter
            var ndx = crossfilter(wellData);

            var As_Dim = ndx.dimension(function (d) { return d.properties.As_; });
            var BaDim = ndx.dimension(function (d) { return d.properties.Ba; });
            var CaDim = ndx.dimension(function (d) { return d.properties.Ca; });
            var Cl_Dim = ndx.dimension(function (d) { return d.properties.Cl_; });
            var CrDim = ndx.dimension(function (d) { return d.properties.Cr; });
            var GrossAlpha_U_NatDim = ndx.dimension(function (d) { return d.properties.GrossAlpha_U_Nat; });
            var NitrateDim = ndx.dimension(function (d) { return d.properties.Nitrate; });
            var PbDim = ndx.dimension(function (d) { return d.properties.Pb; });
            var Ra_TotalDim = ndx.dimension(function (d) { return d.properties.Ra_Total; });
            var SeDim = ndx.dimension(function (d) { return d.properties.Se; });
            var UDim = ndx.dimension(function (d) { return d.properties.U; });
            var NoneDim = ndx.dimension(function (d) { return d.None; });

            var allDim = ndx.dimension(function (d) { return d; });

            var all = ndx.groupAll();

            //countPerAnalyte
            var countPerAs_ = As_Dim.group().reduceCount();
            var countPerBa = BaDim.group().reduceCount();
            var countPerCa = CaDim.group().reduceCount();
            var countPerCl_ = Cl_Dim.group().reduceCount();
            var countPerCr = CrDim.group().reduceCount();
            var countPerGrossAlpha_U_Nat = GrossAlpha_U_NatDim.group().reduceCount();
            var countPerNitrate = NitrateDim.group().reduceCount();
            var countPerPb = PbDim.group().reduceCount();
            var countPerRa_Total = Ra_TotalDim.group().reduceCount();
            var countPerSe = SeDim.group().reduceCount();
            var countPerU = UDim.group().reduceCount();
            var countPerNone = NoneDim.group().reduceCount();

            //Dynamic Charts
            var histogram1 = dc.barChart('#histogram1');
            var histogram2 = dc.barChart('#histogram2');
            var histogram3 = dc.barChart('#histogram3');
            var histogram4 = dc.barChart('#histogram4');
            //dataCount
            var dataCountNew = dc.dataCount('#data-count');

            var dataTableNew = dc.dataTable('#data-table');

            var dataHistogram1;
            var dataHistogram2;
            var dataHistogram3;
            var dataHistogram4;


            if (input1 == "As_") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(As_Dim)
                    .group(countPerAs_)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Arsenic')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram1.yAxis().tickValues([0, 10, 20, 30]);

                dataHistogram1 = function (d) { return d.properties.As_; };

            }
            else if (input1 == "Ba") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(BaDim)
                    .group(countPerBa)
                    .x(d3.scale.linear().domain([0, 1500]))
                    .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Barium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 300, 600, 900, 1200, 1500]);
                histogram1.yAxis().tickValues([0, 10, 20, 30]);

                dataHistogram1 = function (d) { return d.properties.Ba; };
            }
            else if (input1 == "Ca") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(CaDim)
                    .group(countPerCa)
                    .x(d3.scale.linear().domain([0, 970]))
                    .y(d3.scale.linear().domain([0, 13]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(20)
                    // .xAxisLabel('Calcium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 200, 400, 600, 800, 1000]);
                histogram1.yAxis().tickValues([0, 3, 6, 9, 12]);

                dataHistogram1 = function (d) { return d.properties.Ca; };
            }
            else if (input1 == "Cl_") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(Cl_Dim)
                    .group(countPerCl_)
                    .x(d3.scale.linear().domain([0, 41800]))
                    .y(d3.scale.linear().domain([0, 3]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Clorine')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 10000, 20000, 30000, 40000]);
                histogram1.yAxis().tickValues([0, 1, 2, 3]);

                dataHistogram1 = function (d) { return d.properties.Cl_; };
            }
            else if (input1 == "Cr") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(CrDim)
                    .group(countPerCr)
                    .x(d3.scale.linear().domain([0, 30]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Chromium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 10, 20, 30]);
                histogram1.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram1 = function (d) { return d.properties.Cr; };
            }
            else if (input1 == "GrossAlpha_U_Nat") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(GrossAlpha_U_NatDim)
                    .group(countPerGrossAlpha_U_Nat)
                    .x(d3.scale.linear().domain([0, 780]))
                    .y(d3.scale.linear().domain([0, 2]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('GrossAlpha_U_Nat')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 200, 400, 600, 800]);
                histogram1.yAxis().tickValues([0, 1, 2]);

                dataHistogram1 = function (d) { return d.properties.GrossAlpha_U_Nat; };
            }
            else if (input1 == "Nitrate") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(NitrateDim)
                    .group(countPerNitrate)
                    .x(d3.scale.linear().domain([0, 240]))
                    .y(d3.scale.linear().domain([0, 3]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Nitrate')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram1.yAxis().tickValues([0, 1, 2, 3]);

                dataHistogram1 = function (d) { return d.properties.Nitrate; };
            }
            else if (input1 == "Pb") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(PbDim)
                    .group(countPerPb)
                    .x(d3.scale.linear().domain([0, 320]))
                    .y(d3.scale.linear().domain([0, 15]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Lead')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 100, 200, 300]);
                histogram1.yAxis().tickValues([0, 5, 10, 15]);

                dataHistogram1 = function (d) { return d.properties.Pb; };
            }
            else if (input1 == "Ra_Total") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(Ra_TotalDim)
                    .group(countPerRa_Total)
                    .x(d3.scale.linear().domain([0, 1]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Ra_Total')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0.2, 0.4, 0.6, 0.8, 1]);

                dataHistogram1 = function (d) { return d.properties.Ra_Total; };
            }
            else if (input1 == "Se") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(SeDim)
                    .group(countPerSe)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Selenium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram1.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram1 = function (d) { return d.properties.Se; };
            }
            else if (input1 == "U") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(UDim)
                    .group(countPerU)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Uranium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram1.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram1 = function (d) { return d.properties.U; };
            }

            else if (input1 == "None") {

                histogram1
                    .width(250)
                    .height(250)
                    .dimension(NoneDim)
                    .group(countPerNone)
                    //.range([0,20])
                    .x(d3.scale.linear().domain([0, 0]))
                    // .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('None')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram1.xAxis().tickValues([0, 0, 0, 0, 0, 0]);
                histogram1.yAxis().tickValues([0, 0, 0, 0]);

                dataHistogram1 = function (d) { return d.properties.None; };
            }

            if (input2 == "As_") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(As_Dim)
                    .group(countPerAs_)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Arsenic')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram2.yAxis().tickValues([0, 10, 20, 30]);

                dataHistogram2 = function (d) { return d.properties.As_; };
            }
            else if (input2 == "Ba") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(BaDim)
                    .group(countPerBa)
                    .x(d3.scale.linear().domain([0, 1500]))
                    // .x(d3.scale.linear().range([0,50]))
                    .y(d3.scale.linear().domain([0, 30]))
                    // .y(d3.scale.linear().range([550,0]))
                    // .xAxis().ticks(20)
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Barium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 300, 600, 900, 1200, 1500]);
                histogram2.yAxis().tickValues([0, 10, 20, 30]);

                dataHistogram2 = function (d) { return d.properties.Ba; };
            }
            else if (input2 == "Ca") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(CaDim)
                    .group(countPerCa)
                    .x(d3.scale.linear().domain([0, 970]))
                    .y(d3.scale.linear().domain([0, 13]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(20)
                    // .xAxisLabel('Calcium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 200, 400, 600, 800, 1000]);
                histogram2.yAxis().tickValues([0, 3, 6, 9, 12]);

                dataHistogram2 = function (d) { return d.properties.Ca; };
            }
            else if (input2 == "Cl_") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(Cl_Dim)
                    .group(countPerCl_)
                    .x(d3.scale.linear().domain([0, 41800]))
                    .y(d3.scale.linear().domain([0, 3]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Clorine')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 10000, 20000, 30000, 40000]);
                histogram2.yAxis().tickValues([0, 1, 2, 3]);

                dataHistogram2 = function (d) { return d.properties.Cl_; };
            }
            else if (input2 == "Cr") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(CrDim)
                    .group(countPerCr)
                    .x(d3.scale.linear().domain([0, 30]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Chromium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 10, 20, 30]);
                histogram2.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram2 = function (d) { return d.properties.Cr; };
            }
            else if (input2 == "GrossAlpha_U_Nat") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(GrossAlpha_U_NatDim)
                    .group(countPerGrossAlpha_U_Nat)
                    .x(d3.scale.linear().domain([0, 780]))
                    .y(d3.scale.linear().domain([0, 2]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('GrossAlpha_U_Nat')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 200, 400, 600, 800]);
                histogram2.yAxis().tickValues([0, 1, 2]);

                dataHistogram2 = function (d) { return d.properties.GrossAlpha_U_Nat; };
            }
            else if (input2 == "Nitrate") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(NitrateDim)
                    .group(countPerNitrate)
                    .x(d3.scale.linear().domain([0, 240]))
                    .y(d3.scale.linear().domain([0, 3]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Nitrate')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram2.yAxis().tickValues([0, 1, 2, 3]);

                dataHistogram2 = function (d) { return d.properties.Nitrate; };
            }
            else if (input2 == "Pb") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(PbDim)
                    .group(countPerPb)
                    .x(d3.scale.linear().domain([0, 320]))
                    .y(d3.scale.linear().domain([0, 15]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Lead')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 100, 200, 300]);
                histogram2.yAxis().tickValues([0, 5, 10, 15]);

                dataHistogram2 = function (d) { return d.properties.Pb; };
            }
            else if (input2 == "Ra_Total") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(Ra_TotalDim)
                    .group(countPerRa_Total)
                    .x(d3.scale.linear().domain([0, 1]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Ra_Total')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0.2, 0.4, 0.6, 0.8, 1]);

                dataHistogram2 = function (d) { return d.properties.Ra_Total; };
            }
            else if (input2 == "Se") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(SeDim)
                    .group(countPerSe)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Selenium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram2.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram2 = function (d) { return d.properties.Se; };
            }
            else if (input2 == "U") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(UDim)
                    .group(countPerU)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Uranium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram2.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram2 = function (d) { return d.properties.U; };
            }

            else if (input2 == "None") {

                histogram2
                    .width(250)
                    .height(250)
                    .dimension(NoneDim)
                    .group(countPerNone)
                    .x(d3.scale.linear().domain([0, 0]))
                    // .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('None')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram2.xAxis().tickValues([0, 0, 0, 0, 0, 0]);
                histogram2.yAxis().tickValues([0, 0, 0, 0]);

                dataHistogram2 = function (d) { return d.properties.None; };
            }

            if (input3 == "As_") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(As_Dim)
                    .group(countPerAs_)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Arsenic')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram3.yAxis().tickValues([0, 10, 20, 30]);

                dataHistogram3 = function (d) { return d.properties.As_; };
            }
            else if (input3 == "Ba") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(BaDim)
                    .group(countPerBa)
                    .x(d3.scale.linear().domain([0, 1500]))
                    .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Barium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 300, 600, 900, 1200, 1500]);
                histogram3.yAxis().tickValues([0, 10, 20, 30]);

                dataHistogram3 = function (d) { return d.properties.Ba; };
            }
            else if (input3 == "Ca") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(CaDim)
                    .group(countPerCa)
                    .x(d3.scale.linear().domain([0, 970]))
                    .y(d3.scale.linear().domain([0, 13]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(20)
                    // .xAxisLabel('Calcium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 200, 400, 600, 800, 1000]);
                histogram3.yAxis().tickValues([0, 3, 6, 9, 12]);

                dataHistogram3 = function (d) { return d.properties.Ca; };
            }
            else if (input3 == "Cl_") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(Cl_Dim)
                    .group(countPerCl_)
                    .x(d3.scale.linear().domain([0, 41800]))
                    .y(d3.scale.linear().domain([0, 3]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Clorine')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 10000, 20000, 30000, 40000]);
                histogram3.yAxis().tickValues([0, 1, 2, 3]);

                dataHistogram3 = function (d) { return d.properties.Cl_; };
            }
            else if (input3 == "Cr") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(CrDim)
                    .group(countPerCr)
                    .x(d3.scale.linear().domain([0, 30]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Chromium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 10, 20, 30]);
                histogram3.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram3 = function (d) { return d.properties.Cr; };
            }
            else if (input3 == "GrossAlpha_U_Nat") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(GrossAlpha_U_NatDim)
                    .group(countPerGrossAlpha_U_Nat)
                    .x(d3.scale.linear().domain([0, 780]))
                    .y(d3.scale.linear().domain([0, 2]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('GrossAlpha_U_Nat')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 200, 400, 600, 800]);
                histogram3.yAxis().tickValues([0, 1, 2]);

                dataHistogram3 = function (d) { return d.properties.GrossAlpha_U_Nat; };
            }
            else if (input3 == "Nitrate") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(NitrateDim)
                    .group(countPerNitrate)
                    .x(d3.scale.linear().domain([0, 240]))
                    .y(d3.scale.linear().domain([0, 3]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Nitrate')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram3.yAxis().tickValues([0, 1, 2, 3]);

                dataHistogram3 = function (d) { return d.properties.Nitrate; };
            }
            else if (input3 == "Pb") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(PbDim)
                    .group(countPerPb)
                    .x(d3.scale.linear().domain([0, 320]))
                    .y(d3.scale.linear().domain([0, 15]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Lead')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 100, 200, 300]);
                histogram3.yAxis().tickValues([0, 5, 10, 15]);

                dataHistogram3 = function (d) { return d.properties.Pb; };
            }
            else if (input3 == "Ra_Total") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(Ra_TotalDim)
                    .group(countPerRa_Total)
                    .x(d3.scale.linear().domain([0, 1]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Ra_Total')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0.2, 0.4, 0.6, 0.8, 1]);

                dataHistogram3 = function (d) { return d.properties.Ra_Total; };
            }
            else if (input3 == "Se") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(SeDim)
                    .group(countPerSe)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Selenium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram3.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram3 = function (d) { return d.properties.Se; };
            }
            else if (input3 == "U") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(UDim)
                    .group(countPerU)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Uranium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram3.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram3 = function (d) { return d.properties.U; };
            }

            else if (input3 == "None") {

                histogram3
                    .width(250)
                    .height(250)
                    .dimension(NoneDim)
                    .group(countPerNone)
                    .x(d3.scale.linear().domain([0, 0]))
                    // .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('None')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram3.xAxis().tickValues([0, 0, 0, 0, 0, 0]);
                histogram3.yAxis().tickValues([0, 0, 0, 0]);

                dataHistogram3 = function (d) { return d.properties.None; };
            }

            if (input4 == "As_") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(As_Dim)
                    .group(countPerAs_)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Arsenic')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram4.yAxis().tickValues([0, 10, 20, 30]);

                dataHistogram4 = function (d) { return d.properties.As_; };
            }
            else if (input4 == "Ba") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(BaDim)
                    .group(countPerBa)
                    .x(d3.scale.linear().domain([0, 1500]))
                    .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Barium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 300, 600, 900, 1200, 1500]);
                histogram4.yAxis().tickValues([0, 10, 20, 30]);

                dataHistogram4 = function (d) { return d.properties.Ba; };
            }
            else if (input4 == "Ca") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(CaDim)
                    .group(countPerCa)
                    .x(d3.scale.linear().domain([0, 970]))
                    .y(d3.scale.linear().domain([0, 13]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(20)
                    // .xAxisLabel('Calcium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 200, 400, 600, 800, 1000]);
                histogram4.yAxis().tickValues([0, 3, 6, 9, 12]);

                dataHistogram4 = function (d) { return d.properties.Ca; };
            }
            else if (input4 == "Cl_") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(Cl_Dim)
                    .group(countPerCl_)
                    .x(d3.scale.linear().domain([0, 41800]))
                    .y(d3.scale.linear().domain([0, 3]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Clorine')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 10000, 20000, 30000, 40000]);
                histogram4.yAxis().tickValues([0, 1, 2, 3]);

                dataHistogram4 = function (d) { return d.properties.Cl_; };
            }
            else if (input4 == "Cr") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(CrDim)
                    .group(countPerCr)
                    .x(d3.scale.linear().domain([0, 30]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Chromium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 10, 20, 30]);
                histogram4.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram4 = function (d) { return d.properties.Cr; };
            }
            else if (input4 == "GrossAlpha_U_Nat") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(GrossAlpha_U_NatDim)
                    .group(countPerGrossAlpha_U_Nat)
                    .x(d3.scale.linear().domain([0, 780]))
                    .y(d3.scale.linear().domain([0, 2]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('GrossAlpha_U_Nat')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 200, 400, 600, 800]);
                histogram4.yAxis().tickValues([0, 1, 2]);

                dataHistogram4 = function (d) { return d.properties.GrossAlpha_U_Nat; };
            }
            else if (input4 == "Nitrate") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(NitrateDim)
                    .group(countPerNitrate)
                    .x(d3.scale.linear().domain([0, 240]))
                    .y(d3.scale.linear().domain([0, 3]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Nitrate')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram4.yAxis().tickValues([0, 1, 2, 3]);

                dataHistogram4 = function (d) { return d.properties.Nitrate; };
            }
            else if (input4 == "Pb") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(PbDim)
                    .group(countPerPb)
                    .x(d3.scale.linear().domain([0, 320]))
                    .y(d3.scale.linear().domain([0, 15]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Lead')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 100, 200, 300]);
                histogram4.yAxis().tickValues([0, 5, 10, 15]);

                dataHistogram4 = function (d) { return d.properties.Pb; };
            }
            else if (input4 == "Ra_Total") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(Ra_TotalDim)
                    .group(countPerRa_Total)
                    .x(d3.scale.linear().domain([0, 1]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Ra_Total')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0.2, 0.4, 0.6, 0.8, 1]);

                dataHistogram4 = function (d) { return d.properties.Ra_Total; };
            }
            else if (input4 == "Se") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(SeDim)
                    .group(countPerSe)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Selenium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram4.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram4 = function (d) { return d.properties.Se; };
            }
            else if (input4 == "U") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(UDim)
                    .group(countPerU)
                    .x(d3.scale.linear().domain([0, 282]))
                    .y(d3.scale.linear().domain([0, 20]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('Uranium')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 50, 100, 150, 200, 250]);
                histogram4.yAxis().tickValues([0, 5, 10, 15, 20]);

                dataHistogram4 = function (d) { return d.properties.U; };
            }

            else if (input4 == "None") {

                histogram4
                    .width(250)
                    .height(250)
                    .dimension(NoneDim)
                    .group(countPerNone)
                    .x(d3.scale.linear().domain([0, 0]))
                    // .y(d3.scale.linear().domain([0, 30]))
                    .elasticY(false)
                    .centerBar(true)
                    .barPadding(3)
                    // .xAxisLabel('None')
                    .yAxisLabel('Count')
                    .margins({ top: 10, right: 20, bottom: 50, left: 50 });
                histogram4.xAxis().tickValues([0, 0, 0, 0, 0, 0]);
                histogram4.yAxis().tickValues([0, 0, 0, 0]);

                dataHistogram4 = function (d) { return d.properties.None; };
            }

            dataCountNew
                .dimension(ndx)
                .group(all);


            //Code for DataTable
            dataTableNew
                .dimension(allDim)
                .group(function (d) { return 'dc.js insists on putting a row here so I remove it using JS'; })
                .size(1001)
                .columns([
                    function (d) { return d.properties.well_id; },
                    dataHistogram1,
                    dataHistogram2,
                    dataHistogram3,
                    dataHistogram4
                ]) //Code to make dataTable data Alter the Map wells
                .on('renderlet', function (table) {
                    // each time table is rendered remove nasty extra row dc.js insists on adding
                    table.select('tr.dc-table-group').remove();

                    wellMarkers.clearLayers();
                    _.each(allDim.top(Infinity), function (d) {
                        var filLoc = d.properties;
                        // var id = d.properties.well_id;

                        // Color based on well use
                        function getColor(wUse) {
                            switch (wUse) {
                                case "Independent":
                                    return "#8c510a";
                                case "Agriculture":
                                    return "#bf812d";
                                case "Domestic":
                                    return "#dfc27d";
                                case "Livestock":
                                    return "#f6e8c3";
                                case "Other":
                                    return "#01665e";
                                case "Municipal":
                                    return "#c7eae5";
                                case "Domestic Irrigation":
                                    return "#80cdc1";
                                case "Recreation":
                                    return "#35978f";
                                default:
                                    return "#01665e";
                            }
                        }

                        var markerOptions = {
                            radius: 3.5,
                            fillColor: getColor(d.properties.USE),
                            color: "black",
                            weight: 0,
                            opacity: 1,
                            fillOpacity: 0.7
                        };

                        // Add circle markers
                        var marker = L.circleMarker([filLoc.lat, filLoc.long], markerOptions);

                        marker.bindPopup(
                            "<dl><dt> <h5><b><i>WELL INFORMATION- NAVAJO NATION WELL</i></b></h5><br>"
                            + "<dl>"
                            + "<dt><span style='font-weight:bolder'>FID: </span> </dt> <dd>" + d.properties.FID + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Well No.: </span> </dt> <dd>" + d.properties.well_no + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Well ID: </span> </dt> <dd>" + d.properties.well_id + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Well Name: </span> </dt> <dd>" + d.properties.well_name + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Owner: </span> </dt> <dd>" + d.properties.owner + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Depth: </span> </dt> <dd>" + d.properties.depth + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Public Water Sys. ID: </span> </dt> <dd>" + d.properties.pwsid + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>USGS ID: </span> </dt> <dd>" + d.properties.usgs_id + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Data Source: </span> </dt> <dd>" + d.properties.data_sourc + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Comment(s): </span> </dt> <dd>" + d.properties.comments + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Alternate Name 1: </span> </dt> <dd>" + d.properties.aka2 + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Alternate Name 2: </span> </dt> <dd>" + d.properties.aka3 + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Status: </span> </dt> <dd>" + d.properties.well_statu + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Agency: </span> </dt> <dd>" + d.properties.nn_agency + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Well Use: </span> </dt> <dd>" + d.properties.USE + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Alkalinity: </span> </dt> <dd>" + d.properties.Alkalinity + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Total Alkalinity: </span> </dt> <dd>" + d.properties.Alkalinity_Total + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>As: </span> </dt> <dd>" + d.properties.As_ + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Ba: </span> </dt> <dd>" + d.properties.Ba + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Be: </span> </dt> <dd>" + d.properties.Be + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Br: </span> </dt> <dd>" + d.properties.Br_ + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Ca: </span> </dt> <dd>" + d.properties.Ca + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Cd: </span> </dt> <dd>" + d.properties.Cd + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Cl :" + d.properties.Cl_ + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Conductivity: </span> </dt> <dd>" + d.properties.Conductivity + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Cr: </span> </dt> <dd>" + d.properties.Cr + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>DO: </span> </dt> <dd>" + d.properties.DO + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Electrical Conductivity: </span> </dt> <dd>" + d.properties.ElectricalConductivity + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Gross Alpha 2 Sigma Comb. Uncertainty: </span> </dt> <dd>" + d.properties.Gross_alpha__2_sigma_combined_uncertainty + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Gross Alpha: </span> </dt> <dd>" + d.properties.GrossAlpha + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Gross Alpha: U Nat: </span> </dt> <dd>" + d.properties.GrossAlpha_U_Nat + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Gross Beta 1: </span> </dt> <dd>" + d.properties.GrossBeta + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Gross Beta: Cs 137: </span> </dt> <dd>" + d.properties.GrossBeta_Cs137 + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Gross Beta: Sr Y90: </span> </dt> <dd>" + d.properties.GrossBeta_Sr_Y90 + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Hardness: </span> </dt> <dd>" + d.properties.Hardness + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Total Hardness: </span> </dt> <dd>" + d.properties.Hardness_Total + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Hg: </span> </dt> <dd>" + d.properties.Hg + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Hydroxide: </span> </dt> <dd>" + d.properties.Hydroxide + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>K: </span> </dt> <dd>" + d.properties.K + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Mg: </span> </dt> <dd>" + d.properties.Mg + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Mn: </span> </dt> <dd>" + d.properties.Mn + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Na: </span> </dt> <dd>" + d.properties.Na + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Na Adsorption Ratio: </span> </dt> <dd>" + d.properties.Na_AdsorptionRatio + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Na Fraction Cations: </span> </dt> <dd>" + d.properties.Na_FractionCations + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Na_K: </span> </dt> <dd>" + d.properties.Na_K + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Nitrate: </span> </dt> <dd>" + d.properties.Nitrate + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Nitrate_Nitrite: </span> </dt> <dd>" + d.properties.Nitrate_Nitrite + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>NO2: </span> </dt> <dd>" + d.properties.NO2_ + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>NO3: </span> </dt> <dd>" + d.properties.NO3_ + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>ORP: </span> </dt> <dd>" + d.properties.ORP + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Pb: </span> </dt> <dd>" + d.properties.Pb + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Ra 226: </span> </dt> <dd>" + d.properties.Ra_226 + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Ra 228: </span> </dt> <dd>" + d.properties.Ra_228 + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Ra Total: </span> </dt> <dd>" + d.properties.Ra_Total + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Sb: </span> </dt> <dd>" + d.properties.Sb + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Se: </span> </dt> <dd>" + d.properties.Se + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Temperature: </span> </dt> <dd>" + d.properties.Temperature + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Tl: </span> </dt> <dd>" + d.properties.Tl + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>Turbidity: </span> </dt> <dd>" + d.properties.Turbidity + ";<dd>"
                            + "<dt><span style='font-weight:bolder'>U: </span> </dt> <dd>" + d.properties.U + "<dt><dl>"
                            + "</dl>"
                        );
                        wellMarkers.addLayer(marker);
                    });

                    //remove Layers from map
                    // map.removeLayer(wellMarkers);   //Problem since wellMarkers is not global

                    // Add markers to map:
                    map.addLayer(wellMarkers);  //Says map.addLayer is not a function for some reason.
                    map.fitBounds(wellMarkers.getBounds());

                });

            dc.renderAll();
            //xdocument.getElementById("histogram1").innerHTML=histogram1;
        });

    }
}
