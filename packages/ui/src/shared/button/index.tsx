import React from 'react';
import { Button } from '#components/button';
import { Spinner } from '#components/spinner';

type ButtonLoadingProps = React.ComponentProps<typeof Button> & {
  children?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
};

function ButtonLoading({
  children,
  isLoading = false,
  loadingText,
  isDisabled,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button
      aria-disabled={isLoading}
      aria-busy={isLoading}
      isDisabled={isLoading || isDisabled}
      {...props}
    >
      {isLoading && <Spinner data-icon="inline-start" className="size-4" />}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}

export { ButtonLoading };
