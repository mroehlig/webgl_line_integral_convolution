// Uniforms.
uniform sampler2D field;

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

// Main.
void main() {
  vec2 uv = texcoord;

  // Get grid dimensions.
  ivec2 size = textureSize(field, 0);
  float width = float(size.x);
  float height = float(size.y);

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
  float lineLength = 0.125 * mag;
  float lineWidth = 0.05;
  float lineDist = sdSegment(cellUv, -dir * lineLength, dir * lineLength);
  float lineCutoff = smoothstep(0.0, lineWidth, lineDist);
  color = mix(vec3(0.0, 0.0, 0.0), color, lineCutoff); 

  // Draw circle at end of line segment.
  float circle = sdCircle(cellUv - dir * lineLength, lineWidth);
  circle = smoothstep(0.0, lineWidth, circle);
  color = mix(vec3(0.0, 0.0, 0.0), color, circle);

  // Set output.
  frag_color = vec4(color, alpha);
}