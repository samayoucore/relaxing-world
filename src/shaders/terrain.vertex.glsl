precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;

uniform mat4 worldViewProjection;

varying vec4 vColor;
varying vec3 vNormal;

void main(void) {
  vColor = color;
  vNormal = normal;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}
