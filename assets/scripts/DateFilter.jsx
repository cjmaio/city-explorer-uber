import React from 'react'

export default React.createClass({
    handleChange(e) {
        this.props.handleChange(e.target.name, e.target.value);
    },
    render() {
       return (
           <form name="date-filter">
               <label htmlFor="fromDate">Date Start: </label>
               <input type="datetime-local" name="fromDate" value={this.props.fromDate} onChange={this.handleChange} />
               <br />
               <label htmlFor="toDate">Date End: </label>
               <input type="datetime-local" name="toDate" value={this.props.toDate} onChange={this.handleChange} />
           </form>
       )
    }
})
