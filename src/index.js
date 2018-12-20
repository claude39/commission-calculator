import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'react-date-range-with-events/dist/styles.css'; // main style file
import 'react-date-range-with-events/dist/theme/default.css'; // theme css file
import 'react-big-calendar/lib/css/react-big-calendar.css'
ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
