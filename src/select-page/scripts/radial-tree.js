var RadialTree = (function() {
    // private objects
    let colormap = {};
    let type_filter_settings = {};
    let selectedSubjects = [];
    let onUpdateFunction;
    let maxTextLength = 15;
    let svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        radius = 800,
        g = svg.append("g");
    let higlightType = "";
    let zoom = d3.zoom()
        .on("zoom", () => {
            g.attr("transform", d3.event.transform)
        });
    svg.call(zoom);

    let tree = d3.tree()
        .size([360, radius])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    function project(x, y) {
        var angle = (x - 90) / 180 * Math.PI, radius = y;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    function children_func(d) {
        children = [];
        if (d.hasOwnProperty('categories')) {
            for (let child of d['categories']) {
                children.push(child)
            }
        }

        if (d.hasOwnProperty('subjects')) {
            for (let child of d['subjects']) {
                children.push(child)
            }
        }

        return children;
    }

    /**
     * Zooms out so that the provided node is completely visible.
     * @param nodeElement Element you want to have zoomed out
     */
    function zoomOutToFitParentSize(nodeElement, zoom) {
        let elementBBox = nodeElement.node().getBBox();
        let parentClientRect = nodeElement.node().parentElement.getClientRects()['0'];
        let maxHeight = parentClientRect.height,
            maxWidth = parentClientRect.width,
            currentHeight = elementBBox.height,
            currentWidth = elementBBox.width;

        let midX = maxWidth/2;
        let midY = maxHeight/2;

        let scale = Math.min(maxWidth/currentWidth, maxHeight/currentHeight);
        let transform = d3.zoomIdentity.translate(midX, midY).scale(scale);

        svg.call(zoom.transform, transform);
    }

    function isSubject(d) {
        return d.data.hasOwnProperty('subject_type')
    }

    function isSubjectFiltered(d) {
        if (isSubject(d)) {
            let semesters = [];
            if (d.data.hasOwnProperty("semester")){
                semesters = [d.data.semester]
            } else {
                semesters = d.data['semesters'];
            }
            if (type_filter_settings.has(d.data.subject_type)) {
                for (let sem of semesters) {
                    if (type_filter_settings.has(sem)) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        }
        return true;
    }

    function getDataForAllCategories(data) {
        let categories = [];
        for (let datum of data) {
            if (!isSubject(datum)){
                categories.push(datum);
            }
        }
        return categories;
    }

    function getDataForFilteredSubjects(data) {
        let subjects = [];
        for (let datum of data) {
            if (isSubject(datum) && isSubjectFiltered(datum)){
                subjects.push(datum);
            }
        }
        return subjects;
    }

    // Devide a string into chunks that contain 3 words per chunk
    // e.g "i am a chunk" => ["i am  a", "chunk"]
    function splitTextIntoLinesWithThreeWords(text) {
        return text.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,2}\b/g)
    }

    function splitLongTextIntoMultipleLines(text) {
        let words = text.split(" ");
        let lines = [];
        let line = words[0];

        for (let i = 1; i< words.length; i++) {
            if (line.length + words[i].length <= maxTextLength) {
                line += " "+words[i];
            } else {
                lines.push(line);
                line = words[i];
            }
        }
        // Add last line
        lines.push(line);
        return lines;
    }

    function selectSubject(d) {
        d.isSelected = true;
        selectedSubjects.push(d);
    }

    function deselectSubject(d) {
        let index = selectedSubjects.indexOf(d);
        console.log(index);
        selectedSubjects.splice(index,1);
        d.isSelected = false;
    }

    function shouldBeLowlighted(d) {
        if (!d.data.hasOwnProperty("subject_type")){
            return false;
        }

        if (higlightType === "") {
            return false;
        } else if (higlightType === d.data.subject_type) {
            return (selectedSubjects.indexOf(d) < 0);
        } else {
            return true;
        }
    }

    // public objects
    return {
        init: (studyprogram, map_with_colors, settings_for_type_filter, onUpdate) => {
            type_filter_settings = settings_for_type_filter;
            colormap = map_with_colors;
            onUpdateFunction = onUpdate;
            let root = tree(d3.hierarchy(selected_studyprogram, children_func));
            RadialTree.draw(root);
            zoomOutToFitParentSize(g, zoom);
            return root;
        },
        loadSelectedSubjects: (root, subjects) => {
            selectedSubjects = [];
            for (let node of root.descendants()) {
                for (let subject of subjects) {
                    if (node.data.id === subject.id) {
                        selectSubject(node)
                    }
                }
            }
        },
        getSelection: () => selectedSubjects,
        removeSelectedSubjectNode: (node) => deselectSubject(node),
        setHighlightedType: (type) => { higlightType = type;},
        resetHighlightType: () => { higlightType = "";},
        draw: (root) => {
            let dataTextLengths = {};

            // create links
            let link = g.selectAll(".link")
                .data(root.descendants().slice(1).filter(isSubjectFiltered))
                .enter().append("path")
                .attr("class", "link")
                .attr("d", function(d) {
                    return "M" + project(d.x, d.y)
                        + "C" + project(d.x, (d.y + d.parent.y) / 2)
                        + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                        + " " + project(d.parent.x, d.parent.y);
                });

            /*
                Handling nodes for categories
             */

            // add node
            let node = g.selectAll(".node")
                .data(getDataForAllCategories(root.descendants().slice(1)))
                .enter()
                .append("g")
                .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

            // add text
            let textCategory = node
                .append("text")
                .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
                .attr("y", (d) => {
                    // divide between node and leaf. Since the name of nodes will be split into chunks,
                    // the y alignment has to be adjusted, so that the whole text-block is centered to the node
                    let lines = splitLongTextIntoMultipleLines(d.data.name);
                    let height = lines.length * 90;
                    let y = "-"+height/200 +"em";
                    return d.children? y: ".31em"})
                .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
                .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; });


            // create tspans
            // append a tspan to each text. The name of the subject will only be visible through a tspan,
            // because sometimes the name is too long and has to be divided into smaller chunks
            textCategory.selectAll("tspan.text")
                .data(d => {
                    let titles = d.children? splitLongTextIntoMultipleLines(d.data.name): [d.data.name];
                    let data = [];
                    for (let title of titles) {
                        data.push({title: title, id: d.data.id, subject: isSubject(d)? true: false})
                    }
                    return data;
                })
                .enter()
                .append("tspan")
                .attr("class","text")
                .text(d => d.title)
                .attr("x", 0)
                .attr("dx", 0)
                .attr("dy", (d) => {
                    return d.subject? ".0em" : ".90em";
                });

            /*
                 Handling subjects
             */

            // bind to data
            let subjectNodes = g.selectAll('.subject')
                .data(getDataForFilteredSubjects(root.descendants().slice(1)),d => d.data.id);

            // on exit
            subjectNodes
                .exit()
                .remove();

            // add subjects
            let subjectsEnter = subjectNodes
                .enter()
                .append("g")
                .attr("class", "node--leaf subject")
                .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

            // add a rect as background color
            let subjectTextBackgroundEnter = subjectsEnter
                .append('rect');

            // add text to the subject's node
            let subjectTextEnter = subjectsEnter
                .append("text");

            d3.selectAll(".subject text")
                .on("click", (d) => {
                    if (selectedSubjects.indexOf(d) >= 0) {
                        deselectSubject(d);
                    } else {
                        selectSubject(d);
                    }

                   RadialTree.draw(root);
                })
                .attr("class", function(d) {return (d.isSelected)? "selected": ""})
                .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
                .attr("y", (d) => ".31em")
                .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
                .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
                .attr("fill", (d) => {
                    if (shouldBeLowlighted(d)) {
                        return d3.rgb(200,200,200);
                    }
                    return d3.rgb(colormap[d.data.subject_type]).darker()
                })
                .text((d) => d.data.name)
                .each(function(d) {
                    dataTextLengths[d.data.id] = this.getComputedTextLength();
                })
                .exit().remove();

            //updating links when filtered
            g.selectAll(".link")
                .data(root.descendants().slice(1).filter(isSubjectFiltered))
                .attr("d", function(d) {
                    return "M" + project(d.x, d.y)
                        + "C" + project(d.x, (d.y + d.parent.y) / 2)
                        + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                        + " " + project(d.parent.x, d.parent.y);
                });

            // remove links
            g.selectAll(".link")
                .data(root.descendants().slice(1).filter(isSubjectFiltered))
                .exit()
                .remove();

            // remove functions
            g.selectAll(".node")
                .data(getDataForAllCategories(root.descendants().slice(1)))
                .exit()
                .remove();

            onUpdateFunction();
        }

    }
})();
