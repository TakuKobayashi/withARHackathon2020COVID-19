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
  private isFaceTrackModelLoaded: boolean = false;
  private cameraVideo: HTMLVideoElement | null;
  private canvas: HTMLCanvasElement;
  private context: any;
  private isStartTracking = false;

  constructor(props: any) {
    super(props);
    console.log(faceapi.nets);
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models').then(() => {
      console.log("faceLoaded");
      this.isFaceTrackModelLoaded = true;
      this.runDetection();
    });
    handTrack.load().then(handModel => {
      console.log(handModel);
      this.handTrackModel = handModel;
      this.runDetection();
    });
    this.runDetection = this.runDetection.bind(this);
  }

  componentDidMount () {
    //console.log(this.webcam.video);
    //console.log(faceapi.createCanvasFromMedia(this.webcam.video));
  }

  onCanvasLoaded = (canvasRef: HTMLCanvasElement) => {
    console.log(canvasRef);
    if (!canvasRef) {
      return;
    }
    this.canvas = canvasRef;
    this.context = canvasRef.getContext("2d");
  }

  onWebcamRef = (webcamRef: Webcam) => {
    this.webcam = webcamRef;
  }

  onVideoRef = (videoRef) => {
    handTrack.startVideo(videoRef).then((isSuccess: boolean) => {
      this.cameraVideo = videoRef;
      if(isSuccess){
        this.runDetection();
      }
    });
  }

  runDetection() {
    if(!this.cameraVideo){
      return;
    }
    if(this.handTrackModel){
      this.handTrackModel.detect(this.cameraVideo).then(predictions => {
        this.isStartTracking = true;
        console.log("Predictions: ", predictions);
        //this.handTrackModel.renderPredictions(predictions, this.canvas, this.context, this.cameraVideo);
        window.requestAnimationFrame(this.runDetection);
      });
    }
    if(this.isFaceTrackModelLoaded){
      faceapi.detectSingleFace(this.cameraVideo).then(faces => {
        console.log("faces: ", faces);
        window.requestAnimationFrame(this.runDetection);
      });
    }
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
