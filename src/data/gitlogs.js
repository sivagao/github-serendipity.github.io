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

export function getAllTopics (cb){
  // http://www.gitlogs.com/data/github_topics.json
}

export function getTrendingBatch(cb) {
  // Todo support 滚动加载更多...
  // Todo ignore error
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
        return status < 600; // ignore error...
      }
    }).then((i)=>(i), (e)=>{e}); // igore error for timeout pass down
  })).then((values)=>{
    // Todo: 统一的错误处理
    let idx = 0;
    return cb(_.map(_.filter(values, (i)=>(i && (i.status == 200))), ({data})=>{
      let anchor = data[0].date.slice(0, 10)
      ++idx;
      return {
        name: anchor,
        key: (idx === 1) ? 'trending_first' : anchor, // hack
        list: _.map(data, (i)=>{
          return {
            name: i.repo_name.split('/')[1] + ' ' + i.count,
            key: i.repo_name.replace('/', '___'),
            description: i.repo ? i.repo.description : ""
          }
        })
      }
    }));
  })
}

export function getTopicRepoList (topic, cb){
  const apiURL = 'https://api.github.com/search/repositories'
  // const apiURL =

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
    return cb([{
      name: topic,
      key: 'topic_only',
      list: _.map(items, (i)=>{
        return {
          key: i.full_name.replace('/', '___'),
          name: `${i.name} ${i.stargazers_count}`
        }
      })
    }]);
  });
}

// incomplete_results
// items
// total_count

import RepoData from './rankdata';
export const TagTopicsAsMenus = [[Infinity, 1000], [1000, 500], [500, 200], [200, 0]].map((c)=>{
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
