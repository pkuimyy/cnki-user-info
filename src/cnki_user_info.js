'use strict'

const fs = require('fs');
const csv = require('fast-csv');
const crawler = require('crawler');

let stream = fs.createReadStream('../data/test.csv');

csv.fromStream(stream, { headers: true, delimiter: '|' })
    .on('data', function (user) {
        execute(user);
    });

let idSet = new Set();
function execute(user) {
    let uids = user['author_id'];
    if (!uids) {
        return;
    }
    let uidList = uids.split(',');
    uidList.forEach(function(uid){
        if(idSet.has(uid)){
            return;
        }else{
            idSet.add(uid);
            getUserInfo(uid);
        }
    });    
}


let c = new crawler({
    // ratelimit: 500
});

// c.on('schedule', options => {
//     options.proxy = 'http://127.0.0.1:8888';
// })

let baseUrl = 'http://yuanjian.cnki.com.cn/Scholar/_GetScholarInfo';
function getUserInfo(uid) {
    c.queue({
        method: 'POST',
        jQuery: false,
        headers: {
            'Host': 'yuanjian.cnki.com.cn',
            'Referer': 'http://yuanjian.cnki.com.cn/scholar/Result?AuthorFilter=' + uid,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
            'Origin': 'http://yuanjian.cnki.com.cn',
        },
        form: {
            'code': uid
        },
        uri: baseUrl,
        callback: saveInfo
    });
}

function saveInfo(err, res, done) {
    if (err) {
        console.log(err);
    } else {
        let json = JSON.parse(res.body)
        console.log(json['ScholarCode']);
    }
    done();
}