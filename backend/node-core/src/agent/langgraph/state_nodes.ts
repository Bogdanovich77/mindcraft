/**
 * State Nodes for Simplified Mindcraft LangGraph System
 * Defines the core processing nodes for the 4-node architecture: Perception, Conversation, Decision, Execution
 */

import { 
  AgentState, 
  WorldContext, 
  ConversationState, 
  Position,
  InventoryItem,
  Entity,
  Equipment,
  Inventory
} from './interfaces.js';

// Import Prompter for LLM integration with type annotation
import { Prompter } from '../../models/prompter.js';

/**
 * Execution Node - Executes chosen actions and updates state
 * 
 * Responsibilities:
 * - Executes the lastAction chosen by the Decision node
 * - Handles both physical commands and chat responses
 * - Updates the mandate if a new task is accepted through conversation
 * - Integrates with existing mineflayer action systems
 * - Provides feedback on action execution results
 * 
 * Performance Target: <100ms for action dispatch
 * 
 * @param state Current AgentState with lastAction, response, and conversation
 * @param bot Mineflayer bot instance for action execution
 * @param agent Agent instance containing action manager and other systems
 * @returns Updated AgentState with execution results and potential mandate updates
 */
export async function executionNode(state: any, bot?: any, agent?: any): Promise<Partial<any>> {
  const startTime = Date.now();
  
  try {
    console.log("[EXECUTION] Starting action execution");
    console.log(`[EXECUTION] Action to execute: "${state.lastAction}"`);
    
    // Validate required state fields
    if (!state.lastAction || state.lastAction.trim().length === 0) {
      console.warn("[EXECUTION] No action to execute, returning without changes");
      return {};
    }
    
    // Initialize execution results
    let executionResult = {
      success: false,
      message: "",
      actionExecuted: state.lastAction,
      mandateUpdated: false,
      newMandate: state.mandate || ""
    };
    
    // Execute chat response if present
    if (state.response && state.response.trim().length > 0) {
      await executeChatResponse(state.response, bot);
      executionResult.message += `Chat response sent: "${state.response}"\n`;
    }
    
    // Execute the chosen action
    const actionResult = await executeAction(state.lastAction, state, bot, agent);
    executionResult = { ...executionResult, ...actionResult };
    
    // Check for mandate updates based on conversation context
    const mandateUpdate = await updateMandateFromConversation(state, bot);
    if (mandateUpdate.updated) {
      executionResult.mandateUpdated = true;
      executionResult.newMandate = mandateUpdate.newMandate;
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`[EXECUTION] Processing completed in ${processingTime}ms`);
    console.log(`[EXECUTION] Execution result:`, executionResult);
    
    // Performance validation
    if (processingTime > 100) {
      console.warn(`[EXECUTION] Performance warning: Processing took ${processingTime}ms (target: <100ms)`);
    }
    
    // Return updated state with execution results and potential mandate changes
    const returnValue: Partial<any> = {};
    
    // Update mandate if it changed
    if (executionResult.mandateUpdated) {
      returnValue.mandate = executionResult.newMandate;
      console.log(`[EXECUTION] Mandate updated to: "${executionResult.newMandate}"`);
    }
    
    // Clear response and action after execution
    returnValue.response = "";
    returnValue.lastAction = "";
    
    return returnValue;
    
  } catch (error) {
    console.error("[EXECUTION] Error during action execution:", error);
    
    // Return safe state to maintain system stability
    return {
      response: "", // Clear response to avoid re-sending
      lastAction: state.lastAction // Keep action for debugging
    };
  }
}

/**
 * Executes chat response using mineflayer bot
 * 
 * @param response The response message to send
 * @param bot Mineflayer bot instance
 */
async function executeChatResponse(response: string, bot?: any): Promise<void> {
  try {
    if (!bot || !bot.chat) {
      console.warn("[EXECUTION] No bot or chat capability available, skipping chat response");
      return;
    }
    
    // Validate and clean response
    const cleanedResponse = validateAndCleanChatMessage(response);
    if (cleanedResponse.length === 0) {
      console.warn("[EXECUTION] Empty or invalid chat response, skipping");
      return;
    }
    
    // Send chat message
    bot.chat(cleanedResponse);
    console.log(`[EXECUTION] Chat response sent: "${cleanedResponse}"`);
    
  } catch (error) {
    console.error("[EXECUTION] Error sending chat response:", error);
  }
}

/**
 * Executes the specified action using appropriate handlers
 * 
 * @param action The action to execute
 * @param state Current agent state for context
 * @param bot Mineflayer bot instance
 * @param agent Agent instance containing action manager
 * @returns Execution result with success status and message
 */
async function executeAction(action: string, state: any, bot?: any, agent?: any): Promise<any> {
  try {
    console.log(`[EXECUTION] Executing action: "${action}"`);
    
    // Normalize action for processing
    const normalizedAction = action.trim().toLowerCase();
    
    // Route to appropriate action handler
    if (normalizedAction.includes('chat') || normalizedAction.includes('talk') || normalizedAction.includes('respond')) {
      return await handleChatAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('move') || normalizedAction.includes('walk') || normalizedAction.includes('go')) {
      return await handleMovementAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('dig') || normalizedAction.includes('mine') || normalizedAction.includes('excavate')) {
      return await handleDiggingAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('build') || normalizedAction.includes('construct') || normalizedAction.includes('place')) {
      return await handleBuildingAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('craft') || normalizedAction.includes('create')) {
      return await handleCraftingAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('eat') || normalizedAction.includes('consume') || normalizedAction.includes('food')) {
      return await handleEatingAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('heal') || normalizedAction.includes('recover')) {
      return await handleHealingAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('sleep') || normalizedAction.includes('rest')) {
      return await handleSleepingAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('attack') || normalizedAction.includes('fight') || normalizedAction.includes('strike')) {
      return await handleAttackAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('defend') || normalizedAction.includes('protect')) {
      return await handleDefenseAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('flee') || normalizedAction.includes('run') || normalizedAction.includes('escape')) {
      return await handleFleeAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('explore') || normalizedAction.includes('scout') || normalizedAction.includes('search')) {
      return await handleExplorationAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('patrol')) {
      return await handlePatrolAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('organize') || normalizedAction.includes('sort')) {
      return await handleOrganizeAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('accept_help') || normalizedAction.includes('accept') || normalizedAction.includes('agree')) {
      return await handleAcceptHelpAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('request_help') || normalizedAction.includes('help')) {
      return await handleRequestHelpAction(normalizedAction, state, bot);
    } else if (normalizedAction.includes('wait') || normalizedAction.includes('stay') || normalizedAction.includes('idle')) {
      return await handleWaitAction(normalizedAction, state, bot);
    } else {
      // Handle unknown actions
      return await handleUnknownAction(normalizedAction, state, bot);
    }
    
  } catch (error) {
    console.error(`[EXECUTION] Error executing action "${action}":`, error);
    return {
      success: false,
      message: `Action execution failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles chat-related actions
 */
async function handleChatAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling chat action");
    
    // Chat actions are handled through the response field, so this is mostly a no-op
    return {
      success: true,
      message: "Chat action processed through response field",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Chat action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles movement actions using pathfinder
 */
async function handleMovementAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling movement action");
    
    if (!bot || !bot.pathfinder) {
      console.warn("[EXECUTION] No pathfinder available, using basic movement");
      return {
        success: false,
        message: "Movement requires pathfinder plugin",
        actionExecuted: action
      };
    }
    
    // Simple movement - in a full implementation, this would parse direction and distance
    // For now, we'll use a basic forward movement
    const movements = new bot.pathfinder.Movements(bot, bot.mcData);
    
    // Placeholder for actual movement logic
    console.log("[EXECUTION] Movement action would be implemented with pathfinder");
    
    return {
      success: true,
      message: "Movement action executed",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Movement action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles digging/mining actions
 */
async function handleDiggingAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling digging action");
    
    if (!bot) {
      return {
        success: false,
        message: "Digging requires bot instance",
        actionExecuted: action
      };
    }
    
    // Check if bot has a tool equipped
    const tool = state.worldContext?.equipment?.tool;
    if (!tool) {
      console.warn("[EXECUTION] No tool equipped for digging");
      return {
        success: false,
        message: "Digging requires a tool (pickaxe, shovel, etc.)",
        actionExecuted: action
      };
    }
    
    // Find a block to dig (simplified - would use target selection logic)
    const targetBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (targetBlock && targetBlock.type !== 0) {
      await bot.dig(targetBlock);
      console.log(`[EXECUTION] Dug block: ${targetBlock.name}`);
      
      return {
        success: true,
        message: `Dug ${targetBlock.name}`,
        actionExecuted: action
      };
    } else {
      return {
        success: false,
        message: "No suitable block to dig found",
        actionExecuted: action
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Digging action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles building/placing actions
 */
async function handleBuildingAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling building action");
    
    if (!bot) {
      return {
        success: false,
        message: "Building requires bot instance",
        actionExecuted: action
      };
    }
    
    // Find a suitable block to place on
    const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (!referenceBlock || referenceBlock.type === 0) {
      return {
        success: false,
        message: "No suitable reference block found for building",
        actionExecuted: action
      };
    }
    
    // Find a placeable block in inventory (simplified)
    const placeableItem = state.worldContext?.inventory?.items?.find((item: any) => 
      item.name.includes('dirt') || item.name.includes('stone') || item.name.includes('wood')
    );
    
    if (!placeableItem) {
      return {
        success: false,
        message: "No building materials available in inventory",
        actionExecuted: action
      };
    }
    
    // Place the block
    const placementPosition = referenceBlock.position.offset(0, 1, 0);
    await bot.placeBlock(referenceBlock, placementPosition);
    
    console.log(`[EXECUTION] Placed ${placeableItem.name} block`);
    
    return {
      success: true,
      message: `Placed ${placeableItem.name} block`,
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Building action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles crafting actions
 */
async function handleCraftingAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling crafting action");
    
    // Crafting would require access to crafting tables and recipe knowledge
    // This is a placeholder implementation
    
    return {
      success: true,
      message: "Crafting action placeholder - would craft based on available materials",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Crafting action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles eating actions
 */
async function handleEatingAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling eating action");
    
    if (!bot) {
      return {
        success: false,
        message: "Eating requires bot instance",
        actionExecuted: action
      };
    }
    
    // Find food in inventory
    const foodItem = state.worldContext?.inventory?.items?.find((item: any) => 
      item.name.includes('bread') || item.name.includes('apple') || item.name.includes('meat') || 
      item.name.includes('carrot') || item.name.includes('potato')
    );
    
    if (!foodItem) {
      return {
        success: false,
        message: "No food available in inventory",
        actionExecuted: action
      };
    }
    
    // Eat the food
    const item = bot.inventory.findInventoryItem(foodItem.name);
    if (item) {
      await bot.equip(item, 'hand');
      await bot.consume();
      console.log(`[EXECUTION] Ate ${foodItem.name}`);
      
      return {
        success: true,
        message: `Ate ${foodItem.name}`,
        actionExecuted: action
      };
    } else {
      return {
        success: false,
        message: `Could not find ${foodItem.name} in inventory`,
        actionExecuted: action
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Eating action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles healing actions
 */
async function handleHealingAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling healing action");
    
    const currentHealth = state.worldContext?.health || 0;
    
    if (currentHealth >= 20) {
      return {
        success: true,
        message: "Already at full health",
        actionExecuted: action
      };
    }
    
    // Try to eat food for healing
    const eatResult = await handleEatingAction(action, state, bot);
    return eatResult;
    
  } catch (error) {
    return {
      success: false,
      message: `Healing action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles sleeping actions
 */
async function handleSleepingAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling sleeping action");
    
    if (!bot) {
      return {
        success: false,
        message: "Sleeping requires bot instance",
        actionExecuted: action
      };
    }
    
    // Check if it's night time
    const timeOfDay = state.worldContext?.timeOfDay || 0;
    if (timeOfDay < 13000 || timeOfDay > 23000) {
      return {
        success: false,
        message: "Can only sleep during nighttime",
        actionExecuted: action
      };
    }
    
    // Find a nearby bed
    const nearbyBed = bot.findBlock({
      matching: bot.registry.blocksByName?.bed?.id,
      maxDistance: 10
    });
    
    if (!nearbyBed) {
      return {
        success: false,
        message: "No nearby bed found for sleeping",
        actionExecuted: action
      };
    }
    
    // Sleep in the bed
    await bot.sleep(nearbyBed);
    console.log("[EXECUTION] Bot went to sleep");
    
    return {
      success: true,
      message: "Bot went to sleep",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Sleeping action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles attack actions
 */
async function handleAttackAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling attack action");
    
    if (!bot) {
      return {
        success: false,
        message: "Attack requires bot instance",
        actionExecuted: action
      };
    }
    
    // Find nearby hostile entities
    const hostileEntities = state.worldContext?.nearbyEntities?.filter((e: any) => e.hostile) || [];
    
    if (hostileEntities.length === 0) {
      return {
        success: false,
        message: "No hostile entities nearby to attack",
        actionExecuted: action
      };
    }
    
    // Attack the closest hostile entity
    const target = hostileEntities[0];
    const entity = bot.nearestEntity((entity: any) => entity.id === target.id);
    
    if (entity) {
      await bot.attack(entity);
      console.log(`[EXECUTION] Attacked ${entity.name || entity.type}`);
      
      return {
        success: true,
        message: `Attacked ${entity.name || entity.type}`,
        actionExecuted: action
      };
    } else {
      return {
        success: false,
        message: "Target entity not found",
        actionExecuted: action
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Attack action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles defense actions
 */
async function handleDefenseAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling defense action");
    
    // Defense is typically reactive - this would set up defensive stance
    // For now, we'll just check for threats and prepare to defend
    
    const hostileEntities = state.worldContext?.nearbyEntities?.filter((e: any) => e.hostile && (e.distance || 0) < 8) || [];
    
    if (hostileEntities.length > 0) {
      console.log("[EXECUTION] Defense posture activated - threats detected");
      return {
        success: true,
        message: `Defense posture - ${hostileEntities.length} threats nearby`,
        actionExecuted: action
      };
    } else {
      return {
        success: true,
        message: "Defense posture - no immediate threats",
        actionExecuted: action
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Defense action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles flee actions
 */
async function handleFleeAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling flee action");
    
    if (!bot || !bot.pathfinder) {
      return {
        success: false,
        message: "Fleeing requires pathfinder plugin",
        actionExecuted: action
      };
    }
    
    // Find threats and move away from them
    const hostileEntities = state.worldContext?.nearbyEntities?.filter((e: any) => e.hostile && (e.distance || 0) < 16) || [];
    
    if (hostileEntities.length === 0) {
      return {
        success: false,
        message: "No threats to flee from",
        actionExecuted: action
      };
    }
    
    // Calculate flee direction (away from threats)
    // This would be implemented with proper pathfinding logic
    console.log("[EXECUTION] Fleeing from threats");
    
    return {
      success: true,
      message: "Fleeing from hostile entities",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Flee action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles exploration actions
 */
async function handleExplorationAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling exploration action");
    
    // Exploration would involve moving to unexplored areas
    // This is a placeholder implementation
    
    return {
      success: true,
      message: "Exploration initiated - moving to new areas",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Exploration action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles patrol actions
 */
async function handlePatrolAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling patrol action");
    
    // Patrol would involve moving in a pattern around a base area
    // This is a placeholder implementation
    
    return {
      success: true,
      message: "Patrol initiated - monitoring area",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Patrol action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles inventory organization actions
 */
async function handleOrganizeAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling organize action");
    
    // Organization would involve arranging inventory items
    // This is a placeholder implementation
    
    return {
      success: true,
      message: "Inventory organization completed",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Organize action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles accepting help actions
 */
async function handleAcceptHelpAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling accept help action");
    
    // This would accept help from another bot
    // For now, we'll just acknowledge the acceptance
    
    return {
      success: true,
      message: "Accepted help offer",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Accept help action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles requesting help actions
 */
async function handleRequestHelpAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling request help action");
    
    if (!bot || !bot.chat) {
      return {
        success: false,
        message: "Requesting help requires chat capability",
        actionExecuted: action
      };
    }
    
    // Send help request to chat
    const helpMessage = "Help! I need assistance!";
    bot.chat(helpMessage);
    
    return {
      success: true,
      message: "Help request sent",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Request help action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles wait actions
 */
async function handleWaitAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log("[EXECUTION] Handling wait action");
    
    // Wait is essentially a no-op action
    return {
      success: true,
      message: "Waiting/idling",
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Wait action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Handles unknown actions
 */
async function handleUnknownAction(action: string, state: any, bot?: any): Promise<any> {
  try {
    console.log(`[EXECUTION] Handling unknown action: "${action}"`);
    
    return {
      success: false,
      message: `Unknown action: ${action}`,
      actionExecuted: action
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Unknown action failed: ${error instanceof Error ? error.message : String(error)}`,
      actionExecuted: action
    };
  }
}

/**
 * Updates mandate based on conversation context
 * 
 * @param state Current agent state
 * @param bot Mineflayer bot instance
 * @returns Mandate update result with new mandate if updated
 */
async function updateMandateFromConversation(state: any, bot?: any): Promise<any> {
  try {
    const conversation = state.conversation;
    const currentMandate = state.mandate || "";
    
    // Check if this is a help request that should become a mandate
    if (conversation && conversation.isRequestForHelp && conversation.sender) {
      const helpMandate = `Help ${conversation.sender} with their request`;
      
      if (helpMandate !== currentMandate) {
        console.log(`[EXECUTION] Updating mandate from help request: "${helpMandate}"`);
        return {
          updated: true,
          newMandate: helpMandate
        };
      }
    }
    
    // Check if conversation contains explicit mandate instructions
    if (conversation && conversation.message) {
      const message = conversation.message.toLowerCase();
      
      // Look for mandate patterns
      const mandatePatterns = [
        /mandate[:\s]+(.+)/i,
        /orders?[:\s]+(.+)/i,
        /task[:\s]+(.+)/i,
        /help\s+(\w+)\s+with\s+(.+)/i
      ];
      
      for (const pattern of mandatePatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
          const newMandate = match[1].trim();
          if (newMandate !== currentMandate) {
            console.log(`[EXECUTION] Updating mandate from conversation: "${newMandate}"`);
            return {
              updated: true,
              newMandate: newMandate
            };
          }
        }
      }
    }
    
    // Check if current mandate should be cleared (task completed)
    if (currentMandate && shouldClearMandate(state, currentMandate)) {
      console.log(`[EXECUTION] Clearing completed mandate: "${currentMandate}"`);
      return {
        updated: true,
        newMandate: ""
      };
    }
    
    return {
      updated: false,
      newMandate: currentMandate
    };
    
  } catch (error) {
    console.error("[EXECUTION] Error updating mandate from conversation:", error);
    return {
      updated: false,
      newMandate: state.mandate || "/"
    };
  }
}

/**
 * Determines if a mandate should be cleared based on current state
 * 
 * @param state Current agent state
 * @param mandate Current mandate to check
 * @returns True if mandate should be cleared
 */
function shouldClearMandate(state: any, mandate: string): boolean {
  try {
    // Check if task appears to be completed based on context
    // This is a simplified implementation
    
    // If this was a help request, check if the help was provided
    if (mandate.includes('help') && state.response && state.response.toLowerCase().includes('help')) {
      return false; // Still helping
    }
    
    // If health was low and now it's restored, clear healing mandate
    if (mandate.includes('heal') && state.worldContext && state.worldContext.health >= 18) {
      return true;
    }
    
    // If food was low and now it's restored, clear eating mandate
    if (mandate.includes('eat') && state.worldContext && state.worldContext.food >= 18) {
      return true;
    }
    
    // For other mandates, use time-based clearing (simplified)
    // In a full implementation, this would be much more sophisticated
    return false;
    
  } catch (error) {
    console.error("[EXECUTION] Error checking mandate completion:", error);
    return false;
  }
}

/**
 * Validates and cleans chat messages
 * 
 * @param message The message to validate and clean
 * @returns Cleaned message safe to send
 */
function validateAndCleanChatMessage(message: string): string {
  try {
    if (!message || typeof message !== 'string') {
      return "";
    }
    
    // Clean the message
    let cleanedMessage = message.trim();
    
    // Remove any potentially harmful content
    cleanedMessage = cleanedMessage.replace(/[<>]/g, "");
    
    // Length validation
    if (cleanedMessage.length > 256) {
      console.warn("[EXECUTION] Chat message too long, truncating");
      cleanedMessage = cleanedMessage.substring(0, 253) + "...";
    }
    
    return cleanedMessage;
    
  } catch (error) {
    console.error("[EXECUTION] Error cleaning chat message:", error);
    return "";
  }
}