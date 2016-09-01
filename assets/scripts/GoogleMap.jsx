import React from 'react'
import DateFilter from './DateFilter'
import PickupDropoffFilter from './PickupDropoffFilter'
import Spinner from './Spinner'

export default React.createClass({
    getDefaultProps() {
        return {
            initialZoom: 14,
            mapCenterLat: 40.7128,
            mapCenterLng: -74.0059
        }
    },
    getInitialState() {
        return {
            markers: [],
            largestPickups: 0,
            largestDropoffs: 0,
            totalPickups: 0,
            totalDropoffs: 0,
            overlay: null,
            type: '',
            map: null,
            mc: null,
            heatmap: null,
            reloadingMap: false,
            previousCenter: null,
            drawingManager: null,
            filter: {
                fromDate: '2014-04-04T00:00:00',
                toDate: '2014-04-05T00:00:00',
                showPickups: true,
                showDropoffs: false,
                showMarkers: true,
                showHeatmap: false,
                showFrequency: false
            }
        }
    },
    handleFilterChange(name, value) {
        var change = this.state.filter;
        change[name] = value;
        this.setState({ 'filter': change });
        console.log('handling change ' + name + ' ' + value);
    },
    clearMarkers() {
        let mc = this.state.mc;
        if (mc !== null) {
            mc.removeMarkers(this.state.markers);
        }
        this.setState({
            'markers': []
        });
    },
    clearHeatmap() {
        if (this.state.heatmap !== null) {
            this.state.heatmap.setMap(null);
            this.setState({
                'heatmap': null
            });
        }
    },
    clearDrawing() {
        this.state.overlay.setMap(null);
        this.setState({ 'overlay': null, 'type': '' });
        this.clearMarkers();
        this.changeMap();
    },
    updateData() {
        this.changeMap();
    },
    changeMap() {
        let map = this.state.map;

        if (this.state.reloadingMap == true) return;
        this.setState({reloadingMap: true});

        let vertices = [];

        // If we have an overlay, obtain the necessary vertices to send to the backend for filtering
        if (this.state.overlay !== null) {
            if (this.state.type == 'polygon') {
                let points = this.state.overlay.getPath();
                for (var i = 0; i < points.getLength(); i++) {
                    vertices.push([ points.getAt(i).lat(), points.getAt(i).lng() ]);
                }
            } else if (this.state.type == 'rectangle') {
                let bounds = this.state.overlay.getBounds();
                vertices.push([ bounds.getNorthEast().lat(), bounds.getNorthEast().lng() ]);
                vertices.push([ bounds.getSouthWest().lat(), bounds.getSouthWest().lng() ]);
            } else {
                alert('She doesn\'t even go here.');
            }
        }

        // If we don't have vertices, we must not have a shape... so let's go with the map viewport bounds
        if (vertices.length == 0) {
            vertices.push([ map.getBounds().getNorthEast().lat(), map.getBounds().getNorthEast().lng() ]);
            vertices.push([ map.getBounds().getSouthWest().lat(), map.getBounds().getSouthWest().lng() ]);
        }

        let xhr = new XMLHttpRequest();
        xhr.open('post', '/trips' , true);
        xhr.overrideMimeType('application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                let status = xhr.status;
                if (status == 200) {
                    let data = JSON.parse(xhr.responseText);

                    let markers = [];
                    let points = [];

                    // TODO: this is temporary
                    let largestPickups = 0;
                    let largestDropoffs = 0;
                    let totalPickups = 0;
                    let totalDropoffs = 0;
                    for (var value of data.results) {
                        if (value.type == 'pickup') {
                            totalPickups++;
                            if (value.count > largestPickups) {
                                largestPickups = value.count;
                            }
                        } else if (value.type == 'dropoff') {
                            totalDropoffs++;
                            if (value.count > largestDropoffs) {
                                largestDropoffs = value.count;
                            }
                        }
                    }

                    this.setState({ totalPickups: totalPickups, totalDropoffs: totalDropoffs, largestPickups: largestPickups, largestDropoffs: largestDropoffs });

                    if (totalDropoffs+totalPickups > 150000 && this.state.filter.showMarkers) {
                        alert('Whoa there! Your filter criterion has only narrowed the result set down to ' + (totalDropoffs + totalPickups) + ' data points, when we can only comfortably display 150,000 at once. Narrow down your selection, or disable markers and enable the heatmap to analyze datasets this large.');
                        this.setState({ reloadingMap: false });
                        return;
                    }

                    this.clearMarkers();
                    this.clearHeatmap();

                    for (var value of data.results) {
                        var pickup = value.point.replace('POINT(','').replace(')','').split(' ');
                        var color = (value.type == 'pickup') ? '#0066cc' : '#00cc66';
                        var size = 1;
                        if (this.state.filter.showFrequency == true) {
                            if (value.type == 'pickup') {
                                size = (5 * (value.count / largestPickups));
                            } else {
                                size = (5 * (value.count / largestDropoffs));
                            }
                        }
                        var latlng = new google.maps.LatLng(parseFloat(pickup[0]), parseFloat(pickup[1]));
                        if (this.state.filter.showMarkers) {
                            var marker = new google.maps.Marker({
                                position: latlng,
                                icon: {
                                    path: 'M0.5,5a4.5,4.5 0 1,0 9,0a4.5,4.5 0 1,0 -9,0',
                                    fillColor: color,
                                    fillOpacity: 1.0,
                                    strokeColor: 'black',
                                    strokeWeight: 0.5,
                                    scale: size
                                }
                            });
                            markers.push(marker);
                        }
                        points.push(latlng);
                    }

                    let mc = this.state.mc;
                    if (mc === null) {
                        var mc = new MarkerClusterer(map, markers, {
                            imagePath: 'https://cdn.rawgit.com/googlemaps/js-marker-clusterer/gh-pages/images/m',
                            maxZoom: 16
                        });
                    } else {
                        mc.addMarkers(markers);
                    }

                    if (this.state.filter.showHeatmap) {
                        let heatmap = new google.maps.visualization.HeatmapLayer({
                            data: points,
                            map: map
                        });

                        this.setState({
                            heatmap: heatmap
                        });
                    }

                    this.setState({ 'markers': markers, 'mc': mc, reloadingMap: false });
                }

            }
        }.bind(this);
        var data = new FormData();
        data.append('date_start', this.state.filter.fromDate);
        data.append('date_end', this.state.filter.toDate);
        data.append('show_pickups', this.state.filter.showPickups);
        data.append('show_dropoffs', this.state.filter.showDropoffs);
        data.append('vertices', vertices);

        xhr.send(data);
    },
    componentDidMount(rootNode) {

        // Setup map
        let map = new google.maps.Map(document.getElementById('google-map'), {
            center: new google.maps.LatLng(this.props.mapCenterLat, this.props.mapCenterLng),
            zoom: this.props.initialZoom,
            minZoom: 12,
            maxZoom: 18
        });
        this.setState({map: map});

        // Setup drawing manager
        let drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['polygon', 'rectangle']
            },
            map: map
        });
        this.setState({drawingManager: drawingManager});

        // Add drawing listener
        google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
            if (this.state.overlay !== null) {
                this.state.overlay.setMap(null);
                this.state.type = '';
            }
            this.setState({ 'overlay': event.overlay, 'type': event.type });
            this.changeMap();
        });

        // Add re-centering and zoom listeners. We only will pull new data if the shape doesn't exist, otherwise
        // it would be a waste of a HTTP request and a waste of CPU cycles to redraw the points.
        map.addListener('zoom_changed', () => {
            if (this.state.overlay === null) {
                this.changeMap();
            }
        });
        map.addListener('dragend',  () => {
            if (this.state.overlay === null) {
                this.changeMap();
            }
        });
    },
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-1-3">
                        <h3>Display Filters</h3>
                        <PickupDropoffFilter showPickups={this.state.filter.showPickups} showDropoffs={this.state.filter.showDropoffs} showFrequency={this.state.filter.showFrequency} showHeatmap={this.state.filter.showHeatmap} showMarkers={this.state.filter.showMarkers} handleChange={this.handleFilterChange} />
                    </div>
                    <div className="col-1-3">
                        <h3>Date Filter</h3>
                        <DateFilter fromDate={this.state.filter.fromDate} toDate={this.state.filter.toDate} handleChange={this.handleFilterChange} />
                    </div>
                    <div className="col-1-3">
                        <h3>Statistics</h3>
                        <dl>
                            <dt>Unique Pickups</dt>
                            <dd>{ this.state.totalPickups }</dd>
                            <dt>Largest total pickups per unique location</dt>
                            <dd>{ this.state.largestPickups }</dd>
                            <dt>Unique Dropoffs</dt>
                            <dd>{ this.state.totalDropoffs }</dd>
                            <dt>Largest total pickups per unique location</dt>
                            <dd>{ this.state.largestDropoffs }</dd>
                        </dl>
                    </div>
                </div>
                <div className="clear"></div>
                <br />
                <button className="btn small solid blue" onClick={this.updateData} disabled={this.state.reloadingMap}>{ this.state.reloadingMap ? <Spinner /> : <i className="icon-vital" /> } { this.state.reloadingMap ? 'Please wait...' : 'Update' }</button>
                &nbsp;&nbsp;<button className="btn small solid red" onClick={this.clearDrawing} disabled={this.state.overlay == null}><i className="icon-close-empty" /> Clear Drawing</button>
                <br />
                <br />
                <div id='google-map'></div>
            </div>
        )
    }
})
