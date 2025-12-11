/**
 * Comprehensive Integration Test Suite
 * Tests all major components and their interactions
 */

import React from 'react';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithProviders, mockAgentState, waitForCondition } from '../utils/testUtils';
import App from '../../src/App';
import { store } from '../../src/store';

describe('Comprehensive Integration Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    store.dispatch({ type: 'RESET_STATE' });
  });

  describe('Application Initialization', () => {
    test('should render application without crashing', () => {
      renderWithProviders(<App />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Mindcraft Cognitive Dashboard')).toBeInTheDocument();
    });

    test('should establish Socket.IO connection', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toBeInTheDocument();
      });
    });

    test('should load agent list on mount', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('agent-list')).toBeInTheDocument();
      });
    });
  });

  describe('Agent Overview Dashboard', () => {
    test('should display agent information correctly', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      // Dispatch agent to store
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
        expect(screen.getByText(`Health: ${mockAgent.health}`)).toBeInTheDocument();
        expect(screen.getByText(`Level: ${mockAgent.level}`)).toBeInTheDocument();
      });
    });

    test('should handle agent selection', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      // Add agent to store
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
        fireEvent.click(agentCard);
      });
      
      // Verify agent is selected
      await waitFor(() => {
        expect(screen.getByTestId('agent-details')).toBeInTheDocument();
      });
    });

    test('should update agent status in real-time', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      // Add agent to store
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        expect(screen.getByText(`Health: ${mockAgent.health}`)).toBeInTheDocument();
      });
      
      // Simulate health update
      const updatedAgent = { ...mockAgent, health: 15 };
      store.dispatch({
        type: 'agents/updateAgent',
        payload: updatedAgent
      });
      
      await waitFor(() => {
        expect(screen.getByText(`Health: ${updatedAgent.health}`)).toBeInTheDocument();
      });
    });
  });

  describe('Personality Visualization', () => {
    test('should display personality traits correctly', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      // Add agent and select it
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to personality tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      await waitFor(() => {
        const personalityTab = screen.getByTestId('personality-tab');
        fireEvent.click(personalityTab);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Personality Traits')).toBeInTheDocument();
        expect(screen.getByText('Openness')).toBeInTheDocument();
        expect(screen.getByText('Conscientiousness')).toBeInTheDocument();
        expect(screen.getByText('Extraversion')).toBeInTheDocument();
      });
    });

    test('should render personality radar chart', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Select agent and navigate to personality tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const personalityTab = screen.getByTestId('personality-tab');
      fireEvent.click(personalityTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('personality-radar-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Memory System Visualization', () => {
    test('should display memory system overview', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Select agent and navigate to memory tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const memoryTab = screen.getByTestId('memory-tab');
      fireEvent.click(memoryTab);
      
      await waitFor(() => {
        expect(screen.getByText('Memory Systems')).toBeInTheDocument();
        expect(screen.getByText('Semantic Memory')).toBeInTheDocument();
        expect(screen.getByText('Episodic Memory')).toBeInTheDocument();
        expect(screen.getByText('Procedural Memory')).toBeInTheDocument();
        expect(screen.getByText('Working Memory')).toBeInTheDocument();
      });
    });

    test('should display memory statistics', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to memory tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const memoryTab = screen.getByTestId('memory-tab');
      fireEvent.click(memoryTab);
      
      await waitFor(() => {
        expect(screen.getByText('150 concepts')).toBeInTheDocument();
        expect(screen.getByText('200 events')).toBeInTheDocument();
        expect(screen.getByText('25 skills')).toBeInTheDocument();
        expect(screen.getByText('7/10 buffer')).toBeInTheDocument();
      });
    });
  });

  describe('Goal Hierarchy Display', () => {
    test('should display hierarchical goals', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to goals tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const goalsTab = screen.getByTestId('goals-tab');
      fireEvent.click(goalsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Goal Hierarchy')).toBeInTheDocument();
        expect(screen.getByText('Strategic Goals')).toBeInTheDocument();
        expect(screen.getByText('Tactical Goals')).toBeInTheDocument();
        expect(screen.getByText('Operational Goals')).toBeInTheDocument();
      });
    });

    test('should display goal progress indicators', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to goals tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const goalsTab = screen.getByTestId('goals-tab');
      fireEvent.click(goalsTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('goal-progress-strat-1')).toBeInTheDocument();
        expect(screen.getByText('30%')).toBeInTheDocument();
      });
    });
  });

  describe('Social Relationship Visualization', () => {
    test('should display social relationships', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to social tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const socialTab = screen.getByTestId('social-tab');
      fireEvent.click(socialTab);
      
      await waitFor(() => {
        expect(screen.getByText('Social Relationships')).toBeInTheDocument();
        expect(screen.getByText('Agent 2')).toBeInTheDocument();
        expect(screen.getByText('COLLEAGUE')).toBeInTheDocument();
      });
    });

    test('should display relationship metrics', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to social tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const socialTab = screen.getByTestId('social-tab');
      fireEvent.click(socialTab);
      
      await waitFor(() => {
        expect(screen.getByText('Trust: 70%')).toBeInTheDocument();
        expect(screen.getByText('Friendship: 60%')).toBeInTheDocument();
        expect(screen.getByText('Reputation: 80%')).toBeInTheDocument();
      });
    });
  });

  describe('Skill Progression Visualization', () => {
    test('should display skill progression', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to skills tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const skillsTab = screen.getByTestId('skills-tab');
      fireEvent.click(skillsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Skill Progression')).toBeInTheDocument();
        expect(screen.getByText('Mining')).toBeInTheDocument();
        expect(screen.getByText('Building')).toBeInTheDocument();
        expect(screen.getByText('Level 15')).toBeInTheDocument();
        expect(screen.getByText('Level 8')).toBeInTheDocument();
      });
    });

    test('should display skill proficiency breakdown', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to skills tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const skillsTab = screen.getByTestId('skills-tab');
      fireEvent.click(skillsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Knowledge: 80%')).toBeInTheDocument();
        expect(screen.getByText('Practical: 60%')).toBeInTheDocument();
        expect(screen.getByText('Creative: 50%')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics Dashboard', () => {
    test('should display performance metrics', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to performance tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const performanceTab = screen.getByTestId('performance-tab');
      fireEvent.click(performanceTab);
      
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Response Time')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      });
    });

    test('should display performance charts', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to performance tab
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const performanceTab = screen.getByTestId('performance-tab');
      fireEvent.click(performanceTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
        expect(screen.getByTestId('cpu-usage-chart')).toBeInTheDocument();
        expect(screen.getByTestId('memory-usage-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Data Streaming', () => {
    test('should handle real-time agent updates', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
      });
      
      // Simulate real-time update
      const updatedAgent = {
        ...mockAgent,
        position: { x: 100, y: 65, z: 200 },
        health: 18
      };
      
      store.dispatch({
        type: 'agents/updateAgent',
        payload: updatedAgent
      });
      
      await waitFor(() => {
        expect(screen.getByText(`Health: ${updatedAgent.health}`)).toBeInTheDocument();
      });
    });

    test('should handle connection status changes', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toBeInTheDocument();
      });
      
      // Simulate connection loss
      store.dispatch({
        type: 'connection/setStatus',
        payload: 'disconnected'
      });
      
      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });
      
      // Simulate reconnection
      store.dispatch({
        type: 'connection/setStatus',
        payload: 'connected'
      });
      
      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should display error messages', async () => {
      renderWithProviders(<App />);
      
      // Simulate error
      store.dispatch({
        type: 'ui/setError',
        payload: 'Connection failed'
      });
      
      await waitFor(() => {
        expect(screen.getByText('Connection failed')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    test('should allow error recovery', async () => {
      renderWithProviders(<App />);
      
      // Simulate error
      store.dispatch({
        type: 'ui/setError',
        payload: 'Connection failed'
      });
      
      await waitFor(() => {
        expect(screen.getByText('Connection failed')).toBeInTheDocument();
      });
      
      // Clear error
      const clearButton = screen.getByTestId('clear-error-button');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Connection failed')).not.toBeInTheDocument();
      });
    });

    test('should handle component errors gracefully', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      // Navigate to a tab that might have errors
      const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
      fireEvent.click(agentCard);
      
      const personalityTab = screen.getByTestId('personality-tab');
      fireEvent.click(personalityTab);
      
      // Should still render other components even if one fails
      await waitFor(() => {
        expect(screen.getByTestId('agent-details')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
      
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('agent-list')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
      });
    });

    test('should adapt to tablet viewport', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('agent-list')).toBeInTheDocument();
        expect(screen.getByTestId('tablet-layout')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Compliance', () => {
    test('should have proper ARIA labels', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
        expect(agentCard).toHaveAttribute('aria-label', `Agent ${mockAgent.name}`);
      });
    });

    test('should support keyboard navigation', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        const agentCard = screen.getByTestId(`agent-card-${mockAgent.id}`);
        agentCard.focus();
        
        expect(agentCard).toHaveFocus();
        
        // Test Tab navigation
        fireEvent.keyDown(agentCard, { key: 'Tab' });
        
        // Should focus on next interactive element
        expect(document.activeElement).not.toBe(agentCard);
      });
    });
  });

  describe('Performance Optimization', () => {
    test('should render efficiently with large datasets', async () => {
      const startTime = performance.now();
      
      // Create large dataset
      const largeAgentList = Array.from({ length: 100 }, (_, index) => ({
        ...mockAgentState,
        id: `agent-${index}`,
        name: `Agent ${index}`,
      }));
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: largeAgentList
      });
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/agent-card-/)).toHaveLength(100);
      });
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
    });

    test('should handle rapid state updates efficiently', async () => {
      const mockAgent = mockAgentState;
      
      renderWithProviders(<App />);
      
      store.dispatch({
        type: 'agents/setAgents',
        payload: [mockAgent]
      });
      
      await waitFor(() => {
        expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
      });
      
      // Simulate rapid updates
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        store.dispatch({
          type: 'agents/updateAgent',
          payload: { ...mockAgent, health: 20 - i }
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Health: 10')).toBeInTheDocument();
      });
      
      const updateTime = performance.now() - startTime;
      expect(updateTime).toBeLessThan(500); // Should handle 10 updates in under 500ms
    });
  });
});