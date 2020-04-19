import * as React from 'react'
import { Link } from 'gatsby'

import * as handTrack from 'handtrackjs'
import * as faceapi from 'face-api.js'

import fetch from 'node-fetch';
global.fetch = fetch

import Page from '../components/Page'
import Container from '../components/Container'
import IndexLayout from '../layouts'

interface CameraProps {
  isVideo: boolean
  isShowMessage: boolean
}

class IndexPage extends React.Component<CameraProps> {
  private handTrackModel: handTrack.ObjectDetection | undefined = undefined

  private isFaceTrackModelLoaded = false

  private cameraVideo: HTMLVideoElement | null = null

  private canvas: HTMLCanvasElement | null = null

  private canvasContext: CanvasRenderingContext2D | null = null

  private isStartTracking: boolean = false

  private isFaceDetecting: boolean = false

  private isHandTracking: boolean = false

  private lastDetectedFace: faceapi.FaceDetection | undefined = undefined

  private lastDetectedHands: any[] = []

  constructor(props: any) {
    super(props)
    this.state = {
      isVideo: false,
      isShowMessage: false
    }
    faceapi.env.monkeyPatch({ fetch: fetch });
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
    this.canvasContext = canvasRef.getContext('2d')
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
    if (!this.canvasContext || !this.canvas){
      return
    }
    if (this.handTrackModel && !this.isHandTracking) {
      this.isHandTracking = true
      this.handTrackModel.detect(this.cameraVideo).then(predictions => {
        this.isStartTracking = true
        this.isHandTracking = false
        this.lastDetectedHands = predictions
        console.log('Predictions: ', predictions)
        // this.handTrackModel.renderPredictions(predictions, this.canvas, this.canvasContext, this.cameraVideo);
      })
    }
    if (this.isFaceTrackModelLoaded && !this.isFaceDetecting) {
      this.isFaceDetecting = true
      faceapi.detectSingleFace(this.cameraVideo, new faceapi.TinyFaceDetectorOptions()).then(faces => {
        this.isFaceDetecting = false
        this.lastDetectedFace = faces
        console.log('faces: ', faces)
      })
    }
    /*
    if (!this.state.isVideo) {
      this.setState({
        isVideo: true
      })
    }
    this.canvasContext.drawImage(this.cameraVideo, 0, 0, this.canvas.width, this.canvas.height)
     */
    const isFaceTouch = this.checkFaceTouch()
    console.log(isFaceTouch)
    if (this.state.isShowMessage !== isFaceTouch) {
      this.setState({isShowMessage: isFaceTouch});
    }
    window.requestAnimationFrame(this.runDetection)
  }

  private checkFaceTouch(): boolean {
    if (!this.lastDetectedFace) {
      return false
    }
    if (!this.lastDetectedHands.length > 0) {
      return false
    }

    const faceBox = this.lastDetectedFace.box
    const hands = this.lastDetectedHands
    for (const hand of hands) {
      // 顔の左上が手の中
      const checkInclude1 =
        hand.bbox[0] < faceBox.x &&
        faceBox.x < hand.bbox[0] + hand.bbox[2] &&
        hand.bbox[1] < faceBox.y &&
        faceBox.y < hand.bbox[1] + hand.bbox[3]

      // 顔の右上が手の中
      const checkInclude2 =
        hand.bbox[0] < faceBox.x + faceBox.width &&
        faceBox.x + faceBox.width < hand.bbox[0] + hand.bbox[2] &&
        hand.bbox[1] < faceBox.y &&
        faceBox.y < hand.bbox[1] + hand.bbox[3]

      // 顔の右上が手の中
      const checkInclude3 =
        hand.bbox[0] < faceBox.x &&
        faceBox.x < hand.bbox[0] + hand.bbox[2] &&
        hand.bbox[1] < faceBox.y + faceBox.height &&
        faceBox.y + faceBox.height < hand.bbox[1] + hand.bbox[3]

      // 顔の右上が手の中
      const checkInclude4 =
        hand.bbox[0] < faceBox.x + faceBox.width &&
        faceBox.x + faceBox.width < hand.bbox[0] + hand.bbox[2] &&
        hand.bbox[1] < faceBox.y + faceBox.height &&
        faceBox.y + faceBox.height < hand.bbox[1] + hand.bbox[3]

      console.log({
        checkInclude1,
        checkInclude2,
        checkInclude3,
        checkInclude4,
      })

      // どれかの手が顔に当たっている判定
      if (checkInclude1 || checkInclude2 || checkInclude3 || checkInclude4) {
        return true
      }
    }
    return true
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
            <div>
              <video ref={this.onVideoRef} hidden={this.state.isVideo} />
            </div>
            <div>
              { this.state.isShowMessage ? "顔触ってるよ!!" : null }
            </div>
            <div>
              <canvas ref={this.onCanvasLoaded} />
            </div>
          </Container>
        </Page>
      </IndexLayout>
    )
  }
}

export default IndexPage
