export function worldToScreen(
  x: number,
  y: number,
  cellSize: number,
  camera: { x: number; y: number; zoom: number },
) {
  return {
    x: x * cellSize * camera.zoom + camera.x,
    y: y * cellSize * camera.zoom + camera.y,
  };
}

export function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  cellSize: number,
  camera: { x: number; y: number; zoom: number },
) {
  const left = Math.round(camera.x + x * cellSize * camera.zoom);
  const top = Math.round(camera.y + y * cellSize * camera.zoom);
  const right = Math.round(camera.x + (x + 1) * cellSize * camera.zoom);
  const bottom = Math.round(camera.y + (y + 1) * cellSize * camera.zoom);

  ctx.fillStyle = color;
  ctx.fillRect(left, top, right - left, bottom - top);
}

export function drawHoveredCellBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  camera: { x: number; y: number; zoom: number },
) {
  const left = Math.round(camera.x + x * cellSize * camera.zoom);
  const top = Math.round(camera.y + y * cellSize * camera.zoom);
  const right = Math.round(camera.x + (x + 1) * cellSize * camera.zoom);
  const bottom = Math.round(camera.y + (y + 1) * cellSize * camera.zoom);

  ctx.strokeStyle = "#5555558e";
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, right - left, bottom - top);
}
