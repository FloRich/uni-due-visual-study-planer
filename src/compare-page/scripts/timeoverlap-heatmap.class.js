class TimeoverlapHeatMap {

    constructor(elemenetId) {
        this.elementId = '#'+elemenetId;
        this.yScale =  d3.scaleBand();
        this.xScale = d3.scaleBand();
        this.types= ["nothing", "edge", "critical"];
        this.legendDescription = {
            "nothing": "No overlapping",
            "edge": "No time between subjects",
            "critical": "Overlapping"
        }
    }

    init(subjects, widthOfField, heightOfField, offsetLeft, offsetTop) {
        this.width = widthOfField * subjects.length;
        this.height = heightOfField * subjects.length;
        this.cellWidth = widthOfField;
        this.cellHeight = heightOfField;
        this.offsetLeft = offsetLeft;
        this.offsetTop = offsetTop;

        this.map = d3.select(this.elementId)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", "translate("+(this.offsetLeft)+", "+this.offsetTop +")")
            .append("g");

        this.xScaleElement = this.map
            .append("g")
            .attr("class", "timeoverlap-x-axis");
        this.contentElement = this.map
            .append("g")
            .attr("id", "timeoverlap-content")
            .on("mouseleave", function () {
                d3.select('#tooltip')
                    .style("display","none")
            });

        this.createLegend();
    }

    createLegend() {
        this.legendElement = this.map
            .append("g")
            .attr("class","timeoverlap-legend");

        let legend = this.legendElement
            .selectAll("g")
            .data(this.types, d => d)
            .enter()
            .append("g");

        legend
            .append("rect")
            .attr("width", this.cellWidth)
            .attr("height", this.cellHeight)
            .attr("y", (d,i) => this.cellHeight * i)
            .attr("class", (d) => "cell overlap-"+d);

        legend
            .append("text")
            .attr("x", this.cellWidth + 5)
            .attr("y", "1em")
            .attr("transform", (d,i) => {
                return "translate(0,"+ (this.cellHeight * i)+")";
            })
            .text(d => this.legendDescription[d]);
    }

    updateScalesAndLegend(data) {
        this.width = this.cellWidth * data.length;
        this.height = this.cellHeight * data.length;

        // update scales
        this.yScale = d3.scaleBand()
            .range([this.height, 0])
            .domain(data.map( d => d.name));

        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .domain(data.map( d => d.name));

        this.xScaleElement
            .call(d3.axisTop(this.xScale))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 5)
            .attr("dy", -5)
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "start");

        // move legend
        let legendHeigt = this.types.length * this.cellWidth;
        this.legendElement
            .attr("transform","translate("+(this.width+ 10)+","+(this.height - legendHeigt)/2+")");
    }

    drawContent(data) {
        console.log(data);
        let content = this.contentElement
            .selectAll(".cell")
            .data(data, d => d.name);

        content.exit().remove();

        let contentEnter = content
            .enter()
            .append("rect")
            .attr("class", function(d) {
                let classes = "cell ";
                if (d.subjectA.name === d.subjectB.name) {
                    return classes + "overlap-identity";
                }

                if (d.overlaps.length === 0) {
                    return classes + "overlap-nothing";
                } else {
                    for (let entry of d.overlaps){
                        if (entry.severity === "critical") {
                            return classes + "overlap-critical";
                        }
                    }
                    return classes + "overlap-edge";
                }
            });

        contentEnter.merge(content)
            .attr("width", width_of_field)
            .attr("height", height_of_field)
            .attr("x", (d) => {
                return this.xScale(d['subjectB'].name)
            })
            .attr("y", (d) => {
                return this.yScale(d['subjectA'].name)
            }).on("mouseover", showTimeTooltip);

    }

    draw(subjects, overlapData) {
        this.updateScalesAndLegend(subjects);
        this.drawContent(overlapData)
    }

}
