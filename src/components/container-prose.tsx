import { cn } from "@/utils/cn";
import { ComponentPropsWithoutRef } from "react";

export type ContainerProseProps = ComponentPropsWithoutRef<"div">;

export function ContainerProse({ className, ...props }: ContainerProseProps) {
  return <div {...props} className={cn("container prose my-4", className)} />;
}
