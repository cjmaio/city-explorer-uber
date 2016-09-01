import React from 'react'

export default React.createClass({
    getInitialState: function() {
        return {
            showPickups: (!!this.props.showPickups) || true,
            showDropoffs: (!!this.props.showDropoffs) || false,
            showMarkers: (!!this.props.showMarkers) || true,
            showHeatmap: (!!this.props.showHeatmap) || false,
            showFrequency: (!!this.props.showFrequency) || false,
        };
    },
    handleChange(e) {
        let stateChange = [];
        stateChange[e.target.name] = !this.state[e.target.name];
        this.setState(stateChange);
        this.props.handleChange(e.target.name, stateChange[e.target.name]);
    },
    render() {
       return (
           <form name="pickup-dropoff-filter">
               <label>
                   <input name="showPickups" type="checkbox" defaultChecked={this.props.showPickups} onChange={this.handleChange} />
                   Show Pickups
               </label>
               <br />
               <label>
                    <input name="showDropoffs" type="checkbox" defaultChecked={this.props.showDropoffs} onChange={this.handleChange} />
                    Show Dropoffs
               </label>
               <br />
               <label>
                    <input name="showMarkers" type="checkbox" defaultChecked={this.props.showMarkers} onChange={this.handleChange} />
                    Show Markers
               </label>
               <br />
               <label>
                    <input name="showFrequency" type="checkbox" defaultChecked={this.props.showFrequency} onChange={this.handleChange} />
                    Show Frequency
               </label>
               <br />
               <label>
                    <input name="showHeatmap" type="checkbox" defaultChecked={this.props.showHeatmap} onChange={this.handleChange} />
                    Show Heatmap
               </label>
           </form>
       )
    }
})
