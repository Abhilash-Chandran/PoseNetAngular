const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser');

const app = express()
const Pose = require('./models/pose');

const mongoose = require('mongoose');


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/posenetdb?retryWrites=true')
.then(() => {
  console.log('mongodb connection successfull');
})
.catch((error) => {
  console.log('mongodb Connection was not successfull ' + error);
})

let videosListObject = [];

app.use(express.static(path.join(__dirname, 'assets')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); //  just for demo purpose.


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
  const filesList = fs.readdirSync(dirPath+currentDir)
                      .filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
  const rootPath = dirPath + (currentDir.length>0?currentDir + '/': '')
  console.log(rootPath);
  for(file of filesList){
    const fileStat = fs.statSync(rootPath+file);
    if(fileStat.isDirectory()){
      videosListObject[file] = [];
      recursiveReadDir(rootPath, file);
    } else {
      const newFile = {action: currentDir, name: file};
      videosListObject = [...videosListObject, newFile ] ;
    }
  }
}

app.get('/api/videos', (req,res,next) => {
  videosListObject = [];
  recursiveReadDir(__dirname+'/assets/videos/','');
  res.status(200).json({
    message: 'These are the list of videos',
    videos: videosListObject
  })
})

app.get('/video/:action/:name', (req, res, next) => {
  const path = 'backend/assets/videos/'+ req.params.action +'/'+req.params.name;
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
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
    fs.createReadStream(path).pipe(res)
  }
})

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
    datasets: ["jhmdb_poses", "Dummy1", "Dummy2"]
  })
});

app.get('/api/:dataset/actions', (req, res, next) => {
  const query = Pose.find();
  const datasetName = req.params.dataset;
  query.distinct('action');
  query.where('dataset').equals(datasetName);
  query.then((documents) => {
    res.status(200).json({
      message: 'Actions found for the dataset ' + datasetName,
      actions: documents,
      //actionCount: Pose.count()
    });
  }).catch((err) => {
      res.status(501).json({
        message: "Somme error occured while fetching action for the " + datasetName + " dataset." + err
      });
  });
});

app.get('/api/:dataset/:action/keypoints', (req, res, next) => {
  const query = Pose.find();
  const datasetName = req.params.dataset;
  const action = req.params.action;
  query.select('action video_title score keypoints');
  query.where('dataset').equals(datasetName);
  query.where('action').equals(action);
  query.then((documents) => {
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
