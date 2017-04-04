
var MongoClient = require('mongodb').MongoClient

// Connection URL
var url = 'mongodb://localhost:27017/github'
// Use connect method to connect to the Server
let db, trendingrepos
MongoClient.connect(url, function(err, _db) {
  if(err) return
  console.log("Connected correctly to server")
  let db = _db
  trendingrepos = db.collection('trendingrepos')
  main()
})

var request = require('request')
var moment = require('moment')
var async = require('async')
var fs = require('fs')


// save the 20 days trending to file -> latest

// save gitlogs topics

// save last year rank just non programming

// save last year rank



function fetchYear() {
  fetchLatestDays(365); // fetch last year
}


// fetch history: 2017-03-18
function fetchLatest() {
  var diffDays = moment().diff(moment('2017-03-18'), 'days') - 1
  fetchLatestDays(diffDays)
}

function aggTrendingNonProgram() {
  trendingrepos.aggregate(
    {$match: {
      'repo.language':  {$in: [null, 'HTML']}
    }},
    {$group: {
      _id: '$repo_name', countall: {$sum: "$count"}, desc: {"$first": "$repo.description"}
    }},
    function( err, data ) {
      if(err) return console.log(err);
      fs.writeFileSync('../public/rank_data.json', JSON.stringify(data), 'utf8');
      console.log('done');
    }
  )
}

function main() {
  // fetchLatest();
  aggTrendingNonProgram();
}

// Todo 找到没有被录入的日期如连接超时异常等


// fetch trending in days, filter repo, insert many to mongodb
function fetchLatestDays(days) {
  async.eachOfLimit(Array(days), 5, (_d, idx, done)=>{
    let datestr = moment().subtract({days: idx+1}).format('YYYY-MM-DD')
    let url = 'http://app.gitlogs.com/trending?date='+datestr
    request.get({url, json: true, timeout: 20000}, (err, res, body)=>{
      if(err) return console.error('fetch ' + datestr + ' with err ', err) && done(err)
      console.log(idx + 'fetched ' + datestr)

      let filtered = Array.from(body).filter((i)=> i.repo)
      console.dir(filtered)

      trendingrepos.insertMany(filtered, function(err, result) {
        if(err) return console.error('inserted ' + datestr + ' with err ', err) && done(err)
        done();
      });
    })
  }, ()=>{
    console.log('done!')
  })
}
