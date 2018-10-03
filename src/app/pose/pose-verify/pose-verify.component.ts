import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PoseService } from '../pose.service';
import { Pose } from '../pose-response.model';

@Component({
  selector: 'app-pose-verify',
  templateUrl: './pose-verify.component.html',
  styleUrls: ['./pose-verify.component.css']
})
export class PoseVerifyComponent implements OnInit {

  datasetDetails = {};

  datasets: string[] = [];
  datasetSelected: string;

  actions: string[];
  actionSelected: string;

  videos: string[];
  videoSelected: string;

  constructor(private poseService: PoseService) { }

  poses: Pose[] = [];

  ngOnInit() {
    this.poseService.fetchDatasetDetails();
    this.poseService.datasetDetailsFetched.subscribe((datasetDetails: Object) => {
      this.datasetDetails = datasetDetails;
      this.datasets = Object.keys(this.datasetDetails);
    });
  }

  onSelectionChanged(event) {
    this.actions = null;
    if (this.datasetSelected) {
      this.actions = Object.keys(this.datasetDetails[this.datasetSelected]);
    }
  }

  onActionChanged() {
    this.videos = null;
    if (this.actionSelected) {
      this.videos = this.datasetDetails[this.datasetSelected][this.actionSelected];
    }
  }
}
