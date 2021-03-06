let STUDYPROGRAM_RETRIEVAL_KEY = "studyprogram";
let SUBJECTS_REMOVED_KEY = "subjects_removed";
let SUBJECTS_RETRIEVAL_KEY = "subjects";

/**
 * Retrieves subjects that were selected from local storage
 * @returns [Subject]
 */
function loadSelectedSubjects() {
    console.log("load selected_subjects");
    let selection = JSON.parse(localStorage.getItem(SUBJECTS_RETRIEVAL_KEY));
    if (selection === null) {
        selection = []
    }
    console.log(selection);
    return selection;
}

/**
 * Saves a list of subjects to local storage
 * @param listOfNodes
 */
function setSelectedSubjectsOfNodes(listOfNodes) {
    let subjects = [];
    for (let node of listOfNodes) {
        subjects.push(node.data)
    }
    console.log("set from nodes")
    console.log(subjects)
    localStorage.removeItem(SUBJECTS_RETRIEVAL_KEY);
    localStorage.setItem(SUBJECTS_RETRIEVAL_KEY, JSON.stringify(subjects));
}

/**
 * Saves a list of subjects to local storage
 * @param listOfNodes
 */
function setSelectedSubjects(subjects) {
    console.log("set selected_subjects");
    console.log(subject);
    localStorage.removeItem(SUBJECTS_RETRIEVAL_KEY);
    localStorage.setItem(SUBJECTS_RETRIEVAL_KEY, JSON.stringify(subjects));
}


/**
 * Clears the local storage from subjects
 */
function clearSelectedSubjects() {
    localStorage.setItem(SUBJECTS_RETRIEVAL_KEY,"[]")
}

/**
 * Retrieves selected Studyprogram
 * @returns {Studyprogram}
 */
function loadSelectedStudyprogram() {
    return JSON.parse(localStorage.getItem(STUDYPROGRAM_RETRIEVAL_KEY))
}

/**
 * Saves studyprogram to local storage
 * @param studyprogram
 */
function setSelectedStudyprogram(studyprogram) {
    localStorage.setItem(STUDYPROGRAM_RETRIEVAL_KEY, JSON.stringify(studyprogram));
}

/**
 * Clears the local storage from studyprogram
 */
function clearSelectedStudyprogram() {
    localStorage.setItem(STUDYPROGRAM_RETRIEVAL_KEY,"")
}

/**
 * Retrieves subjects that were selected from local storage
 * @returns [Subject]
 */
function loadRemovedSubjects() {
    let selection = JSON.parse(localStorage.getItem(SUBJECTS_REMOVED_KEY));
    if (selection === null) {
        selection = []
    }
    return selection;
}

/**
 * Clears the local storage from removedSubjects
 */
function clearRemovedSubjects() {
    localStorage.setItem(SUBJECTS_REMOVED_KEY, "[]");
}


/**
 * Saves a list of subjects to local storage
 * @param listOfSubjects
 */
function setRemovedSubjects(subjects) {
    localStorage.removeItem(SUBJECTS_REMOVED_KEY);
    localStorage.setItem(SUBJECTS_REMOVED_KEY, JSON.stringify(subjects));
}

function clearAll() {
    clearSelectedSubjects();
    clearSelectedStudyprogram();
    clearRemovedSubjects();
}
