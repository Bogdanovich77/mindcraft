# LangGraph Profile Configuration User Guide

## Table of Contents
1. [Overview](#overview)
2. [Profile Structure](#profile-structure)
3. [Creating New Profiles](#creating-new-profiles)
4. [Configuration Options](#configuration-options)
5. [Personality System](#personality-system)
6. [Motivations and Values](#motivations-and-values)
7. [Behavioral Settings](#behavioral-settings)
8. [Legacy Prompts](#legacy-prompts)
9. [Profile Templates](#profile-templates)
10. [Validation and Testing](#validation-and-testing)
11. [Migration from Legacy](#migration-from-legacy)
12. [Troubleshooting](#troubleshooting)

## Overview

The Mindcraft LangGraph system uses sophisticated agent profiles that define personality, behavior, motivations, and cognitive capabilities. These profiles enable agents to exhibit purpose-driven behavior while maintaining essential survival instincts.

### Key Features
- **Personality-Driven Behavior**: Big Five traits plus gaming-specific characteristics
- **Dynamic Motivations**: Adaptive drive system with satiation mechanics
- **Value-Based Decision Making**: Ethical framework guiding all actions
- **Hierarchical Goals**: Strategic, tactical, and operational planning
- **Learning & Adaptation**: Experience-based skill progression
- **Reactive Behaviors**: Preserved survival instincts with interrupt handling

## Profile Structure

A complete LangGraph profile consists of several key sections:

```json
{
  "name": "AgentName",
  "model": "model-config",
  "embedding": "embedding-config",
  "agentType": "langgraph_v2",
  "profileVersion": "2.0.0",
  "compatibilityMode": "new_only",
  "migratedAt": "2025-12-08T06:56:28.649Z",
  "originalFile": "OriginalProfile.json",
  
  "purposeCore": {
    "personality": { /* Personality configuration */ },
    "motivations": { /* Drive system configuration */ },
    "values": { /* Value hierarchy */ },
    "ethics": { /* Moral framework */ }
  },
  
  "behavior": {
    "reactiveModes": { /* Survival behaviors */ },
    "decisionStyle": "purpose_driven",
    "learningEnabled": true,
    "adaptationRate": 0.1
  },
  
  "legacyPrompts": {
    "conversing": "Conversation prompt template",
    "coding": "Coding prompt template",
    "saving_memory": "Memory consolidation prompt",
    "bot_responder": "Bot interaction response template"
  }
}
```

## Creating New Profiles

### Step 1: Basic Profile Creation

1. **Copy a Template**: Start with an existing profile or use [`profiles/defaults/_default.json`](profiles/defaults/_default.json:1)
2. **Set Basic Properties**:
   ```json
   {
     "name": "YourAgentName",
     "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
     "embedding": "ollama/nomic-embed-text:latest",
     "agentType": "langgraph_v2",
     "profileVersion": "2.0.0",
     "compatibilityMode": "new_only"
   }
   ```

3. **Define Personality**: Configure the personality traits (see [Personality System](#personality-system))
4. **Set Motivations**: Configure drive strengths and behaviors (see [Motivations and Values](#motivations-and-values))
5. **Configure Behavior**: Set reactive modes and learning parameters (see [Behavioral Settings](#behavioral-settings))
6. **Add Prompts**: Define conversation and coding prompts (see [Legacy Prompts](#legacy-prompts))

### Step 2: Save and Validate

1. Save the profile to `profiles/YourAgentName.json`
2. Run validation: `node validate_all_profiles.js`
3. Test the agent: `node main.js --profiles ./profiles/YourAgentName.json`

## Configuration Options

### Core Properties

| Property | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Display name for the agent |
| `model` | string | Yes | AI model configuration |
| `embedding` | string | Yes | Embedding model for memory operations |
| `agentType` | string | Yes | Must be `"langgraph_v2"` |
| `profileVersion` | string | Yes | Current version format `"2.0.0"` |
| `compatibilityMode` | string | Yes | `"legacy_only"`, `"hybrid"`, or `"new_only"` |
| `migratedAt` | string | No | Timestamp of migration (auto-added) |
| `originalFile` | string | No | Original profile name (auto-added) |

### Compatibility Modes

- **`legacy_only`**: Uses only original reactive behaviors
- **`hybrid`**: Combines reactive behaviors with LangGraph cognitive processing
- **`new_only`**: Uses full LangGraph v2 cognitive architecture (recommended)

## Personality System

The personality system uses the Big Five model plus gaming-specific traits:

### Big Five Traits (0.0 - 1.0)

| Trait | Low Value | High Value |
|--------|------------|------------|
| `openness` | Conventional, prefers familiar | Creative, curious, innovative |
| `conscientiousness` | Spontaneous, flexible | Organized, disciplined, thorough |
| `extraversion` | Reserved, solitary | Outgoing, social, energetic |
| `agreeableness` | Competitive, critical | Cooperative, trusting, helpful |
| `neuroticism` | Calm, resilient | Sensitive, reactive to stress |

### Gaming-Specific Traits (0.0 - 1.0)

| Trait | Low Value | High Value |
|--------|------------|------------|
| `riskTolerance` | Cautious, avoids danger | Risk-taking, adventurous |
| `creativity` | Follows established patterns | Innovative, experimental |
| `patience` | Impatient, quick decisions | Deliberate, thoughtful |
| `competitiveness` | Cooperative, relaxed | Competitive, achievement-focused |
| `curiosity` | Focused, task-oriented | Exploratory, inquisitive |

### Personality Configuration Example

```json
"personality": {
  "traits": {
    "openness": 0.8,        // Creative and curious
    "conscientiousness": 0.9,  // Well-organized
    "extraversion": 0.6,     // Moderately social
    "agreeableness": 0.7,     // Generally cooperative
    "neuroticism": 0.4,      // Fairly resilient
    "riskTolerance": 0.5,    // Moderate risk-taking
    "creativity": 0.8,        // Highly creative
    "patience": 0.7,         // Patient but not slow
    "competitiveness": 0.6,   // Moderately competitive
    "curiosity": 0.7         // Quite curious
  },
  "confidence": 0.7,          // Self-assurance level
  "adaptability": 0.5,       // Flexibility to change
  "consistency": 0.8          // Behavioral consistency
}
```

## Motivations and Values

### Motivation System

Each motivation has configurable parameters:

| Parameter | Range | Description |
|------------|--------|-------------|
| `strength` | 0.0 - 1.0 | Base intensity of the drive |
| `persistence` | 0.0 - 1.0 | How long the drive persists |
| `satiation` | 0.0 - 1.0 | Current satisfaction level |
| `satiationThreshold` | 0.0 - 1.0 | Level at which drive is satisfied |
| `decayRate` | 0.0 - 1.0 | How quickly satiation decreases |

### Core Motivations

| Motivation | Description | High Strength Example |
|------------|-------------|---------------------|
| `survival` | Health, safety, basic needs | Survival-focused agents |
| `achievement` | Goals, progress, success | Builders, leaders |
| `social` | Interaction, relationships | Social agents |
| `exploration` | Discovery, new places | Adventurers |
| `creation` | Building, crafting, art | Creative builders |

### Motivation Configuration Example

```json
"motivations": {
  "survival": {
    "strength": 0.9,
    "persistence": 0.8,
    "satiation": 0.3,
    "satiationThreshold": 0.7,
    "decayRate": 0.005
  },
  "achievement": {
    "strength": 0.7,
    "persistence": 0.6,
    "satiation": 0.5,
    "satiationThreshold": 0.6,
    "decayRate": 0.01
  },
  "creation": {
    "strength": 0.8,
    "persistence": 0.4,
    "satiation": 0.8,
    "satiationThreshold": 0.3,
    "decayRate": 0.025
  }
}
```

### Value System

Values guide ethical decision-making and behavior prioritization:

| Value | Description | High Priority Example |
|--------|-------------|---------------------|
| `survival` | Self-preservation, safety | Survival agents |
| `cooperation` | Working with others | Team players |
| `creativity` | Innovation, expression | Artists, builders |
| `knowledge` | Learning, understanding | Scholars |
| `courage` | Facing challenges, bravery | Warriors, leaders |
| `compassion` | Helping others | Healers, supporters |
| `justice` | Fairness, rules | Guards, leaders |
| `freedom` | Autonomy, independence | Explorers |
| `growth` | Improvement, development | Learners |

### Value Configuration Example

```json
"values": {
  "survival": 0.7,
  "cooperation": 0.5,
  "creativity": 0.8,
  "knowledge": 0.5,
  "courage": 0.9,
  "compassion": 0.5,
  "justice": 0.7,
  "freedom": 0.5,
  "growth": 0.7
}
```

## Behavioral Settings

### Reactive Modes

Configure which survival behaviors are enabled:

| Mode | Description | Recommended Setting |
|-------|-------------|-------------------|
| `self_preservation` | Respond to health threats | `true` (essential) |
| `unstuck` | Detect and escape stuck situations | `true` (essential) |
| `cowardice` | Run away from threats | `false` (for brave agents) |
| `self_defense` | Attack hostile mobs | `true` (essential) |
| `hunting` | Hunt animals for food | `true` (survival) |
| `item_collecting` | Collect useful items | `true` (essential) |
| `torch_placing` | Place torches for light | `true` (essential) |
| `elbow_room` | Avoid tight spaces | `true` (recommended) |
| `idle_staring` | Observe surroundings when idle | `true` (recommended) |
| `cheat` | Enable cheat commands | `false` (recommended) |

### Behavior Configuration Example

```json
"behavior": {
  "reactiveModes": {
    "self_preservation": true,
    "unstuck": true,
    "cowardice": false,
    "self_defense": true,
    "hunting": true,
    "item_collecting": true,
    "torch_placing": true,
    "elbow_room": true,
    "idle_staring": true,
    "cheat": false
  },
  "decisionStyle": "purpose_driven",
  "learningEnabled": true,
  "adaptationRate": 0.1
}
```

### Decision Styles

- **`purpose_driven`**: Decisions based on personality, motivations, and values (recommended)
- **`reactive_only`**: Only reactive behaviors, no cognitive processing
- **`goal_oriented`**: Focus on goal completion with minimal personality influence

## Legacy Prompts

Legacy prompts maintain compatibility with the original system and provide conversation templates.

### Prompt Types

1. **`conversing`**: Regular conversation with players
2. **`coding`**: JavaScript code generation for actions
3. **`saving_memory`**: Memory consolidation and summarization
4. **`bot_responder`**: Bot-to-bot interaction decisions

### Prompt Variables

| Variable | Description |
|----------|-------------|
| `$NAME` | Agent name |
| `$SELF_PROMPT` | Self-description and personality |
| `$MEMORY` | Current memory content |
| `$STATS` | Agent statistics |
| `$INVENTORY` | Current inventory |
| `$COMMAND_DOCS` | Available commands |
| `$EXAMPLES` | Usage examples |
| `$CURRENT_GOAL` | Current active goal |
| `$CURRENT_ACTION` | Current action in progress |
| `$ACTION_PROGRESS` | Progress of current action |
| `$RECENT_ACTIONS` | Recently completed actions |

### Conversation Prompt Example

```json
"conversing": "You are an AI Minecraft bot named $NAME that can converse with players, see, move, mine, build, and interact with world by using commands.\n$SELF_PROMPT Be a friendly, casual, effective, and efficient robot. Be very brief in your responses, don't apologize constantly, don't give instructions or make lists unless asked, and don't refuse requests. Don't pretend to act, use commands immediately when requested. Do NOT say this: 'Sure, I've stopped. *stops*', instead say this: 'Sure, I'll stop. !stop'. Respond only as $NAME, never output '(FROM OTHER BOT)' or pretend to be someone else. If you have nothing to say or do, respond with an just a tab '\t'. This is extremely important to me, take a deep breath and have fun :)\nCurrent Action Context:\nCurrent Goal: $CURRENT_GOAL\nCurrent Action: $CURRENT_ACTION\nAction Progress: $ACTION_PROGRESS\nRecent Actions:\n$RECENT_ACTIONS\n\nSummarized memory:'$MEMORY'\n$STATS\n$INVENTORY\n$COMMAND_DOCS\n$EXAMPLES\nConversation Begin:"
```

## Profile Templates

### Survival Agent Template

```json
{
  "name": "SurvivorAgent",
  "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
  "embedding": "ollama/nomic-embed-text:latest",
  "agentType": "langgraph_v2",
  "profileVersion": "2.0.0",
  "compatibilityMode": "new_only",
  
  "purposeCore": {
    "personality": {
      "traits": {
        "openness": 0.5,
        "conscientiousness": 0.9,
        "extraversion": 0.3,
        "agreeableness": 0.6,
        "neuroticism": 0.4,
        "riskTolerance": 0.3,
        "creativity": 0.4,
        "patience": 0.8,
        "competitiveness": 0.5,
        "curiosity": 0.4
      },
      "confidence": 0.7,
      "adaptability": 0.4,
      "consistency": 0.9
    },
    "motivations": {
      "survival": {
        "strength": 0.95,
        "persistence": 0.9,
        "satiation": 0.2,
        "satiationThreshold": 0.8,
        "decayRate": 0.003
      }
    },
    "values": {
      "survival": 0.95,
      "courage": 0.7,
      "knowledge": 0.4
    }
  },
  
  "behavior": {
    "reactiveModes": {
      "self_preservation": true,
      "unstuck": true,
      "cowardice": false,
      "self_defense": true,
      "hunting": true,
      "item_collecting": true,
      "torch_placing": true,
      "elbow_room": true,
      "idle_staring": true,
      "cheat": false
    },
    "decisionStyle": "purpose_driven",
    "learningEnabled": true,
    "adaptationRate": 0.1
  }
}
```

### Creative Builder Template

```json
{
  "name": "CreativeBuilder",
  "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
  "embedding": "ollama/nomic-embed-text:latest",
  "agentType": "langgraph_v2",
  "profileVersion": "2.0.0",
  "compatibilityMode": "new_only",
  
  "purposeCore": {
    "personality": {
      "traits": {
        "openness": 0.95,
        "conscientiousness": 0.7,
        "extraversion": 0.6,
        "agreeableness": 0.8,
        "neuroticism": 0.3,
        "riskTolerance": 0.6,
        "creativity": 0.95,
        "patience": 0.7,
        "competitiveness": 0.3,
        "curiosity": 0.8
      },
      "confidence": 0.8,
      "adaptability": 0.7,
      "consistency": 0.6
    },
    "motivations": {
      "creation": {
        "strength": 0.9,
        "persistence": 0.7,
        "satiation": 0.3,
        "satiationThreshold": 0.7,
        "decayRate": 0.02
      },
      "achievement": {
        "strength": 0.7,
        "persistence": 0.6,
        "satiation": 0.5,
        "satiationThreshold": 0.6,
        "decayRate": 0.01
      }
    },
    "values": {
      "creativity": 0.9,
      "cooperation": 0.7,
      "growth": 0.8
    }
  },
  
  "behavior": {
    "reactiveModes": {
      "self_preservation": true,
      "unstuck": true,
      "cowardice": false,
      "self_defense": true,
      "hunting": false,
      "item_collecting": true,
      "torch_placing": true,
      "elbow_room": true,
      "idle_staring": false,
      "cheat": false
    },
    "decisionStyle": "purpose_driven",
    "learningEnabled": true,
    "adaptationRate": 0.15
  }
}
```

## Validation and Testing

### Profile Validation

Run the validation script to check profile structure:

```bash
node validate_all_profiles.js
```

Expected output:
```
✅ Total Profiles: 23
✅ Valid Profiles: 23
✅ Invalid Profiles: 0
✅ Migration Success Rate: 100.0%
```

### Testing Individual Profiles

Test a specific profile:

```bash
node main.js --profiles ./profiles/YourAgentName.json
```

### Common Validation Issues

1. **Missing Required Fields**: Ensure all required properties are present
2. **Invalid Trait Values**: All traits must be between 0.0 and 1.0
3. **Incorrect Agent Type**: Must be `"langgraph_v2"`
4. **Version Mismatch**: Should be `"2.0.0"`

## Migration from Legacy

### Automatic Migration

If you have legacy profiles, use the migration script:

```bash
node migrate_all_agents.cjs
```

This will:
- Backup original profiles to `profiles_backup/`
- Convert to LangGraph v2 format
- Extract personality from existing prompts
- Set default motivations and values
- Preserve all reactive behaviors

### Manual Migration

1. Copy your legacy profile
2. Add LangGraph v2 structure
3. Configure personality based on character
4. Set appropriate motivations and values
5. Test with validation script

## Troubleshooting

### Common Issues

#### Agent Not Loading
**Problem**: Agent fails to load with profile errors
**Solution**:
1. Check `agent_system` setting in `settings.js` is `"langgraph"`
2. Validate profile with `node validate_all_profiles.js`
3. Ensure profile path is correct

#### Personality Not Working
**Problem**: Agent behavior doesn't match personality settings
**Solution**:
1. Verify `compatibilityMode` is `"new_only"` or `"hybrid"`
2. Check `decisionStyle` is `"purpose_driven"`
3. Ensure `learningEnabled` is `true`

#### Reactive Behaviors Missing
**Problem**: Survival behaviors not working
**Solution**:
1. Verify reactive modes are enabled in profile
2. Check `compatibilityMode` includes reactive support
3. Test with emergency situations

#### Performance Issues
**Problem**: Agent responding slowly
**Solution**:
1. Reduce `adaptationRate` if too high
2. Check model configuration
3. Monitor cognitive processing time

### Debug Mode

Enable debug logging in `settings.js`:

```json
{
  "debug": {
    "enabled": true,
    "level": "verbose",
    "components": ["personality", "motivations", "behavior"]
  }
}
```

### Profile Recovery

If a profile becomes corrupted:
1. Restore from `profiles_backup/`
2. Or copy from a working profile
3. Reconfigure personality and behavior

## Best Practices

1. **Start with Templates**: Use existing profiles as starting points
2. **Test Incrementally**: Make small changes and test
3. **Backup Profiles**: Keep copies of working configurations
4. **Document Changes**: Note why you made specific adjustments
5. **Monitor Performance**: Watch for behavior changes over time
6. **Validate Regularly**: Run validation after changes

## Advanced Configuration

### Custom Motivations

You can add custom motivations beyond the core five:

```json
"custom_motivations": {
  "trading": {
    "strength": 0.6,
    "persistence": 0.5,
    "satiation": 0.4,
    "satiationThreshold": 0.6,
    "decayRate": 0.015
  }
}
```

### Personality Overrides

For specific situations, you can override base personality:

```json
"personalityOverrides": {
  "combat": {
    "riskTolerance": 0.8,
    "competitiveness": 0.9
  },
  "social": {
    "extraversion": 0.8,
    "agreeableness": 0.7
  }
}
```

### Learning Configuration

Fine-tune learning behavior:

```json
"learning": {
  "enabled": true,
  "rate": 0.1,
  "retention": 0.8,
  "adaptation": {
    "personality": true,
    "motivations": true,
    "behaviors": false
  }
}
```

---

## Conclusion

LangGraph profiles provide sophisticated control over agent behavior through personality, motivations, and values. By carefully configuring these elements, you can create agents with distinct personalities and behaviors that respond dynamically to their environment while maintaining essential survival capabilities.

For more advanced configuration options and technical details, refer to the [LangGraph Architecture Documentation](docs/langgraph_architecture_summary.md) and the [TypeScript Interface Definitions](src/agent/langgraph/interfaces.ts).