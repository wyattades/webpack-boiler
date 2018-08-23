import React from 'react';
import { render } from 'react-dom';

import './style.scss';
import App from './App';
import TestWorker from './test.worker.js';

require.context('./static', true);

const testWorker = new TestWorker();


render(<App/>, document.getElementById('root'));
