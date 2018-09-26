import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as posenet from '@tensorflow-models/posenet';
import { VgAPI, VgMedia } from 'videogular2/core';
import { Subscription } from 'rxjs';
import { PoseService } from '../pose.service';

@Component({
  selector: 'app-posenet-local',
  templateUrl: './posenet-local.component.html',
  styleUrls: ['./posenet-local.component.css']
})
export class PosenetLocalComponent implements OnInit, OnDestroy {

  api: VgAPI;
  timeUpdateSubs: Subscription;  
  @ViewChild('media') media: ElementRef;
  videoHTML : any;

  constructor(private poseService: PoseService) { }

  ngOnInit() {
    this.videoHTML = this.media.nativeElement;
  }

  onPlayerReady(api:VgAPI) {
    this.api = api;
    this.timeUpdateSubs = this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(() => {      
      this.detetectPose(this.videoHTML, this.api.currentTime).then((pose) => {
        console.log(pose.keypoints);
      });      

    });
  }

  async detetectPose(video: any, updatedtime: string){
    // setTimeout(() => {
    //   console.log('at ' + updatedtime + ' video elem is : ' + video);
    // }, 2000)
    const imageScaleFactor = 0.5;
    const outputStride = 16;
    const flipHorizontal = false;

    const net = await posenet.load();

    const pose = await net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride);

    return pose;

  }

  ngOnDestroy() {
    this.timeUpdateSubs.unsubscribe();
  }


}
