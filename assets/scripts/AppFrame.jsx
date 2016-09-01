import React from 'react'
import { Link } from 'react-router'

export default React.createClass({
    render() {
       return (
          <div className="app">
              <div className="row header">
                  <div className="section">
                      <nav>
                          <ul className="menu">
                              <li>
                                  <Link to={`/`}>Map</Link>
                              </li>
                              <li>
                                  <Link to={`/import`}>Import</Link>
                              </li>
                          </ul>
                      </nav>
                  </div>
              </div>
              <div className="row">
                  <div className="section">
                      { this.props.children }
                  </div>
              </div>
          </div>
       )
    }
})
