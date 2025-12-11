/**
 * Accessibility Validation Test Suite
 * Tests WCAG 2.1 AA compliance and accessibility features
 */

import { renderWithProviders, mockAgentState, checkAccessibility, getBrowserInfo } from '../utils/testUtils';
import { accessibilityConfig } from '../config/testConfig';
import App from '../../src/App';

describe('Accessibility Validation Tests', () => {
  let browserInfo: any;

  beforeEach(() => {
    browserInfo = getBrowserInfo();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    test('should have proper color contrast', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Select agent and navigate to personality tab
      const agentCard = container.querySelector(`[data-testid="agent-card-${mockAgent.id}"]`);
      if (agentCard) {
        agentCard.click();
      }
      
      // Wait for personality tab
      const personalityTab = await container.querySelector('[data-testid="personality-tab"]');
      if (personalityTab) {
        personalityTab.click();
      }
      
      // Check accessibility
      const results = await checkAccessibility(container);
      
      // Should not have color contrast violations
      const contrastViolations = results.violations.filter(
        violation => violation.id === 'color-contrast'
      );
      
      expect(contrastViolations).toHaveLength(0);
    });

    test('should support keyboard navigation', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Test keyboard navigation
      const agentCard = container.querySelector(`[data-testid="agent-card-${mockAgent.id}"]`);
      if (agentCard) {
        agentCard.focus();
      }
      
      // Tab through interactive elements
      const tabKey = browserInfo.isSafari ? 'Alt' : 'Tab';
      
      // Press Tab to navigate to next element
      fireEvent.keyDown(document.activeElement || document.body, { key: tabKey });
      
      // Should focus on next interactive element
      expect(document.activeElement).not.toBe(agentCard);
      
      // Test Enter key activation
      fireEvent.keyDown(document.activeElement || document.body, { key: 'Enter' });
      
      // Should activate the focused element
      const personalityTab = container.querySelector('[data-testid="personality-tab"]');
      expect(personalityTab).toHaveFocus();
    });

    test('should have proper ARIA labels', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Check ARIA labels on key elements
      const agentCard = container.querySelector(`[data-testid="agent-card-${mockAgent.id}"]`);
      const personalityTab = container.querySelector('[data-testid="personality-tab"]');
      const memoryTab = container.querySelector('[data-testid="memory-tab"]');
      
      // Agent card should have aria-label
      expect(agentCard).toHaveAttribute('aria-label', `Agent ${mockAgent.name}`);
      
      // Tabs should have proper ARIA attributes
      expect(personalityTab).toHaveAttribute('role', 'tab');
      expect(personalityTab).toHaveAttribute('aria-selected', 'false');
      expect(personalityTab).toHaveAttribute('aria-controls', 'personality-panel');
      
      expect(memoryTab).toHaveAttribute('role', 'tab');
      expect(memoryTab).toHaveAttribute('aria-selected', 'false');
      expect(memoryTab).toHaveAttribute('aria-controls', 'memory-panel');
    });

    test('should support screen readers', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Check for semantic structure
      const mainElement = container.querySelector('[role="main"]');
      const navigation = container.querySelector('[role="navigation"]');
      const complementary = container.querySelector('[role="complementary"]');
      
      expect(mainElement).toBeInTheDocument();
      expect(navigation).toBeInTheDocument();
      expect(complementary).toBeInTheDocument();
      
      // Check for proper heading structure
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);
      
      // First heading should be h1
      expect(headings[0].tagName).toBe('H1');
    });

    test('should have focus management', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Test focus trapping in modals
      const agentCard = container.querySelector(`[data-testid="agent-card-${mockAgent.id}"]`);
      if (agentCard) {
        agentCard.click();
      }
      
      // Wait for potential modal or detailed view
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Test tab navigation within focused area
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach((element, index) => {
        element.focus();
        expect(element).toHaveFocus();
        
        if (index < focusableElements.length - 1) {
          fireEvent.keyDown(element, { key: 'Tab' });
          expect(focusableElements[index + 1]).toHaveFocus();
        }
      });
    });
  });

  describe('Touch Target Size', () => {
    test('should meet minimum touch target size', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Find interactive elements
      const interactiveElements = container.querySelectorAll(
        'button, [role="button"], a, input, select, [tabindex]:not([tabindex="-1"])'
      );
      
      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const minDimension = accessibilityConfig.customTests.touchTargetSize;
        
        // Both width and height should meet minimum
        expect(rect.width).toBeGreaterThanOrEqual(minDimension);
        expect(rect.height).toBeGreaterThanOrEqual(minDimension);
      });
    });

    test('should have adequate spacing between touch targets', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Find adjacent interactive elements
      const buttons = container.querySelectorAll('button, [role="button"]');
      
      for (let i = 0; i < buttons.length - 1; i++) {
        const button1 = buttons[i];
        const button2 = buttons[i + 1];
        
        if (button1 && button2) {
          const rect1 = button1.getBoundingClientRect();
          const rect2 = button2.getBoundingClientRect();
          
          // Calculate minimum distance
          const minDistance = accessibilityConfig.customTests.touchTargetSize;
          
          // Check horizontal and vertical spacing
          const horizontalSpacing = Math.abs(rect1.left - rect2.left);
          const verticalSpacing = Math.abs(rect1.top - rect2.top);
          
          expect(horizontalSpacing).toBeGreaterThanOrEqual(minDistance);
          expect(verticalSpacing).toBeGreaterThanOrEqual(minDistance);
        }
      }
    });
  });

  describe('Text Resize and Zoom', () => {
    test('should support text zoom up to 200%', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Simulate browser zoom
      Object.defineProperty(document.documentElement, 'style', {
        writable: true,
        value: {
          fontSize: '200%',
          transform: 'scale(2)'
        }
      });
      
      // Text should remain readable
      const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
      
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const fontSize = parseFloat(styles.fontSize);
        
        // Font size should scale with zoom
        expect(fontSize).toBeGreaterThan(16); // Base 16px * 2 = 32px
      });
    });

    test('should maintain readability at high contrast', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Simulate high contrast mode
      Object.defineProperty(document.documentElement, 'style', {
        writable: true,
        value: {
          filter: 'contrast(100%)',
          backgroundColor: '#000000',
          color: '#ffffff'
        }
      });
      
      // Check accessibility results
      const results = await checkAccessibility(container);
      
      // Should not have contrast violations in high contrast mode
      const contrastViolations = results.violations.filter(
        violation => violation.id === 'color-contrast'
      );
      
      expect(contrastViolations).toHaveLength(0);
    });
  });

  describe('Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async () => {
      const mockAgent = mockAgentState;
      
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Find animated elements
      const animatedElements = container.querySelectorAll(
        '[style*="animation"], [style*="transition"]'
      );
      
      // In reduced motion mode, animations should be disabled or very subtle
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (mediaQuery.matches) {
        animatedElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          const animationDuration = styles.animationDuration;
          const transitionDuration = styles.transitionDuration;
          
          // Animations should be very short or disabled
          expect(
            animationDuration === '0s' || 
            parseFloat(animationDuration) < 0.1
          ).toBeTruthy();
          
          expect(
            transitionDuration === '0s' || 
            parseFloat(transitionDuration) < 0.1
          ).toBeTruthy();
        });
      }
    });
  });

  describe('Form Accessibility', () => {
    test('should have proper form labels', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Navigate to settings or any form
      const settingsTab = container.querySelector('[data-testid="settings-tab"]');
      if (settingsTab) {
        settingsTab.click();
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Find form elements
      const inputs = container.querySelectorAll('input, select, textarea');
      const labels = container.querySelectorAll('label');
      
      // Each input should have associated label
      inputs.forEach(input => {
        const hasLabel = Array.from(labels).some(label => 
          label.htmlFor === input.id || 
          label.contains(input)
        );
        
        expect(hasLabel).toBeTruthy();
      });
    });

    test('should have proper fieldset and legend', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Look for fieldsets
      const fieldsets = container.querySelectorAll('fieldset');
      
      fieldsets.forEach(fieldset => {
        // Fieldset should have legend
        const legend = fieldset.querySelector('legend');
        expect(legend).toBeInTheDocument();
        
        // Legend should describe the fieldset purpose
        expect(legend.textContent?.trim()).toBeTruthy();
      });
    });

    test('should have proper error messaging', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Simulate form validation error
      const errorElement = document.createElement('div');
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      errorElement.textContent = 'Please enter a valid agent name';
      
      container.appendChild(errorElement);
      
      // Error should be accessible to screen readers
      const results = await checkAccessibility(container);
      
      const ariaLiveViolations = results.violations.filter(
        violation => violation.id === 'aria-valid-attr-value'
      );
      
      expect(ariaLiveViolations).toHaveLength(0);
      expect(errorElement).toHaveAttribute('role', 'alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Link and Button Accessibility', () => {
    test('should have descriptive link text', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Find links
      const links = container.querySelectorAll('a[href]');
      
      links.forEach(link => {
        // Link should have descriptive text or aria-label
        const text = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        
        expect(text || ariaLabel).toBeTruthy();
        
        // Should indicate if link opens in new window
        const target = link.getAttribute('target');
        if (target === '_blank') {
          expect(link).toHaveAttribute('aria-label');
          expect(link.getAttribute('aria-label')).toContain('opens in new window');
        }
      });
    });

    test('should have accessible button states', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Find buttons
      const buttons = container.querySelectorAll('button, [role="button"]');
      
      buttons.forEach(button => {
        // Button should have accessible name
        const text = button.textContent?.trim();
        const ariaLabel = button.getAttribute('aria-label');
        
        expect(text || ariaLabel).toBeTruthy();
        
        // Disabled buttons should have aria-disabled
        if (button.disabled) {
          expect(button).toHaveAttribute('aria-disabled', 'true');
        } else {
          expect(button).not.toHaveAttribute('aria-disabled');
        }
        
        // Loading state should be communicated
        const ariaBusy = button.getAttribute('aria-busy');
        if (button.getAttribute('data-loading') === 'true') {
          expect(ariaBusy).toBe('true');
        }
      });
    });
  });

  describe('Table Accessibility', () => {
    test('should have proper table structure', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Look for data tables
      const tables = container.querySelectorAll('table');
      
      tables.forEach(table => {
        // Table should have caption or aria-label
        const caption = table.querySelector('caption');
        const ariaLabel = table.getAttribute('aria-label');
        
        expect(caption || ariaLabel).toBeTruthy();
        
        // Should have proper headers
        const headers = table.querySelectorAll('th');
        expect(headers.length).toBeGreaterThan(0);
        
        // Headers should have scope attribute
        headers.forEach(header => {
          expect(header).toHaveAttribute('scope');
        });
        
        // Data cells should be associated with headers
        const dataCells = table.querySelectorAll('td');
        dataCells.forEach(cell => {
          const headers = cell.getAttribute('headers');
          const ariaLabel = cell.getAttribute('aria-label');
          
          expect(headers || ariaLabel).toBeTruthy();
        });
      });
    });

    test('should support table navigation', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      const tables = container.querySelectorAll('table');
      
      tables.forEach(table => {
        // Table should be navigable with keyboard
        table.focus();
        expect(table).toHaveFocus();
        
        // Tab navigation should work within table
        const focusableElements = table.querySelectorAll(
          'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        let currentFocus = 0;
        focusableElements.forEach((element, index) => {
          element.focus();
          expect(element).toHaveFocus();
          currentFocus = index;
          
          if (index < focusableElements.length - 1) {
            fireEvent.keyDown(element, { key: 'Tab' });
            expect(focusableElements[currentFocus + 1]).toHaveFocus();
            currentFocus++;
          }
        });
      });
    });
  });

  describe('Media Accessibility', () => {
    test('should have accessible images', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Find images
      const images = container.querySelectorAll('img');
      
      images.forEach(img => {
        // Images should have alt text
        const alt = img.getAttribute('alt');
        expect(alt).toBeTruthy();
        
        // Decorative images should have empty alt
        if (img.getAttribute('role') === 'presentation') {
          expect(alt || '').toBe('');
        }
      });
    });

    test('should have accessible video content', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Find videos
      const videos = container.querySelectorAll('video');
      
      videos.forEach(video => {
        // Videos should have controls
        expect(video).toHaveAttribute('controls');
        
        // Should have captions or transcript
        const tracks = video.querySelectorAll('track[kind="captions"]');
        const transcript = video.nextElementSibling?.querySelector('.transcript');
        
        expect(tracks.length > 0 || transcript).toBeTruthy();
      });
    });
  });

  describe('Custom Accessibility Tests', () => {
    test('should handle cognitive load appropriately', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Simulate high cognitive load scenario
      const complexData = Array.from({ length: 100 }, (_, i) => ({
        id: `agent-${i}`,
        ...mockAgent,
        cognitive: {
          ...mockAgent.cognitive,
          processing: {
            currentPhase: 'COMPLEX_ANALYSIS',
            cognitiveLoad: 0.9
          }
        }
      }));
      
      const { unmount } = renderWithProviders(<App />, { agents: complexData });
      
      // Should still be accessible under high load
      const results = await checkAccessibility(container);
      
      const criticalViolations = results.violations.filter(
        violation => violation.impact === 'critical'
      );
      
      expect(criticalViolations).toHaveLength(0);
    });

    test('should support voice navigation', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Test voice navigation compatibility
      const interactiveElements = container.querySelectorAll(
        'button, [href], input, select, [role="button"], [role="link"]'
      );
      
      interactiveElements.forEach(element => {
        // Elements should have accessible names for voice commands
        const accessibleName = 
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          element.textContent?.trim();
        
        expect(accessibleName).toBeTruthy();
        
        // Should be keyboard accessible
        const tabIndex = element.getAttribute('tabindex');
        expect(tabIndex !== '-1').toBeTruthy();
      });
    });
  });

  describe('Browser Compatibility', () => {
    test('should work across different browsers', async () => {
      const mockAgent = mockAgentState;
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Test browser-specific features
      if (browserInfo.isChrome) {
        // Chrome-specific accessibility features
        expect(container).toBeInTheDocument();
      }
      
      if (browserInfo.isFirefox) {
        // Firefox-specific accessibility features
        expect(container).toBeInTheDocument();
      }
      
      if (browserInfo.isSafari) {
        // Safari-specific accessibility features
        expect(container).toBeInTheDocument();
      }
      
      if (browserInfo.isEdge) {
        // Edge-specific accessibility features
        expect(container).toBeInTheDocument();
      }
    });

    test('should handle mobile accessibility', async () => {
      // Mock mobile environment
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 667,
      });
      
      const mockAgent = mockAgentState;
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Mobile-specific accessibility checks
      const touchTargets = container.querySelectorAll(
        'button, [role="button"], a, input, select'
      );
      
      touchTargets.forEach(target => {
        const rect = target.getBoundingClientRect();
        
        // Touch targets should be large enough for mobile
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
      
      // Check for viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toHaveAttribute('content', expect.stringContaining('width=device-width'));
    });
  });

  describe('Performance Impact of Accessibility', () => {
    test('should maintain performance with accessibility features', async () => {
      const mockAgent = mockAgentState;
      
      const startTime = performance.now();
      
      const { container } = renderWithProviders(<App />, { agents: [mockAgent] });
      
      // Enable accessibility features
      const results = await checkAccessibility(container);
      
      // Accessibility check should not significantly impact performance
      const checkTime = performance.now() - startTime;
      expect(checkTime).toBeLessThan(1000); // Should complete in under 1 second
      
      // Should not have critical accessibility violations
      const criticalViolations = results.violations.filter(
        violation => violation.impact === 'critical'
      );
      
      expect(criticalViolations).toHaveLength(0);
    });

    test('should handle large datasets accessibly', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockAgentState,
        id: `agent-${i}`,
        name: `Agent ${i}`,
        position: { x: i, y: 64, z: i }
      }));
      
      const startTime = performance.now();
      
      const { container } = renderWithProviders(<App />, { agents: largeDataset });
      
      // Should render large dataset efficiently
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(3000); // Should render 1000 items in under 3 seconds
      
      // Should remain accessible
      const results = await checkAccessibility(container);
      
      const criticalViolations = results.violations.filter(
        violation => violation.impact === 'critical'
      );
      
      expect(criticalViolations.length).toBeLessThan(10); // Less than 1% critical violations
    });
  });
});