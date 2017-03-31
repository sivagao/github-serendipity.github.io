import axios from 'axios'
import { notification } from 'antd'

export function getReadme (name, cb){

  axios({
    url: `https://api.github.com/repos/${name}/readme`,
    headers: {
      accept: 'application/vnd.github.v3.raw', // html
    },
    params: {
      client_id: '8b9c22a2d0e69409752b',
      client_secret: '5a92678d71512b1e0fc99fa4952daa4e2c43c08b'
    },
    responseType: 'text',
  }).then(({data})=>{
    cb(data);
  }).catch((e)=>{
    notification['error']({
      message: 'API Error',
      description: `Can't get Readme for ${name}`,
    });
  });
}
