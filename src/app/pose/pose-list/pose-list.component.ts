import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Pose } from '../pose-response.model';
import { environment } from 'src/environments/environment';
import { ViewRef } from '@angular/core/src/render3/view_ref';
import { drawKeypoints } from 'src/app/shared/data_util';

@Component({
  selector: 'app-pose-list',
  templateUrl: './pose-list.component.html',
  styleUrls: ['./pose-list.component.css']
})
export class PoseListComponent implements OnInit {

  BACKEND_URL = environment.backendUrl;

  src: string;

  @ViewChild('loc_canvas') canvas: ElementRef;

  @Input()
  pose: Pose;

  @Input()
  dataset: string;

  @Input()
  action: string;

  constructor() { }

  ngOnInit() {
    this.src = this.BACKEND_URL +  'video/' + this.action + '/' + this.pose.video_title;
  }

  animateKeypoints() {
    const canvas = this.canvas.nativeElement as HTMLCanvasElement;
    const ctxt = canvas.getContext('2d');
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
    drawKeypoints(this.pose.keypoints, 0.0, ctxt);
  }

}
