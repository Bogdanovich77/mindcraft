# Ollama Model Test Report

## Executive Summary
- **Overall Score**: 0.347 / 1.000
- **Average Response Time**: 489ms
- **Test Duration**: 2025-12-09T02:23:58.727Z

## Category Scores

### Personality Consistency: 0.167/1.000

#### Personality Test Results

**Analytical Explorer**: 0.138/1.000
- Consistency: 13.8%
- ⚠️ **Issue**: Low personality consistency

**Creative Builder**: 0.210/1.000
- Consistency: 21.0%
- ⚠️ **Issue**: Low personality consistency

**Aggressive Warrior**: 0.171/1.000
- Consistency: 17.1%
- ⚠️ **Issue**: Low personality consistency

**Social Diplomat**: 0.148/1.000
- Consistency: 14.8%
- ⚠️ **Issue**: Low personality consistency

**Cautious Survivor**: 0.171/1.000
- Consistency: 17.1%
- ⚠️ **Issue**: Low personality consistency

**Curious Scholar**: 0.138/1.000
- Consistency: 13.8%
- ⚠️ **Issue**: Low personality consistency

**Efficient Miner**: 0.204/1.000
- Consistency: 20.4%
- ⚠️ **Issue**: Low personality consistency

**Chaotic Trickster**: 0.154/1.000
- Consistency: 15.4%
- ⚠️ **Issue**: Low personality consistency



### Multi-Turn Conversations: 0.800/1.000

#### Conversation Test Results

**Cooperative Building**: 0.800/1.000
- Coherence: 80.0%
- Relevance: 80.0%
- Personality Consistency: 80.0%
- ✅ **Good**: Strong conversation quality



### Agentic Behavior: 0.743/1.000

#### Agentic Behavior Test Results

**Goal Setting**: 0.750/1.000
- Expected Elements Coverage: 0.0%
- ✅ **Good**: Strong agentic behavior

**Problem Solving**: 0.736/1.000
- Expected Elements Coverage: 0.0%
- ✅ **Good**: Strong agentic behavior



### Intellectual Awareness: 0.697/1.000

#### Intellectual Awareness Test Results

**Self-Awareness**: 0.697/1.000
- Expected Elements Coverage: 25.0%
- ⚠️ **Issue**: Moderate intellectual awareness



### Parsing Capabilities: 0.189/1.000

#### Parsing Capabilities Test Results

**Command Parsing**: 0.189/1.000
- Expected Elements Coverage: 0.0%
- ⚠️ **Issue**: Poor parsing capabilities



## Performance Metrics
- **Min Response Time**: 193ms
- **Max Response Time**: 5063ms
- **Average Coherence**: N/A

## Recommendations
- **Improve personality consistency**: The model struggles to maintain consistent personality traits across different scenarios. Consider fine-tuning with more personality-specific training data.
- **Boost intellectual awareness**: Abstract reasoning and self-awareness need improvement. Consider training on more complex reasoning tasks.
- **Improve parsing capabilities**: Command and context parsing are weak. Training on structured data and instruction-following tasks is recommended.

## Detailed Results

### Detailed Test Results

#### Sample Personality Responses

**Analytical Explorer**:
- Survival Challenge: "Back to my roots—time to farm! !goToCoordinates(-700, 110, 80, 2)..."
- Survival Challenge: "I need food to survive! My hunger is critical at 8/20—village with villagers might not have enough. ..."
- Building Project: "Huh! !inventory..."

**Creative Builder**:
- Survival Challenge: "I'm in trouble! !goToPlayer("Villain_Victor*", 3)..."
- Survival Challenge: "Oh man, I'm really hungry! Let me find some food before I die!

!searchForEntity("cow", 30)..."
- Building Project: "Let’s brainstorm this together! I’ve got plenty of materials—let’s get creative! !newAction("Build a..."

**Aggressive Warrior**:
- Survival Challenge: "!attack("zombie")..."
- Survival Challenge: "Village ahead! I'll start gathering wood for the tools. !collectBlocks("oak_log", 20)..."
- Building Project: "I'll plan this out! !getCraftingPlan("dirt", 32)..."

**Social Diplomat**:
- Survival Challenge: "I'm already dead! I've got sticks now. I'll just defend myself and get my stuff back. !attack("zombi..."
- Survival Challenge: "First things first, I need food! !searchForEntity("cow", 30)..."
- Building Project: "Let’s brainstorm! With 32 logs and 15 planks, we can craft sticks, make axes, or start building the ..."

**Cautious Survivor**:
- Survival Challenge: "!attack("zombie")..."
- Survival Challenge: "Given my current health (15 hearts) and hunger (8/20), I need to address survival issues first. My p..."
- Building Project: "Let’s brainstorm this together! I’ve got plenty of wood—let’s get creative with the desert. We could..."

**Curious Scholar**:
- Survival Challenge: "I'd rather just sit here and mope. I'm dying, though.
!
System output: Recent behaviors log: 
Pickin..."
- Survival Challenge: "My hunger is critical! Food bar at 8/20 – I need to consume some food to stabilize. !consume("rotten..."
- Building Project: "I'll build a small dirt hut! !newAction("Construct a 3x3x3 dirt house here")..."

**Efficient Miner**:
- Survival Challenge: "!attack("zombie")..."
- Survival Challenge: "Iron armor first! I'm gonna need it to mine diamonds. !searchForBlock("iron_ore", 50)..."
- Building Project: "I'll build a basic dirt house first for emergency construction! Let me collect some wood. !collectBl..."

**Chaotic Trickster**:
- Survival Challenge: "Zombie alert! I'll dodge and fight my way out. !moveAway(10)..."
- Survival Challenge: "Village cleanup! I'll start by collecting some wood first. !collectBlocks("oak_log", 20)..."
- Building Project: "!newAction("Build a small dirt hut with spruce walls and a roof.")..."


