import axios from 'axios'
import _ from 'lodash'
import {store, hourExpire} from '../utils/store'

// has cache 6 hours
export function getAwesomeMenus(cb) {
  const cacheKey = `repos:awesome`

  if(store.get(cacheKey)) {
    cb(store.get(cacheKey))
  } else {
    axios({
      url: 'https://raw.githubusercontent.com/lockys/awesome.json/master/awesome/awesome.json'
    }).then(({data})=>{
      const menus = _.map(data, (list, k)=>{
        return {
          key: k,
          name: k,
          list: _.map(list, ({name, repo})=>{
            return {
              key: repo.replace('/', '___'),
              name: name
            }
          })
        }
      });
      store.set(cacheKey, menus, hourExpire(6))
      cb(menus)
    })
  }
}
