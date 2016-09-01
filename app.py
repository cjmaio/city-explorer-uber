from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_webpack import Webpack
from geoalchemy2 import Geometry
from sqlalchemy import func, distinct
from os import path
import csv
from flask.ext.heroku import Heroku

# Initialize the application
app = Flask(__name__)
app.config.update({
    'SQLALCHEMY_DATABASE_URI': 'postgresql://localhost/city-explorer',
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'DEBUG': True,
    'WEBPACK_MANIFEST_PATH': './static/manifest.json',
    'UPLOAD_FOLDER': '/tmp/'
})

heroku = Heroku(app)

# Initialize our database connection
db = SQLAlchemy(app)

# Initialize our application with Webpack
webpack = Webpack()
webpack.init_app(app)


# Deserialize datetime object into string form for JSON processing.
# Thank you, to http://stackoverflow.com/questions/7102754/jsonify-a-sqlalchemy-result-set-in-flask
def dump_datetime(value):
    if value is None:
        return None
    return [value.strftime('%Y-%m-%d'), value.strftime('%H:%M:%S')]


# Add onto a SQLAlchemy query, finding pickup or dropoff points inside of a polygon (rectangle or polygon)
def append_query_trips(trips, is_rectangle, vertices):
    if is_rectangle:
        return trips \
            .filter(func.ST_Contains(
            func.ST_MakeBox2D(func.ST_Point(vertices[0], vertices[1]), func.ST_POINT(vertices[2], vertices[3])),
            Trip.dropoff)) \
            .filter(func.ST_Contains(
            func.ST_MakeBox2D(func.ST_Point(vertices[0], vertices[1]), func.ST_POINT(vertices[2], vertices[3])),
            Trip.pickup));
    else:
        polygon = 'LINESTRING('
        for x in range(len(vertices)):
            if x % 2 == 0:
                if x != 0:
                    polygon += ', '
                polygon += vertices[x] + ' '
            else:
                polygon += vertices[x]

        polygon += ', ' + vertices[0] + ' ' + vertices[1] + ')'

        return trips.filter(func.ST_Contains(func.ST_MakePolygon(func.ST_GeomFromText(polygon)), Trip.pickup)) \
            .filter(func.ST_Contains(func.ST_MakePolygon(func.ST_GeomFromText(polygon)), Trip.dropoff));


# Create our Trip model, which contains date, pickup, dropoff, and base data
class Trip(db.Model):
    __tablename__ = "trips"
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    pickup = db.Column(Geometry('POINT'))
    dropoff = db.Column(Geometry('POINT'))
    base = db.Column(db.String(10))

    def __init__(self, date, pickup_lat, pickup_lon, dropoff_lat, dropoff_lon, base):
        self.date = date
        self.pickup = 'POINT(' + pickup_lat + ' ' + pickup_lon + ')'
        self.dropoff = 'POINT(' + dropoff_lat + ' ' + dropoff_lon + ')'
        self.base = base

    def __repr__(self):
        return '<Date %r>' % self.date


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/importfile', methods=['POST'])
def import_file():
    file = request.files['file']
    if file:
        file.save(path.join(app.config['UPLOAD_FOLDER'], file.filename))
        # Do something
        with open(path.join(app.config['UPLOAD_FOLDER'], file.filename)) as csvfile:
            tripreader = csv.reader(csvfile, delimiter=',', quotechar='"')
            header = next(tripreader)
            for row in tripreader:
                if row[0] != 'Date/Time':
                    print('importing...')
                    next_trip = next(tripreader)
                    trip = Trip(row[0], row[1], row[2], next_trip[1], next_trip[2], row[3])
                    db.session.add(trip)
                    db.session.commit()

        return 'derp'
    else:
        return 'bad'


@app.route('/trips', methods=['POST'])
def get_trips():
    vertices = request.form.get('vertices')
    start_date = request.form.get('date_start')
    end_date = request.form.get('date_end')
    show_pickups = request.form.get('show_pickups')
    show_dropoffs = request.form.get('show_dropoffs')
    vertices = vertices.split(',')

    pickup_points = []
    dropoff_points = []

    if show_pickups == 'true':
        trips = db.session.query(Trip).with_entities(func.count(Trip.pickup), func.ST_AsText(Trip.pickup));
        trips = append_query_trips(trips, (len(vertices) == 4), vertices);
        pickup_points = trips.filter(Trip.date.between(start_date, end_date)).group_by(Trip.pickup).all();

    if show_dropoffs == 'true':
        trips = db.session.query(Trip).with_entities(func.count(Trip.dropoff), func.ST_AsText(Trip.dropoff));
        trips = append_query_trips(trips, (len(vertices) == 4), vertices);
        dropoff_points = trips.filter(Trip.date.between(start_date, end_date)).group_by(Trip.dropoff).all();

    result = []
    for i in pickup_points:
        result.append({
            'point': i[1],
            'count': i[0],
            'type': 'pickup'
        })

    for i in dropoff_points:
        result.append({
            'point': i[1],
            'count': i[0],
            'type': 'dropoff'
        })

    return jsonify(results=result)

if __name__ == '__main__':
    app.debug = True
    app.run()
