import React from 'react';
import _maxBy from 'lodash/maxBy';

import {coords} from './coords';

const maxX = _maxBy(coords, item => item.x).x;
const maxY = _maxBy(coords, item => item.y).y;

const HEIGHT = 500;
const WIDTH = 500;

function setEvent(target, eventName, fn) {
  const event = target.addEventListener(eventName, fn);
  const offEvent = () => {
    target.removeEventListener(eventName, fn);
  };

  return {
    nativeEvent: event,
    removeEvent: offEvent,
  };
}

class App extends React.Component {

  state = { x: 0, y: 0 };

  eventMove = null;
  eventUp = null;
  eventDown = null;
  canvas = React.createRef();

  componentDidMount() {
    this.draw();
    this.events();
  }

  componentDidUpdate() {
    this.draw();
  }

  draw = () => {
    const canvas = this.canvas.current;
    if (!canvas) return;

    const pos = this.state;
    const ctx = canvas.getContext("2d");
    const rectCanvas = canvas.getBoundingClientRect();
    const { width, height } = rectCanvas;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "red";

    const rect = {
      x1: -pos.x,
      x2: -pos.x + width,
      y1: -pos.y,
      y2: -pos.y + height,
    };

    const filteredCoords = coords.filter(({ x, y }) => {
      return (rect.x1 <= x && rect.x2 >= x && rect.y1 <= y && rect.y2 >= y);
    }).map(({ x, y }) => ({ x: pos.x + x, y: pos.y + y }));

    for (let i = 0; i < filteredCoords.length; i++) {
      const { x, y } = filteredCoords[i];
      ctx.fillRect(x, y, 10, 10);
    }
  }

  events = () => {
    const canvas = this.canvas.current;
    let { eventMove, eventUp, eventDown } = this;
    if (eventDown) eventDown.removeEvent();
    if (eventUp) eventUp.removeEvent();
    if (eventMove) eventMove.removeEvent();

    const onDown = (MDevent) => {
      const firstMousePos = {
        x: MDevent.clientX,
        y: MDevent.clientY
      };

      const pos = this.state;
      const onMove = (MMevent) => {
        const secondMousePos = {
          x: MMevent.clientX,
          y: MMevent.clientY
        };

        let posX = secondMousePos.x - firstMousePos.x + pos.x;
        if (posX > 0) posX = 0;
        if (posX < -maxX + WIDTH) posX = -maxX + WIDTH - 1; //1px for right point

        let posY = secondMousePos.y - firstMousePos.y + pos.y;
        if (posY > 0) posY = 0;
        if (posY < -maxY + HEIGHT) posY = -maxY + HEIGHT - 1; //1px for bottom point

        this.setState({ x: posX, y: posY });
      };

      const onUp = () => {
        if (eventUp) eventUp.removeEvent();
        if (eventMove) eventMove.removeEvent();
      };

      eventUp = setEvent(document, 'mouseup', onUp);
      eventMove = setEvent(canvas, 'mousemove', onMove);
    }

    this.eventDown = setEvent(canvas, 'mousedown', onDown);
  }

  componentWillUnmount() {
    const { eventMove, eventUp, eventDown } = this;

    if (eventDown) eventDown.removeEvent();
    if (eventUp) eventUp.removeEvent();
    if (eventMove) eventMove.removeEvent();
  }

  render() {
    return (
      <canvas
        ref={this.canvas}
        width={WIDTH}
        height={HEIGHT}
      />
    );
  }
}

export default App;
