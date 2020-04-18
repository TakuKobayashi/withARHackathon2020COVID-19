import * as React from 'react'
import { Link } from 'gatsby'

import * as handTrack from 'handtrackjs';
import * as faceapi from 'face-api.js';
import Webcam from "react-webcam";

import Page from '../components/Page'
import Container from '../components/Container'
import IndexLayout from '../layouts'

class IndexPage extends React.Component {
  private webcam: Webcam;
  private handTrackModel: handTrack.ObjectDetection | null = null;
  private cameraVideo: HTMLVideoElement | null;
  private isStartTracking = false;

  constructor(props: any) {
    super(props);
    console.log(faceapi.nets);
    handTrack.load().then(model => {
      console.log(model);
      this.handTrackModel = model;
      this.runDetection();
    });
    this.runDetection = this.runDetection.bind(this);
  }

  componentDidMount () {
    //console.log(this.webcam.video);
    //console.log(faceapi.createCanvasFromMedia(this.webcam.video));
  }
  

  onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) {
      return;
    }
  }

  onWebcamRef = (webcamRef: Webcam) => {
    this.webcam = webcamRef;
  }

  onVideoRef = (videoRef) => {
    console.log(videoRef);
    handTrack.startVideo(videoRef).then((isSuccess: boolean) => {
      this.cameraVideo = videoRef;
      if(isSuccess){
        this.runDetection();
      }
    });
  }

  runDetection() {
    if(!this.handTrackModel || !this.cameraVideo){
      return;
    }
    this.handTrackModel.detect(this.cameraVideo).then(predictions => {
      this.isStartTracking = true;
        console.log("Predictions: ", predictions);
        window.requestAnimationFrame(this.runDetection);
        //model.renderPredictions(predictions, canvas, context, video);
        //if (isVideo) {
            //requestAnimationFrame(runDetection);
        //}
    });
  }

  render():
  | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  | string
  | number
  | {}
  | React.ReactNodeArray
  | React.ReactPortal
  | boolean
  | null
  | undefined {
  return (
      <IndexLayout>
        <Page>
          <Container>
            <h1>Hi people</h1>
            <p>Welcome to your new Gatsby site.</p>
            <p>Now go build something great.</p>
            <video ref={this.onVideoRef} />
            <canvas ref={this.onCanvasLoaded} />
          </Container>
        </Page>
      </IndexLayout>
    )
  }
}

export default IndexPage
