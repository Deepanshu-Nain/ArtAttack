export function fastFloodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorStr: string
) {
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;
  
  // Ensure coordinates are integers
  startX = Math.floor(startX);
  startY = Math.floor(startY);

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  // View buffer as 32-bit integers for extremely fast comparison and assignment
  const data = new Uint32Array(imageData.data.buffer);

  const startPos = startY * width + startX;
  const targetColor = data[startPos];

  // Parse hex color (e.g. "#FF0000") to ABGR (Little Endian layout for HTML Canvas)
  const r = parseInt(fillColorStr.slice(1, 3), 16);
  const g = parseInt(fillColorStr.slice(3, 5), 16);
  const b = parseInt(fillColorStr.slice(5, 7), 16);
  const a = 255;
  // Little-endian layout: A is highest byte, then B, G, R
  const fillColor = (a << 24) | (b << 16) | (g << 8) | r;

  // If the target color is the same as fill color, do nothing
  if (targetColor === fillColor) return;

  // Flat array stack for maximum performance (avoiding object allocation overhead)
  // Stack size can be at most width * height
  const stack = new Int32Array(width * height);
  let stackPtr = 0;

  stack[stackPtr++] = startPos;

  // Iterative scanline algorithm
  while (stackPtr > 0) {
    let currentPos = stack[--stackPtr];
    
    let y = Math.floor(currentPos / width);
    const x = currentPos % width;

    // Move up to the top-most pixel of the target color in this column
    while (y > 0 && data[currentPos - width] === targetColor) {
      currentPos -= width;
      y--;
    }

    let reachLeft = false;
    let reachRight = false;

    // Scan downwards
    while (y < height && data[currentPos] === targetColor) {
      // Fill the pixel
      data[currentPos] = fillColor;

      // Check pixel to the left
      if (x > 0) {
        if (data[currentPos - 1] === targetColor) {
          if (!reachLeft) {
            stack[stackPtr++] = currentPos - 1;
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      // Check pixel to the right
      if (x < width - 1) {
        if (data[currentPos + 1] === targetColor) {
          if (!reachRight) {
            stack[stackPtr++] = currentPos + 1;
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      currentPos += width;
      y++;
    }
  }

  // Write changes back to canvas
  ctx.putImageData(imageData, 0, 0);
}
