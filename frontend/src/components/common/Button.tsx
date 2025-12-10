import React from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'children' | 'variant'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  sx,
  ...props
}) => {
  const getVariantProps = () => {
    const baseProps = {
      color: 'primary' as const,
      variant: 'contained' as const,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseProps,
          color: 'primary' as const,
          variant: 'contained' as const,
        };
      case 'secondary':
        return {
          ...baseProps,
          color: 'secondary' as const,
          variant: 'outlined' as const,
        };
      case 'danger':
        return {
          ...baseProps,
          color: 'error' as const,
          variant: 'contained' as const,
        };
      default:
        return baseProps;
    }
  };

  return (
    <MuiButton
      {...getVariantProps()}
      disabled={disabled || loading}
      sx={{
        minWidth: 120,
        ...sx,
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </MuiButton>
  );
};

export default Button;