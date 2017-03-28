
export function getReadme (name, cb){
  var apiURL = 'https://api.github.com/repos/' + name + '/readme';

  fetch(apiURL, {
    headers: {
      accept: 'application/vnd.github.v3.raw', // html
    },
  }).then((resp)=>{
    return resp.text()
  }).then((raw)=>{
    cb(raw);
  });
}
