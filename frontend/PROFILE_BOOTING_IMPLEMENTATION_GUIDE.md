# Profile Booting Implementation Guide

## Overview

This guide documents the complete profile booting functionality that connects the frontend profile components to the backend agent creation and management system. The implementation provides seamless agent lifecycle management with real-time updates.

## Architecture

### Components

1. **ProfileService** (`src/services/profileService.ts`)
   - Handles all profile-related API calls and Socket.IO events
   - Provides boot, stop, restart, and status checking functionality
   - Manages real-time event subscriptions

2. **Profiles Slice** (`src/store/slices/profilesSlice.ts`)
   - Redux state management for profiles
   - Async thunks for profile operations
   - Real-time event handling via Socket.IO

3. **ProfileCard** (`src/components/ProfileCard.tsx`)
   - Individual profile display with boot/stop/restart controls
   - Real-time status indicators
   - Loading states and error handling

4. **AgentStatusDisplay** (`src/components/AgentStatusDisplay.tsx`)
   - Real-time agent statistics display
   - Health, position, inventory, equipment visualization
   - Compact and detailed view modes

5. **Socket.IO Service** (`src/services/socketService.ts`)
   - Enhanced with agent lifecycle event handlers
   - Simplified event validation and sanitization
   - Real-time bidirectional communication

## Key Features

### 1. Agent Lifecycle Management

- **Boot Profile**: Start an agent from a profile configuration
- **Stop Profile**: Gracefully stop a running agent
- **Restart Profile**: Stop and restart an agent in sequence
- **Status Check**: Get current status of any profile/agent

### 2. Real-time Updates

- **Socket.IO Integration**: All status changes update in real-time
- **Event-driven Architecture**: Backend events automatically update UI
- **Connection Management**: Automatic reconnection and error handling

### 3. User Experience

- **Loading States**: Visual feedback during operations
- **Error Handling**: Comprehensive error messages and recovery
- **Status Indicators**: Clear visual status representation
- **Responsive Design**: Works on desktop and mobile devices

## Implementation Details

### ProfileService Methods

```typescript
// Boot a profile to start an agent
async bootProfile(name: string): Promise<ProfileBootResponse>

// Stop a running agent
async stopProfile(name: string): Promise<void>

// Restart an agent (stop + boot)
async restartProfile(name: string): Promise<ProfileBootResponse>

// Get current status of a profile/agent
async getProfileStatus(name: string): Promise<{ status: string; isRunning: boolean; agentId?: string }>
```

### Redux Actions

```typescript
// Async thunks
bootProfile(profileName: string)
stopProfile(profileName: string)
restartProfile(profileName: string)
checkProfileStatus(profileName: string)
initializeProfilesSocket()

// State selectors
selectAllProfiles
selectBootingProfiles
selectIsProfileBooting(profileName)
```

### Socket.IO Events

#### Client to Server:
- `create-agent-from-profile`: Start agent from profile
- `stop-agent`: Stop running agent
- `get-agent-status`: Request agent status

#### Server to Client:
- `agent:connected`: Agent successfully connected
- `agent:disconnected`: Agent disconnected
- `agent:status`: Agent status update
- `agent:boot`: Boot operation result
- `agent:stop`: Stop operation result
- `agent:restart`: Restart operation result

## Usage Examples

### Basic Profile Management

```typescript
import { useDispatch } from 'react-redux';
import { bootProfile, stopProfile, restartProfile } from '../store/slices/profilesSlice';

const ProfileManager = () => {
  const dispatch = useDispatch();

  const handleBoot = async (profileName: string) => {
    try {
      await dispatch(bootProfile(profileName)).unwrap();
      console.log('Profile booted successfully');
    } catch (error) {
      console.error('Boot failed:', error);
    }
  };

  const handleStop = async (profileName: string) => {
    await dispatch(stopProfile(profileName));
  };

  const handleRestart = async (profileName: string) => {
    await dispatch(restartProfile(profileName));
  };

  return (
    // UI components with handlers
  );
};
```

### Real-time Status Monitoring

```typescript
import { useSelector } from 'react-redux';
import { selectAllProfiles, selectBootingProfiles } from '../store/slices/profilesSlice';

const ProfileStatus = () => {
  const profiles = useSelector(selectAllProfiles);
  const bootingProfiles = useSelector(selectBootingProfiles);

  return (
    <div>
      {profiles.map(profile => (
        <div key={profile.id}>
          <h3>{profile.name}</h3>
          <p>Status: {profile.status}</p>
          <p>Running: {profile.isRunning ? 'Yes' : 'No'}</p>
          {bootingProfiles.includes(profile.name) && (
            <p>Booting...</p>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Agent Status Display

```typescript
import AgentStatusDisplay from '../components/AgentStatusDisplay';

const AgentMonitor = ({ agentId }) => {
  return (
    <div>
      {/* Detailed view */}
      <AgentStatusDisplay 
        agentId={agentId} 
        compact={false} 
        showDetails={true} 
      />
      
      {/* Compact view */}
      <AgentStatusDisplay 
        agentId={agentId} 
        compact={true} 
        showDetails={false} 
      />
    </div>
  );
};
```

## Integration with Existing Systems

### Backend Integration

The profile booting system integrates with the existing backend through:

1. **REST API Endpoints**:
   - `POST /api/profiles/{name}/boot` - Boot profile
   - `POST /api/profiles/{name}/stop` - Stop profile
   - `GET /api/profiles/{name}/status` - Get status

2. **Socket.IO Events**:
   - Uses existing Socket.IO connection
   - Leverages simplified LangGraph agent architecture
   - Compatible with current agent management system

### Agent State Management

The system integrates with the simplified 4-node LangGraph architecture:

- **Perception Node**: Updates world context
- **Conversation Node**: Handles communication
- **Decision Node**: Action selection
- **Execution Node**: Executes actions

Agent state includes the 7 core fields:
- `worldContext`: Position, health, inventory
- `personality`: Agent personality string
- `goals`: Agent goals string
- `mandate`: Current orders
- `conversation`: Message tracking
- `lastAction`: Last executed action
- `response`: Last response string

## Error Handling

### Client-side Errors

- **Network Errors**: Automatic retry with exponential backoff
- **Validation Errors**: Profile validation before operations
- **Timeout Errors**: 30-second timeout for boot operations
- **Connection Errors**: Graceful degradation and user feedback

### Server-side Errors

- **Boot Failures**: Detailed error messages
- **Agent Creation Errors**: Profile validation feedback
- **Resource Errors**: Clear status communication

## Performance Considerations

### Optimization Features

1. **Memoized Selectors**: Prevent unnecessary re-renders
2. **Debounced Updates**: Throttled Socket.IO event handling
3. **Lazy Loading**: Components load data as needed
4. **Connection Pooling**: Reused Socket.IO connections

### Memory Management

- **Event Listener Cleanup**: Automatic cleanup on unmount
- **State Sanitization**: Limited data retention
- **Cache Management**: Intelligent caching strategies

## Testing

### Unit Tests

```typescript
// Profile service tests
describe('ProfileService', () => {
  test('should boot profile successfully', async () => {
    const result = await profileService.bootProfile('test-profile');
    expect(result.success).toBe(true);
  });

  test('should handle boot failures', async () => {
    await expect(profileService.bootProfile('invalid-profile'))
      .rejects.toThrow('Failed to boot profile');
  });
});

// Redux slice tests
describe('profilesSlice', () => {
  test('should handle boot profile pending', () => {
    const action = { type: 'profiles/bootProfile/pending', meta: { arg: 'test' } };
    const state = profilesSlice.reducer(initialState, action);
    expect(state.booting['test']).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Component integration tests
describe('ProfileCard Integration', () => {
  test('should boot profile when button clicked', async () => {
    const mockBoot = jest.fn();
    render(<ProfileCard profile={mockProfile} onBoot={mockBoot} />);
    
    fireEvent.click(screen.getByText('Boot'));
    await waitFor(() => {
      expect(mockBoot).toHaveBeenCalledWith('test-profile');
    });
  });
});
```

## Troubleshooting

### Common Issues

1. **Profile Not Booting**
   - Check backend server connection
   - Verify profile configuration
   - Check Socket.IO connection status

2. **Status Not Updating**
   - Verify Socket.IO event listeners
   - Check Redux state updates
   - Ensure component subscriptions

3. **Agent Not Showing**
   - Check agent creation in backend
   - Verify agent registration
   - Check Socket.IO event emission

### Debug Tools

- **Redux DevTools**: Monitor state changes
- **Socket.IO Debug**: Enable debug logging
- **Network Tab**: Check API calls and events
- **Console Logs**: Detailed operation logging

## Future Enhancements

### Planned Features

1. **Bulk Operations**: Boot/stop multiple profiles
2. **Scheduling**: Timed agent operations
3. **Performance Metrics**: Agent performance tracking
4. **Advanced Filtering**: Enhanced profile filtering
5. **Export/Import**: Profile configuration management

### Scalability Considerations

- **Horizontal Scaling**: Multiple backend instances
- **Load Balancing**: Agent distribution
- **Caching Strategy**: Enhanced caching mechanisms
- **Monitoring**: Performance and health monitoring

## Conclusion

The profile booting implementation provides a comprehensive solution for agent lifecycle management with real-time updates, error handling, and user-friendly interfaces. It integrates seamlessly with the existing Mindcraft architecture while maintaining performance and scalability.

The modular design allows for easy extension and modification, while the comprehensive error handling ensures reliability in production environments.