import React from 'react';
import { render } from 'react-dom';
import * as Offline from 'offline-plugin/runtime';

// Imported css or sass files are extracted to the file: `index.[hash].css`
// because this is the `index` webpack entry point
import './style.scss';
import App from './App';
import TestWorker from './test.worker.js';


// Enable offline plugin: uses a service worker to cache resources
if (process.env.NODE_ENV === 'production')
  Offline.install();

// Copy all files from the `static` to `dist`, retaining their folder structure
require.context('./static', true);

// Create a worker
const testWorker = new TestWorker();
testWorker.postMessage('cow');
testWorker.onmessage = (event) => {
  console.log('Parent received:', event.data);
};

// React syntax (jsx) is supported
render(<App/>, document.getElementById('root'));
