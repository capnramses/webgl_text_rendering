//
// Example WebGL programme to test text rendering
// Anton Gerdelan, 6 Jan 2015

attribute vec2 vp;
attribute vec2 vt;
varying vec2 st;
uniform vec2 pos;

void main () {
	st = vt;
	gl_Position = vec4 (vp + pos, 0.0, 1.0);
}
