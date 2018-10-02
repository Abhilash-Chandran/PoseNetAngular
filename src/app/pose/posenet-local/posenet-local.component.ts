import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as posenet from '@tensorflow-models/posenet';
import { Subscription } from 'rxjs';
import { VgAPI } from 'videogular2/core';
import { PoseService } from '../pose.service';
import { VideoModel } from '../video.model';

@Component({
  selector: 'app-posenet-local',
  templateUrl: './posenet-local.component.html',
  styleUrls: ['./posenet-local.component.css']
})
export class PosenetLocalComponent implements OnInit, OnDestroy {

  api: VgAPI;
  timeUpdateSubs: Subscription;
  loadedMetaDataSubs: Subscription;
  videoEndedSubs: Subscription;
  videoListFetched: Subscription;

  // select dataset options
  datasets: string[];
  datasetSelected: string;

  // Video element
  @ViewChild('media') media: ElementRef;
  videoList: VideoModel[];
  currentIndex = 0;
  currentSrc: string;
  btn_text = 'Start Extraction';

  isPlaying = false;

  constructor(private poseService: PoseService) { }

  ngOnInit() {    
    this.poseService.fetchDatasetNames();
    this.poseService.datasetNamesFetched.subscribe((datasetNames: string[]) => {
      this.datasets = datasetNames;      
    });    
  }

  onPlayerReady(api: VgAPI) {
    console.log('On player ready called.');
    this.api = api;         

    this.videoEndedSubs = this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
      console.log('video ended called');
      this.nextVideo();
    }); 
    this.timeUpdateSubs = this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(() => {
      this.detetectPose(this.media.nativeElement, this.api.currentTime);
    });
  }

  async detetectPose(video: any, updatedtime: string) {
    const imageScaleFactor = 0.5;
    const outputStride = 16;
    const flipHorizontal = false;

    const net = await posenet.load(0.50);
    const pose = await net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride);
    net.dispose();
    const currentVideo = this.videoList[this.currentIndex];
    this.poseService.saveNewPose('jhmdb_poses', currentVideo.action, currentVideo.name, pose);
  }

  nextVideo() {
    console.log('current index is ' + this.currentIndex );
    this.currentIndex++;
    if (this.currentIndex === this.videoList.length) {
        this.currentIndex = 0;
        this.stopExraction();
        return;
    }
    const { srcUrl } = this.videoList[this.currentIndex];
    this.currentSrc = srcUrl;
  }

  playVideo() {      
       this.api.play();            
  }

  pauseVideo() {
    this.api.pause();
  }

  stopExraction() {
    this.api.pause();
    this.timeUpdateSubs.unsubscribe();
    this.loadedMetaDataSubs.unsubscribe();
    this.videoEndedSubs.unsubscribe();
  }

  startOrPauseExtraction() { 
    if(this.btn_text == 'Start Extraction') {
      this.loadedMetaDataSubs = this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(() => {            
        setTimeout(() => {
          this.playVideo();
        }, 5000);
      });  
      this.btn_text = 'Pause Extraction';
      this.playVideo();
    } else {
      this.pauseVideo();
      this.btn_text = 'Start Extraction';
      this.locUnsubscribe(this.loadedMetaDataSubs);
      
    }  
    
  }
  
  onSelectionChanged(event) {
    this.videoList = null;
    this.poseService.fetchVideos(this.datasetSelected);
    this.videoListFetched = this.poseService.getVideoListChangedListener().subscribe((videoListfromApi) => {
      console.log('subscribe called');            
      this.currentSrc = videoListfromApi[0].srcUrl;      
      this.videoList = videoListfromApi;
    });
  }

  ngOnDestroy() {
    this.locUnsubscribe(this.timeUpdateSubs);
    this.locUnsubscribe(this.loadedMetaDataSubs);
    this.locUnsubscribe(this.videoEndedSubs);
    this.locUnsubscribe(this.videoListFetched);
  }

  locUnsubscribe(subs: Subscription){
    if(subs){
      subs.unsubscribe();
    }
  }
}
