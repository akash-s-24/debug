'use client';

import { useEffect, useRef } from 'react';

export function WebGLBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the shader element from the user's custom HTML logic
    class WebGLShaderElement extends HTMLElement {
      canvas: HTMLCanvasElement;
      gl: WebGLRenderingContext | null;
      program?: WebGLProgram;
      positionLocation?: number;
      timeLocation?: WebGLUniformLocation | null;
      resolutionLocation?: WebGLUniformLocation | null;
      startTime: number = 0;
      animationFrameId?: number;
      resizeObserver: ResizeObserver;

      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.shadowRoot!.appendChild(this.canvas);
        this.gl = this.canvas.getContext('webgl');
        
        this.resizeObserver = new ResizeObserver(() => this.resize());
      }

      connectedCallback() {
        this.resizeObserver.observe(this);
        this.initWebGL();
      }

      disconnectedCallback() {
        this.resizeObserver.disconnect();
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
      }

      resize() {
        if (this.canvas) {
          const rect = this.getBoundingClientRect();
          this.canvas.width = rect.width * window.devicePixelRatio;
          this.canvas.height = rect.height * window.devicePixelRatio;
          if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
          }
        }
      }

      async initWebGL() {
        const gl = this.gl;
        if (!gl) return;

        const vertexShaderSource = `
            attribute vec2 position;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
                v_texCoord = position * 0.5 + 0.5;
            }
        `;

        // The user provided a script for the element but didn't provide the fragment shader source.
        // I will implement a cool matrix/grid shader here to match the "Hacker Lab" theme.
        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            varying vec2 v_texCoord;

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                
                // Subtle dark grid/glow
                float y = mod(uv.y * 100.0 - u_time * 2.0, 1.0);
                float x = mod(uv.x * 100.0, 1.0);
                
                float grid = (step(0.95, y) + step(0.95, x)) * 0.15;
                
                // Dark background with slight green tint
                vec3 color = mix(vec3(0.04, 0.04, 0.04), vec3(0.0, 0.1, 0.05), grid);
                
                // Vignette
                float d = distance(uv, vec2(0.5));
                color *= smoothstep(0.8, 0.2, d);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) return;

        this.program = gl.createProgram()!;
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(this.program));
            return;
        }

        const positions = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
        ]);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        this.positionLocation = gl.getAttribLocation(this.program, "position");
        this.timeLocation = gl.getUniformLocation(this.program, "u_time");
        this.resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");

        this.startTime = performance.now();
        this.render();
      }

      createShader(type: number, source: string) {
        const gl = this.gl!;
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
      }

      render() {
        if (!this.gl || !this.program) return;
        const gl = this.gl;

        gl.useProgram(this.program);

        gl.enableVertexAttribArray(this.positionLocation!);
        gl.vertexAttribPointer(this.positionLocation!, 2, gl.FLOAT, false, 0, 0);

        const currentTime = (performance.now() - this.startTime) * 0.001;
        gl.uniform1f(this.timeLocation!, currentTime);
        gl.uniform2f(this.resolutionLocation!, this.canvas.width, this.canvas.height);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.animationFrameId = requestAnimationFrame(() => this.render());
      }
    }

    if (!customElements.get('webgl-shader')) {
      customElements.define('webgl-shader', WebGLShaderElement);
    }

    const shaderElement = document.createElement('webgl-shader');
    shaderElement.style.width = '100%';
    shaderElement.style.height = '100%';
    shaderElement.style.position = 'absolute';
    shaderElement.style.top = '0';
    shaderElement.style.left = '0';
    shaderElement.style.zIndex = '-10';
    
    containerRef.current.appendChild(shaderElement);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10" />;
}
