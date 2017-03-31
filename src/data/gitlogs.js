// https://api.github.com/search/repositories?q=topic:react%20created:2000-01-01..*&per_page=100&sort=stars&order=desc
// http://www.gitlogs.com/most_popular?topic=development =>
//

// q:topic:development created:2000-01-01..*
// per_page:100
// page:2
// sort:stars
// order:desc

import axios from 'axios'
import _ from 'lodash'

import {store, hourExpire} from '../utils/store'

export function getAllTopics (cb){

  /*
  {
    "topic": "android",
    "tag": "mobile",
    "repos": 100,
    "total_stars": 399333,
    "median": 2660.5
  }
   */

  //  import TopicsData from '../data/gitlogs_topics.json';
   // http://stackoverflow.com/questions/31758081/loading-json-data-from-local-file-into-react-js

  const cacheKey = `topics`

  if(store.get(cacheKey)) {
    cb(store.get(cacheKey))
  } else {
    axios({
      // url: 'http://www.gitlogs.com/data/github_topics.json'
      url: `${process.env.PUBLIC_URL}/gitlogs_topics.json`,
    }).then(({data})=>{

      const CategoryTopics = _.reverse(_.sortBy(_.map(_.groupBy(data, 'tag'), (topics, cateName)=>{
        return {
          name: cateName,
          topics: _.reverse(_.sortBy(topics, 'median')), // median or total_stars
          total_stars: _.reduce(topics, (total_stars, n)=>(total_stars + n.total_stars), 0) // total_stars
        }
      }), 'total_stars'))

      store.set(cacheKey, CategoryTopics, hourExpire(6))
      cb(CategoryTopics)
    })
  }
}

// has cache 6 hours
export function getTrendingBatch(cb) {
  // Todo support 滚动加载更多...

  const cacheKey = `repos:trending`;

  if(store.get(cacheKey)) {
    cb(store.get(cacheKey))
  } else {
    Promise.all(_.map(Array(5).fill(1), (i, idx)=>{
      const now = new Date()
      let _d = new Date(now.setDate(now.getDate() - idx -1))
      return axios({
        timeout: 5000, // short time for timeout
        url: 'http://app.gitlogs.com/trending',
        params: {
          date: _d.toISOString().slice(0,10)
        },
        validateStatus: function (status) {
          return status < 600; // hack to ignore error...
        }
      }).then((i)=>(i), (e)=>{e}); // igore error for timeout pass down
    })).then((values)=>{
      // Todo: 添补日期
      let idx = 0;
      const menus = _.map(_.filter(values, (i)=>(i && (i.status == 200))), ({data})=>{
        let anchor = data[0].date.slice(0, 10)
        ++idx;
        return {
          name: anchor,
          key: (idx === 1) ? 'trending_first' : anchor, // hack
          list: _.map(data.slice(0, 40), (i)=>{
            return {
              name: i.repo_name.split('/')[1] + ' ' + i.count,
              key: i.repo_name.replace('/', '___'),
              description: i.repo ? i.repo.description : ""
            }
          })
        }
      });
      store.set(cacheKey, menus, hourExpire(6))
      return cb(menus);
    })
  }
}

// has cache 6 hours
export function getTopicRepoList (topic, cb){
  const apiURL = 'https://api.github.com/search/repositories'

  const cacheKey = `repos.topic.${topic}`;
  if(store.get(cacheKey)) {
    return cb(store.get(cacheKey));
  } else {
    axios({
      url: apiURL,
      params: {
        per_page: 600,
        page: 1,
        sort: 'stars',
        order: 'desc',
        q: `topic:${topic} created:2000-01-01..*`
      }
    }).then(({data: {items}})=>{
      const menus = [{
        name: topic,
        key: 'topic_only',
        list: _.map(items, (i)=>{
          return {
            key: i.full_name.replace('/', '___'),
            name: `${i.name} ${i.stargazers_count}`
          }
        })
      }];
      store.set(cacheKey, menus, hourExpire(6)) // expire 6 hours
      return cb(menus);
    });
  }
}


import RepoData from './rankdata';
export const RankAsMenus = [[Infinity, 1000], [1000, 500], [500, 200], [200, 0]].map((c)=>{
  const list = RepoData.filter((i)=>{
    return c[0] > i.countall && i.countall >= c[1];
  }).sort( (a, b) => (b.countall - a.countall))
  .map((i)=>{
    return {
      key: i._id.replace('/', '___'),
      name: i._id.split('/')[1] + ' ' + i.countall,
      description: i.desc
    }
  });
  return {
    key: c.toString(),
    name: 'Between ' + c.toString() + ' stars',
    list: list
  }
})
