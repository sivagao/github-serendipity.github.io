import _ from 'lodash';


import React, { Component } from 'react';


import { Card } from 'antd';
import { Tag } from 'antd';

import { Link } from 'react-router'


import TopicsData from '../data/gitlogs_topics.json';
// http://stackoverflow.com/questions/31758081/loading-json-data-from-local-file-into-react-js

const CategoryTopics = _.reverse(_.sortBy(_.map(_.groupBy(TopicsData, 'tag'), (topics, cateName)=>{
  return {
    name: cateName,
    topics: _.reverse(_.sortBy(topics, 'median')), // median or total_stars
    total_stars: _.reduce(topics, (total_stars, n)=>(total_stars + n.total_stars), 0) // total_stars
  }
}), 'total_stars'))

/*
{
  "topic": "android",
  "tag": "mobile",
  "repos": 100,
  "total_stars": 399333,
  "median": 2660.5
}
 */

function fetchTopic() {

}



class GitlogTopics extends React.Component {
  constructor() {
    super();
    this.state = {
      collapsed: false,
      mode: 'inline',
    };
  }
  handleExpandCategory(key) {
    // fetch repo readme. setState
    // let self = this;
    // getReadme(key, (content)=>{
    //   self.setState({
    //     reporeadme: content
    //   })
    // })
  }
  render() {

    // Todo: 展示更多
    const topicElems = (topics)=>{
      return _.map(topics, (i)=>{
        return (
          <Tag>
            <Link to={'/topic/'+i.topic}>{i.topic + '-' + i.total_stars}</Link>
          </Tag>
        );
      })
    }

    const categoryElems = _.map(CategoryTopics, (i)=>{
        return (
          <Card title={i.name + '- ' + i.total_stars} extra={<a href="#">More</a>} style={{ display: 'inline', width: 300 }}>
            {topicElems(i.topics)}
          </Card>
        )
      })

    return (
      <div>
        {categoryElems}
      </div>
    );
  }
}

export default GitlogTopics;
