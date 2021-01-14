import React from 'react';
import { render } from 'react-dom';

// Imported css or sass files are extracted to the file: `index.[hash].css`
// because this is the `index` webpack entry point
import './style.scss';
import App from './App';
import TestWorker from './test.worker.js';
import './typescript';

// Create a worker
const testWorker = new TestWorker();
testWorker.postMessage('cow');
testWorker.onmessage = (event) => {
  console.log('Parent received: ' + JSON.stringify(event.data));
};

// React syntax (jsx) is supported
render(<App />, document.getElementById('root'));
