import axios from 'axios'
import _ from 'lodash'
import { notification } from 'antd';


export function getSimAsMenus (repo, cb){

  axios({
    url: `${location.protocol}//s3.amazonaws.com/github_yasiv/out/${repo}.json`,
  }).then(({data})=>{
    const menu = {
      name: `Similar To ${repo.split('/')[1]}`,
      key: 'similar-repos', // hack
      list: _.map(data.slice(1), (i)=>{ // omit the first same one
        return {
          name: i.n.split('/')[1] + ' ' + i.w,
          key: i.n.replace('/', '___'),
          description: i.d
        }
      })
    }

    cb([menu]);
  }).catch((e)=>{
    notification['error']({
      message: 'API Error',
      description: `Can't  find Similar Repos for ${repo}`,
    });
    cb([])
  });
}
