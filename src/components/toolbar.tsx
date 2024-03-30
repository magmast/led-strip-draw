import { cn } from "@/utils/cn";
import { cva, VariantProps } from "class-variance-authority";
import { ComponentPropsWithoutRef } from "react";

const toolbarVariants = cva("border-b border-slate-300", {
  variants: { placement: { top: "border-b", bottom: "border-t" } },
});

export type ToolbarProps = ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof toolbarVariants>;

export function Toolbar({ className, placement, ...props }: ToolbarProps) {
  return (
    <div {...props} className={cn(toolbarVariants({ className, placement }))} />
  );
}

export type ToolbarContainerProps = ComponentPropsWithoutRef<"div">;

export function ToolbarContainer({
  className,
  ...props
}: ToolbarContainerProps) {
  return (
    <div
      {...props}
      className={cn("container h-14 flex items-center", className)}
    />
  );
}
