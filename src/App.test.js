import App from "./App";

Object.defineProperty(global.document, "createElement", {
  value: jest.fn(),
  writable: true
});
Object.defineProperty(global.window, "addEventListener", { value: jest.fn() });
Object.defineProperty(global.window, "getComputedStyle", { value: jest.fn() });
Object.defineProperty(global.window, "devicePixelRatio", {
  value: undefined,
  writable: true
});
Object.defineProperty(global.window, "requestAnimationFrame", {
  value: jest.fn()
});
Object.defineProperty(global.console, "error", {
  value: jest.fn()
});

jest.mock("./shaders/particle.vert", () => "vertex shader");
jest.mock("./shaders/particle.frag", () => "fragment shader");
jest.mock("./Particle", () => {
  return class Particle {
    static get radius() {
      return 30;
    }

    constructor(props) {
      const { x, y } = props;

      this.position = { x: x, y: y };
      this.velocity = { x: 0, y: 0 };
      this.restitution = -0.8;
      this.mass = 30;
    }
  };
});
jest.mock("./webgl", () => {
  return {
    createShader: () => "shader",
    createProgram: (gl, vertexShader, fragmentShader) => {
      return { gl, vertexShader, fragmentShader };
    }
  };
});

describe("App", () => {
  let canvas;

  beforeEach(() => {
    const { createElement } = global.document;

    createElement.mockImplementation(() => ({
      className: undefined,
      addEventListener: jest.fn(),
      appendChild: jest.fn(el => (canvas = el)),
      getContext: () => ({
        VERTEX_SHADER: "VERTEX_SHADER",
        FRAGMENT_SHADER: "FRAGMENT_SHADER",
        canvas: {
          width: undefined,
          height: undefined
        },
        viewport: jest.fn(),
        useProgram: jest.fn(),
        getAttribLocation: jest.fn(),
        enableVertexAttribArray: jest.fn(),
        bindBuffer: jest.fn(),
        vertexAttribPointer: jest.fn(),
        uniform1f: jest.fn(),
        getUniformLocation: jest.fn(),
        createBuffer: jest.fn(),
        bufferData: jest.fn(),
        drawArrays: jest.fn()
      })
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should instantiate without error", () => {
    const { createElement } = global.document;
    const { addEventListener } = global.window;

    const onResize = jest
      .spyOn(App.prototype, "onResize")
      .mockImplementation(jest.fn());
    const onMouseUp = jest
      .spyOn(App.prototype, "onMouseUp")
      .mockImplementation(jest.fn());

    const app = new App();

    expect(createElement).toHaveBeenCalledWith("div");
    expect(app.el.className).toBe("app");
    expect(createElement).toHaveBeenCalledWith("canvas");
    expect(canvas.className).toBe("canvas");

    expect(canvas.addEventListener.mock.calls[0][0]).toBe("mouseup");
    expect(canvas.addEventListener.mock.calls[0][1].toString()).toBe(
      onMouseUp.bind(app).toString()
    );
    expect(addEventListener.mock.calls[0][0]).toBe("resize");
    expect(addEventListener.mock.calls[0][1].toString()).toBe(
      onResize.bind(app).toString()
    );
    expect(addEventListener.mock.calls[1][0]).toBe("DOMContentLoaded");
    expect(addEventListener.mock.calls[1][1].toString()).toBe(
      onResize.bind(app).toString()
    );

    App.prototype.onResize.mockRestore();
    App.prototype.onMouseUp.mockRestore();
  });

  it("should throw an Error if it failed to get webgl context from browser", () => {
    global.document.createElement.mockImplementation(() => ({
      className: undefined,
      addEventListener: jest.fn(),
      appendChild: jest.fn(),
      getContext: () => {
        throw new Error("getContext error");
      }
    }));
    const displayError = jest
      .spyOn(App.prototype, "displayError")
      .mockImplementation(jest.fn());

    const app = new App();

    expect(displayError).toHaveBeenCalledWith(new Error("getContext error"));

    App.prototype.displayError.mockRestore();
  });

  it("should start without error", () => {
    const app = new App();
    const initializeShaderProgram = jest
      .spyOn(app, "initializeShaderProgram")
      .mockImplementation(jest.fn());
    const setShaderProperties = jest
      .spyOn(app, "setShaderProperties")
      .mockImplementation(jest.fn());
    const animate = jest.spyOn(app, "animate").mockImplementation(jest.fn());

    app.start();

    expect(initializeShaderProgram).toHaveBeenCalled();
    expect(setShaderProperties).toHaveBeenCalled();
    expect(animate).toHaveBeenCalled();
  });

  it("should throw an Error if any of subsequent calls fail after the start", () => {
    const app = new App();
    const initializeShaderProgram = jest
      .spyOn(app, "initializeShaderProgram")
      .mockImplementation(() => {
        throw new Error("initializeShaderProgram Error");
      });
    const setShaderProperties = jest
      .spyOn(app, "setShaderProperties")
      .mockImplementation(jest.fn());
    const animate = jest.spyOn(app, "animate").mockImplementation(jest.fn());
    const displayError = jest
      .spyOn(app, "displayError")
      .mockImplementation(jest.fn());

    app.start();

    expect(displayError).toHaveBeenCalledWith(
      new Error("initializeShaderProgram Error")
    );
  });

  it("should return computed dimensions of element", () => {
    const app = new App();
    global.window.getComputedStyle.mockImplementation(() => ({
      getPropertyValue: property => {
        if (property === "width") return "123px";
        if (property === "height") return "321px";
      }
    }));

    expect(app.getComputedElementDimensions()).toEqual({
      width: 123,
      height: 321
    });
  });

  it("should set renderer dimensions to the size of canvas", () => {
    const app = new App();
    const getComputedElementDimensions = jest
      .spyOn(app, "getComputedElementDimensions")
      .mockImplementation(() => ({ width: 123, height: 321 }));
    global.window.devicePixelRatio = 2;

    app.onResize();

    expect(app.gl.canvas).toEqual({
      width: 246,
      height: 642
    });

    global.window.devicePixelRatio = undefined;
  });

  it("should create new Particle from the position of mouse pointer", () => {
    const app = new App();
    const getComputedElementDimensions = jest
      .spyOn(app, "getComputedElementDimensions")
      .mockImplementation(() => ({ width: 123, height: 321 }));

    app.onMouseUp({
      clientX: 234,
      clientY: 456
    });

    expect(app.particles[0]).toEqual({
      position: { x: 2.8048780487804876, y: -1.8411214953271027 },
      velocity: { x: 0, y: 0 },
      restitution: -0.8,
      mass: 30
    });
  });

  it("should initialize shader program", () => {
    const app = new App();
    const getComputedElementDimensions = jest.spyOn(
      app,
      "getComputedElementDimensions"
    );

    app.initializeShaderProgram();

    expect(app.gl.useProgram).toHaveBeenCalledWith({
      gl: app.gl,
      vertexShader: "shader",
      fragmentShader: "shader"
    });
  });

  it("should set shader properties", () => {
    const app = new App();
    const attribLocation = jest
      .spyOn(app.gl, "getAttribLocation")
      .mockImplementation(() => "attribLocation");
    const enableVertexAttribArray = jest.spyOn(
      app.gl,
      "enableVertexAttribArray"
    );
    const bindBuffer = jest.spyOn(app.gl, "bindBuffer");
    const createBuffer = jest
      .spyOn(app.gl, "createBuffer")
      .mockImplementation(() => "createBuffer");
    const vertexAttribPointer = jest.spyOn(app.gl, "vertexAttribPointer");
    const uniform1f = jest.spyOn(app.gl, "uniform1f");
    const getUniformLocation = jest
      .spyOn(app.gl, "getUniformLocation")
      .mockImplementation(() => "getUniformLocation");

    app.setShaderProperties();

    expect(attribLocation).toHaveBeenCalledWith(app.gl.program, "position");
    expect(enableVertexAttribArray).toHaveBeenCalledWith("attribLocation");
    expect(bindBuffer).toHaveBeenCalledWith(
      app.gl.ARRAY_BUFFER,
      "createBuffer"
    );
    expect(vertexAttribPointer).toHaveBeenCalledWith(
      "attribLocation",
      2,
      app.gl.FLOAT,
      false,
      0,
      0
    );
    expect(uniform1f).toHaveBeenCalledWith("getUniformLocation", 30);
    expect(getUniformLocation).toHaveBeenCalledWith(app.gl.program, "radius");
  });

  it("should animate", () => {
    const app = new App();
    const render = jest.spyOn(app, "render");
    const setBufferData = jest.spyOn(app, "setBufferData");
    const requestAnimationFrame = jest.spyOn(window, "requestAnimationFrame");

    app.animate();

    expect(render).toHaveBeenCalled();
    expect(setBufferData).toHaveBeenCalled();
    expect(requestAnimationFrame).toHaveBeenCalledWith(app.animate);
  });

  it("should set buffer data if particles length is > 0", () => {
    const app = new App();
    const bufferData = jest.spyOn(app.gl, "bufferData");
    const drawArrays = jest.spyOn(app.gl, "drawArrays");
    jest
      .spyOn(app, "getComputedElementDimensions")
      .mockImplementation(() => ({ width: 123, height: 321 }));

    app.onMouseUp({
      clientX: 234,
      clientY: 456
    });
    app.setBufferData();

    expect(bufferData).toHaveBeenCalledWith(
      app.gl.ARRAY_BUFFER,
      new Float32Array([2.804877996444702, -1.8411215543746948]),
      app.gl.STATIC_DRAW
    );
    expect(drawArrays).toHaveBeenCalledWith(
      app.gl.POINTS,
      0,
      app.particles.length
    );
  });

  it("should not set buffer data if particles are empty", () => {
    const app = new App();
    const bufferData = jest.spyOn(app.gl, "bufferData");

    app.setBufferData();

    expect(bufferData).not.toHaveBeenCalled();
  });

  it("should remove particles if goes out of screen", () => {
    const app = new App();
    app.gl.canvas.height = 200;
    global.window.devicePixelRatio = 2;
    jest
      .spyOn(app, "getComputedElementDimensions")
      .mockImplementation(() => ({ width: 100, height: 100 }));

    app.onMouseUp({
      clientX: 10,
      clientY: 10
    });
    app.onMouseUp({
      clientX: 10000,
      clientY: 10
    });
    app.render();

    expect(app.particles).toHaveLength(1);

    global.window.devicePixelRatio = undefined;
  });

  it("should return an container element", () => {
    const app = new App();
    expect(app.getElement()).toEqual(app.el);
  });

  it("should display an error message", () => {
    const app = new App();
    app.displayError();
    expect(app.el.innerHTML).toEqual(`
    <p>
      Sorry! Your browser doesn't seem to support webgl<br/>
      Please try again in different browsers
    </p>`);
  });
});
