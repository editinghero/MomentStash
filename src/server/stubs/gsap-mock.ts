const noop = (..._args: unknown[]) => noop;
const timeline = Object.assign(noop, {
  to: noop,
  from: noop,
  fromTo: noop,
  set: noop,
  add: noop,
  kill: noop,
  play: noop,
  pause: noop,
  reverse: noop,
  seek: noop,
  progress: noop,
  clear: noop,
  eventCallback: noop,
});

const gsap = Object.assign(noop, {
  to: noop,
  from: noop,
  fromTo: noop,
  set: noop,
  timeline: () => timeline,
  registerPlugin: noop,
  matchMedia: noop,
  getById: () => undefined,
  globalTimeline: timeline,
  ticker: {
    add: noop,
    remove: noop,
    fps: () => {},
  },
  utils: {
    toArray: () => [],
    selector: () => () => [],
    checkPrefix: () => "",
  },
  config: noop,
  default: undefined,
});

const ScrollTrigger = {
  create: noop,
  refresh: noop,
  getAll: () => [],
  getById: () => undefined,
  kill: noop,
  sort: noop,
  config: noop,
  isTouch: 0,
  isInViewport: () => false,
};

export { ScrollTrigger };
export default gsap;
