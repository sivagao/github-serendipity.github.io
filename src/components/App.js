import React, { Component } from 'react';
import { Button } from 'antd';
import './App.css';
import AppLayout from './AppLayout';

import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

import ReadmePanel from './ReadmePanel';
import GitlogTopics from './GitlogTopics';

const Home = () => (<div> About This Repo: 用来快速找到一些好用的项目 </div>)

const Nav = () => (
  <div>
    <Link to='/'>Home</Link>&nbsp;
    <Link to='/topics'>Address</Link>
  </div>
)

const Container = (props) => <div>
  <Nav />
  {props.children}
</div>


class App extends Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route path='/' component={AppLayout}>
          <IndexRoute component={Home} />
          <Route path='topics' component={GitlogTopics} />
          <Route path='repo/:repo' component={ReadmePanel} />
          <Route path='*' component={ReadmePanel} />
        </Route>
      </Router>
    );
  }
}

export default App;
