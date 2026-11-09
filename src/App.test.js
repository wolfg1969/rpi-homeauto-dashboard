import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App';
import dashboardApp from './reducers';

// App dispatches thunks that call the Home Assistant API on mount.
// Swallow them so the smoke test stays offline and deterministic.
const ignoreThunks = () => next => action => (
  typeof action === 'function' ? undefined : next(action)
);

it('renders without crashing', () => {
  const store = createStore(dashboardApp, applyMiddleware(ignoreThunks));
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div
  );
});
