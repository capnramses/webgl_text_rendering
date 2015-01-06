//
// Example WebGL programme to test text rendering
// Anton Gerdelan, 6 Jan 2015

precision mediump float;

varying vec2 st;
uniform sampler2D tex;
uniform vec4 text_colour;

void main () {
	gl_FragColor = texture2D (tex, st) * text_colour;
}
