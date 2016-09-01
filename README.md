# city-explorer-uber
A web application to "explore a particular city, or an arbitrary region of a city, with regard to trip volume, common pickups or dropoffs, common routes, high or low speeds, etc."

# Client

Anyone at the ATC who wishes to explore a particular city, or an arbitrary region of a city, with regard to trip volume, common pickups or dropoffs, common routes, high or low speeds, or other factors you can think of. The client should be able to select an arbitrary region within a given city and see one or more analyses. Assume that your clients are not coders, so design and build with that in mind.

# Languages

Python, JavaScript

# Frameworks

Flask, Node, React.js, Redux/Flux, WebGL, d3.js

# Goals
- Clean, modular, well­documented code
- Good back end and front end skills
- The app should be quick and responsive
- The app should have an intuitive UI
- The app should be easily extensible to support new views and features
- Include a discussion of design decisions and tradeoffs
- Include next steps and what you would do if given more time and resources.


# How to Run
Details coming soon... for now...
```
CREATE EXTENSION postgis;
```


# Approach
I am very familiar with PHP and AngularJS, as I use it every day currently. However, as the ATC utilizes Python (Flask) and React, I decided to write it in those languages. I was previously familiar with Python, and know JavaScript very well, but I've never used the Flask or React frameworks previous to this project. I decided to use PostgreSQL as the database backend, as it has very good support for geometric functions and queries with the PostGIS library.

# Design Decisions
Since I was previously familiar with using the Google Maps API, I utilized it to display the data points on the map. It comes with built-in support for heatmaps and other features. There is a tradeoff - it does not handle hundreds of thousands of markers with ease. However, with the limited timeline of this project, it was a tradeoff I was willing to go with. The application interface is very simple, but I did write a quick upload to import the data into the database, as it was helpful in learning the React/Flask frameworks/libraries. A simple CSS library (Vital) was used to provide basic styling to the application. 

The database initially stored the data as separate DOUBLE fields, however, I found quickly that sorting through that data was not easy. Enter the PostGIS library. This allowed me to store the pickup / dropoff points as the POINT datatype, which made it incredibly easy to query based on whether the points were within a rectangle or polygon shape. I went this direction because determining whether or not the data was within the shape is something I do not want JavaScript to do on the client end -- we would be returning far too much data, and putting too much strain on the client machine, which may or may not have many resources at its disposal. As much work as I can offload on the database (which is designed for sorting, filtering, etc) the better.

# Future Wishlist
If I had more time, I would have:
- Explored the d3.js library; although Google Maps worked, it does have some limitations in how much data can be displayed without the browser locking up.
- Mapped out routes in a way that, if you hover over a pcikup location, it would draw routes to the various dropoff locations that came from that pickup.
- Further researched the capabilities of PostGIS. While it was able to speed up my queries significantly, I think the library contains even more features that would assist in an application of this type.
- Utilized Flux/Redux more; as this is my first foray into React, I was able to accomplish the application without the use of Flux/Redux. However, I can see the value in having dedicated application state management.

