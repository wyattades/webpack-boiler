import React from 'react';
import { render } from 'react-dom';
import * as Offline from 'offline-plugin/runtime';

import './style.scss';
import App from './App';
import TestWorker from './test.worker.js';


// Enable offline plugin: uses a service worker to cache resources
Offline.install();

require.context('./static', true);

const testWorker = new TestWorker();

render(<App/>, document.getElementById('root'));
