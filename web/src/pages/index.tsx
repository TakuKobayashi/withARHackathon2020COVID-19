import * as React from 'react'
import { Link } from 'gatsby'
import * as handTrack from 'handtrackjs';

import Page from '../components/Page'
import Container from '../components/Container'
import IndexLayout from '../layouts'

class IndexPage extends React.Component {
  constructor(props: any) {
    super(props);
    handTrack.load().then(model => {
      // detect objects in the image.
      console.log("model loaded");
      console.log(model);
    });
  }

  onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) {
      return;
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
            <canvas ref={this.onCanvasLoaded} />
          </Container>
        </Page>
      </IndexLayout>
    )
  }
}

export default IndexPage
