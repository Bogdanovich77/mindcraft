# Manual Testing Guide for Profile Management Workflow

This guide provides step-by-step instructions for manually validating the complete profile management workflow in the Mindcraft system. Use this guide alongside the automated tests to ensure comprehensive validation of both backend functionality and user experience.

## Prerequisites

1. **Server Setup**: Ensure the Mindcraft server is running on `localhost:8080`
2. **Frontend Setup**: Ensure the frontend development server is running (typically `localhost:3000`)
3. **Test Profiles**: Have at least 2-3 test profiles available in the `profiles/` directory
4. **Browser**: Use a modern browser with developer tools (Chrome, Firefox, Edge)

## Test Environment Setup

1. Open the frontend application in your browser
2. Open browser developer tools (F12) for monitoring:
   - Console tab for JavaScript errors
   - Network tab for API requests
   - Application tab for local storage/state
3. Clear browser cache and local storage before starting tests

---

## Scenario 1: Complete Profile Lifecycle

### 1.1 Profile Loading and Display

**Steps:**
1. Navigate to the Profile Management page
2. Wait for profiles to load (should show loading state initially)
3. Verify all profiles from the `profiles/` directory are displayed
4. Check that each profile card shows:
   - Profile name
   - Model information
   - Agent type
   - Current status (offline/online)
   - Action buttons (Boot, Edit, Delete)

**Expected Results:**
- ✅ Loading indicator appears briefly
- ✅ All profiles from the directory are listed
- ✅ Profile information is displayed correctly
- ✅ No JavaScript errors in console
- ✅ Network requests to `/api/profiles` succeed (200 status)

**Validation Points:**
- Profile images/avatars load correctly
- Responsive design works on different screen sizes
- Empty state is handled if no profiles exist

### 1.2 Profile Booting

**Steps:**
1. Select a profile from the list
2. Click the "Boot" button
3. Observe the button state change (should show "Booting..." or spinner)
4. Wait for the agent to start (typically 10-30 seconds)
5. Verify the agent appears in the "Running Agents" section
6. Check that the profile status changes to "online"

**Expected Results:**
- ✅ Button shows loading state during boot process
- ✅ Success notification appears when agent boots
- ✅ Agent appears in running agents list
- ✅ Profile status updates to "online"
- ✅ Real-time stats begin updating (position, health, inventory)

**Validation Points:**
- Boot button is disabled during booting process
- Error handling works if booting fails
- Multiple agents can be booted simultaneously
- Agent stats update in real-time

### 1.3 Real-time Stats Updates

**Steps:**
1. With an agent running, observe the "Agent Status" section
2. Monitor the following stats for updates:
   - Position (x, y, z coordinates)
   - Health points
   - Inventory items and count
   - Current action/goal
3. Wait 2-3 minutes to see continuous updates
4. Check the update frequency indicator

**Expected Results:**
- ✅ Position updates when agent moves
- ✅ Health updates if agent takes damage
- ✅ Inventory updates when agent picks up items
- ✅ Current action reflects agent behavior
- ✅ Updates appear smoothly without UI freezing

**Validation Points:**
- Update frequency is reasonable (1-5 seconds)
- UI remains responsive during updates
- Connection status indicator shows "Connected"
- No memory leaks or performance degradation

### 1.4 Profile Editing

**Steps:**
1. Click the "Edit" button on a running agent's profile
2. Modify the personality field (e.g., change "friendly" to "aggressive")
3. Change the goals field (e.g., add "mining" to goals)
4. Save the changes
5. Verify the changes are reflected in the agent's behavior
6. Check that changes persist after agent restart

**Expected Results:**
- ✅ Edit form opens with current profile data
- ✅ Form validation works (required fields, proper formats)
- ✅ Save button updates profile successfully
- ✅ Agent behavior changes reflect new personality/goals
- ✅ Changes persist after agent restart

**Validation Points:**
- Form validation provides helpful error messages
- Cancel button discards changes properly
- Real-time validation feedback
- Profile changes are saved to file system

### 1.5 Agent Stopping and Cleanup

**Steps:**
1. Click the "Stop" button on a running agent
2. Confirm the stop action if prompted
3. Verify the agent disappears from running agents list
4. Check that profile status returns to "offline"
5. Verify no background processes remain running
6. Test restarting the same agent

**Expected Results:**
- ✅ Stop confirmation dialog appears
- ✅ Agent gracefully shuts down
- ✅ Running agents list updates immediately
- ✅ Profile status returns to "offline"
- ✅ Agent can be restarted successfully

**Validation Points:**
- Stop process completes within reasonable time (<10 seconds)
- No memory leaks or orphaned processes
- UI updates promptly reflect agent state
- Error handling works if stop fails

---

## Scenario 2: Error Handling and Edge Cases

### 2.1 Invalid Profile Operations

**Steps:**
1. Try to boot an invalid/corrupted profile
2. Attempt to edit a profile with invalid data
3. Try to delete a profile while agent is running
4. Test network disconnection during operations
5. Attempt to boot multiple agents with same name

**Expected Results:**
- ✅ Clear error messages for invalid operations
- ✅ Graceful fallback when operations fail
- ✅ UI remains functional after errors
- ✅ Validation prevents invalid submissions
- ✅ Network errors are handled gracefully

**Validation Points:**
- Error messages are user-friendly and actionable
- No JavaScript crashes or console errors
- Recovery mechanisms work properly
- User can retry failed operations

### 2.2 Concurrent Operations

**Steps:**
1. Boot multiple agents simultaneously
2. Edit different profiles while agents are running
3. Start/stop agents while editing profiles
4. Test rapid clicking of action buttons
5. Switch between profiles quickly

**Expected Results:**
- ✅ Concurrent operations don't interfere with each other
- ✅ UI remains responsive during concurrent actions
- ✅ Race conditions are properly handled
- ✅ Button states prevent conflicting operations
- ✅ Data consistency is maintained

**Validation Points:**
- No data corruption from concurrent operations
- Proper locking mechanisms for critical operations
- UI feedback prevents user confusion
- Performance remains acceptable under load

### 2.3 Browser and Network Issues

**Steps:**
1. Test with slow network connection (throttle)
2. Refresh page during active operations
3. Close and reopen browser tab
4. Test with different browser sizes
5. Disable JavaScript and test fallbacks

**Expected Results:**
- ✅ Slow network is handled gracefully
- ✅ Page refresh doesn't cause data loss
- ✅ Responsive design works on all sizes
- ✅ Progressive enhancement works without JS
- ✅ Session state is properly restored

**Validation Points:**
- Loading states for slow operations
- Proper cleanup on page unload
- Local storage for session persistence
- Mobile-friendly interface
- Accessibility features work properly

---

## Scenario 3: Performance and Reliability

### 3.1 Extended Operation Testing

**Steps:**
1. Run agents for extended period (30+ minutes)
2. Monitor memory usage in browser dev tools
3. Check for memory leaks or performance degradation
4. Test with multiple agents running simultaneously
5. Monitor network bandwidth usage

**Expected Results:**
- ✅ Memory usage remains stable
- ✅ No performance degradation over time
- ✅ Network usage is optimized
- ✅ UI remains responsive after extended use
- ✅ No memory leaks or resource exhaustion

**Validation Points:**
- Memory usage doesn't grow indefinitely
- CPU usage remains reasonable
- Network requests are properly throttled
- Garbage collection works effectively
- Long-running operations remain stable

### 3.2 Stress Testing

**Steps:**
1. Boot maximum number of agents (system limit)
2. Rapidly start/stop agents in succession
3. Perform rapid profile edits
4. Test with large profile data
5. Simulate high-frequency real-time updates

**Expected Results:**
- ✅ System handles maximum load gracefully
- ✅ Performance degrades gracefully under load
- ✅ No crashes or system failures
- ✅ Appropriate rate limiting in place
- ✅ Resource limits are enforced

**Validation Points:**
- System remains stable under stress
- Appropriate error handling for overload
- Graceful degradation of features
- Resource cleanup works properly
- User feedback for system limitations

---

## Scenario 4: Integration Validation

### 4.1 Backend API Integration

**Steps:**
1. Monitor Network tab in browser dev tools
2. Verify all API calls use correct endpoints
3. Check proper HTTP methods (GET, POST, PUT, DELETE)
4. Validate request/response formats
5. Test error response handling

**Expected Results:**
- ✅ All API calls use correct endpoints
- ✅ Proper HTTP methods for each operation
- ✅ Request/response formats match API specification
- ✅ Error responses are properly handled
- ✅ Authentication/authorization works correctly

**Validation Points:**
- API documentation is accurate
- Response times are within acceptable limits
- Error codes are meaningful and consistent
- Request payload validation works
- Response data is properly sanitized

### 4.2 Socket.IO Integration

**Steps:**
1. Monitor WebSocket connections in dev tools
2. Verify real-time events are received
3. Test connection resilience (disconnect/reconnect)
4. Check event data integrity
5. Validate event handling performance

**Expected Results:**
- ✅ WebSocket connections establish properly
- ✅ Real-time events are received timely
- ✅ Connection resilience works correctly
- ✅ Event data is complete and accurate
- ✅ Event handling doesn't impact UI performance

**Validation Points:**
- Connection status indicators work
- Automatic reconnection succeeds
- Event ordering is preserved
- Duplicate events are handled
- Connection failures are reported

---

## Test Results Checklist

### Functional Testing
- [ ] Profile listing works correctly
- [ ] Profile creation succeeds
- [ ] Profile booting functions properly
- [ ] Real-time updates work as expected
- [ ] Profile editing saves changes
- [ ] Agent stopping/cleanup works
- [ ] Error handling is comprehensive
- [ ] Concurrent operations work correctly

### Performance Testing
- [ ] Response times are acceptable (<2 seconds)
- [ ] Memory usage remains stable
- [ ] UI remains responsive under load
- [ ] Network usage is optimized
- [ ] Extended operations are stable

### Usability Testing
- [ ] Interface is intuitive and easy to use
- [ ] Loading states provide good feedback
- [ ] Error messages are clear and helpful
- [ ] Responsive design works on all devices
- [ ] Accessibility features work properly

### Integration Testing
- [ ] Backend API integration works correctly
- [ ] Socket.IO integration functions properly
- [ ] Data persistence works as expected
- [ ] Cross-browser compatibility is good
- [ ] Mobile functionality works correctly

---

## Bug Report Template

If you encounter issues during testing, use this template:

```
Bug Report:
---------
Title: [Brief description of the issue]

Environment:
- Browser: [Browser name and version]
- Operating System: [OS and version]
- Server Version: [Mindcraft version]
- Frontend Version: [Frontend build version]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Results:
[What should have happened]

Actual Results:
[What actually happened]

Screenshots/Videos:
[Attach if applicable]

Console Errors:
[Paste any JavaScript console errors]

Network Issues:
[Describe any network request failures]

Severity: [Critical/High/Medium/Low]
Priority: [High/Medium/Low]
```

## Test Completion

After completing all manual tests:

1. **Document Results**: Record all test outcomes in a shared document
2. **Report Bugs**: Create bug reports for any issues found
3. **Performance Metrics**: Document performance measurements
4. **User Experience Notes**: Record any UX improvements suggested
5. **Integration Status**: Note any integration issues or successes

This manual testing guide complements the automated test suite and ensures comprehensive validation of the complete profile management workflow from both technical and user experience perspectives.