/**
 * Draws a stacked-bar Chart with one bar for sws of all given subjects.
 *
 * @param selected_subjects array of subjects
 */
function drawSwsChart(selected_subjects) {
    let max_amount_of_sws = 0;
    let number_of_different_sws = new Map();
    let height_per_sws = 12;

    // calculate sum of sws and count different sws
    for (subject of selected_subjects) {
        let sws = subject.sws.replace(/ /g,'');
        if (sws === "") {
            sws = 0;
            subject.sws = "*";
        } else {
            max_amount_of_sws += +sws;
        }
        let count_sws = number_of_different_sws.get(subject.sws);
        count_sws = (count_sws === undefined)? 1: count_sws;
        number_of_different_sws.set(subject.sws,count_sws +1);
    }
    //sort number of different sws
    number_of_different_sws = new Map([...number_of_different_sws.entries()].sort((a,b) => {
        return b[0]-a[0];
    }));


    // create domain for color scale
    let domain = [];
    for (let k of number_of_different_sws.keys()) {
        domain.push(k);
    }

    let swsColorScale = d3.scaleBand()
        .range([0, 1])
        .domain(domain);

    //This is for rendering the sws chart
    let sws = d3.select('#sws')
        .selectAll('.sws-subject')
        .data(selected_subjects.reverse(), d => d.name);

    // remove old representation if data had changed
    sws.exit().remove();

    // append new representation
    let divs = sws.enter()
        .append('div')
        .attr('class','sws-subject');

    let values = divs
        .append('div')
        .attr('class','sws-value')
        .text(d => ((d.sws === -1)? "*": d.sws));

    let names = divs
        .append('div')
        .attr('class','sws-name')
        //.style("line-height", d => d.sws * height_per_sws +"px")
        .text(d => d.name);


    //update existing representations
    divs
        .merge(sws)
        .style("height", d => d.sws * height_per_sws +"px");

    values.merge(divs)
        .style("background-color", d => d3.color(d3.interpolateSinebow(swsColorScale(d.sws))).darker())
        .style("line-height", d => ((d.sws === -1)? 1: d.sws) * height_per_sws +"px");

    names.merge(divs)
        .style("font-size", function(d) {
            return 0.75 * height_per_sws+"px";
        })
        .style("color", d => {
            return d3.color(d3.interpolateSinebow(swsColorScale(d.sws))).darker();
        });

    // render sum of sws
    d3.select('#amount_of_sws')
        .html("SWS: &Sigma; "+max_amount_of_sws);

    // render legend for colorcoding
    let legend = d3.select('#sws-legend-items')
        .selectAll('.sws-legend-item')
        .data(domain, d => d);

    legend.exit().remove();

    let legendEnter = legend
        .enter()
        .append('div')
        .attr("class","sws-legend-item");

    let legendColor = legendEnter
        .append('div')
        .attr("class", "sws-legend-color");

    let legendTitle = legendEnter
        .append("div")
        .attr("class", "sws-legend-title");

    legendColor
        .merge(legendEnter)
        .style("background-color", d => d3.color(d3.interpolateSinebow(swsColorScale(d))).darker());

    legendTitle
        .merge(legendEnter)
        .text(d => d +" sws")


}
