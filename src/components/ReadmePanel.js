import React, { Component } from 'react';

// const ReactMarkdown = require('react-markdown');
import ReactMarkdown from 'react-markdown';

import {getReadme} from '../data/github';

import {Spin, BackTop, Tag} from 'antd';

import {HeadingRenderer, LinkRenderer, ImageRenderer, transformImageUri, transformLinkUri} from '../utils/markdown';
import _ from 'lodash'

import {run as tocRun} from '../utils/toc'
// https://github.com/FallenMax/smart-toc

import {store, hourExpire} from '../utils/store'

class ReadmePanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      repo: '', // Todo: repo status bar
      source: ''
    }
    this.smartToc = {}
  }

  componentWillUnmount() {
    // Todo clean toc since toc will auto refresh after dom tree modified
    this.smartToc.dispose && this.smartToc.dispose()
  }

  render() {
    const source = this.state.source;
    const params = this.props.params;
    const that = this;
    let repoName, isLoading, repoKey;
    console.log('rending readme panel..')
    const cacheRepoReadKey = 'repo:readdict'
    if(params && params.repo) {
      repoName = params.repo.replace('___', '/');
      repoKey = params.repo;
      isLoading = true;
      getReadme(repoName, (_r)=>{
        delete params.repo;
        that.setState({
          source: _r,
          repoName: repoName
        });
        // store has read it?
        let dictCache = store.get(cacheRepoReadKey) || {}
        dictCache[repoKey] = true;
        store.set(cacheRepoReadKey, Object.assign({}, dictCache), hourExpire(24*7*4))
        isLoading = false;
        if(that.smartToc.refresh) {
          that.smartToc.refresh();
        } else {
          that.smartToc = tocRun({userOffset: [window.innerWidth - 350, 20]})
        }
         // {userOffset: [80, window.innerWidth - 200]}
      });
    }

    const prefix = `//github.com/${this.state.repoName}/`;
    const markProps = {
      source,
      className: 'markdown-body',
      renderers: {
        Link: _.curry(LinkRenderer)(prefix),
        Heading: HeadingRenderer,
      },
    }
    const imgPrefix = `//raw.githubusercontent.com/${this.state.repoName}/master/`;
    return (
      <div className="ga-readme-wrap">
        {source ? (
          <div className="ga-readme">
            <BackTop />
            {/* <Tag><a href={'//github.com/'+this.state.repoName} target="_blank"> View On Github</a></Tag> */}
            {isLoading && <Spin size="large" />}
            <ReactMarkdown {...markProps}
              transformLinkUri={_.curry(transformLinkUri)(prefix)}
              transformImageUri={_.curry(transformImageUri)(imgPrefix)} />
          </div>
        ): (<Spin size="large" spinning={true}></Spin>) }
      </div>
    )
  }
}

export default ReadmePanel;
