# Project: Course Insights

This project helps students decide which subjects they can take for a semester by providing visual analysis of the study program.

**Main Idea**

1. Being able to find the subjects offered by various departments 
2. Having interactive interface of Select and Compare Pages 
3. Clear idea of subject based on ratings 
4. Clear overview of whether or not to choose a subject 

A live version can be found at https://florich.github.io/uni-due-visual-study-planer/.

# Project Architecture and Components

![image](https://user-images.githubusercontent.com/41328290/63997396-a2012a00-cafe-11e9-919a-cd7d5f7894b3.png)

The blue rectangles represents components which consists of a html, css and javascript file and access the global script, css, and data folder for using the datasets and frameworks. The blue big arrow indicates the navigation possibilities and is only in one direction, because the app guides the user through the process. But if something unpredictable like a crash of the browser, accidentally closing it or going back through the browser implemented navigation buttons happen, the previous state of the component will be retrieved from the local storage, because every component exchanges their data over the local storage with every other component. If data changes in a component, it will be automatically saved to the local storage. In the page for selecting component we created a reusable class for representing the radial-tree and one for the bar chart. The “page for comparing”-component has two different classes for heat maps, one for the ratings and one for showing which of the selected courses overlaps in time with each other. Additionally it provides a modified stacked bar chart for displaying the semester week hours (sws) for all selected courses.

# Getting Started

Below are instructions on how to navigate and use this project.

# Prerequisites

* Modern browser that supports most of ES6, like Chrome (newer than v65).

# Steps on running the project + Informations

**Steps**
* Download and extract this repository.
* Navigate to src/start-page and open start-page.html with a browser. You will see the first page.

**First page**: Study program selection
1. Click on the ***Startpage.html*** file to open up the project
2. Select your study program from the list provided on the start page or write it down in the search bar
3. After selection you'll be provided with some additional information about number of lectures, seminars, internships and other related information
4. Now click on next to get to the next page 

![image](https://user-images.githubusercontent.com/41328290/63997432-c2c97f80-cafe-11e9-9d66-ca7aecc1c0ac.png)

**Second page**: Course Selection
1. Select any of the boxes that matches your interest to have an overview of the subjects regardingly
2. You can also select the subjects right from the radial tree itself and view the infromation on the sidebar
3. After selecting your subject click next to get to the next page 

![image](https://user-images.githubusercontent.com/41328290/63997452-d5dc4f80-cafe-11e9-8a51-ba7ae25da9bc.png)

**Third page**: Course comparison and an overview of timeoverlap (if there's any) alongside other related information
1. You can see all the possible information for the subject that you've selected on the previous page (Course Selection)
2. You can remove a subject that you don't want to have the information about and can do the opposite as well

![image](https://user-images.githubusercontent.com/41328290/63997480-eb517980-cafe-11e9-8eb8-e3777e34d7be.png)

# Tools/technologies and libraries used

* HTML
* Javascript
* D3.js
* Bootstrap
* jQuery (Only for scrolling in the start-page.html)

# Supervised by

* Professor dr. Mohamed Amine Chatti
* Dr. Arham Muslim
* Book by Tamara Munzner (Visualization Analysis and Design)

# Versioning

* D3.js version 5.11.0 is used for this project.

# Linked projects
In order to provide a visualization for the [course catalog](https://campus.uni-due.de/lsf/rds?state=wtree&search=1&category=veranstaltung.browse&navigationPosition=lectures%2Clectureindex&breadcrumb=lectureindex&topitem=lectures&subitem=lectureindex) we had to get data of the courses and combine these course data with ratings found on [meinprof.de](https://www.meinprof.de). Therefor, we created two other projects that extracted and processed data from the course catalog (see https://github.com/FloRich/uni-due-course-catalog-scraper) and from meinprof.de (see https://github.com/FloRich/course-ratings).

# Creators 

* Florian Richtscheid
* Ghulam Dawood Nasimi
* Ritesh Damera
* Amin Shahin










