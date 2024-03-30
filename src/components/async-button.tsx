import { Button, ButtonProps } from "@/components/ui/button";
import { MouseEvent, useState } from "react";

export interface AsyncButtonProps extends ButtonProps {
  onClick(event: MouseEvent): Promise<void>;
}

export function AsyncButton({ onClick, disabled, ...props }: AsyncButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick(event: MouseEvent) {
    setLoading(true);

    try {
      await onClick(event);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      {...props}
      disabled={disabled === undefined ? loading : disabled}
      onClick={handleClick}
    />
  );
}
