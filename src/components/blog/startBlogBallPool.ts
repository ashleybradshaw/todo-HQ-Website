import Matter from "matter-js";

export type BallPoolColors = {
  bg: string;
  fg: string;
};

export type BallPoolHandle = {
  pause: () => void;
  resume: () => void;
  recolor: (colors?: BallPoolColors) => void;
  destroy: () => void;
};

const WALL = 28;
const HQ_BG = "#dfdfff";
const HQ_FG = "#4545ff";

function readHqColors() {
  const root = getComputedStyle(document.documentElement);
  const bg = root.getPropertyValue("--background").trim() || HQ_BG;
  const fg = root.getPropertyValue("--foreground").trim() || HQ_FG;
  return { bg, fg };
}

function sizeOf(host: HTMLElement) {
  const width = Math.max(1, Math.floor(host.clientWidth));
  const height = Math.max(1, Math.floor(host.clientHeight));
  return { width, height };
}

function wallBody(
  x: number,
  y: number,
  w: number,
  h: number,
  fg: string,
) {
  return Matter.Bodies.rectangle(x, y, w, h, {
    isStatic: true,
    label: "wall",
    friction: 0.2,
    render: {
      fillStyle: fg,
      strokeStyle: fg,
      lineWidth: 0,
    },
  });
}

function paintWorld(
  engine: Matter.Engine | null,
  render: Matter.Render | null,
  bg: string,
  fg: string,
) {
  if (render) {
    render.options.background = bg;
    render.canvas.style.background = bg;
  }
  if (!engine) {
    return;
  }
  for (const body of Matter.Composite.allBodies(engine.world)) {
    if (body.label === "wall") {
      body.render.fillStyle = fg;
      body.render.strokeStyle = fg;
      continue;
    }
    if (body.label === "ball-outline") {
      body.render.fillStyle = bg;
      body.render.strokeStyle = fg;
      continue;
    }
    if (body.label === "ball-fill") {
      body.render.fillStyle = fg;
      body.render.strokeStyle = fg;
    }
  }
}

export function startBlogBallPool(
  host: HTMLElement,
  colors?: BallPoolColors,
): BallPoolHandle {
  const { Engine, Render, Runner, Bodies, Composite, Composites, Mouse, MouseConstraint } =
    Matter;

  let engine: Matter.Engine | null = null;
  let render: Matter.Render | null = null;
  let runner: Matter.Runner | null = null;
  let mouse: Matter.Mouse | null = null;
  let palette = colors ?? readHqColors();
  let enabled = true;
  let lastWidth = 0;
  let lastHeight = 0;
  let resizeTimer = 0;

  function teardown() {
    if (runner) {
      Runner.stop(runner);
    }
    if (render) {
      Render.stop(render);
    }
    if (mouse) {
      Mouse.clearSourceEvents(mouse);
    }
    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }
    render?.canvas.remove();
    engine = null;
    render = null;
    runner = null;
    mouse = null;
  }

  function setup() {
    const { width, height } = sizeOf(host);
    lastWidth = width;
    lastHeight = height;
    const { bg, fg } = palette;
    const ratio = Math.min(2, window.devicePixelRatio || 1);

    engine = Engine.create({
      enableSleeping: true,
      gravity: { x: 0, y: 1, scale: 0.001 },
    });

    render = Render.create({
      element: host,
      engine,
      options: {
        width,
        height,
        pixelRatio: ratio,
        wireframes: false,
        background: bg,
        showSleeping: false,
        showAngleIndicator: false,
      },
    });

    render.canvas.style.display = "block";
    render.canvas.style.width = "100%";
    render.canvas.style.height = "100%";
    render.canvas.style.touchAction = "none";
    render.canvas.setAttribute("aria-hidden", "true");

    runner = Runner.create();

    const floor = wallBody(width / 2, height + WALL / 2 - 2, width + WALL * 2, WALL, fg);
    const ceiling = wallBody(width / 2, -WALL / 2 + 2, width + WALL * 2, WALL, fg);
    const left = wallBody(-WALL / 2 + 2, height / 2, WALL, height + WALL * 2, fg);
    const right = wallBody(width + WALL / 2 - 2, height / 2, WALL, height + WALL * 2, fg);

    const cols = Math.max(8, Math.min(16, Math.floor((width - 48) / 46)));
    const rows = Math.max(3, Math.min(5, Math.floor(height / 150)));
    const stack = Composites.stack(32, 28, cols, rows, 4, 4, (x: number, y: number) => {
      const radius = 11 + ((x + y) % 13);
      const outline = (Math.round(x) + Math.round(y)) % 3 === 0;
      return Bodies.circle(x, y, radius, {
        restitution: 0.82,
        friction: 0.04,
        frictionAir: 0.012,
        density: 0.0016,
        label: outline ? "ball-outline" : "ball-fill",
        render: outline
          ? { fillStyle: bg, strokeStyle: fg, lineWidth: 2 }
          : { fillStyle: fg, strokeStyle: fg, lineWidth: 0 },
      });
    });

    Composite.add(engine.world, [floor, ceiling, left, right, stack]);

    mouse = Mouse.create(render.canvas);
    mouse.pixelRatio = ratio;
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);
    Object.assign(render, { mouse });

    if (enabled) {
      Runner.run(runner, engine);
      Render.run(render);
    }
  }

  function pause() {
    enabled = false;
    if (runner) {
      Runner.stop(runner);
    }
    if (render) {
      Render.stop(render);
    }
  }

  function resume() {
    enabled = true;
    if (runner && engine) {
      Runner.run(runner, engine);
    }
    if (render) {
      Render.run(render);
    }
  }

  setup();

  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const { width, height } = sizeOf(host);
      if (Math.abs(width - lastWidth) < 2 && Math.abs(height - lastHeight) < 2) {
        return;
      }
      teardown();
      setup();
    }, 160);
  };

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(host);

  return {
    pause,
    resume,
    recolor(next) {
      palette = next ?? readHqColors();
      paintWorld(engine, render, palette.bg, palette.fg);
    },
    destroy() {
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      teardown();
    },
  };
}
