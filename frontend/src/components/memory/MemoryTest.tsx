import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import MemoryVisualization from './MemoryVisualization';

export const MemoryTest: React.FC = () => {
  const [showVisualization, setShowVisualization] = React.useState(false);

  const handleMemorySelect = (memoryId: string, type: string) => {
    console.log(`Selected memory: ${memoryId} of type: ${type}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Memory System Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        This component tests the Memory Visualization system.
        The visualization will attempt to fetch memory data for the specified agent ID.
      </Typography>
      
      <Button
        variant="contained"
        onClick={() => setShowVisualization(!showVisualization)}
        sx={{ mb: 3 }}
      >
        {showVisualization ? 'Hide' : 'Show'} Memory Visualization
      </Button>

      {showVisualization && (
        <MemoryVisualization
          agentId="test-agent"
          width={1200}
          height={800}
          onMemorySelect={handleMemorySelect}
        />
      )}
    </Box>
  );
};

export default MemoryTest;