class RatingsHeatMap {

    constructor(elementId, cellWidth, cellHeight, offsetLeft, offsetTop) {
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.offsetLeft = offsetLeft;
        this.offsetTop = offsetTop;
        this.elementId = '#'+elementId;
        this.xlabels = ['recommendation', 'understandability', 'fairness','support','material','interest','fun', 'node_effort'];

    }

    init(subjects) {
        this.width = this.cellWidth * subjects.length;
        this.height = this.cellHeight * subjects.length;

        this.map = d3.select(this.elementId)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", "translate("+(this.offsetLeft)+", "+this.offsetTop +")")
            .append("g");

        // create scales for labels
        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .domain(this.xlabels);

        this.yScale = d3.scaleBand()
            .range([this.height, 0])
            .domain(subjects.map( d=> d.name));

        this.xScaleElement = this.map
            .append("g")
            .attr("class", "ratings-x-axis");
        this.xScaleElement
            .call(d3.axisTop(this.xScale))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 5)
            .attr("dy", -5)
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "start");

        this.yScaleElement = this.map
            .append("g")
            .attr("class","ratings-y-axis");

        // create colorscale for content

        this.ratingColorScale =  d3.scaleLinear()
            .range(["#fffc85", "#4bb354"])
            .domain([0,100]);

        this.linearGradient = this.map
            .append("defs")
            .append("linearGradient")
            .attr("id", "linear-gradient");

        this.linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", this.ratingColorScale(0));

        this.linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", this.ratingColorScale(100));

        this.createLegend();

        this.contentElement = this.map
            .append("g")
            .attr("class", "ratings-content");
    }

    createLegend() {
        // Construct legend
        this.legend = this.map.append("g")
            .attr("class","legend-content")
            .attr("transform","translate("+0+","+ (this.height+30)+")");

        // Create scale"
        let legendScale = this.legend.append("g");
        legendScale.append("text")
            .attr("transform","translate(-30,12.5)")
            .style("font-size","15px")
            .text("0 %");
        legendScale.append("rect")
            .attr("x", 0)
            .attr("y",0)
            .attr("width", this.width)
            .attr("height", 15)
            .attr("fill", "url(#linear-gradient)");
        legendScale.append("text")
            .attr("transform", "translate("+(this.width+5)+",12.5)")
            .style("font-size","15px")
            .text("100 %");

        // Add explaination for X
        let legendNoRating = this.legend.append("g")
            .attr("class","x-explaination")
            .attr("transform","translate(0,+"+40+")");
        legendNoRating.append("rect")
            .attr("y",-(this.cellWidth*0.7))
            .attr("transform","scale(0.7)")
            .attr("width", this.cellWidth)
            .attr("height",this.cellHeight)
            .attr("fill", "url(#no_rating)");
        legendNoRating.append("text")
            .style("font-size","15px")
            .attr("x", this.cellWidth * 0.7)
            .attr("y", 1)
            .text("No Rating");

        //Create triangle
        const symbolGenerator = d3.symbol()
            .type(d3.symbolTriangle)
            .size(64);

        this.triangle = this.legend.append("g")
            .attr("transform","rotate(180), translate("+(-this.width/2)+",5)")
            .attr("class", "triangle-pointer");

        this.triangle
            .append("path")
            .attr("d", symbolGenerator());

        this.triangle
            .append("text")
            .attr("transform","rotate(180)")
            .attr("x",0)
            .style("text-anchor","middle")
            .attr("id","triangle-text")
            .style("font-size","10px")
            .attr("y",30)
            .text("");
    }

    /**
     * Moves the triangle from the legend to the specified element and position
     * @param type the element to move on. One of "values", "x-explaination"
     * @param value
     */
    moveTriangeToValue(type, value) {
        let x = -3;
        let y = 5;
        if (type === "values") {
            x = x +value * (this.width);

            d3.select("#triangle-text").transition().delay(300).text(Math.round(value*10000)/100+" %");

            this.triangle
                .transition()
                .delay(300)
                .attr("transform", "rotate(180) translate("+-x+","+y+")")
        } else if (type === "x-explanation") {
            y = 37;
            d3.select("#triangle-text").transition().delay(300).text("");

            this.triangle
                .transition()
                .delay(300)
                .attr("transform", "rotate(90) translate("+y+","+-x+")")
        }

    }

    updateAxisAndLegend(subjects) {
        // update y axis
        this.yScale = this.yScale
            .range([this.height, 0])
            .domain(subjects.map(d => d.name));

        this.yScaleElement
            .call(d3.axisLeft(this.yScale))
            .selectAll("text")
            .on("click", function(d) {
                let index = selected_subjects.findIndex((subject) => (subject.name === d));
                if (index >= 0) {
                    removeSubject(index);
                }
            });

        // update legend
        this.legend
            .attr("transform","translate("+0+","+ (this.height+30)+")");
    }

    draw(subjects) {
        this.width = this.cellWidth * subjects.length;
        this.height = this.cellHeight * subjects.length;

        this.updateAxisAndLegend(subjects);

        let flattened_data = [];

        // flatten data
        for (let element of subjects){
            for (let attrib of this.xlabels) {
                flattened_data.push({
                    name: element.name,
                    type: attrib,
                    value: element.rating[""+attrib] || -1
                })
            }
        }

        // delete labels and rectangles
        d3.select(this.elementId).selectAll('.ratings-y-axis')
            .exit()
            .remove();

        let rect = this.contentElement.selectAll(".cell")
            .data(flattened_data, (d) => d);

        rect.exit().remove();

        let rectEnter = rect.enter()
            .append("rect")
            .attr("class", "cell");

        rectEnter.merge(rect)
            .attr("x",(d) => {
                return this.xScale(d.type)
            })
            .attr("y", (d) => {
                return this.yScale(d.name)
            }) .attr("width", this.cellWidth)
            .attr("height", this.cellHeight)
            .style("fill", (d) => {
                if (d.value === -1) {
                    return "url(#no_rating)"
                }
                return this.ratingColorScale(d.value)
            })
            .on("mouseover", (d) => {
                if (d.value === -1) {
                    this.moveTriangeToValue("x-explanation",0);
                }else {
                    this.moveTriangeToValue("values",d.value/100);
                }
            });
    }


}
