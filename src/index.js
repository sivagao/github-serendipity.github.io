import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

// https://github.com/sindresorhus/github-markdown-css
import './utils/github-markdown.css';
import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// var language = navigator.languages && navigator.languages[0] ||
//    navigator.language ||
//    navigator.userLanguage;
