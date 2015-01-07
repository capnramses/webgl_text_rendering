//
// Example WebGL programme to test text rendering
// Anton Gerdelan, 6 Jan 2015

/*
API:

init_text_rendering (viewport_width, viewport_height)
load_font (image, meta)
txt_id = add_text (str, x, y, size_in_px, r, g, b, a)
update_text (id, str)
change_text_colour (id, r, g, b, a)
draw_texts ()
*/

var ATLAS_COLS = 16;
var ATLAS_ROWS = 16;

var font_texture;

var font_sp;
var font_vs = "shaders/font.vert";
var font_fs = "shaders/font.frag";
var font_text_colour_loc;

var glyph_widths = new Array ();
var glyph_y_offsets = new Array ();

var renderable_texts = new Array ();

var font_viewport_width, font_viewport_height;

function init_text_rendering (viewport_width, viewport_height) {
	//
	// get around JavaScripts complete failure to allow you to create a new array
	// of certain length
	for (var i = 0; i < 256; i++) {
		glyph_widths.push (0.0);
		glyph_y_offsets.push (0.0);
	}

	console.log ("loading font shaders " + font_vs + " " + font_fs);
	font_sp = load_shaders_from_files (font_vs, font_fs);
	gl.bindAttribLocation (font_sp, 0, "vp");
	gl.bindAttribLocation (font_sp, 1, "vt");
	gl.linkProgram (font_sp);
	font_text_colour_loc = get_uniform_loc (font_sp, "text_colour");
	font_viewport_width = viewport_width;
	font_viewport_height = viewport_height;
}

function load_font (image, meta) {
	font_texture = create_texture_from_file (image);
	load_font_meta (meta);
}

function load_font_meta (meta) {
	console.log ("loading meta " + meta);
	var str = get_string_from_URL (meta);
	var lines = str.split ('\n');
	
	// skip header line
	// loop through and get each glyph's info
	for (var i = 1; i < lines.length; i++) {
		var toks = lines[i].split (' ');
		// %i %f %f %f %f %f\n
		var ascii = parseInt (toks[0]);
		//var xmin = parseFloat (toks[1]);
		var width = parseFloat (toks[2]);
		//var ymin = parseFloat (toks[3]);
		var height = parseFloat (toks[4]);
		var y_offset = parseFloat (toks[5]);
		
		glyph_widths[ascii] = width;
		glyph_y_offsets[ascii] = 1.0 - height - y_offset;
	}
}

//
// create a VBO from a string of text, using our font's glyph sizes to make a
// set of quads
function text_to_vbo (str, at_x, at_y, scale_px, id) {
	var curr_x = at_x;
	var len = str.length;
	var points_tmp = new Array ();
	var texcoords_tmp = new Array ();
	var line_offset = 0.0;
	var curr_index = 0;
	var x_pos = 0.0;
	var y_pos = 0.0;
	for (var i = 0; i < len; i++) {
		if ('\n' == str[i]) {
			line_offset += scale_px / font_viewport_height;
			curr_x = at_x;
			continue;
		}
	
		// get ascii code as integer
		var ascii_code = str[i].charCodeAt (0);
	
		// work out row and column in atlas
		var atlas_col = (ascii_code - ' '.charCodeAt (0)) % ATLAS_COLS;
		var atlas_row = Math.floor ((ascii_code - ' '.charCodeAt (0)) /
			ATLAS_COLS);
	
		// work out texture coordinates in atlas
		s = atlas_col * (1.0 / ATLAS_COLS);
		t = (atlas_row + 1) * (1.0 / ATLAS_ROWS);
		
		// work out position of glyphtriangle_width
		x_pos = curr_x;
		y_pos = at_y - scale_px / font_viewport_height *
			glyph_y_offsets[ascii_code] - line_offset;
		
		// move next glyph along to the end of this one
		if (i + 1 < len) {
			// upper-case letters move twice as far
			curr_x += glyph_widths[ascii_code] * scale_px / font_viewport_width;
		}
		// add 6 points and texture coordinates to buffers for each glyph
		points_tmp.push (x_pos);
		points_tmp.push (y_pos);
		points_tmp.push (x_pos);
		points_tmp.push (y_pos - scale_px / font_viewport_height);
		points_tmp.push (x_pos + scale_px / font_viewport_width);
		points_tmp.push (y_pos - scale_px / font_viewport_height);
		
		points_tmp.push (x_pos + scale_px / font_viewport_width);
		points_tmp.push (y_pos - scale_px / font_viewport_height);
		points_tmp.push (x_pos + scale_px / font_viewport_width);
		points_tmp.push (y_pos);
		points_tmp.push (x_pos);
		points_tmp.push (y_pos);
		
		texcoords_tmp.push (s);
		texcoords_tmp.push (1.0 - t + 1.0 / ATLAS_ROWS);
		texcoords_tmp.push (s);
		texcoords_tmp.push (1.0 - t);
		texcoords_tmp.push (s + 1.0 / ATLAS_COLS);
		texcoords_tmp.push (1.0 - t);
		
		texcoords_tmp.push (s + 1.0 / ATLAS_COLS);
		texcoords_tmp.push (1.0 - t);
		texcoords_tmp.push (s + 1.0 / ATLAS_COLS);
		texcoords_tmp.push (1.0 - t + 1.0 / ATLAS_ROWS);
		texcoords_tmp.push (s);
		texcoords_tmp.push (1.0 - t + 1.0 / ATLAS_ROWS);
		//alert (points_tmp);
		curr_index++;
	}
	gl.bindBuffer (gl.ARRAY_BUFFER, renderable_texts[id].points_vbo);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (points_tmp),
		gl.DYNAMIC_DRAW)
	gl.bindBuffer (gl.ARRAY_BUFFER, renderable_texts[id].texcoords_vbo);
	gl.bufferData (gl.ARRAY_BUFFER, new Float32Array (texcoords_tmp),
		gl.DYNAMIC_DRAW)
	renderable_texts[id].point_count = curr_index * 6;
}

//
// add a string of text to render on-screen
// returns an integer to identify it with later if we want to change the text
// returns <0 on error
// x,y are position of the bottom-left of the first character in clip space
// size_is_px is the size of maximum-sized glyph in pixels on screen
// r, g, b, a is the colour of the text string
function add_text (str, x, y, size_in_px, r, g, b, a) {
	var rstr = new Object ();

	rstr.x = x;
	rstr.y = y;
	rstr.size_px = size_in_px;
	
	rstr.points_vbo = gl.createBuffer ();
	rstr.texcoords_vbo = gl.createBuffer ();
	rstr.r = r;
	rstr.g = g;
	rstr.b = b;
	rstr.a = a;
	renderable_texts.push (rstr);
	
	text_to_vbo (str, x, y, size_in_px, renderable_texts.length - 1);
	
	console.log ("string " + (renderable_texts.length - 1) +
		" added to render texts. " + "point count " + rstr.point_count);
	
	return renderable_texts.length - 1;
}

function update_text (id, str) {
	// just re-generate the existing VBOs and point count
	text_to_vbo (str, renderable_texts[id].x, renderable_texts[id].y,
		renderable_texts[id].size_px, id);
}

function change_text_colour (id, r, g, b, a) {
	renderable_texts[id].r = r;
	renderable_texts[id].g = g;
	renderable_texts[id].b = b;
	renderable_texts[id].a = a;
}

function draw_texts () {
	// always draw on-top of scene
	gl.disable (gl.DEPTH_TEST);
	gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable (gl.BLEND);
	
	gl.activeTexture (gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, font_texture);
	gl.useProgram (font_sp);
	for (var i = 0; i < renderable_texts.length; i++) {
		gl.uniform4f (font_text_colour_loc,
			renderable_texts[i].r,
			renderable_texts[i].g,
			renderable_texts[i].b,
			renderable_texts[i].a);
		
		gl.bindBuffer (gl.ARRAY_BUFFER, renderable_texts[i].points_vbo);
		gl.vertexAttribPointer (0, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer (gl.ARRAY_BUFFER, renderable_texts[i].texcoords_vbo);
		gl.vertexAttribPointer (1, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray (0);
		gl.enableVertexAttribArray (1);
		gl.drawArrays (gl.TRIANGLES, 0, renderable_texts[i].point_count);
		gl.disableVertexAttribArray (0);
		gl.disableVertexAttribArray (1);
	}
	gl.enable (gl.DEPTH_TEST);
}

