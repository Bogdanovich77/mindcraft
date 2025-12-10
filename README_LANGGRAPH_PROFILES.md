# LangGraph Profile Documentation

## Overview

This documentation suite provides comprehensive guidance for creating, configuring, and managing LangGraph profiles for the Mindcraft system. LangGraph profiles enable sophisticated AI agents with personality-driven behavior, dynamic motivations, and adaptive learning capabilities.

## Documentation Structure

### 📚 [Complete User Guide](LANGGRAPH_PROFILE_USER_GUIDE.md)
**Comprehensive documentation covering all aspects of profile configuration**

- **Profile Structure**: Detailed explanation of all configuration sections
- **Personality System**: Big Five traits plus gaming-specific characteristics
- **Motivations and Values**: Drive systems and ethical frameworks
- **Behavioral Settings**: Reactive modes and learning parameters
- **Legacy Prompts**: Compatibility with existing conversation system
- **Advanced Configuration**: Custom motivations and personality overrides
- **Troubleshooting**: Common issues and solutions

**Best for**: Complete reference and deep understanding

---

### ⚡ [Quick Reference Guide](LANGGRAPH_PROFILE_QUICK_REFERENCE.md)
**Fast lookup for common configurations and examples**

- **Quick Start Examples**: Ready-to-use profile templates
- **Personality Cheat Sheet**: Trait combinations for common archetypes
- **Motivation Guidelines**: Strength recommendations by priority
- **Reactive Mode Combinations**: Pre-configured behavior sets
- **Validation Commands**: Essential testing commands
- **Troubleshooting Quick Fixes**: Rapid problem resolution

**Best for**: Experienced users and rapid configuration

---

### 🎓 [Step-by-Step Tutorial](LANGGRAPH_PROFILE_TUTORIAL.md)
**Hands-on guide to creating your first profile**

- **Environment Setup**: Prerequisites and initial configuration
- **Profile Creation**: Building a profile from scratch
- **Personality Design**: Crafting agent characteristics
- **Motivation Configuration**: Setting drive systems
- **Testing and Validation**: Ensuring profiles work correctly
- **Fine-Tuning**: Adjusting behavior based on observation
- **Common Issues**: Solutions to typical problems

**Best for**: Beginners and first-time profile creators

---

## Getting Started

### For New Users

1. **Start with the Tutorial**: [Step-by-Step Tutorial](LANGGRAPH_PROFILE_TUTORIAL.md)
2. **Reference the User Guide**: [Complete User Guide](LANGGRAPH_PROFILE_USER_GUIDE.md) for detailed explanations
3. **Use Quick Reference**: [Quick Reference Guide](LANGGRAPH_PROFILE_QUICK_REFERENCE.md) for common tasks

### For Experienced Users

1. **Quick Reference**: [Quick Reference Guide](LANGGRAPH_PROFILE_QUICK_REFERENCE.md) for rapid lookups
2. **User Guide**: [Complete User Guide](LANGGRAPH_PROFILE_USER_GUIDE.md) for advanced features
3. **Tutorial**: [Step-by-Step Tutorial](LANGGRAPH_PROFILE_TUTORIAL.md) for specific examples

## Key Concepts

### 🧠 Personality System

LangGraph profiles use a sophisticated personality model based on:

- **Big Five Traits**: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **Gaming-Specific Traits**: Risk Tolerance, Creativity, Patience, Competitiveness, Curiosity
- **Dynamic Adaptation**: Personality influences learning and decision-making

### 💪 Motivation System

Agents are driven by multiple motivations that change over time:

- **Core Motivations**: Survival, Achievement, Social, Exploration, Creation
- **Satiation Mechanics**: Drives are satisfied and decay over time
- **Priority Balancing**: Multiple motivations compete for attention

### 🎯 Value-Based Ethics

Decision-making is guided by a value hierarchy:

- **Core Values**: Survival, Cooperation, Creativity, Knowledge, Courage, Compassion, Justice, Freedom, Growth
- **Ethical Frameworks**: Utilitarian, deontological, virtue-based approaches
- **Moral Reasoning**: Context-aware ethical decision-making

### 🔄 Learning and Adaptation

Agents learn from experience and adapt behavior:

- **Experience Processing**: Learning from actions and outcomes
- **Personality Adaptation**: Traits evolve based on experiences
- **Skill Progression**: Dynamic skill development with practice

## Profile Examples

### 🛡️ Survival Agent
```json
{
  "name": "Survivor",
  "purposeCore": {
    "personality": {
      "traits": {
        "conscientiousness": 0.9,
        "riskTolerance": 0.2,
        "patience": 0.8
      }
    },
    "motivations": {
      "survival": {"strength": 0.9}
    }
  }
}
```

### 🎨 Creative Builder
```json
{
  "name": "Builder",
  "purposeCore": {
    "personality": {
      "traits": {
        "openness": 0.9,
        "creativity": 0.9,
        "agreeableness": 0.8
      }
    },
    "motivations": {
      "creation": {"strength": 0.9}
    }
  }
}
```

### 🗺️ Explorer
```json
{
  "name": "Explorer",
  "purposeCore": {
    "personality": {
      "traits": {
        "openness": 0.9,
        "curiosity": 0.9,
        "riskTolerance": 0.8
      }
    },
    "motivations": {
      "exploration": {"strength": 0.9}
    }
  }
}
```

## Validation and Testing

### Essential Commands

```bash
# Validate all profiles
node validate_all_profiles.js

# Test specific profile
node main.js --profiles ./profiles/YourProfile.json

# Debug mode
node main.js --debug --profiles ./profiles/YourProfile.json
```

### Common Validation Issues

| Issue | Cause | Solution |
|--------|--------|----------|
| Invalid JSON | Syntax error | Use JSON validator |
| Missing fields | Incomplete profile | Check required fields |
| Invalid traits | Values outside 0-1 range | Verify trait values |
| Wrong agent type | Legacy format | Set `"agentType": "langgraph_v2"` |

## Advanced Features

### Custom Motivations

Create specialized drives for unique behaviors:

```json
"custom_motivations": {
  "trading": {
    "strength": 0.8,
    "persistence": 0.6,
    "satiation": 0.4,
    "satiationThreshold": 0.7,
    "decayRate": 0.015
  }
}
```

### Personality Overrides

Context-specific personality adjustments:

```json
"personalityOverrides": {
  "combat": {
    "riskTolerance": 0.9,
    "competitiveness": 0.9
  },
  "social": {
    "extraversion": 0.9,
    "agreeableness": 0.9
  }
}
```

### Learning Configuration

Fine-tune adaptation behavior:

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

## Migration Guide

### From Legacy Profiles

1. **Automatic Migration**: `node migrate_all_agents.cjs`
2. **Manual Migration**: Follow [Tutorial](LANGGRAPH_PROFILE_TUTORIAL.md)
3. **Validation**: `node validate_all_profiles.js`

### Compatibility Modes

- **`legacy_only`**: Original reactive behaviors only
- **`hybrid`**: Reactive + LangGraph cognitive processing
- **`new_only`**: Full LangGraph v2 architecture (recommended)

## File Structure

```
mindcraft/
├── profiles/                    # Profile configurations
│   ├── MyAgent.json            # Your custom profiles
│   ├── defaults/               # Template profiles
│   └── backup/                # Backup copies
├── docs/                      # Documentation
├── src/agent/langgraph/        # LangGraph implementation
├── validate_all_profiles.js     # Validation script
├── migrate_all_agents.cjs      # Migration script
└── main.js                    # Main application
```

## Community Resources

### Profile Sharing

- **Template Library**: Community-contributed profiles
- **Personality Presets**: Common character archetypes
- **Behavior Patterns**: Proven configurations

### Support

- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Recommended approaches
- **Performance Tips**: Optimization guidelines

## Technical Reference

### Core Interfaces

- **[AgentState](src/agent/langgraph/interfaces.ts:662)**: Complete state structure
- **[PersonalityTraits](src/agent/langgraph/interfaces.ts:142)**: Personality definition
- **[MotivationSystem](src/agent/langgraph/interfaces.ts:155)**: Drive system
- **[ValueHierarchy](src/agent/langgraph/interfaces.ts:162)**: Value structure

### Implementation Files

- **[Purpose Core](src/agent/cognitive/purpose_core.ts:1)**: Personality and motivation processing
- **[Agent Loader](src/agent/langgraph_agent_loader.js:1)**: Profile loading system
- **[State Graph](src/agent/langgraph/core_graph.ts:1)**: Cognitive processing graph

## Contributing

### Documentation Improvements

1. **Report Issues**: Inaccuracies or missing information
2. **Suggest Examples**: Useful profile configurations
3. **Share Templates**: Common personality patterns

### Profile Contributions

1. **Test Thoroughly**: Ensure profiles work correctly
2. **Document Behavior**: Explain expected characteristics
3. **Validate Structure**: Use validation tools

---

## Quick Links

| Document | Purpose | Audience |
|-----------|---------|----------|
| [User Guide](LANGGRAPH_PROFILE_USER_GUIDE.md) | Complete reference | All users |
| [Quick Reference](LANGGRAPH_PROFILE_QUICK_REFERENCE.md) | Rapid lookup | Experienced users |
| [Tutorial](LANGGRAPH_PROFILE_TUTORIAL.md) | Step-by-step learning | Beginners |
| [TypeScript Interfaces](src/agent/langgraph/interfaces.ts) | Technical reference | Developers |
| [Migration Summary](MIGRATION_SUMMARY.md) | System upgrade info | Existing users |

## Getting Help

### Self-Service

1. **Check Validation**: Run `node validate_all_profiles.js`
2. **Review Logs**: Look for error messages in console output
3. **Compare Examples**: Use working profiles as reference

### Community Support

1. **Documentation**: Search these guides for solutions
2. **Examples**: Review existing profiles in `profiles/`
3. **Templates**: Use `profiles/defaults/` as starting points

---

**Last Updated**: December 10, 2025  
**Version**: LangGraph v2.0.0  
**Compatible**: Mindcraft LangGraph System

For the most up-to-date information, check the [project repository](https://github.com/your-repo/mindcraft).