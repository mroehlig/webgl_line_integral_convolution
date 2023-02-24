// Uniforms.
uniform sampler2D field;

// Glpyh data.
uniform float glyph_grid_size;
uniform float glyph_size;
uniform vec3 glyph_color;
uniform float glyph_alpha;

// Varyings.
in vec2 texcoord;

// Outputs.
out vec4 frag_color;

// Functions.
float gridLine(float position, float line_count, float line_width) {
  float f = abs(fract(position * line_count - 0.5) - 0.5);
  float df = fwidth(position * line_count);
  float fmin = max(0.0, line_width - 1.0);
  float fmax = max(1.0, line_width);
  return clamp((f - df * fmin) / (df * (fmax - fmin)),
               max(0.0, 1.0 - line_width),
               1.0);
}

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float arrow(vec2 p, vec2 a, vec2 b, vec2 size) {
  vec2 dir = b - a;
  vec2 dirP = vec2(-dir.y, dir.x);

  float shaft = sdSegment(p, a, b);
  float head = min(sdSegment(p, b, b - dir * size.x + size.y * dirP),
                   sdSegment(p, b, b - dir * size.x - size.y * dirP));
  return min(head, shaft);
}

// Main.
void main() {
  vec2 uv = texcoord;

  // Get grid dimensions.
  ivec2 size = textureSize(field, 0);
  float width = glyph_grid_size;//float(size.x);
  float height = glyph_grid_size;//float(size.y);

  // Determine grid cell.
  vec2 cell = floor(uv * vec2(width, height));

  // Get normalized cell coordinates.
  vec2 cellUv = (fract(uv * vec2(width, height)) - 0.5);

  // Get vector data for cell.
  vec2 data = texture(field, texcoord).xy;
  vec2 dir = normalize(data);
  float mag = length(data);

  // Initialize color and alpha
  vec3 color = vec3(0.0, 0.0, 0.0);
  float alpha = 1.0;

  // Assign color based on direction.
  color = vec3(dir * 0.5 + 0.5, 0.0);
  //color = vec3(1.0);

  // Draw grid lines.
  // float line = gridLine(uv.x, width, 1.0);
  // line *= gridLine(uv.y, height, 1.0);
  // color = mix(vec3(0.25), color, line);



  // Draw line segment oriented by vector direction in cell.
  float lineLength = clamp(mag * glyph_size, 0.01, 1.0);
  float lineWidth = 0.05;
  // float lineDist = sdSegment(cellUv, -dir * lineLength, dir * lineLength);
  // float lineCutoff = smoothstep(0.0, lineWidth, lineDist);
  // color = mix(vec3(0.0, 0.0, 0.0), color, lineCutoff); 

  // // Draw circle at end of line segment.
  // float circle = sdCircle(cellUv - dir * lineLength, lineWidth);
  // circle = smoothstep(0.0, lineWidth, circle);
  // color = mix(vec3(0.0, 0.0, 0.0), color, circle);

  float arrow = arrow(cellUv, -dir * lineLength, dir * lineLength, vec2(0.3, 0.25));
  arrow = smoothstep(0.0, lineWidth, arrow);
  color = mix(glyph_color, color, arrow);

  // Set output.
  frag_color = vec4(color, alpha);
}