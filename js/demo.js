//
// Example WebGL programme to test text rendering
// Anton Gerdelan, 6 Jan 2015

var font_img = "fonts/freemono.png"
var font_meta = "fonts/freemono.meta"

var canvas;
var gl;
var gl_width;
var gl_height;

main ();

function main () {
	canvas = document.getElementById ("canvas");
	gl = WebGLUtils.setupWebGL (canvas);
	canvas_resize ();
	
	//
	// load font shaders etc.
	init_text_rendering ();
	//
	// load the font image and meta-data files
	load_font (font_img, font_meta);
	
	gl.clearColor (0.2, 0.2, 0.2, 1.0);
	gl.enable (gl.DEPTH_TEST);
	gl.cullFace (gl.BACK);
	gl.frontFace (gl.CCW);
	gl.enable (gl.CULL_FACE);
	gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	update ();
}

function canvas_resize () {
	gl_width = canvas.clientWidth;
	gl_height = canvas.clientHeight;
	gl.viewport (0, 0, gl_width, gl_height);
	console.log ("client canvas size: " + gl_width + "x" + gl_height);
}


function update () {
	draw ();
	window.requestAnimFrame (update, canvas);
}

function draw () {
	gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
