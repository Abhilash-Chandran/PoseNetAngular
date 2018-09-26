import { OnInit, Injectable } from "@angular/core";
import * as fs from 'fs';
import { VideoModel } from "./video.model";

@Injectable({
    providedIn: 'root'
})
export class PoseService implements OnInit{
    
    videoModelList: VideoModel[] = [];

    constructor() {
    }

    ngOnInit() {
        this.appendToVideoModelList('./videos');
    }

    appendToVideoModelList(dirPath: string, action?: string) {
        const root = fs.readdirSync('./videos');
        root.forEach((file) =>{
            const filestat = fs.statSync(file)
            if(filestat.isFile) {
                // const tmpFile = fs.readFileSync(file);
                // this.videoModelList.push({path: filestat.name})
                console.log(file);
                console.log(filestat);
            }
        })
    }

}