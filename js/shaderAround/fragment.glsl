uniform float time;
uniform float progress;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewDir;

float PI = 3.141592653589793238;

vec3 brightnessToColor(float b) {
    b *= 0.25;
    return (vec3(b, b * b, b * b * b * b) / 0.25) * 0.8;
}

void main() {
    float radial = 1.0 - abs(vNormal.z);
    radial = pow(radial, 2.0);

    float brightness = 1.0 + radial * 0.83;

    gl_FragColor.rgb = brightnessToColor(brightness) * radial;
    gl_FragColor.a = radial;
}