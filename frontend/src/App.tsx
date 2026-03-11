import "./App.css";
import { useRef, useEffect } from "react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = 5;
    let hoveredCell: { x: number; y: number } | null = null;

    function drawCell(x: number, y: number, color: string) {
      ctx!.fillStyle = color;
      ctx!.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }

    function drawHoveredCellBorder(x: number, y: number) {
      ctx!.strokeStyle = "#555";
      ctx!.lineWidth = 1;
      ctx!.strokeRect(
        x * cellSize + 0.5,
        y * cellSize + 0.5,
        cellSize - 1,
        cellSize - 1,
      );
    }

    const board = Array.from({ length: 200 }, () =>
      Array.from({ length: 340 }, () => null as string | null),
    );

    // Example: Pre-fill some cells with colors
    //board[8][10] = "red";
    //board[8][11] = "blue";
    //board[8][12] = "green";
    //board[8][13] = "purple";

    function renderBoard() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let x = 0; x < 340; x++) {
        for (let y = 0; y < 200; y++) {
          const color = board[y][x];

          if (color) {
            drawCell(x, y, color);
          }
        }
      }

      if (hoveredCell) {
        drawHoveredCellBorder(hoveredCell.x, hoveredCell.y);
      }
    }

    function getCellFromMouse(event: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const hoverOffset = 4;

      const mouseX = event.clientX - rect.left - hoverOffset;
      const mouseY = event.clientY - rect.top - hoverOffset;

      const cellX = Math.max(0, Math.floor(mouseX / cellSize));
      const cellY = Math.max(0, Math.floor(mouseY / cellSize));

      return { x: cellX, y: cellY };
    }

    function handleCanvasClick(event: MouseEvent) {
      const clickedCell = getCellFromMouse(event);

      board[clickedCell.y][clickedCell.x] = "black";
      renderBoard();
    }

    function handleCanvasMouseMove(event: MouseEvent) {
      hoveredCell = getCellFromMouse(event);
      renderBoard();
    }

    function handleCanvasMouseLeave() {
      hoveredCell = null;
      renderBoard();
    }

    renderBoard();

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    canvas.addEventListener("mouseleave", handleCanvasMouseLeave);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("mousemove", handleCanvasMouseMove);
      canvas.removeEventListener("mouseleave", handleCanvasMouseLeave);
    };
  }, []);

  return (
    <div className="app">
      <h1 className="title">Pixel Board</h1>

      <canvas
        ref={canvasRef}
        className="board-canvas"
        width={1700}
        height={1000}
      />
    </div>
  );
}

export default App;
