// Render line integral convolution.
export function renderLIC(ctx, streamlines) {
  // Get the canvas size.
  let width = ctx.canvas.width;
  let height = ctx.canvas.height;

  // Draw style.
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";

  // Render the streamlines.
  for (let i = 0; i < streamlines.length; ++i) {
    // Get the streamline.
    let streamline = streamlines[i];

    // Check if the streamline is valid.
    if (!streamline.valid) {
      continue;
    }

    // Draw the streamline points.
    let points = streamline.points;
    ctx.beginPath();
    ctx.moveTo(streamline.start.x * width, (1 - streamline.start.y) * height);

    for (let j = 0; j < points.length; ++j) {
      let point = points[j];
      ctx.lineTo(point.x * width, (1 - point.y) * height);
    }

    ctx.stroke();
  }
}
