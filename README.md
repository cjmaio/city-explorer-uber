# City Explorer (Assignment for Uber ATC)
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
I've split these instructions into *Local* setup, or setup to deploy to *Heroku*. This is my first time using Heroku, so I apologize in advance for any rookie mistakes. Usually, I set my servers up myself :)

## Local
You will want to have the following prerequisites installed:
- Python 3.x
- NodeJS / NPM
- virtualenv package (from pip)
- PostgreSQL (via [Postgres.app](http://postgresapp.com/))
- Postico ([Download Here](https://eggerapps.at/postico/))

First, let's get our PostgreSQL database setup. Assuming you've installed Postgres.app and Postico, start Postgres.app and then open Postico to connect to the database. You'll want to create a database called `city-explorer`. Once created, access the database, open up an SQL window, and type in the following query:

```
CREATE EXTENSION postgis;
```

This will enable the PostGIS extension, which we use to store geometric data. Awesome - your database is now setup.

Next, you want to update `webpack.config.js` for local development, which you can do via `cp webpack.config.development.js webpack.config.js`.

Next, run `npm install` to install packages for React, etc.

To install Python requirements, we are going to create a virtualenv with the command `virtualenv venv` and then enter that environment with `source venv/bin/activate`. To install requirements, we run `pip install -r requirements.txt`.

Let's populate the database initially with the tables we need. To do that, open a terminal window and run the following:

```
$ python
Python 3.5.2 (default, Jul 28 2016, 21:28:00) 
[GCC 4.2.1 Compatible Apple LLVM 7.3.0 (clang-703.0.31)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> 
$ from app import db
$ db.create_all()
$ exit()
```

After you run those commands, you shouldn't see any errors. The tables have been created, which you can verify in Postico.

You'll be running two processes in development. The first is `npm run start` which will run the webpack development server, allowing for hot reloading of React components as you change them.

In another window, you'll run `python app.py` to start the Python code. Now, you should be able toa ccess the application at http://127.0.0.1:5000

## Deploy to Heroku
My deployment to Heroku is automatic via GitHub on commit to master, so I don't have to setup any pre-requisites.

You'll want to go into Heroku and setup a PostgreSQL database. Once setup, connect to it with Postico, you'll want to create a database called `city-explorer`. Once created, access the database, open up an SQL window, and type in the following query:

```
CREATE EXTENSION postgis;
```

This will enable the PostGIS extension, which we use to store geometric data. Awesome - your database is now setup.

Currently, before committing code, you need to copy the contents of `webpack.config.production.js` to `webpack.config.js`, and run `npm install && npm run build` to build all appropriate production files.

Commit the code to your Git repository, and it should deploy successfully to Heroku.

# Approach
I am very familiar with PHP and AngularJS, as I use it every day in my current position. However, since the ATC utilizes *Python (Flask)* and *React*, I decided to write it in those languages. 

I was previously familiar with Python and know JavaScript very well - but I've never used the Flask or React frameworks previous to this project. This project served as my crash course in both of those frameworks.

For the database end, I decided to use PostgreSQL, as it has very good support for geometric functions and queries with the [PostGIS library](http://postgis.net/install/).

# Design Decisions

## Mapping
Since I was previously familiar with using the Google Maps API, I utilized it to display the data points on the map. It comes with built-in support for heatmaps and other features. There is a tradeoff - it does not handle hundreds of thousands of markers with ease, and is a dependency on an external service. This is a tradeoff I was comfortable with given the timeline for this assignment.

## Importing Data
I wrote a quick upload page in the application to import the CSV data into the database,as it was helpful in learning the React/Flask frameworks/libraries.

## UI
The UI is very simple - two pages, Map and Export. A simple CSS library called [Vital](https://vitalcss.com/) was used to provide basic styling to the application. 

## Storing Data
The database initially stored the data as separate DOUBLE fields, however, I found quickly that sorting through that data was not easy. Enter the [PostGIS](http://postgis.net/install/) library. This allowed me to store the pickup / dropoff points as the POINT datatype, which made it incredibly easy to query based on whether the points were within a rectangle or polygon shape. I did not want those calculations done on the front end, as the application would be transferring more data than necessary from the server (which has processing power to do those sort of filters) to the client (which, who knows what the capabilities are). As much work as I can offload on the database (which is designed for sorting, filtering, etc) the better.

# Future Wishlist / Exploration
This project was a good way to initially learn Flask and React. If I had more time, there are several things I would have liked to accomplish.

## Use of d3.js library
Although Google Maps worked, it does have limitations in how much data can be displayed, and the overhead may be more than is necessary for an application like this.

## Connect pickup and dropoff points
I would map out routes in a way that, if you hover over a pickup location, it would draw routes to the various dropoff locations that came from the pickup location.

## Research capabilities of PostGIS
While use of this library for PostgreSQL was able to speed up my queries significantly, I think the library contains even more features that would assist in an application of this type.

## Utilized Flux/Redux
This is my first foray into React, and I was able to accomplish the application without the use of Flux/Redux. However, I can see the value in having dedicated application state management.

## Queueing data import
I would have built a data import utilizing [beanstalkd](http://kr.github.io/beanstalkd/) or [RabbitMQ](https://www.rabbitmq.com/) to do the data import, so the front end could have some sort of notice that data is importing, and so the page didn't need to stay up.
