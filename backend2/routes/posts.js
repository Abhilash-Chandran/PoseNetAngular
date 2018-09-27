const express = require('express');
const Post = require('../models/post');
const router = express.Router();
const multer = require('multer');


const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg' : 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const ext = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid Mime type error.")
    if(ext){
      error = null;
    }
    callback(error, "backend/images"); // this path is rel to to server.js
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('_');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext);
  }
})

router.post("", multer({storage: storage}).single("image"), (req, res, next) => { // image is the keyword in the request body which multer will look for.
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then((result) => {
    res.status(201).json({
      message: 'Your post is saved successfully',
      postId : result._id
    });
  });
})

router.put("/:id", (req, res, next ) => {
  const post = new Post({
    _id : req.params.id,
    title: req.body.title,
    content: req.body.content
  })
  Post.updateOne({_id: req.params.id}, post)
      .then((result) => {
        res.status(200).json({message: "successfull updated post Id : " + req.body.title});
      })
})

router.get("", (req, res, next) => {
  Post.find()
  .then((documents) => {
    res.status(200).json({
      message: 'posts fetched successfully',
      posts: documents
    });
  })
  .catch((error) => {
    console.log('Some error while fetching posts ' + error );
  });
})

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: "Unable to find post with the id " + req.params.id});
    }
  })
})

router.delete('/:idc', (req,res,next) => {
  Post.deleteOne({_id: req.params.idc})
    .then((result) => {
      console.log(result)
    });
  res.status(200).json({message: "Post with " + req.params.idc + " was deleted successfully"});
})

module.exports = router;
