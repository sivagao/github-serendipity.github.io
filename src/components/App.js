import React, { Component, PropTypes } from 'react';
import { Button } from 'antd';
// import './App.css';
import AppLayout from './AppLayout';

import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

import ReadmePanel from './ReadmePanel';
import GitlogTopics from './GitlogTopics';

const Home = () => (<div> About This Repo: 用来快速找到一些好用的项目 </div>)


class App extends Component {
  render() {
    return (
      // https://github.com/ReactTraining/react-router/issues/2019 back to top after change route
      <Router history={browserHistory} onUpdate={() => window.scrollTo(0, 0)}>
        <Route path='/' component={AppLayout}>
          {/* <IndexRoute component={Home} /> */}
          <Route path='topics' component={{content: GitlogTopics}} hideSide={true} />
          <Route path='repo/:repo' component={{content: ReadmePanel}} />
          <Route path='repo/:repo/similar' component={{content: ReadmePanel}} />
          <Route path='*' component={{content: ReadmePanel}} />
        </Route>
      </Router>
    );
  }
}

App.propTypes = {
  store: PropTypes.object.isRequired,
};

export default App;
