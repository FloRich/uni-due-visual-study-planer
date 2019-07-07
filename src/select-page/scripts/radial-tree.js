class RadialTree {

    constructor(elementId, updateFn) {
        this.elementId = '#'+elementId;
        this.colormap = {};
        this.type_filter_settings = {};
        this.selectedSubjects = [];
        this.onUpdateFunction = updateFn;
        this.maxTextLength = 15;
    }

    init(studyprogram, map_with_colors, settings_for_type_filter) {
        this.type_filter_settings = settings_for_type_filter;
        this.colormap = map_with_colors;
        this.selectedStudyprogram = studyprogram;
        this.treeSvg = d3.select(this.elementId);
        this.width = +this.treeSvg.attr("width");
        this.height = +this.treeSvg.attr("height");
        this.radius = 800;
        this.treeViz = this.treeSvg.append("g");
        this.highlightType = "";

        // apply pen and zooming
        this.zoom = d3.zoom()
            .on("zoom", () => {
                this.treeViz.attr("transform", d3.event.transform)
            });
        this.treeSvg.call(this.zoom);

        let tree = d3.tree()
            .size([360, this.radius])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

        this.root = tree(d3.hierarchy(this.selectedStudyprogram, this.children_func));

        this.draw();
        this.zoomOutToFitParentSize(this.treeViz, this.zoom);
    }

    project(x, y) {
        const angle = (x - 90) / 180 * Math.PI;
        const radius = y;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    children_func(d) {
        let children = [];
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
    zoomOutToFitParentSize(nodeElement, zoom) {
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

        this.treeSvg.call(zoom.transform, transform);
    }

    static isSubject(d) {
        return d.data.hasOwnProperty('subject_type')
    }

    isSubjectFiltered(d) {
        if (RadialTree.isSubject(d)) {
            let semesters = [];
            if (d.data.hasOwnProperty("semester")){
                semesters = [d.data.semester]
            } else {
                semesters = d.data['semesters'];
            }
            if (this.type_filter_settings.has(d.data.subject_type)) {
                for (let sem of semesters) {
                    if (this.type_filter_settings.has(sem)) {
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

    getDataForAllCategories(data) {
        let categories = [];
        for (let datum of data) {
            if (!RadialTree.isSubject(datum)){
                categories.push(datum);
            }
        }
        return categories;
    }

    getDataForFilteredSubjects(data) {
        let subjects = [];
        for (let datum of data) {
            if (RadialTree.isSubject(datum) && this.isSubjectFiltered(datum)){
                subjects.push(datum);
            }
        }
        return subjects;
    }

    // Devide a string into chunks that contain 3 words per chunk
    // e.g "i am a chunk" => ["i am  a", "chunk"]
    splitTextIntoLinesWithThreeWords(text) {
        return text.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,2}\b/g)
    }

    splitLongTextIntoMultipleLines(text) {
        let words = text.split(" ");
        let lines = [];
        let line = words[0];

        for (let i = 1; i< words.length; i++) {
            if (line.length + words[i].length <= this.maxTextLength) {
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

    selectSubject(d) {
        d.isSelected = true;
        this.selectedSubjects.push(d);
    }

    deselectSubject(d) {
        let index = this.selectedSubjects.indexOf(d);
        this.selectedSubjects.splice(index,1);
        d.isSelected = false;
    }

    shouldBeLowlighted(d) {
        if (!d.data.hasOwnProperty("subject_type")){
            return false;
        }

        if (this.highlightType === "") {
            return false;
        } else if (this.highlightType === d.data.subject_type) {
            return (this.selectedSubjects.indexOf(d) < 0);
        } else {
            return true;
        }
    }

    loadSelectedSubjects(subjects) {
            this.selectedSubjects = [];
            console.log(subjects);
            console.log(this.root.descendants().splice(1));
            for (let subject of subjects) {
                for (let node of this.root.descendants().splice(1)) {
                    if ( node.data.hasOwnProperty("subject_type") && node.data.id === subject.id && node.data.name === subject.name) {
                        console.log(node)
                        console.log(subject);
                        this.selectSubject(node)
                    }
                }
            }
    }
    getSelection() {
        return this.selectedSubjects;
    }

    removeSelectedSubjectNode(node)  {
        this.deselectSubject(node)
    }

    setHighlightedType(type)  { this.highlightType = type;}

    resetHighlightType() { this.highlightType = "";}

    draw() {
            let dataTextLengths = {};

            // create links
            let link = this.treeViz.selectAll(".link")
                .data(() => this.root.descendants().slice(1).filter((d) => this.isSubjectFiltered(d)))
                .enter().append("path")
                .attr("class", "link")
                .attr("d", (d) => {
                    return "M" + this.project(d.x, d.y)
                        + "C" + this.project(d.x, (d.y + d.parent.y) / 2)
                        + " " + this.project(d.parent.x, (d.y + d.parent.y) / 2)
                        + " " + this.project(d.parent.x, d.parent.y);
                });

            /*
                Handling nodes for categories
             */

            // add node
            let node = this.treeViz.selectAll(".node")
                .data(this.getDataForAllCategories(this.root.descendants().slice(1)))
                .enter()
                .append("g")
                .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                .attr("transform", (d) => { return "translate(" + this.project(d.x, d.y) + ")"; });

            // add text
            let textCategory = node
                .append("text")
                .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
                .attr("y", (d) => {
                    // divide between node and leaf. Since the name of nodes will be split into chunks,
                    // the y alignment has to be adjusted, so that the whole text-block is centered to the node
                    let lines = this.splitLongTextIntoMultipleLines(d.data.name);
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
                    let titles = d.children? this.splitLongTextIntoMultipleLines(d.data.name): [d.data.name];
                    let data = [];
                    for (let title of titles) {
                        data.push({title: title, id: d.data.id, subject: !!RadialTree.isSubject(d)})
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
            let subjectNodes = this.treeViz.selectAll('.subject')
                .data(() => this.getDataForFilteredSubjects(this.root.descendants().slice(1)),d => d.data.id);

            // on exit
            subjectNodes
                .exit()
                .remove();

            // add subjects
            let subjectsEnter = subjectNodes
                .enter()
                .append("g")
                .attr("class", "node--leaf subject")
                .attr("transform", (d) => { return "translate(" + this.project(d.x, d.y) + ")"; });

            // add a rect as background color
            let subjectTextBackgroundEnter = subjectsEnter
                .append('rect');

            // add text to the subject's node
            let subjectTextEnter = subjectsEnter
                .append("text");

            d3.selectAll(".subject text")
                .on("click", (d) => {
                    if (this.selectedSubjects.indexOf(d) >= 0) {
                        this.deselectSubject(d);
                    } else {
                        this.selectSubject(d);
                    }

                   this.draw();
                })
                .attr("class", function(d) {
                    let attrib = (d.isSelected)? "selected": "";
                    if(d.data.hasOwnProperty("semester")) {
                        return attrib + ((d.data.semester === "WiSe 2018/19")? " semester-ws": " semester-ss");
                    } else {
                        return attrib;
                    }
                })
                .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
                .attr("y", (d) => ".31em")
                .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
                .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
                .attr("fill", (d) => {
                    if (this.shouldBeLowlighted(d)) {
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
            this.treeViz.selectAll(".link")
                .data(() => this.root.descendants().slice(1).filter((d) => this.isSubjectFiltered(d)))
                .attr("d", (d) => {
                    return "M" + this.project(d.x, d.y)
                        + "C" + this.project(d.x, (d.y + d.parent.y) / 2)
                        + " " + this.project(d.parent.x, (d.y + d.parent.y) / 2)
                        + " " + this.project(d.parent.x, d.parent.y);
                });

            // remove links
            this.treeViz.selectAll(".link")
                .data(() => this.root.descendants().slice(1).filter((d) => this.isSubjectFiltered(d)))
                .exit()
                .remove();

            // remove functions
            this.treeViz.selectAll(".node")
                .data(this.getDataForAllCategories(this.root.descendants().slice(1)))
                .exit()
                .remove();

            this.onUpdateFunction();
        }

};
