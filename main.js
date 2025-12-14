import * as Mindcraft from './dist/src/mindcraft/mindcraft.js';
import settings, { setSettings } from './dist/src/agent/settings.js';
import settingsConfig from './settings.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { createAgentLoader } from './dist/src/agent/langgraph_agent_loader.js';

// Initialize the global settings object with the configuration from settings.js
setSettings(settingsConfig);

function parseArguments() {
    return yargs(hideBin(process.argv))
        .option('profiles', {
            type: 'array',
            describe: 'List of agent profile paths',
        })
        .option('task_path', {
            type: 'string',
            describe: 'Path to task file to execute'
        })
        .option('task_id', {
            type: 'string',
            describe: 'Task ID to execute'
        })
        .help()
        .alias('help', 'h')
        .parse();
}
const args = parseArguments();
if (args.profiles) {
    settings.profiles = args.profiles;
}
if (args.task_path) {
    let tasks = JSON.parse(readFileSync(args.task_path, 'utf8'));
    if (args.task_id) {
        settings.task = tasks[args.task_id];
        settings.task.task_id = args.task_id;
    }
    else {
        throw new Error('task_id is required when task_path is provided');
    }
}

// these environment variables override certain settings
if (process.env.MINECRAFT_PORT) {
    settings.port = process.env.MINECRAFT_PORT;
}
if (process.env.MINDSERVER_PORT) {
    settings.mindserver_port = process.env.MINDSERVER_PORT;
}
if (process.env.PROFILES && JSON.parse(process.env.PROFILES).length > 0) {
    settings.profiles = JSON.parse(process.env.PROFILES);
}
if (process.env.INSECURE_CODING) {
    settings.allow_insecure_coding = true;
}
if (process.env.BLOCKED_ACTIONS) {
    settings.blocked_actions = JSON.parse(process.env.BLOCKED_ACTIONS);
}
if (process.env.MAX_MESSAGES) {
    settings.max_messages = process.env.MAX_MESSAGES;
}
if (process.env.NUM_EXAMPLES) {
    settings.num_examples = process.env.NUM_EXAMPLES;
}
if (process.env.LOG_ALL) {
    settings.log_all_prompts = process.env.LOG_ALL;
}

// Initialize Mindcraft server
Mindcraft.init(true, settings.mindserver_port, settings.auto_open_ui);

// Initialize agent loader based on system configuration
const agentLoader = createAgentLoader();

async function initializeAgents() {
    console.log(`[DEBUG] Initializing agents with ${settings.agent_system} system...`);
    console.log('[DEBUG] Settings:', {
        agent_system: settings.agent_system,
        profiles_count: settings.profiles.length,
        profiles: settings.profiles
    });
    
    if (settings.agent_system === 'langgraph') {
        // Use new LangGraph agent system
        console.log('[DEBUG] Agent system is set to langgraph, attempting to load LangGraph agents...');
        try {
            console.log('[DEBUG] Creating agent loader...');
            const agentLoader = createAgentLoader();
            console.log('[DEBUG] Agent loader created successfully');
            
            console.log('[DEBUG] Loading all agents...');
            const agents = await agentLoader.loadAllAgents();
            console.log(`[DEBUG] Successfully loaded ${agents.length} LangGraph agents`);
            
            // Check what types of agents were actually loaded
            agents.forEach((agent, index) => {
                console.log(`[DEBUG] Agent ${index}:`, {
                    name: agent.name || agent.profile?.name || 'unknown',
                    constructor: agent.constructor.name,
                    hasProfile: !!agent.profile,
                    profileAgentType: agent.profile?.agentType
                });
            });
            
            // Register each loaded agent with the MindServer
            let agentIndex = 0;
            for (const agent of agents) {
                if (agent.profile) {
                    const viewer_port = 3000 + agentIndex;
                    console.log(`[DEBUG] Registering agent ${agent.profile.name} on port ${viewer_port}`);
                    
                    // Register the agent with MindServer
                    Mindcraft.registerAgent({
                        profile: agent.profile,
                        host: settings.host || 'localhost',
                        port: settings.port || 25565,
                        minecraft_version: settings.minecraft_version || 'auto',
                        load_memory: settings.load_memory || false,
                        init_message: settings.init_message || null
                    }, viewer_port);
                    
                    // Connect the agent to the MindServer
                    console.log(`[DEBUG] Connecting agent ${agent.profile.name} to MindServer...`);
                    agent.connectToMindServer(settings.mindserver_port || 8080);
                    
                    agentIndex++;
                    console.log(`[DEBUG] Registered LangGraph agent: ${agent.profile.name}`);
                } else {
                    console.warn('[DEBUG] Agent missing profile, skipping registration');
                }
            }
            
            // Display agent statistics
            console.log('[DEBUG] Getting agent statistics...');
            const stats = await agentLoader.getAgentStats();
            console.log('[DEBUG] Agent Statistics:', stats);
            
        } catch (error) {
            console.error('[DEBUG] Failed to load LangGraph agents, falling back to legacy system:', error);
            console.error('[DEBUG] Full error details:', error.stack);
            fallbackToLegacy();
        }
    } else {
        console.log('[DEBUG] Agent system is not langgraph, using legacy system...');
        // Use legacy system
        fallbackToLegacy();
    }
}

function fallbackToLegacy() {
    console.log('[DEBUG] Using legacy agent system...');
    
    for (let profile of settings.profiles) {
        console.log(`[DEBUG] Loading legacy profile: ${profile}`);
        try {
            const profile_json = JSON.parse(readFileSync(profile, 'utf8'));
            console.log(`[DEBUG] Profile loaded: ${profile_json.name}, agentType: ${profile_json.agentType}`);
            
            // Merge global settings with profile-specific settings to ensure host/port are present
            const agentSettings = { ...settings, profile: profile_json };
            console.log(`[DEBUG] Creating legacy agent for ${profile_json.name}...`);
            Mindcraft.createAgent(agentSettings);
            console.log(`[DEBUG] Legacy agent created for ${profile_json.name}`);
        } catch (error) {
            console.error(`[DEBUG] Failed to load legacy profile ${profile}:`, error);
        }
    }
}

// Initialize agents
initializeAgents().catch(error => {
    console.error('Failed to initialize agents:', error);
    process.exit(1);
});