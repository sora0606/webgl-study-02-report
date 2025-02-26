precision highp float;
precision highp int;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}