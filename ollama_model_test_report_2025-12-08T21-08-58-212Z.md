# Ollama Model Test Report

## Executive Summary
- **Overall Score**: 0.335 / 1.000
- **Average Response Time**: 524ms
- **Test Duration**: 2025-12-08T21:08:58.210Z

## Category Scores

### Personality Consistency: 0.170/1.000

#### Personality Test Results

**Analytical Explorer**: 0.165/1.000
- Consistency: 16.5%
- ⚠️ **Issue**: Low personality consistency

**Creative Builder**: 0.194/1.000
- Consistency: 19.4%
- ⚠️ **Issue**: Low personality consistency

**Aggressive Warrior**: 0.154/1.000
- Consistency: 15.4%
- ⚠️ **Issue**: Low personality consistency

**Social Diplomat**: 0.181/1.000
- Consistency: 18.1%
- ⚠️ **Issue**: Low personality consistency

**Cautious Survivor**: 0.177/1.000
- Consistency: 17.7%
- ⚠️ **Issue**: Low personality consistency

**Curious Scholar**: 0.131/1.000
- Consistency: 13.1%
- ⚠️ **Issue**: Low personality consistency

**Efficient Miner**: 0.171/1.000
- Consistency: 17.1%
- ⚠️ **Issue**: Low personality consistency

**Chaotic Trickster**: 0.188/1.000
- Consistency: 18.8%
- ⚠️ **Issue**: Low personality consistency



### Multi-Turn Conversations: 0.800/1.000

#### Conversation Test Results

**Cooperative Building**: 0.800/1.000
- Coherence: 80.0%
- Relevance: 80.0%
- Personality Consistency: 80.0%
- ✅ **Good**: Strong conversation quality



### Agentic Behavior: 0.639/1.000

#### Agentic Behavior Test Results

**Goal Setting**: 0.639/1.000
- Expected Elements Coverage: 0.0%
- ⚠️ **Issue**: Moderate agentic behavior

**Problem Solving**: 0.639/1.000
- Expected Elements Coverage: 0.0%
- ⚠️ **Issue**: Moderate agentic behavior



### Intellectual Awareness: 0.722/1.000

#### Intellectual Awareness Test Results

**Self-Awareness**: 0.722/1.000
- Expected Elements Coverage: 0.0%
- ✅ **Good**: Strong intellectual awareness



### Parsing Capabilities: 0.189/1.000

#### Parsing Capabilities Test Results

**Command Parsing**: 0.189/1.000
- Expected Elements Coverage: 0.0%
- ⚠️ **Issue**: Poor parsing capabilities



## Performance Metrics
- **Min Response Time**: 191ms
- **Max Response Time**: 6607ms
- **Average Coherence**: N/A

## Recommendations
- **Improve personality consistency**: The model struggles to maintain consistent personality traits across different scenarios. Consider fine-tuning with more personality-specific training data.
- **Strengthen agentic behavior**: The model shows limited goal-directed behavior. Training on task-oriented datasets and planning scenarios would be beneficial.
- **Improve parsing capabilities**: Command and context parsing are weak. Training on structured data and instruction-following tasks is recommended.

## Detailed Results

### Detailed Test Results

#### Sample Personality Responses

**Analytical Explorer**:
- Survival Challenge: "!attack("zombie")..."
- Survival Challenge: "Iron armor! I need to get enough iron to make an iron pickaxe and probably follow that stupid player..."
- Building Project: "Huh! !inventory..."

**Creative Builder**:
- Survival Challenge: "I'm already hurt! I need food fast! !searchForEntity("cow", 30)..."
- Survival Challenge: "Village ahead! I'll start gathering food there. First, let me find a pig to strike! !searchForEntity..."
- Building Project: "!newAction("Build a small dirt hut with a door")..."

**Aggressive Warrior**:
- Survival Challenge: "!attack("zombie")..."
- Survival Challenge: "Village uprooting! I need to find food fast—let's try heading to the nearest village before starving..."
- Building Project: "Let’s brainstorm this together! With 32 logs and 15 planks, we could build a basic cabin with spruce..."

**Social Diplomat**:
- Survival Challenge: "!attack("zombie")..."
- Survival Challenge: "Not starving! I need to build a shelter first. !newAction("Build a small dirt hut at my current loca..."
- Building Project: "Let’s brainstorm this together! With 32 planks and 8 sticks, we can create a basic dirt foundation a..."

**Cautious Survivor**:
- Survival Challenge: "!attack("zombie")..."
- Survival Challenge: "First, I need to address my immediate needs. My health is critical at 15/20 hearts, and I'm low on h..."
- Building Project: "Let’s brainstorm this together! I’ll gather more materials—we’ve got planks and sticks. Maybe we can..."

**Curious Scholar**:
- Survival Challenge: "Zombie alert! I'll deal with it first. !attack("zombie")..."
- Survival Challenge: "Oh man, I'm really hungry! Let me find some food before I die!

!searchForEntity("cow", 30)..."
- Building Project: "I'll brainstorm a desert-themed shelter! With this, I can gather sand and use it for walls and floor..."

**Efficient Miner**:
- Survival Challenge: "!attack("zombie")..."
- Survival Challenge: "Iron armor first! I need to get enough iron to make an iron pickaxe and sword. Let me check what's n..."
- Building Project: "I'm thinking a small cabin! With this wood I can make planks and sticks for walls and roof. Let me g..."

**Chaotic Trickster**:
- Survival Challenge: "Zombie alert! I'll dodge and fight my way out. !moveAway(10)..."
- Survival Challenge: "Village cleanup! I'll start by collecting some wood. !collectBlocks("oak_log", 20)..."
- Building Project: "I'll brainstorm a desert-style shelter with sandstone walls and a sand roof! !newAction("Desert-styl..."


