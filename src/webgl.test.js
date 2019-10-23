import * as webgl from "./webgl";

describe("createShader()", () => {
  let gl;

  beforeEach(() => {
    gl = {
      COMPILE_STATUS: "COMPILE_STATUS",
      createShader: jest.fn(),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      getShaderParameter: jest.fn(),
      getShaderInfoLog: jest.fn(),
      deleteShader: jest.fn(),
      createProgram: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      getProgramParameter: jest.fn(),
      getProgramInfoLog: jest.fn(),
      deleteProgram: jest.fn()
    };
  });

  it("should return compiled shader if shader source is valid", () => {
    gl.createShader.mockImplementation(() => "shader");
    gl.getShaderParameter.mockImplementation(() => true);

    const shader = webgl.createShader(gl, "type", "source");

    expect(gl.createShader).toHaveBeenCalledWith("type");
    expect(gl.shaderSource).toHaveBeenCalledWith("shader", "source");
    expect(gl.compileShader).toHaveBeenCalledWith("shader");
    expect(shader).toBe("shader");
  });

  it("should throw an Error if the shader fails to compile", () => {
    gl.getShaderParameter.mockImplementation(() => false);
    gl.createShader.mockImplementation(() => "shader");

    expect(() => webgl.createShader(gl, "type", "source")).toThrow(Error);

    expect(gl.getShaderInfoLog).toHaveBeenCalledWith("shader");
    expect(gl.deleteShader).toHaveBeenCalledWith("shader");
  });

  it("should return program if program is successfully created", () => {
    gl.createProgram.mockImplementation(() => "program");
    gl.getProgramParameter.mockImplementation(() => true);

    const program = webgl.createProgram(gl, "vertexShader", "fragmentShader");

    expect(gl.createProgram).toHaveBeenCalled();
    expect(gl.attachShader).toHaveBeenNthCalledWith(
      1,
      "program",
      "vertexShader"
    );
    expect(gl.attachShader).toHaveBeenNthCalledWith(
      2,
      "program",
      "fragmentShader"
    );
    expect(gl.linkProgram).toHaveBeenCalledWith("program");
    expect(program).toBe("program");
  });

  it("should throw an Error if the program fails to create", () => {
    gl.createProgram.mockImplementation(() => "program");
    gl.getProgramParameter.mockImplementation(() => false);

    expect(() =>
      webgl.createProgram(gl, "vertexShader", "fragmentShader")
    ).toThrow(Error);

    expect(gl.getProgramInfoLog).toHaveBeenCalledWith("program");
    expect(gl.deleteProgram).toHaveBeenCalledWith("program");
  });
});
