import React, { Component } from 'react';
import './App.css';

// const ReactMarkdown = require('react-markdown');
import ReactMarkdown from 'react-markdown';

class ReadmePanel extends React.Component {
  render() {
    return (
      <ReactMarkdown source={this.props.source} />
    );
  }
}

export default ReadmePanel;
