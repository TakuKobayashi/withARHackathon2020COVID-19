import * as React from 'react'
import { Link } from 'gatsby'

import * as handTrack from 'handtrackjs'
import * as faceapi from 'face-api.js'

import Page from '../components/Page'
import Container from '../components/Container'
import IndexLayout from '../layouts'

class IndexPage extends React.Component {
  private handTrackModel: handTrack.ObjectDetection | undefined = undefined

  private isFaceTrackModelLoaded = false

  private cameraVideo: HTMLVideoElement | null = null

  private canvas: HTMLCanvasElement | null = null

  private context: CanvasRenderingContext2D | null = null

  private isStartTracking: boolean = false

  private isFaceDetecting: boolean = false

  private isHandTracking: boolean = false

  constructor(props: any) {
    super(props)
    console.log(faceapi.nets)
    faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models').then(() => {
      console.log('faceLoaded')
      this.isFaceTrackModelLoaded = true
      this.runDetection()
    })
    handTrack.load().then(handModel => {
      console.log(handModel)
      this.handTrackModel = handModel
      this.runDetection()
    })
    this.onCanvasLoaded = this.onCanvasLoaded.bind(this)
    this.onVideoRef = this.onVideoRef.bind(this)
    this.runDetection = this.runDetection.bind(this)
  }

  onCanvasLoaded(canvasRef: HTMLCanvasElement) {
    console.log(canvasRef)
    if (!canvasRef) {
      return
    }
    this.canvas = canvasRef
    this.context = canvasRef.getContext('2d')
  }

  onVideoRef(videoRef: HTMLVideoElement) {
    handTrack.startVideo(videoRef).then((isSuccess: boolean) => {
      this.cameraVideo = videoRef
      if (isSuccess) {
        this.runDetection()
      }
    })
  }

  runDetection() {
    if (!this.cameraVideo) {
      return
    }
    if (this.handTrackModel && !this.isHandTracking) {
      this.isHandTracking = true
      this.handTrackModel.detect(this.cameraVideo).then(predictions => {
        this.isStartTracking = true
        this.isHandTracking = false
        console.log('Predictions: ', predictions)
        // this.handTrackModel.renderPredictions(predictions, this.canvas, this.context, this.cameraVideo);
      })
    }
    if (this.isFaceTrackModelLoaded && !this.isFaceDetecting) {
      this.isFaceDetecting = true
      faceapi.detectSingleFace(this.cameraVideo, new faceapi.TinyFaceDetectorOptions()).then(faces => {
        this.isFaceDetecting = false
        console.log('faces: ', faces)
      })
    }
    window.requestAnimationFrame(this.runDetection)
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
            <video ref={this.onVideoRef} />
            <canvas ref={this.onCanvasLoaded} />
          </Container>
        </Page>
      </IndexLayout>
    )
  }
}

export default IndexPage
