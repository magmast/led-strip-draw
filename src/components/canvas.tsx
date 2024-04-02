import {
  Children,
  ComponentPropsWithoutRef,
  ReactNode,
  createContext,
  memo,
  useContext,
  useMemo,
} from "react";
import { useSize } from "react-use";
import { Toolbar, ToolbarProps } from "./toolbar";
import { cn } from "@/utils/cn";
import { Color } from "@/types/color";

interface CanvasContextValue {
  cellSize: number;
}

const CanvasContext = createContext<CanvasContextValue>({ cellSize: 0 });

export type CanvasProps = ComponentPropsWithoutRef<"div">;

export function Canvas({ className, ...props }: CanvasProps) {
  return <div {...props} className={cn("flex h-screen flex-col", className)} />;
}

export type CanvasToolbarProps = ToolbarProps;

export const CanvasToolbar = Toolbar;

export interface CanvasAreaProps {
  children?: ReactNode;
}

export function CanvasArea({ children }: CanvasAreaProps) {
  const matrixSize = Math.sqrt(Children.count(children));
  if (Math.round(matrixSize) !== matrixSize) {
    throw new Error("CanvasArea must have a square number of cells.");
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
        <CanvasContext.Provider value={{ cellSize }}>
          <div
            className="absolute left-1/2 top-1/2 grid border-collapse -translate-x-1/2 -translate-y-1/2"
            style={{
              gridTemplateColumns: `repeat(${matrixSize}, ${cellSize}px)`,
            }}
          >
            {children}
          </div>
        </CanvasContext.Provider>
      )}
    </div>
  );
}

export interface CanvasCellProps
  extends Omit<ComponentPropsWithoutRef<"button">, "color"> {
  color: Color;
}

export const CanvasCell = memo(
  ({ color, style, className, ...props }: CanvasCellProps) => {
    const { cellSize } = useContext(CanvasContext);

    return (
      <button
        {...props}
        style={{
          width: cellSize,
          height: cellSize,
          background: `rgb(${color.r}, ${color.g}, ${color.b})`,
          ...style,
        }}
        className={cn("-ml-[1px] -mt-[1px] border border-slate-300", className)}
      />
    );
  },
);

CanvasCell.displayName = "CanvasCell";
