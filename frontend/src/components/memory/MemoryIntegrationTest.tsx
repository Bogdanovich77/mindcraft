import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import MemoryVisualization from './MemoryVisualization';

/**
 * Integration test component for memory visualization
 * This component verifies that all memory components can be properly imported and rendered
 */
export const MemoryIntegrationTest: React.FC = () => {
  return (
    <Provider store={store}>
      <div style={{ padding: '20px', height: '100vh' }}>
        <h1>Memory System Integration Test</h1>
        <p>This test verifies that all memory visualization components are working correctly.</p>
        
        {/* Test the main MemoryVisualization component */}
        <MemoryVisualization />
      </div>
    </Provider>
  );
};

export default MemoryIntegrationTest;