import { Router, Route, hashHistory } from 'react-router'
import React, {PropTypes, Component} from 'react'
import {render} from 'react-dom'
import AppFrame from './AppFrame'
import Import from './Import'
import Map from './Map'

render((
    <Router history={hashHistory}>
        <Route component={AppFrame}>
            <Route path="/" component={Map} />
            <Route path="import" component={Import} />
        </Route>
    </Router>
    ), document.getElementById('app'))
