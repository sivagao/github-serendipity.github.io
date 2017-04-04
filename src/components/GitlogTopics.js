import _ from 'lodash';


import React from 'react';


import { Card, Icon, Tag, Spin } from 'antd';

import { Link } from 'react-router'

import {getAllTopics} from '../data/gitlogs'


class GitlogTopics extends React.Component {

  state = {
    CategoryTopics: null,
  }

  componentWillMount() {
    getAllTopics((CategoryTopics)=>{
      this.setState({CategoryTopics})
    })
  }

  render() {

    if(!this.state.CategoryTopics) {
      return <Spin></Spin>
    }

    // Todo: 展示更多
    // Todo: unique key for rending
    const topicElems = (topics)=>{
      return _.map(topics, (i)=>{
        return (
          <Tag key={i.topic}>
            <Link to={'/topic/'+i.topic}>{i.topic + ' - ' + i.total_stars}</Link>
          </Tag>
        );
      })
    }

    const cardTitle = (i)=> {
      return <span>{_.capitalize(i.name) + ' - ' + i.total_stars } <Icon type="star-o" /></span>
    }

    const categoryElems = _.map(this.state.CategoryTopics, (i)=>{
      return (
        <Card title={cardTitle(i)} style={{ display: 'inline', width: 300 }} key={i.name}>
          {topicElems(i.topics)}
        </Card>
      )
    })

    return (
      <div className="ga-topics-wrap">
        {categoryElems}
      </div>
    );


  }
}

export default GitlogTopics;
