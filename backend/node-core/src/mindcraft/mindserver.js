import { Server } from 'socket.io';
import { createServer } from 'http';
import * as mindcraft from './mindcraft.js';
import ProfileManager from './profileManager.js';

// Mindserver is:
// - central hub for communication between all agent processes
// - internal Socket.IO server for Agent Core Service
// - handles agent lifecycle management and real-time state updates

let io;
let server;
const agent_connections = {};
const agent_listeners = {};
const profileManager = new ProfileManager();

function agentsStatusUpdate(socket) {
    if (!socket) {
        socket = io;
    }
    let agents = [];
    for (let agentName in agent_connections) {
        const conn = agent_connections[agentName];
        agents.push({
            name: agentName,
            in_game: conn.in_game,
            viewerPort: conn.viewer_port,
            socket_connected: !!conn.socket
        });
    };
    try {
        socket.emit('agents-status', agents);
    } catch (error) {
        console.error('Failed to emit agents-status:', error);
    }
}

// NEW: Simplified agent state update function
function emitSimplifiedAgentState(agentName, agentState) {
    try {
        if (!agentState) {
            console.warn(`[Simplified Events] No agent state provided for ${agentName}`);
            return;
        }

        // Extract only the 7 core fields from the simplified AgentState
        const simplifiedState = {
            agentId: agentName,
            worldContext: agentState.worldContext || null,
            personality: agentState.personality || '',
            goals: agentState.goals || '',
            mandate: agentState.mandate || '',
            conversation: agentState.conversation || null,
            lastAction: agentState.lastAction || '',
            response: agentState.response || '',
            timestamp: Date.now()
        };

        console.log(`[Simplified Events] Emitting agent:state:update for ${agentName}`);
        io.emit('agent:state:update', simplifiedState);
    } catch (error) {
        console.error(`[Simplified Events] Failed to emit agent state update for ${agentName}:`, error);
    }
}

// NEW: Simplified action execution event
function emitActionExecuted(agentName, action, response = '') {
    try {
        const actionData = {
            agentId: agentName,
            action: action || '',
            response: response || '',
            timestamp: Date.now()
        };

        console.log(`[Simplified Events] Emitting agent:action:executed for ${agentName}:`, action);
        io.emit('agent:action:executed', actionData);
    } catch (error) {
        console.error(`[Simplified Events] Failed to emit action executed for ${agentName}:`, error);
    }
}

// NEW: Simplified message sent event
function emitMessageSent(agentName, message, target = null) {
    try {
        const messageData = {
            agentId: agentName,
            message: message || '',
            target: target,
            timestamp: Date.now()
        };

        console.log(`[Simplified Events] Emitting agent:message:sent for ${agentName}:`, message);
        io.emit('agent:message:sent', messageData);
    } catch (error) {
        console.error(`[Simplified Events] Failed to emit message sent for ${agentName}:`, error);
    }
}

// Settings spec is now handled by the FastAPI Gateway
// const settings_spec = JSON.parse(readFileSync(path.join(__dirname, 'public/settings_spec.json'), 'utf8'));
const settings_spec = {
    // Default settings spec for internal validation
    required: ['profile'],
    default: {}
};

class AgentConnection {
    constructor(settings, viewer_port) {
        this.socket = null;
        this.settings = settings;
        this.in_game = false;
        this.full_state = null;
        this.viewer_port = viewer_port;
    }
    setSettings(settings) {
        this.settings = settings;
    }
}

export function registerAgent(settings, viewer_port) {
    let agentConnection = new AgentConnection(settings, viewer_port);
    agent_connections[settings.profile.name] = agentConnection;
}

export function logoutAgent(agentName) {
    if (agent_connections[agentName]) {
        agent_connections[agentName].in_game = false;
        agentsStatusUpdate();
    }
}

// NEW: Set up handlers for simplified agent events
function setupSimplifiedAgentEventHandlers(agentSocket, agentName) {
    if (!agentSocket || !agentName) return;

    console.log(`[Simplified Events] Setting up event handlers for agent ${agentName}`);

    // Handle simplified state updates
    agentSocket.on('simplified:state:update', (data) => {
        try {
            if (data && data.agentState) {
                emitSimplifiedAgentState(agentName, data.agentState);
            }
        } catch (error) {
            console.error(`[Simplified Events] Error handling state update from ${agentName}:`, error);
        }
    });

    // Handle simplified action execution
    agentSocket.on('simplified:action:executed', (data) => {
        try {
            if (data) {
                emitActionExecuted(agentName, data.action, data.response);
            }
        } catch (error) {
            console.error(`[Simplified Events] Error handling action executed from ${agentName}:`, error);
        }
    });

    // Handle simplified message sent
    agentSocket.on('simplified:message:sent', (data) => {
        try {
            if (data) {
                emitMessageSent(agentName, data.message, data.target);
            }
        } catch (error) {
            console.error(`[Simplified Events] Error handling message sent from ${agentName}:`, error);
        }
    });
}

// Initialize the internal Socket.IO server
export function createMindServer(host_public = false, port = 8081) {
    // Create HTTP server for Socket.IO only (no Express)
    server = createServer();
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:8000", "http://localhost:5173"], // Allow FastAPI Gateway and Frontend
            methods: ["GET", "POST"]
        }
    });

    console.log('[Agent Core Service] Starting internal Socket.IO server...');
    console.log('[Agent Core Service] This server only accepts internal connections from FastAPI Gateway');

    // Socket.io connection handling
    io.on('connection', (socket) => {
        let curAgentName = null;
        console.log('Client connected');

        try {
            agentsStatusUpdate(socket);
        } catch (error) {
            console.error('Failed to send initial agents status update:', error);
        }

        socket.on('create-agent', async (settings, callback) => {
            console.log('API create agent...');
            for (let key in settings_spec) {
                if (!(key in settings)) {
                    if (settings_spec[key].required) {
                        callback({ success: false, error: `Setting ${key} is required` });
                        return;
                    }
                    else {
                        settings[key] = settings_spec[key].default;
                    }
                }
            }
            for (let key in settings) {
                if (!(key in settings_spec)) {
                    delete settings[key];
                }
            }
            if (settings.profile?.name) {
                if (settings.profile.name in agent_connections) {
                    callback({ success: false, error: 'Agent already exists' });
                    return;
                }
                let returned = await mindcraft.createAgent(settings);
                callback({ success: returned.success, error: returned.error });
                let name = settings.profile.name;
                if (!returned.success && agent_connections[name]) {
                    mindcraft.destroyAgent(name);
                    delete agent_connections[name];
                }
                try {
                    agentsStatusUpdate();
                } catch (error) {
                    console.error('Failed to update agents status on create-agent:', error);
                }
            }
            else {
                console.error('Agent name is required in profile');
                callback({ success: false, error: 'Agent name is required in profile' });
            }
        });

        socket.on('get-settings', (agentName, callback) => {
            if (agent_connections[agentName]) {
                callback({ settings: agent_connections[agentName].settings });
            } else {
                callback({ error: `Agent '${agentName}' not found.` });
            }
        });

        socket.on('connect-agent-process', (agentName) => {
            if (agent_connections[agentName]) {
                agent_connections[agentName].socket = socket;
                
                // NEW: Set up handlers for simplified agent events
                setupSimplifiedAgentEventHandlers(socket, agentName);
                
                try {
                    agentsStatusUpdate();
                } catch (error) {
                    console.error('Failed to update agents status on connect-agent-process:', error);
                }
            }
        });

        socket.on('login-agent', (agentName) => {
            if (agent_connections[agentName]) {
                agent_connections[agentName].socket = socket;
                agent_connections[agentName].in_game = true;
                curAgentName = agentName;
                try {
                    agentsStatusUpdate();
                } catch (error) {
                    console.error('Failed to update agents status on login-agent:', error);
                }
            }
            else {
                console.warn(`Unregistered agent ${agentName} tried to login`);
            }
        });

        socket.on('disconnect', () => {
            if (agent_connections[curAgentName]) {
                console.log(`Agent ${curAgentName} disconnected`);
                agent_connections[curAgentName].in_game = false;
                agent_connections[curAgentName].socket = null;
                try {
                    agentsStatusUpdate();
                } catch (error) {
                    console.error('Failed to update agents status on disconnect:', error);
                }
            }
            if (agent_listeners.includes(socket)) {
                removeListener(socket);
            }
        });

        socket.on('chat-message', (agentName, json) => {
            if (!agent_connections[agentName]) {
                console.warn(`Agent ${agentName} tried to send a message but is not logged in`);
                return;
            }
            console.log(`${curAgentName} sending message to ${agentName}: ${json.message}`);
            if (agent_connections[agentName].socket) {
                try {
                    agent_connections[agentName].socket.emit('chat-message', curAgentName, json);
                } catch (error) {
                    console.error(`Failed to emit chat-message to agent ${agentName}:`, error);
                }
            } else {
                console.warn(`Agent ${agentName} socket is null, cannot send chat message`);
            }
        });

        socket.on('set-agent-settings', (agentName, settings) => {
            const agent = agent_connections[agentName];
            if (agent) {
                agent.setSettings(settings);
                if (agent.socket) {
                    try {
                        agent.socket.emit('restart-agent');
                    } catch (error) {
                        console.error(`Failed to emit restart-agent to agent ${agentName}:`, error);
                    }
                } else {
                    console.warn(`Agent ${agentName} socket is null, cannot emit restart-agent`);
                }
            }
        });

        socket.on('restart-agent', (agentName) => {
            console.log(`Restarting agent: ${agentName}`);
            const agent = agent_connections[agentName];
            if (agent && agent.socket) {
                try {
                    agent.socket.emit('restart-agent');
                } catch (error) {
                    console.error(`Failed to emit restart-agent to agent ${agentName}:`, error);
                }
            } else {
                console.warn(`Agent ${agentName} not found or socket is null, cannot emit restart-agent`);
            }
        });

        socket.on('stop-agent', (agentName) => {
            mindcraft.stopAgent(agentName);
        });

        socket.on('start-agent', (agentName) => {
            mindcraft.startAgent(agentName);
        });

        socket.on('destroy-agent', (agentName) => {
            if (agent_connections[agentName]) {
                mindcraft.destroyAgent(agentName);
                delete agent_connections[agentName];
            }
            try {
                agentsStatusUpdate();
            } catch (error) {
                console.error('Failed to update agents status on destroy-agent:', error);
            }
        });

        socket.on('stop-all-agents', () => {
            console.log('Killing all agents');
            for (let agentName in agent_connections) {
                mindcraft.stopAgent(agentName);
            }
        });

        socket.on('shutdown', () => {
            console.log('Shutting down');
            for (let agentName in agent_connections) {
                mindcraft.stopAgent(agentName);
            }
            // wait 2 seconds
            setTimeout(() => {
                console.log('Exiting MindServer');
                process.exit(0);
            }, 2000);
            
        });

		socket.on('send-message', (agentName, data) => {
			if (!agent_connections[agentName]) {
				console.warn(`Agent ${agentName} not in game, cannot send message via MindServer.`);
				return
			}
			if (agent_connections[agentName].socket) {
				try {
					agent_connections[agentName].socket.emit('send-message', data)
				} catch (error) {
					console.error(`Failed to emit send-message to agent ${agentName}:`, error);
				}
			} else {
				console.warn(`Agent ${agentName} socket is null, cannot send message`);
			}
		});

        socket.on('bot-output', (agentName, message) => {
            try {
                io.emit('bot-output', agentName, message);
            } catch (error) {
                console.error(`Failed to emit bot-output:`, error);
            }
        });

        socket.on('listen-to-agents', () => {
            addListener(socket);
        });

        socket.on('listen-to-agents', () => {
            addListener(socket);
        });

        // FIX: Add handler for get_agent_list to support explicit agent list requests
        socket.on('get_agent_list', () => {
            console.log('[MindServer] Received get_agent_list request');
            try {
                agentsStatusUpdate(socket);
            } catch (error) {
                console.error('Failed to send agents status on get_agent_list request:', error);
            }
        });

        // Ping handler for frontend latency monitoring
        socket.on('ping', (data) => {
            // Echo back the ping data as pong for latency monitoring
            socket.emit('pong', data);
        });

        // Socket.IO Events for Profile Management (kept for internal FastAPI communication)
        setupProfileSocketHandlers(socket);
    });

    let host = host_public ? '0.0.0.0' : 'localhost';
    server.listen(port, host, () => {
        console.log(`[Agent Core Service] Internal Socket.IO server running on port ${port}`);
        console.log(`[Agent Core Service] Ready for internal communication from FastAPI Gateway`);
        console.log(`[Agent Core Service] External API requests should go to port 8000 (FastAPI Gateway)`);
    });

    return server;
}

/**
 * REST API routes are now handled by the FastAPI Gateway
 * This function is kept for reference but no longer used
 */
function setupProfileRoutes(app) {
    // REST API routes moved to FastAPI Gateway
    console.log('[Agent Core Service] REST API routes are now handled by FastAPI Gateway on port 8000');
}

/**
 * Setup Socket.IO handlers for profile management
 */
function setupProfileSocketHandlers(socket) {
    // get-profiles - Return list of available profiles
    socket.on('get-profiles', async (callback) => {
        try {
            const profiles = await profileManager.getProfiles();
            if (typeof callback === 'function') {
                callback({ success: true, data: profiles });
            } else {
                // If no callback provided, emit the response as an event
                socket.emit('get-profiles-response', { success: true, data: profiles });
            }
        } catch (error) {
            console.error('Socket get-profiles error:', error);
            if (typeof callback === 'function') {
                callback({ success: false, error: error.message });
            } else {
                // If no callback provided, emit the error as an event
                socket.emit('get-profiles-response', { success: false, error: error.message });
            }
        }
    });

    // get-profile - Get specific profile details by name
    socket.on('get-profile', async (name, callback) => {
        try {
            const profile = await profileManager.getProfile(name);
            if (typeof callback === 'function') {
                callback({ success: true, data: profile });
            } else {
                // If no callback provided, emit the response as an event
                socket.emit('get-profile-response', { success: true, data: profile });
            }
        } catch (error) {
            console.error(`Socket get-profile ${name} error:`, error);
            if (typeof callback === 'function') {
                callback({ success: false, error: error.message });
            } else {
                // If no callback provided, emit the error as an event
                socket.emit('get-profile-response', { success: false, error: error.message });
            }
        }
    });

    // save-profile - Save/modify a profile
    socket.on('save-profile', async (name, profileData, callback) => {
        try {
            const updatedProfile = await profileManager.saveProfile(name, profileData);
            callback({
                success: true,
                data: updatedProfile,
                message: `Profile '${name}' saved successfully`
            });
        } catch (error) {
            console.error(`Socket save-profile ${name} error:`, error);
            callback({ success: false, error: error.message });
        }
    });

    // create-agent-from-profile - Create and start an agent using a specific profile
    socket.on('create-agent-from-profile', async (profileName, settings, callback) => {
        try {
            // First get the profile
            const profile = await profileManager.getProfile(profileName);
            
            // Merge profile with any additional settings
            const agentSettings = {
                ...settings,
                profile: profile
            };

            // Validate required settings
            for (let key in settings_spec) {
                if (!(key in agentSettings)) {
                    if (settings_spec[key].required) {
                        callback({ success: false, error: `Setting ${key} is required` });
                        return;
                    } else {
                        agentSettings[key] = settings_spec[key].default;
                    }
                }
            }

            // Check if agent already exists
            if (agent_connections[profile.name]) {
                callback({ success: false, error: 'Agent already exists' });
                return;
            }

            // Create the agent
            let returned = await mindcraft.createAgent(agentSettings);
            
            if (returned.success) {
                callback({
                    success: true,
                    data: { agentName: profile.name, profile: profile },
                    message: `Agent '${profile.name}' created from profile successfully`
                });
                agentsStatusUpdate();
            } else {
                callback({ success: false, error: returned.error });
                // Cleanup if creation failed
                if (agent_connections[profile.name]) {
                    mindcraft.destroyAgent(profile.name);
                    delete agent_connections[profile.name];
                }
            }
        } catch (error) {
            console.error(`Socket create-agent-from-profile ${profileName} error:`, error);
            callback({ success: false, error: error.message });
        }
    });

    // delete-profile - Remove a profile file
    socket.on('delete-profile', async (name, callback) => {
        try {
            // Check if agent is currently running with this profile
            if (agent_connections[name]) {
                callback({
                    success: false,
                    error: `Cannot delete profile '${name}' - agent is currently running. Please stop the agent first.`
                });
                return;
            }

            await profileManager.deleteProfile(name);
            callback({
                success: true,
                message: `Profile '${name}' deleted successfully`
            });
        } catch (error) {
            console.error(`Socket delete-profile ${name} error:`, error);
            callback({ success: false, error: error.message });
        }
    });
}

let listenerInterval = null;
function addListener(listener_socket) {
    agent_listeners.push(listener_socket);
    if (agent_listeners.length === 1) {
        listenerInterval = setInterval(async () => {
            const states = {};
            for (let agentName in agent_connections) {
                let agent = agent_connections[agentName];
                if (agent.in_game) {
                    try {
                        if (agent.socket) {
                            const state = await new Promise((resolve) => {
                                try {
                                    agent.socket.emit('get-full-state', (s) => resolve(s));
                                } catch (error) {
                                    console.error(`Failed to emit get-full-state to agent ${agentName}:`, error);
                                    resolve({ error: String(error) });
                                }
                            });
                            
                            // NEW: Emit simplified agent state instead of complex state
                            if (state && !state.error) {
                                emitSimplifiedAgentState(agentName, state);
                                states[agentName] = state; // Keep for backward compatibility
                            } else {
                                states[agentName] = { error: state.error || 'Unknown error' };
                            }
                        } else {
                            states[agentName] = { error: 'Socket is null' };
                        }
                    } catch (e) {
                        states[agentName] = { error: String(e) };
                    }
                }
            }
            
            // Keep backward compatibility for existing listeners
            for (let listener of agent_listeners) {
                try {
                    listener.emit('state-update', states);
                } catch (error) {
                    console.error('Failed to emit state-update to listener:', error);
                }
            }
        }, 1000);
    }
}

function removeListener(listener_socket) {
    agent_listeners.splice(agent_listeners.indexOf(listener_socket), 1);
    if (agent_listeners.length === 0) {
        clearInterval(listenerInterval);
        listenerInterval = null;
    }
}

// Optional: export these if you need access to them from other files
export const getIO = () => io;
export const getServer = () => server;
export const numStateListeners = () => agent_listeners.length;