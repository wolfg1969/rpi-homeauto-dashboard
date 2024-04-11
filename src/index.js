import 'spectre.css';
import 'font-awesome/css/font-awesome.css';
import 'qweather-icons/font/qweather-icons.css';
import './assets/weather-icons/css/weather-icons.css';
import './assets/weather-icons/css/weather-icons-wind.css';
import './index.css';

import { applyMiddleware, createStore } from 'redux';

import App from './App';
import { CLOCK_TICK } from './actions/clock'
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { createLogger } from 'redux-logger';
import dashboardApp from './reducers'
import registerServiceWorker from './registerServiceWorker';
import thunk from 'redux-thunk';

const logger = createLogger({
  predicate: (getState, action) => action.type !== CLOCK_TICK
});

const store = createStore(dashboardApp, applyMiddleware(thunk, logger))

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, 
  document.getElementById('root')
);
registerServiceWorker();
