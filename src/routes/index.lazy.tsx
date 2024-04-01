import { AsyncButton } from "@/components/async-button";
import { Canvas, CanvasArea, CanvasToolbar } from "@/components/canvas";
import { ToolbarContainer } from "@/components/toolbar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LEDMatrix } from "@/services/led-matrix";
import { Color } from "@/types/color";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SketchPicker } from "react-color";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const [blockDrawing, setBlockDrawing] = useState(false);

  const { matrix, connect, disconnect } = useMatrix();

  const [color, setColor] = useState({ r: 255, g: 255, b: 255 });

  const { pixels, setPixel, setAllPixels } = usePixels();

  function handleError(error: unknown): void {
    console.error(error);

    toast("Something went wrong. Try reconnecting the device.", {
      dismissible: true,
      closeButton: true,
    });
  }

  async function handleCellPressed(index: number) {
    if (blockDrawing) return;

    try {
      const newColor = pixels[index] === color ? { r: 0, g: 0, b: 0 } : color;
      setPixel(index, newColor);
      await matrix?.setColor(index, newColor);
    } catch (error) {
      handleError(error);
    }
  }

  async function handleFillPressed() {
    setBlockDrawing(true);

    try {
      setAllPixels(color);
      const tmpPixels = Array.from({ length: 256 }, () => color);
      await matrix?.setColor(tmpPixels);
    } catch (error) {
      handleError(error);
    } finally {
      setBlockDrawing(false);
    }
  }

  async function handleResendPressed() {
    setBlockDrawing(true);

    try {
      await matrix?.setColor(pixels);
    } catch (error) {
      handleError(error);
    } finally {
      setBlockDrawing(false);
    }
  }

  return (
    <TooltipProvider>
      <Toaster />

      <Canvas>
        <CanvasArea
          matrixSize={16}
          cells={pixels}
          onCellPressed={handleCellPressed}
        />

        <CanvasToolbar placement="bottom">
          <ToolbarContainer className="space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  disabled={blockDrawing}
                  className="h-8 w-8 rounded-full border border-slate-300"
                  style={{
                    background: `rgb(${color.r}, ${color.g}, ${color.b})`,
                  }}
                />
              </PopoverTrigger>

              <PopoverContent>
                <SketchPicker
                  color={color}
                  onChange={(color) => setColor(color.rgb)}
                />
              </PopoverContent>
            </Popover>

            <div className="flex-grow" />

            <AsyncButton
              disabled={blockDrawing ? true : undefined}
              variant="destructive"
              size="sm"
              onClick={handleFillPressed}
            >
              Fill
            </AsyncButton>

            {matrix && (
              <AsyncButton
                size="sm"
                disabled={blockDrawing ? true : undefined}
                onClick={handleResendPressed}
              >
                Resend
              </AsyncButton>
            )}

            {navigator.bluetooth && (
              <AsyncButton
                disabled={blockDrawing ? true : undefined}
                size="sm"
                onClick={matrix ? disconnect : connect}
              >
                {matrix ? "Disconnect" : "Connect"}
              </AsyncButton>
            )}
          </ToolbarContainer>
        </CanvasToolbar>
      </Canvas>
    </TooltipProvider>
  );
}

interface Matrix {
  matrix?: LEDMatrix;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

function useMatrix(): Matrix {
  const [matrix, setMatrix] = useState<LEDMatrix>();

  async function connect() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [LEDMatrix.SERVICE_UUID] }],
      });

      const matrix = await LEDMatrix.open(device);
      setMatrix(matrix);
    } catch (error) {
      console.error(error);
      toast("Connection failed.", { dismissible: true, closeButton: true });
    }
  }

  async function disconnect() {
    if (matrix) {
      matrix.disconnect();
      setMatrix(undefined);
    }
  }

  return { matrix, connect, disconnect };
}

interface Pixels {
  pixels: Color[];
  setPixel(index: number, color: Color): void;
  setAllPixels(color: Color): void;
}

function usePixels(): Pixels {
  const [pixels, setPixels] = useState(
    Array.from({ length: 256 }, () => ({ r: 0, g: 0, b: 0 })),
  );

  function setPixel(index: number, color: Color) {
    setPixels((leds) => {
      const newLEDs = [...leds];
      newLEDs[index] = color;
      return newLEDs;
    });
  }

  function setAllPixels(color: Color) {
    setPixels(Array.from({ length: 256 }, () => color));
  }

  return { pixels, setPixel, setAllPixels };
}
