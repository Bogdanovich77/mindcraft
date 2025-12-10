import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export interface LoadingProps {
  size?: number;
  message?: string;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 40,
  message,
  overlay = false,
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (overlay) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(0, 0, 0, 0.5)"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default Loading;