"use client";

import { useRef, useEffect } from "react";

export default function DrawingBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectToWebsocket = () => {
      try {
        const ws = new WebSocket("ws://localhost:8080");
        wsRef.current = ws;

        ws.onmessage = (event) => {
          // later on when receiving a message, draw the points etc
          const data = JSON.parse(event.data);
        };

        // when closing the connection try to reconnect after 3s
        ws.onclose = () => {
          setTimeout(connectToWebsocket, 3000);
        };
      } catch (error) {
        console.log("Error while trying to connect to the websocket", error);
      }
    };

    connectToWebsocket();

    // clear up function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const startDrawing = (e: MouseEvent) => {
      isDrawing.current = true;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();

      if (!wsRef.current) return;

      wsRef.current.send(
        JSON.stringify({
          action: "drawing",
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      );
    };

    const stopDrawing = () => {
      isDrawing.current = false;
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
    };
  }, []);

  const createSession = async () => {
    const code = "12345";
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex items-center bg-zinc-950 min-h-screen  justify-center">
      <div className="flex-col">
        <canvas
          ref={canvasRef}
          className="border-2 border-foreground rounded-lg shadow-lg w-full max-w-4xl h-96 bg-white cursor-crosshair"
        />
        <div className="flex-row ">
          <button
            onClick={clearCanvas}
            className="px-6 py-2 mr-4 bg-zinc-900 mt-5 text-primary-foreground rounded-lg hover:opacity-90 font-medium"
          >
            Clear Canvas
          </button>
          <button
            onClick={clearCanvas}
            className="px-6 py-2  mr-4 bg-zinc-900 mt-5 text-primary-foreground rounded-lg hover:opacity-90 font-medium"
          >
            Join Session
          </button>
          <button
            onClick={clearCanvas}
            className="px-6 py-2  mr-4 bg-zinc-900 mt-5 text-primary-foreground rounded-lg hover:opacity-90 font-medium"
          >
            Create Session
          </button>

          <button
            onClick={clearCanvas}
            className="px-6 py-2  mr-4 bg-zinc-900 mt-5 text-primary-foreground rounded-lg hover:opacity-90 font-medium"
          >
            Leave Session
          </button>
        </div>
      </div>
    </div>
  );
}
