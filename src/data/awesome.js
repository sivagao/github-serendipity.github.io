import axios from 'axios'
import _ from 'lodash'

export function getAwesomeMenus(cb) {
    axios({
      url: 'https://raw.githubusercontent.com/lockys/awesome.json/master/awesome/awesome.json'
  }).then(({data})=>{
      cb(_.map(data, (list, k)=>{
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
      }))
    })
}
