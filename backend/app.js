const express = require('express')
const { readdirSync, statSync, createReadStream } = require('fs')
const { join } = require('path')

const path = require('path')
const bodyParser = require('body-parser');

const app = express()
const Pose = require('./models/pose');

const mongoose = require('mongoose');


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/posenetdb?retryWrites=true')
//mongoose.connect('mongodb+srv://poseon:C5f7325Oq1v1bJgO@cluster0-x3lta.mongodb.net/test?retryWrites=true')
.then(() => {
  console.log('mongodb connection successfull');
})
.catch((error) => {
  console.log('mongodb Connection was not successfull ' + error);
})


app.use(express.static(path.join(__dirname, 'assets')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); //  just for demo purpose.

let tmpVideosListObject = {};
let datasetDetails = {};

const datasets = readdirSync(path.join(__dirname, 'assets', 'videos'))
                      .filter(f => statSync(join(path.join(__dirname, 'assets', 'videos'), f)).isDirectory());

datasets.forEach(datasetName => {
  // console.log('processing dataset ' + datasetName);
  tmpVideosListObject = {};
  recursiveReadDir(__dirname+'/assets/videos/'+ datasetName +'/','');
  // console.log(tmpVideosListObject);
  datasetDetails[datasetName] = tmpVideosListObject;
  tmpVideosListObject = null;
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-requestedwith, Content-Type, Accept");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE, OPTIONS"
  )
  next();
})


function recursiveReadDir(dirPath, currentDir) {
  const filesList = readdirSync(dirPath+currentDir)
                      .filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
  const rootPath = dirPath + (currentDir.length>0?currentDir + '/': '')
  for(file of filesList){
    const fileStat = statSync(rootPath+file);
    if(fileStat.isDirectory()){
      tmpVideosListObject[file] = [];
      recursiveReadDir(rootPath, file);
    } else {
      tmpVideosListObject[currentDir] = [...tmpVideosListObject[currentDir], file ] ;
    }
  }
}


app.get('/api/videos/:dataset', (req,res,next) => {

  res.status(200).json({
    message: 'These are the list of videos',
    videos: datasetDetails[req.params.dataset]
  })
})

app.get('/video/:dataset/:action/:name', (req, res, next) => {
  const path = 'backend/assets/videos/'+ req.params.dataset + '/' + req.params.action +'/' +req.params.name;
  const stat = statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    createReadStream(path).pipe(res)
  }
});

app.post('/api/newpose/:dataset', (req, res, next) => {
  //console.log(req.body);
  const keypoints =  req.body.keypoints.map((keypoint)=>{
    return {
      score: keypoint.score,
      position: {
        x: keypoint.position.x,
        y: keypoint.position.y
      },
      part: keypoint.part
    };
  });
  const pose = new Pose({
    dataset: req.params.dataset,
    action: req.body.action,
    video_title: req.body.name,    
    score: req.body.score,
    time: req.body.time,
    keypoints: keypoints
  });
  pose.save().then((result) => {
    res.status(201).json({
      message: 'Your pose is saved successfully',
      poseId : result._id
    });
  })
  .catch((err) => {
    res.status(501).json({
      message: 'Some error occured while saving the pose' + err
    })
  });
  //next();
});

app.get('/api/datasets', (req, res, next) => {
  res.status(200).json({
    datasets: datasets
  });
});

app.get('/api/dataset_details', (req, res, next) => {
  res.status(200).json({
    datasetDetails: datasetDetails
  });
});

app.get('/api/:dataset/actions', (req, res, next) => {
  const datasetName = req.params.dataset;
  res.status(200).json({
    message: 'Actions found for the dataset ' + datasetName,
    actions: Object.keys(datasetDetails[datasetName])
  });
});

app.get('/api/:dataset/:action/videos', (req, res, next) => {
  const datasetName = req.params.dataset;
  const actionName = req.params.action;

  res.status(200).json({
    message: 'Videos found for the dataset ' + datasetName +' and action ' + actionName,
    videos: datasetDetails[datasetName][actionName]
  });
});

app.get('/api/:dataset/:action/keypoints', (req, res, next) => {
  const query = Pose.find();
  const datasetName = req.params.dataset;
  const action = req.params.action;
  const video_title = req.query.video_title;
  query.select('action video_title score keypoints');
  query.where('dataset').equals(datasetName);
  query.where('action').equals(action);
  query.where('video_title').equals(video_title);
  query.then((documents) => {
    // console.log('got some documents ' + documents);
    res.status(200).json({
      message: 'Actions found for the dataset ' + datasetName,
      poses: documents,
      //actionCount: Pose.count()
    })
  }).catch((err) => {
      res.status(501).json({
        message: "Somme error occured while fetching action for the " + datasetName + " dataset." + err
      });
  });
});

module.exports = app;
