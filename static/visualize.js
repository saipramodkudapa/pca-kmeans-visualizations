
function drawScreePlot(data, chart_title) {

	//prepare data for bar and line
	data.forEach(function(d) {
	        d.label = d.label;
	        d.variance_ratio = +d.variance_ratio;
	        d.variance_ratio_cumsum = +d.variance_ratio_cumsum
	    });
	var linedata = data.map(function(d) {return d.variance_ratio_cumsum});
	d3.select('#vizn').remove();

	var margin = {top: 20, right: 20, bottom: 80, left: 50},
	width = 1100 - margin.left - margin.right,
	height = 600 - margin.top - margin.bottom;

	//scales for line and bars
	var x = d3.scale.ordinal().rangeRoundBands([0, width], .10);
	var y = d3.scale.linear().range([height, 0]);
	var line_x = d3.scale.linear().domain([-0.5, linedata.length+0.5]).range([0, width]);
	var line_y = d3.scale.linear().domain([0, d3.max(linedata)]).range([height, 0]);

	//scale bar ranges
	x.domain(data.map(function(d) { return d.label }));
	y.domain([0, 100]);


	// variable for line chart
	var markerX
	var markerY
	var color = d3.scale.category10();

	//define axis
	var xAxis = d3.svg.axis().scale(x).orient("bottom")
	var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);



   var line = d3.svg.line()
		      		.x(function(d, i) {
		          		if(i == 2) {
		            		markerX = line_x(i);
		            		markerY = line_y(d)
		          		}
		          		return line_x(i);
		      		})
		      		.y(function(d) {
		        		return line_y(d);
		      		})

	var svg = d3.select("body").append("svg")
				.attr("id", "vizn")
	    		.attr("width", width + margin.left + margin.right)
	    		.attr("height", height + margin.top + margin.bottom)
	    		.append("g")
	    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
	      // .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	      .attr('y',40)
          .attr('x',20)
          .attr('fill','black')
		  .attr('class','label')

	svg.append("g")
	      // .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", -50)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Variance Ratio");

	svg.selectAll("bar")
	      .data(data)
	      .enter().append("rect")
	      .style("fill", "steelblue")
	      .attr("x", function(d) { return x(d.label); })
	      .attr("width", x.rangeBand())
	      .attr("y", function(d) { return y(d.variance_ratio); })
	      .attr("height", function(d) { return height - y(d.variance_ratio); });

    svg.append("path")
        .attr("d", line(linedata))
        .attr("fill", "none")
        .attr("stroke", color(1))
        .attr("stroke-width", "3px")

    svg.append("circle")
     	.attr("cx", markerX)
	    .attr("cy", markerY)
        .attr("r", 8)
	    .style("fill", "red");

    svg.append("text")
        .attr("x", (width / 4))
        .attr("y", 0 + (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text(chart_title);
}

function drawScatterPlot(data, chart_title) {
    console.log('test', data[0])
    console.log(typeof data[0])
    d3.select('#vizn').remove();
    console.log('data', data[0]);
    var array = [];
    var min = 0, max = 0;

    for(var i=0; i< data.length; ++i){
        obj = {}
        obj.x = data[i][Schooling];
        obj.y = data[i][Life expectancy ];
        obj.clusterid = data[i]['clusterid']
        array.push(obj);
    }

    data = array;
    console.log('array data', data);
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    var xValue = function(d) { return d.x;}, xScale = d3.scale.linear().range([0, width]),
        xMap = function(d) { return xScale(xValue(d));}, xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yValue = function(d) { return d.y;}, yScale = d3.scale.linear().range([height, 0]),
        yMap = function(d) { return yScale(yValue(d));}, yAxis = d3.svg.axis().scale(yScale).orient("left");
    var cValue = function(d) { return d.clusterid;}
    var color = d3.scale.category10();
    var svg = d3.select("body").append("svg")
        .attr('id', 'vizn')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var tooltip = d3.select("body").append('div').style('position','absolute');
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .attr("class", "x_axis")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("y", -6)
          .attr("x", width)
          .text("Component 1")
          .style("text-anchor", "end");
    svg.append("g")
          .attr("class", "y_axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("y", 6)
          .attr("transform", "rotate(-90)")
          .attr("dy", ".71em")
          .text("Component 2")
          .style("text-anchor", "end");
    svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("class", "dot")
          .attr("cx", xMap)
          .attr("r", 4)
          .attr("cy", yMap)
          .style("fill", function(d) { return color(cValue(d));})
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text(chart_title);
}

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
}

function dataTransform(data) {
	obj = {}
	keys = Object.keys(data[0])
	console.log('keys', keys);
	for(var i=0; i<keys.length; i++){
		obj[keys[i]] = data.map(function(d) { return d[keys[i]]; })
	}
	console.log(obj);
	return obj;
}


function ddChange() {
    console.log('ddChange')
    var dropdown = document.getElementById("map2");
    var selectedValue = dropdown.options[dropdown.selectedIndex].value;
    if(selectedValue == -1) {
        // Do nothing
    } else if(selectedValue == "screeplot_unsampled") {
        renderViz('/screeplot?sample=unsampled', 'Screeplot Unsampled Data', 'scree');
    } else if(selectedValue == "screeplot_random") {
        renderViz('/screeplot?sample=random', 'Screeplot Randomly Sampled Data', 'scree');
    } else if(selectedValue == "screeplot_stratified") {
        renderViz('/screeplot?sample=stratified', 'Screeplot Stratified Sampling', 'scree');
    } else if(selectedValue == "pc1_pc2_plot_unsampled") {
        renderViz('/scatter_plt_test', 'Scatter Plot PC1 V PC2 Unsampled Data', 'scatter');
    } else if(selectedValue == "pc1_pc2_plot_random") {
        renderViz('/pcaplot?sample=random', 'Scatter Plot PC1 V PC2 Randomly Sampled Data', 'scatter');
    } else if(selectedValue == "pc1_pc2_plot_stratified") {
        renderViz('/pcaplot?sample=stratified', 'Scatter Plot PC1 V PC2 Stratified Data', 'scatter');
    } else if(selectedValue == "mds_euclidean_unsampled") {
        renderViz('/mdsplot?sample=unsampled&metric=euclidean', 'MDS Euclidean Plot Raw Data', 'scatter');
    } else if(selectedValue == "mds_euclidean_random") {
        renderViz('/mdsplot?sample=random&metric=euclidean', 'MDS Euclidean Plot Randomly Sampled Data', 'scatter');
    } else if(selectedValue == "mds_euclidean_stratified") {
        renderViz('/mdsplot?sample=stratified&metric=euclidean', 'MDS Euclidean Plot Stratified Sampled Data', 'scatter');
    } else if(selectedValue == "mds_correlation_unsampled") {
        renderViz('/mdsplot?sample=unsampled&metric=correlation', 'MDS Correlation Plot Raw Data', 'scatter');
    } else if(selectedValue == "mds_correlation_random") {
        renderViz('/mdsplot?sample=random&metric=correlation', 'MDS Correlation Plot Randomly Sampled Data', 'scatter');
    } else if(selectedValue == "mds_correlation_stratified") {
        renderViz('/mdsplot?sample=stratified&metric=correlation', 'MDS Correlation Plot Stratified Sampled Data', 'scatter');
    } else if(selectedValue == "scatterplot_matrix_unsampled") {
        renderViz('/scatterplotMatrix?sample=unsampled', 'Scatter Plot Matrix for Raw Data', 'matrix', true);
    } else if(selectedValue == "scatterplot_matrix_random") {
        renderViz('/scatterplotMatrix?sample=random', 'Scatter Plot Matrix for Randomly Sampled Data', 'matrix', true);
    } else if(selectedValue == "scatterplot_matrix_stratified") {
        renderViz('/scatterplotMatrix?sample=stratified', 'Scatter Plot Matrix for Stratified Sampled Data', 'matrix', false);
    }

    d3.select('#vizn').remove();
}

function renderViz(url, chart_title, typeViz, rs) {
	$.ajax({	
	  type: 'GET',
	  url: url,
      contentType: 'application/json; charset=utf-8',
	  xhrFields: {
		withCredentials: false
	  },
	  headers: {
	  },
	  success: function(result) {
      console.log('result', result.chart_data)
	  	var d3_usable_data = JSON.parse(result.chart_data)
	  	console.log('d3_usable_data', d3_usable_data)
	  	if(typeViz == -1){
	  		// do nothing
	  	} else if(typeViz == 'scree'){
	  		drawScreePlot(d3_usable_data, chart_title)
	  	} else if(typeViz == 'scatter'){
	  		drawScatterPlot(d3_usable_data, chart_title)
	  	} else if(typeViz == 'matrix'){
	  		dataTransform(d3_usable_data);
	  		drawScatterPlotMatrix(dataTransform(d3_usable_data), rs, chart_title)
	  	}		
	  },
	  error: function(result) {
		$("#error").html(result);
	  }
	})
}

