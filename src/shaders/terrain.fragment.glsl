precision highp float;

varying vec4 vColor;
varying vec3 vNormal;

void main(void) {
  float light = clamp(dot(normalize(vNormal), normalize(vec3(0.35, 0.9, 0.25))) * 0.35 + 0.72, 0.0, 1.0);
  gl_FragColor = vec4(vColor.rgb * light, vColor.a);
}
