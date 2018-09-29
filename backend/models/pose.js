const mongoose = require('mongoose');
// const keypointSchema = mongoose.Schema({
//     score: {type: Number},
//     position: {
//       x: {type: Number},
//       y: {type: Number}
//     },
//     part: {type: String}
// })
const poseSchema = mongoose.Schema({
  dataset:{type: String, required: true},
  action: {type: String, required: true},
  video_title: {type: String, required: true},
  score: {type: Number, required: true},
  keypoints: {type: [{
    score: {type: Number},
    position: {
      x: {type: Number},
      y: {type: Number}
    },
    part: {type: String}
}], required: true}
})

module.exports = mongoose.model('Pose', poseSchema);// | mongoose.model('Keypoint', keypointSchema);
