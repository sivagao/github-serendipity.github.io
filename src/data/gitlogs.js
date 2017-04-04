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
    axios({
      url: `${process.env.PUBLIC_URL}/gitlogs_trending.json`,
    }).then(({data})=>{
      store.set(cacheKey, data, hourExpire(6))
      return cb(data);
    })
  }
}

// has cache 6 hours
export function getTopicRepoList (topic, cb){
  const apiURL = 'https://api.github.com/search/repositories'
  // https://developer.github.com/v3/search/#search-repositories

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
            name: `${i.name} ${i.stargazers_count}`,
            description: i.description
          }
        })
      }];
      store.set(cacheKey, menus, hourExpire(6)) // expire 6 hours
      return cb(menus);
    });
  }
}


const blackListForRank = ['amattson21/gitjob', 'egorsmkv/google-spaces']
export function getRankAsMenus(cb) {

  const cacheKey = `repos:rank`;

  if(store.get(cacheKey)) {
    cb(store.get(cacheKey))
  } else {
    axios({
      url: `${process.env.PUBLIC_URL}/rank_data.json`,
    }).then(({data})=>{
      const _RepoData = _.filter(data, (i)=> (!blackListForRank.includes(i._id)))
      const RankAsMenus = [[Infinity, 1000], [1000, 500], [500, 200], [200, 0]].map((c)=>{
        const list = _RepoData.filter((i)=>{
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

      store.set(cacheKey, RankAsMenus, hourExpire(6))
      return cb(RankAsMenus);
    })
  }
}
