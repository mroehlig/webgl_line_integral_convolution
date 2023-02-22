in vec2 texcoord;

out vec4 frag_color;

void main() {
  frag_color = vec4(vec2(texcoord), 0.0, 1.0);
}