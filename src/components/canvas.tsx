import { ComponentPropsWithoutRef, useMemo } from "react";
import { useSize } from "react-use";
import { Toolbar, ToolbarProps } from "./toolbar";
import { cn } from "@/utils/cn";
import { Color } from "@/types/color";

export type CanvasProps = ComponentPropsWithoutRef<"div">;

export function Canvas({ className, ...props }: CanvasProps) {
  return <div {...props} className={cn("flex h-screen flex-col", className)} />;
}

export type CanvasToolbarProps = ToolbarProps;

export const CanvasToolbar = Toolbar;

export interface CanvasAreaProps {
  cells: Color[];
  matrixSize: number;
  onCellPressed?: (index: number) => void;
}

export function CanvasArea({
  cells,
  matrixSize,
  onCellPressed,
}: CanvasAreaProps) {
  if (cells.length !== matrixSize * matrixSize) {
    throw new Error("CanvasArea: `coloredCells` is required.");
  }

  const [sized, { width, height }] = useSize(() => (
    <div className="absolute h-full w-full" />
  ));

  const cellSize = useMemo(() => {
    if (!isFinite(width) || !isFinite(height)) {
      return 0;
    }

    return Math.min(width, height) / matrixSize;
  }, [height, matrixSize, width]);

  return (
    <div className="relative w-full flex-grow bg-slate-50">
      {sized}

      {!cellSize && (
        <div className="container prose my-4">
          <h1>Loading...</h1>
          <p>Calculating cell size.</p>
        </div>
      )}

      {cellSize && (
        <div
          className="absolute left-1/2 top-1/2 grid border-collapse -translate-x-1/2 -translate-y-1/2"
          style={{
            gridTemplateColumns: `repeat(${matrixSize}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: matrixSize * matrixSize }, (_, index) => {
            const row = Math.floor(index / matrixSize);
            const col =
              row % 2 === 0
                ? matrixSize - (index % matrixSize) - 1
                : index % matrixSize;
            const idx = row * matrixSize + col;
            console.log({ row, col, idx, index });
            const { r, g, b } = cells[idx];

            return (
              <button
                key={idx}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: `rgb(${r}, ${g}, ${b})`,
                }}
                className="-ml-[1px] -mt-[1px] border border-slate-300"
                onClick={onCellPressed ? () => onCellPressed(idx) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
