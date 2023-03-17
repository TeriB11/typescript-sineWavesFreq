import { CanvasRenderer } from './Plotter';
import { Color } from './src/Color';
import { GraphingCanvas, MathStr } from './src/GraphingCanvas';
import { Rect } from './src/Rect';
import { Vec2 } from './src/Vec2';

const size = 400;

let hoverPoint : Vec2 | undefined

const graphingCanvas = GraphingCanvas.root({
  size,
  viewport: Rect.createRanges([-2, 2], [-2, 2]),
  onMouseMove: (p) => {
    hoverPoint = p
  },
});

//graphingCanvas.addTitlePlacard('Yo!');
//graphingCanvas.addRangePlacard();

const basicParabola = (x : number) => x*x

/*
  Let's stretch a graph verticall by 2x
  Take the point (x, y)
  And it becomes (x, 2y)

  Learned:
    * a*f(x)    scales the graph by a
    * f(x)+b    moves the graph up by b
    * f(x/c)    stretches by c
    * f(x+d)    moves to the left by d (right if d negative)
*/

/*
  What is the period of y = sin(2x) ?
    Pi!
  What is the frequency?
    f = 1/Period
  Angular frequency:
    f = 1/(2*Pi*Period)
*/

/*
  What frequency do you need (e.g. oscillations per second)
  to be heard by a typical human?

  Typical human range: 20 Hz to 20 KHz
  Hz is "Hertz" which means "somethings per second"

  440 Hz is Middle is most western tempered tunings

*/

/*
  In the instruments we are used to (mostly)
    If 10 Hz is the base frequency
    then the following are also possible at the same time:
  
    10: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,...
    20:     20,     40,     60,     80,     100,      120,...
    40:             40,             80,               120,...
    80:                             80,               ...
*/

/*
  Let's dig into this a step further...

  If the base frequency is f
  You will hear some 2*f        (2:1 prev freq, 2:1 base)
  and less 3*f                  (3:2 prev freq, 3:1 base)
  and even less 4*f             (4:3 prev freq, 4:1 base)


  What notes sound similar ("octaves") to f?
    2f, 4f, 8f, 16f, 0.5f, 0.25f, .125f, ... 

  What notes sound similar to 2f? all the same ones...

  What notes sound similar to 3f?
    3f, 6f, 12f, 24f, 1.5f, 0.75f, .375f, ...
*/

let t = 0

function sinWave(f : number, x : number) {
  return Math.sin(Math.PI/2*f*x)
}

/*

C -> C# -> D -> D# -> E -> F -> F# -> G -> G# -> A -> A# -> B -> C

f = 2^(1/12)

*/

const rendererGroup : CanvasRenderer[] = Array.from({length : 26}, (_, idx) => {
  return (canvas) => {
    const f = Math.pow(2, idx/12)
    const x = Math.sin(f*t)

    canvas.drawCircle(new Vec2(x, idx*0.15 - 1.85), canvas.pixelThickness * 10, new Color(1, 0, 0))
  }
})

graphingCanvas.renderers = [
  (canvas) => {
    if (hoverPoint) {
      canvas.drawCircle(hoverPoint, canvas.pixelThickness * 5, Color.black)
    }
  },
  // makeFunctionRenderer(x => {
  //   t += 0.0001
  //   const amplitude = 1//Math.sin(t)

  //   return amplitude*(
  //     sinWave(1, x) +
  //     sinWave(2, x)*0.25 +
  //     sinWave(3, x)*0.05 +
  //     sinWave(4, x)*0.01
  //   )
  // }, new Color(0, 1, 0), 400),
  // makeFunctionRenderer(x => sinWave(1, x), new Color(0, 1, 0), 400),
  // makeFunctionRenderer(x => sinWave(2, x), new Color(1, 0.5, 0), 400),
  ...rendererGroup,
];

function renderScene() {
  t += 0.01
  graphingCanvas.render();
}

const tickRateMs = 1000 / 60;
graphingCanvas.drawCanvas.runRenderLoop(tickRateMs, () => {
renderScene();
});

function makeFunctionRenderer(fn : (x : number) => number, color: Color, numSteps : number): CanvasRenderer {
  return (canvas, viewport) => {
    const minX = viewport.origin.x
    const maxX = viewport.farCorner.x

    let lastPosition : Vec2 | undefined = undefined

    for (let x = minX; x <= maxX; x += viewport.size.x/(numSteps - 1)) {
      const y = fn(x)
      const pos = new Vec2(x, y)

      if (lastPosition) {
        canvas.drawLine(lastPosition, pos, color, canvas.pixelThickness*3)
      }
      lastPosition = pos
    }
  }
}