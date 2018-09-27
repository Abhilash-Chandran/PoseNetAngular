const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

let videosListObject = [];

app.use(express.static(path.join(__dirname, 'assets')))

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
module.exports = app;
