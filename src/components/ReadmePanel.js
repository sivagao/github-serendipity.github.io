import React, { Component } from 'react';
import './App.css';

// const ReactMarkdown = require('react-markdown');
import ReactMarkdown from 'react-markdown';

import {getReadme} from '../data/github';

// const ReadmePanel = ({ match }) => {
//   console.log(match)
//   getReadme(match.params.repo.replace('___', '/'), (raw)=>{
//     return (
//       <ReactMarkdown source={raw} />
//     );
//   })
// }

class ReadmePanel extends React.Component {
  constructor() {
    super()
    this.state = {
      repo: '',
      source: null
    }
  }

  render() {
    const source = this.state.source;
    const params = this.props.params;
    const that = this;
    if(params && params.repo) {
      getReadme(params.repo.replace('___', '/'), (_r)=>{
        delete params.repo
        that.setState({
          source: _r
        })
      })
    }
    if(source) {
      return <ReactMarkdown source={source} />
    } else {
      return (<h1>loading...</h1>)
    }
  }
}

export default ReadmePanel;
