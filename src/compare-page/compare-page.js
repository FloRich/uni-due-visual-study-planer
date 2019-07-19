var selected_subjects;
var removedSubjects;
let overlapMap = null;
let ratingsMap = null;
let offsetTop = 300;


/**
 * Loads the selected and removed subjects.
 */
function initialzeSubjectLists() {
    selected_subjects = loadSelectedSubjects();
    removedSubjects = loadRemovedSubjects();
}
/**
 *  Removes subject with specified index and visualisation
 */
function removeSubject(index) {
    let removed = selected_subjects.splice(index,1);
    removedSubjects.push(...removed);

    updateViz();
}

/**
 * Sets the width of the svg to the same value as its parent
 */
function setSvgWidthToParentsWidth() {
    // fit svg size to parents size
    let main = document.getElementsByTagName('main')[0];
    let bounding = main.getBoundingClientRect();

    let sideMenuHeight = document.getElementsByTagName('nav')[0].clientHeight;
    d3.select('#heatmaps')
        .attr("width", bounding.width);
}

/**
 * Draws a stacked-bar Chart with one bar for sws of all given subjects.
 *
 * @param selected_subjects array of subjects
 */
function drawSwsChart(selected_subjects) {
    let data = Object.create(selected_subjects).reverse();
    let max_amount_of_sws = 0;
    let number_of_different_sws = new Map();
    let height_per_sws = 12;

    // calculate sum of sws and count different sws
    for (subject of selected_subjects) {
        let sws = (subject.sws)?subject.sws.replace(/ /g,''):"0";
        if (sws === "" || sws === 'undefefined') {
            sws = "0";
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
        .data(data, d => d.name);

    // remove old representation if data had changed
    sws.exit().remove();

    // append new representation
    let divs = sws.enter()
        .append('div')
        .attr('class','sws-subject')
        .on("mouseover", (d) => {
            if (ratingsMap != null){
                ratingsMap.highlightSubjectNames([d.name]);
            }
        })
        .on("mouseout", (d) => {
            if (ratingsMap != null) {
                ratingsMap.removeHighlightingOfSubjectNames();
            }
        });

    let values = divs
        .append('div')
        .attr('class','sws-value')
        .text(d => ((d.sws === -1)? "*": d.sws));

    let names = divs
        .append('div')
        .attr('class','sws-name')
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

    renderSWSLegend(domain, swsColorScale);
}

/**
 * Displays a legend for the sws chart.
 * @param domain the different type of sws points
 * @param swsColorScale colorscale from sws chart
 */
function renderSWSLegend(domain, swsColorScale) {
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

/**
 * Displays all subjects that where removed from the heatmap.
 * @param list_of_subjects
 */
function renderRemovedSubjects() {
    let selections = d3.select("#subject-selection")
        .selectAll("li")
        .data(removedSubjects, d => d.name);

    //on remove
    selections.exit().remove();

    let enter = selections
        .enter()
        .append("li")
        .append("div")
        .attr("class","removed-item");
    let text = enter
        .append("div")
        .attr("class","removed-item-text");

    let revertAction = enter
        .append("img")
        .attr("class", "removed-item-revert")
        .attr("src", "https://img.icons8.com/color/20/000000/undelete.png")
        .on("click", d => revertDeletion(d));

    d3.select("#subject-selection").selectAll(".removed-item-text").merge(text)
        .attr("class","card-text")
        .text((d) => d.name);
}

/**
 * Adds an already removed subject to the list of selected ones and updates the visualization.
 * @param subject the removed subject.
 */
function revertDeletion(subject) {
    let index = removedSubjects.findIndex((obj) => obj.name === subject.name);
    if (index >= 0) {
        removedSubjects.splice(index,1);
        selected_subjects.push(subject);
        updateViz();
    }
}

/**
 * Redraws the heatmap, swsChart and list of removed subjects.
 * Saves changes mede to selected_subjects and removedSubjects.
 */
function updateViz() {
    //save changes
    setSelectedSubjects(selected_subjects);
    setRemovedSubjects(removedSubjects);

    //redraw charts
    drawSwsChart(selected_subjects);
    renderRemovedSubjects(removedSubjects);
    if (ratingsMap)
        ratingsMap.draw(selected_subjects);
    if (overlapMap)
        overlapMap.draw(selected_subjects, generateTimeoverlapChartData(selected_subjects));
}

/**
 * Checks whether two entries from timetables are overlapping
 * @param entryA entry from a timetable. Has to have attributes day, time and duration
 * @param entryB entry from another timetable. Has to have same attributes.
 * @returns {*} - False:  if the do not overlap.
 *              - edge: if the just overlap in the same minute. E.g startA = 10.00 and endB = 10.00
 *              - critical: if the overlap in time.
 */
function checkForTimeOverlap(entryA, entryB) {
    // check if durations do not overlap
    let durationA = entryA.duration;
    let durationB = entryB.duration;
    if ((durationB.from < durationA.from && durationB.to < durationA.from) ||
        (durationB.from > durationA.to && durationB.to > durationA.to)) {
            return false;
    }

    // check if days do not overlap
    if (entryB.day !== entryA.day) {
        return false;
    }

    // check if time does not overlap
    let timeA = entryA.time;
    let timeB = entryB.time;
    if ((timeB.from < timeA.from && timeB.to < timeA.from) ||
        (timeB.from > timeA.to && timeB.to > timeA.to)) {
        return false;
    }

    // everything is overlapping. Check if it is critical e.g full overlap or if just the edges are overlapping
    if (timeB.from === timeA.to || timeB.to === timeA.from) {
        return "edge"
    }

    // the two different entries overlap in time completely
    return "critical"
}

/**
 * Calculate overlapping of time-entries for different timetables
 * @param timetableA first timetable
 * @param timetableB second timetable
 * @returns {Array} A list of pairs of entries with the type of overlap
 */
function calculateTimeoverlaps(timetableA, timetableB) {
    let overlappings = [];
    for (let entryA of timetableA) {
        for (let entryB of timetableB) {
            let result = checkForTimeOverlap(entryA, entryB);
            if (result !== false) {
                overlappings.push({
                    severity: result,
                    from: entryB,
                    with: entryA
                })
            }
        }
    }
    return overlappings;
}

/**
 * Generates data for the timeoverlap chart by comparing differences in timetables of subjects
 * @param selectedSubjects A list of subjects
 * @returns {Array} A list of all combinations of subjects and their overlaps (can be empty).
 */
function generateTimeoverlapChartData(selectedSubjects) {
    let data = [];
    for (let subjectA of selectedSubjects) {
        for (let subjectB of selectedSubjects) {
            if (subjectA !== subjectB) {
                data.push({
                    subjectA: subjectA,
                    subjectB: subjectB,
                    overlaps: calculateTimeoverlaps(subjectA.timetable, subjectB.timetable)
                })
            } else {
                data.push({
                    subjectA: subjectA,
                    subjectB: subjectB,
                    overlaps: []
                })
            }
        }
    }
    return data;
}

/**
 * Renders a tooltip for time-overlap-map.
 * @param timeOverlap data of the timeoverlap of two subjects
 */
function showTimeTooltip(timeOverlap) {
    let body = document.getElementsByTagName("body")[0];
    let mouse = d3.mouse(body);
    d3.select("#tooltip")
        .style("display","flex")
        .style("left", mouse[0]+10+"px")
        .style("top", mouse[1] + "px")
        .on("mouseover", function(d) {
            d3.select(this).style("display","none")
        })
        .html(function() {
            let html = "";
            let subjects = ['subjectA', 'subjectB'];
            let overlapedSubjects = ['with','from'];

            for (let i = 0; i<2; i++) {
                let subject = timeOverlap[subjects[i]];
                let overlapSubject = overlapedSubjects[i];
                let semester = (subject.hasOwnProperty("semester"))? subject.semester: "".concat( ...subject.semesters, " ");
                let subjectHtml = `
                        <div class="timetable-tooltip-subject">
                        <h6>${subject.name}</h6><p>${semester}</p>`;


                let overlaps ='<div class="time-entry-overlap">Overlaping';
                for (let overlap of timeOverlap.overlaps) {
                    let entry = overlap[overlapSubject];
                    overlaps += `
                                <div class="time-entry">
                                    <span>Day: ${entry.day}</span>
                                    <span>Time: ${entry.time.from} to ${entry.time.to}</span>
                                    <span>Duration: ${(Object.keys(entry.duration).indexOf("from") < 0) ? entry.duration : entry.duration.from + " to " + entry.duration.to}</span>
                                </div>
                                `;
                }

                subjectHtml += overlaps + `</div><div class='time-entries'> All`;

                for (let entry of subject.timetable) {
                    subjectHtml += `
                            <div class="time-entry">
                                <span>Day: ${entry.day}</span>
                                <span>Time: ${entry.time.from} to ${entry.time.to}</span>
                                <span>Duration: ${(Object.keys(entry.duration).indexOf("from") < 0) ? entry.duration : entry.duration.from + " to " + entry.duration.to}</span>
                             </div>
                        `
                }
                subjectHtml += "</div></div>";
                html += subjectHtml;
            }
            return html;
        })
}

/**
 * Creates a Heatmap for timeoverlaps
 * @param fieldWidth width of a cell
 * @param fieldHeight height of a cell
 * @param offsetLeft amount of pixels the map should move to the right.
 * @returns {TimeoverlapHeatMap}
 */
function createTimeoverlapHeatmap(fieldWidth, fieldHeight, offsetLeft) {
    overlapMap = new TimeoverlapHeatMap('timeoverlap-matrix');

    let siblingSvg = document.getElementById('rating-map');
    let timeoverlapOffsetLeft =  +siblingSvg.getAttribute("width") +25 + offsetLeft;

    overlapMap.init(selected_subjects, fieldWidth,fieldHeight,timeoverlapOffsetLeft, offsetTop );
    overlapMap.draw(selected_subjects, generateTimeoverlapChartData(selected_subjects));
    return overlapMap;
}

/**
 * Creates a heatmap for ratings.
 * @param fieldWidth width of a cell
 * @param fieldHeight height of a cell
 * @param offsetLeft amount of pixels the map should move to the right.
 * @returns {RatingsHeatMap}
 */
function createRatingsHeatmap(fieldWidth,fieldHeight,offsetLeft) {
    ratingsMap = new RatingsHeatMap('rating-map', fieldWidth, fieldHeight, offsetLeft, offsetTop);

    ratingsMap.init(selected_subjects);
    ratingsMap.draw(selected_subjects);
    return ratingsMap;
}

