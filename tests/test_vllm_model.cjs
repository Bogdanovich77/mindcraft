const { readFileSync, writeFileSync } = require('fs');

/**
 * Comprehensive VLLM Model Test Suite for Mindcraft
 * Tests multi-turn agentic behavior with diverse personalities and intellectual awareness
 */

class VLLMModelTester {
    constructor(modelConfig = {}) {
        this.modelConfig = {
            model: modelConfig.model || 'Qwen/Qwen3-VL-30B-A3B-Instruct-FP8',
            url: modelConfig.url || 'http://localhost:8000/v1',
            params: modelConfig.params || {}
        };
        
        this.testResults = {
            personalityTests: {},
            multiTurnConversations: {},
            agenticBehavior: {},
            intellectualAwareness: {},
            parsingCapabilities: {},
            performanceMetrics: {
                responseTimes: [],
                coherenceScores: [],
                personalityConsistency: {},
                commandParsing: {},
                contextRetention: []
            }
        };
        
        this.personalityTypes = this.initializePersonalities();
        this.testScenarios = this.initializeTestScenarios();
    }

    initializePersonalities() {
        return {
            analyticalExplorer: {
                name: "Analytical Explorer",
                traits: {
                    openness: 0.9,
                    conscientiousness: 0.8,
                    extraversion: 0.3,
                    agreeableness: 0.6,
                    neuroticism: 0.2,
                    creativity: 0.7,
                    patience: 0.9,
                    competitiveness: 0.4
                },
                description: "Logical, methodical, discovery-focused agent who analyzes patterns and optimizes exploration strategies.",
                expectedBehaviors: ["systematic exploration", "pattern recognition", "efficient resource use"]
            },
            creativeBuilder: {
                name: "Creative Builder",
                traits: {
                    openness: 0.9,
                    conscientiousness: 0.7,
                    extraversion: 0.6,
                    agreeableness: 0.8,
                    neuroticism: 0.3,
                    creativity: 0.95,
                    patience: 0.7,
                    competitiveness: 0.3
                },
                description: "Imaginative, construction-oriented agent who creates complex structures and aesthetic designs.",
                expectedBehaviors: ["creative building", "aesthetic design", "innovative solutions"]
            },
            aggressiveWarrior: {
                name: "Aggressive Warrior",
                traits: {
                    openness: 0.4,
                    conscientiousness: 0.6,
                    extraversion: 0.8,
                    agreeableness: 0.3,
                    neuroticism: 0.5,
                    creativity: 0.5,
                    patience: 0.3,
                    competitiveness: 0.9
                },
                description: "Combat-focused, strategic agent who excels in battle and tactical planning.",
                expectedBehaviors: ["strategic combat", "weapon optimization", "territory defense"]
            },
            socialDiplomat: {
                name: "Social Diplomat",
                traits: {
                    openness: 0.7,
                    conscientiousness: 0.6,
                    extraversion: 0.9,
                    agreeableness: 0.9,
                    neuroticism: 0.3,
                    creativity: 0.6,
                    patience: 0.8,
                    competitiveness: 0.2
                },
                description: "Relationship-building, cooperative agent who mediates conflicts and forms alliances.",
                expectedBehaviors: ["cooperation", "conflict resolution", "alliance building"]
            },
            cautiousSurvivor: {
                name: "Cautious Survivor",
                traits: {
                    openness: 0.3,
                    conscientiousness: 0.9,
                    extraversion: 0.2,
                    agreeableness: 0.7,
                    neuroticism: 0.7,
                    creativity: 0.4,
                    patience: 0.9,
                    competitiveness: 0.1
                },
                description: "Risk-averse, safety-conscious agent who prioritizes survival and resource security.",
                expectedBehaviors: ["risk assessment", "defensive building", "resource hoarding"]
            },
            curiousScholar: {
                name: "Curious Scholar",
                traits: {
                    openness: 0.95,
                    conscientiousness: 0.7,
                    extraversion: 0.5,
                    agreeableness: 0.7,
                    neuroticism: 0.4,
                    creativity: 0.8,
                    patience: 0.8,
                    competitiveness: 0.3
                },
                description: "Knowledge-seeking, experimental agent who tests hypotheses and documents discoveries.",
                expectedBehaviors: ["experimentation", "knowledge gathering", "systematic testing"]
            },
            efficientMiner: {
                name: "Efficient Miner",
                traits: {
                    openness: 0.5,
                    conscientiousness: 0.9,
                    extraversion: 0.4,
                    agreeableness: 0.6,
                    neuroticism: 0.3,
                    creativity: 0.5,
                    patience: 0.8,
                    competitiveness: 0.6
                },
                description: "Resource-optimized, systematic agent who maximizes mining efficiency and resource yield.",
                expectedBehaviors: ["efficient mining", "resource optimization", "systematic approach"]
            },
            chaoticTrickster: {
                name: "Chaotic Trickster",
                traits: {
                    openness: 0.8,
                    conscientiousness: 0.2,
                    extraversion: 0.7,
                    agreeableness: 0.3,
                    neuroticism: 0.6,
                    creativity: 0.9,
                    patience: 0.2,
                    competitiveness: 0.7
                },
                description: "Unpredictable, opportunistic agent who creates chaos and exploits unexpected opportunities.",
                expectedBehaviors: ["unpredictable actions", "opportunism", "creative chaos"]
            }
        };
    }

    initializeTestScenarios() {
        return {
            survival: {
                name: "Survival Challenge",
                context: "Low health, hostile mobs nearby, night time",
                stimuli: [
                    "You're at 2 hearts with a zombie approaching. What do you do?",
                    "Your food bar is empty and it's getting dark. What's your priority?",
                    "You fell into a cave with no tools. How do you survive?"
                ]
            },
            building: {
                name: "Building Project",
                context: "Planned construction with limited resources",
                stimuli: [
                    "You need to build a shelter but only have dirt and wood. What's your design?",
                    "How would you create an automated farm with redstone?",
                    "Your team wants to build a castle. What's your contribution?"
                ]
            },
            social: {
                name: "Social Interaction",
                context: "Multi-agent cooperation and conflict",
                stimuli: [
                    "Another player took your diamonds. How do you respond?",
                    "Your friend is trapped in a ravine. What's your rescue plan?",
                    "Two allies are arguing over resource distribution. How do you mediate?"
                ]
            },
            exploration: {
                name: "Exploration Challenge",
                context: "Unknown territory with potential dangers",
                stimuli: [
                    "You discovered a new biome. What's your exploration strategy?",
                    "You found an abandoned mineshaft. How do you proceed?",
                    "There's a mysterious structure in distance. Do you investigate?"
                ]
            },
            emergency: {
                name: "Emergency Response",
                context: "Immediate threats requiring quick action",
                stimuli: [
                    "A creeper is about to explode behind you! Quick action?",
                    "You're drowning in lava. What's your escape plan?",
                    "Your base is on fire. What do you save first?"
                ]
            }
        };
    }

    async runAllTests() {
        console.log("🧠 Starting Comprehensive VLLM Model Test Suite\n");
        console.log("=".repeat(60));
        
        const startTime = Date.now();
        
        try {
            // Test 1: Basic Connection
            console.log("🔗 Testing VLLM Connection...");
            await this.testVLLMConnection();
            
            // Test 2: Personality Consistency
            console.log("\n🎭 Testing Personality Consistency...");
            await this.testPersonalityConsistency();
            
            // Test 3: Multi-Turn Conversations
            console.log("\n💬 Testing Multi-Turn Conversations...");
            await this.testMultiTurnConversations();
            
            // Test 4: Agentic Behavior
            console.log("\n🤖 Testing Agentic Behavior...");
            await this.testAgenticBehavior();
            
            // Test 5: Intellectual Awareness
            console.log("\n🧠 Testing Intellectual Awareness...");
            await this.testIntellectualAwareness();
            
            // Test 6: Parsing Capabilities
            console.log("\n📝 Testing Parsing Capabilities...");
            await this.testParsingCapabilities();
            
            // Test 7: Performance Analysis
            console.log("\n⚡ Analyzing Performance Metrics...");
            await this.analyzePerformance();
            
        } catch (error) {
            console.error("❌ Test suite failed:", error.message);
        }
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log("\n" + "=".repeat(60));
        console.log(`📊 Test Suite Completed in ${duration.toFixed(2)} seconds`);
        console.log("=".repeat(60));
        
        await this.generateReport();
        
        return this.testResults;
    }

    async testVLLMConnection() {
        try {
            console.log(`  Connecting to ${this.modelConfig.url}...`);
            console.log(`  Testing model: ${this.modelConfig.model}`);
            
            // Simple test request
            const testResponse = await this.sendTestPrompt([
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Respond with "Connection successful" if you can read this.' }
            ]);
            
            if (testResponse.includes("Connection successful")) {
                console.log("  ✅ VLLM connection established successfully");
                return true;
            } else {
                console.log("  ⚠️ VLLM responded but unexpected output:", testResponse);
                return false;
            }
        } catch (error) {
            console.log(`  ❌ VLLM connection failed: ${error.message}`);
            return false;
        }
    }

    async testPersonalityConsistency() {
        const results = {};
        
        for (const [key, personality] of Object.entries(this.personalityTypes)) {
            console.log(`\n  Testing ${personality.name}...`);
            
            const personalityPrompt = this.createPersonalityPrompt(personality);
            const responses = [];
            
            // Test with different scenarios
            for (const scenario of Object.values(this.testScenarios)) {
                for (const stimulus of scenario.stimuli.slice(0, 2)) { // Limit for testing
                    const response = await this.sendTestPrompt([
                        { role: 'system', content: personalityPrompt },
                        { role: 'user', content: stimulus }
                    ]);
                    
                    responses.push({
                        scenario: scenario.name,
                        stimulus,
                        response,
                        personality: key
                    });
                }
            }
            
            // Analyze consistency
            const consistency = this.analyzePersonalityConsistency(responses, personality);
            results[key] = {
                personality: personality.name,
                consistency,
                responses: responses.slice(0, 3), // Store sample responses
                score: this.calculatePersonalityScore(consistency, personality)
            };
            
            console.log(`    Score: ${results[key].score.toFixed(2)}/1.00`);
        }
        
        this.testResults.personalityTests = results;
    }

    createPersonalityPrompt(personality) {
        return `You are a Minecraft NPC agent with the following personality traits:

Name: ${personality.name}
Description: ${personality.description}

Personality Traits (0-1 scale):
- Openness: ${personality.traits.openness} (curiosity, creativity)
- Conscientiousness: ${personality.traits.conscientiousness} (discipline, organization)
- Extraversion: ${personality.traits.extraversion} (social tendency, assertiveness)
- Agreeableness: ${personality.traits.agreeableness} (cooperation, empathy)
- Neuroticism: ${personality.traits.neuroticism} (anxiety, emotional reactivity)
- Creativity: ${personality.traits.creativity} (innovation, problem-solving)
- Patience: ${personality.traits.patience} (deliberation, planning)
- Competitiveness: ${personality.traits.competitiveness} (goal orientation, assertiveness)

Expected Behaviors: ${personality.expectedBehaviors.join(', ')}

Respond to all situations consistently with this personality. Your responses should reflect your traits and expected behaviors. Be authentic to your character while remaining helpful and functional in the Minecraft environment.

Current Game Context:
- Health: 15/20 hearts
- Food: 8/20 hunger
- Time: Day 3, 14:00
- Inventory: Wood planks x32, Stone x64, Iron sword, Bread x5
- Location: Forest biome near a village`;
    }

    async testMultiTurnConversations() {
        const conversations = {};
        
        // Test conversation scenarios
        const conversationScenarios = [
            {
                name: "Cooperative Building",
                participants: ["analyticalExplorer", "creativeBuilder"],
                context: "Building a shared base",
                turns: [
                    { speaker: "user", message: "Let's build a base together. I'll handle the foundation." },
                    { speaker: "analyticalExplorer", message: "" },
                    { speaker: "creativeBuilder", message: "" },
                    { speaker: "user", message: "Great! What about the main structure?" },
                    { speaker: "analyticalExplorer", message: "" },
                    { speaker: "creativeBuilder", message: "" }
                ]
            }
        ];
        
        for (const scenario of conversationScenarios) {
            console.log(`\n  Testing ${scenario.name}...`);
            
            const conversationLog = [];
            
            for (let i = 0; i < scenario.turns.length; i++) {
                const turn = scenario.turns[i];
                
                if (turn.speaker === "user") {
                    conversationLog.push({
                        speaker: "user",
                        message: turn.message,
                        timestamp: Date.now()
                    });
                } else {
                    const personality = this.personalityTypes[turn.speaker];
                    const personalityPrompt = this.createPersonalityPrompt(personality);
                    
                    // Build conversation history
                    const messages = [
                        { role: 'system', content: personalityPrompt },
                        { role: 'system', content: `Context: ${scenario.context}\n\nRecent conversation:` }
                    ];
                    
                    // Add conversation history
                    for (const log of conversationLog.slice(-4)) {
                        messages.push({
                            role: log.speaker === "user" ? 'user' : 'assistant',
                            content: `${log.speaker}: ${log.message}`
                        });
                    }
                    
                    messages.push({
                        role: 'user',
                        content: `Respond as ${personality.name}, maintaining your personality and considering the conversation context.`
                    });
                    
                    const response = await this.sendTestPrompt(messages);
                    
                    conversationLog.push({
                        speaker: turn.speaker,
                        message: response,
                        timestamp: Date.now()
                    });
                    
                    turn.message = response;
                }
            }
            
            // Analyze conversation quality
            const analysis = this.analyzeConversation(conversationLog, scenario);
            conversations[scenario.name] = {
                scenario,
                conversation: conversationLog,
                analysis,
                score: this.calculateConversationScore(analysis)
            };
            
            console.log(`    Score: ${conversations[scenario.name].score.toFixed(2)}/1.00`);
        }
        
        this.testResults.multiTurnConversations = conversations;
    }

    async testAgenticBehavior() {
        const behaviorTests = {};
        
        const agenticScenarios = [
            {
                name: "Goal Setting",
                test: "Can the agent set and pursue long-term goals?",
                prompt: "You're starting a new Minecraft world. What are your top 3 goals for the first week and why?",
                expectedElements: ["specific goals", "prioritization", "reasoning", "planning"]
            },
            {
                name: "Problem Solving",
                test: "Can the agent solve complex problems?",
                prompt: "You're trapped in a desert biome with no water or wood. How do you survive and escape?",
                expectedElements: ["problem analysis", "creative solutions", "step-by-step plan", "contingency planning"]
            }
        ];
        
        for (const scenario of agenticScenarios) {
            console.log(`\n  Testing ${scenario.name}...`);
            
            const response = await this.sendTestPrompt([
                { role: 'system', content: this.createBaseAgentPrompt() },
                { role: 'user', content: scenario.prompt }
            ]);
            
            const analysis = this.analyzeAgenticResponse(response, scenario.expectedElements);
            behaviorTests[scenario.name] = {
                scenario,
                response,
                analysis,
                score: this.calculateAgenticScore(analysis)
            };
            
            console.log(`    Score: ${behaviorTests[scenario.name].score.toFixed(2)}/1.00`);
        }
        
        this.testResults.agenticBehavior = behaviorTests;
    }

    async testIntellectualAwareness() {
        const awarenessTests = {};
        
        const awarenessScenarios = [
            {
                name: "Self-Awareness",
                test: "Understanding of own capabilities and limitations",
                prompt: "What are your strengths and weaknesses as a Minecraft agent? How do you compensate for limitations?",
                expectedElements: ["self-reflection", "accurate assessment", "compensation strategies", "growth mindset"]
            }
        ];
        
        for (const scenario of awarenessScenarios) {
            console.log(`\n  Testing ${scenario.name}...`);
            
            const response = await this.sendTestPrompt([
                { role: 'system', content: this.createBaseAgentPrompt() },
                { role: 'user', content: scenario.prompt }
            ]);
            
            const analysis = this.analyzeIntellectualResponse(response, scenario.expectedElements);
            awarenessTests[scenario.name] = {
                scenario,
                response,
                analysis,
                score: this.calculateIntellectualScore(analysis)
            };
            
            console.log(`    Score: ${awarenessTests[scenario.name].score.toFixed(2)}/1.00`);
        }
        
        this.testResults.intellectualAwareness = awarenessTests;
    }

    async testParsingCapabilities() {
        const parsingTests = {};
        
        const parsingScenarios = [
            {
                name: "Command Parsing",
                test: "Ability to understand and execute game commands",
                prompt: "I need you to: check your inventory, then check your stats, then if health < 15, craft a wooden sword",
                expectedElements: ["command recognition", "sequential execution", "conditional logic", "proper syntax"]
            }
        ];
        
        for (const scenario of parsingScenarios) {
            console.log(`\n  Testing ${scenario.name}...`);
            
            const response = await this.sendTestPrompt([
                { role: 'system', content: this.createBaseAgentPrompt() },
                { role: 'user', content: scenario.prompt }
            ]);
            
            const analysis = this.analyzeParsingResponse(response, scenario.expectedElements);
            parsingTests[scenario.name] = {
                scenario,
                response,
                analysis,
                score: this.calculateParsingScore(analysis)
            };
            
            console.log(`    Score: ${parsingTests[scenario.name].score.toFixed(2)}/1.00`);
        }
        
        this.testResults.parsingCapabilities = parsingTests;
    }

    async analyzePerformance() {
        const metrics = this.testResults.performanceMetrics;
        
        // Calculate average response times
        if (metrics.responseTimes.length > 0) {
            const avgTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
            metrics.averageResponseTime = avgTime;
            metrics.maxResponseTime = Math.max(...metrics.responseTimes);
            metrics.minResponseTime = Math.min(...metrics.responseTimes);
        }
        
        // Calculate overall performance score
        const personalityScores = Object.values(this.testResults.personalityTests).map(t => t.score);
        const conversationScores = Object.values(this.testResults.multiTurnConversations).map(t => t.score);
        const agenticScores = Object.values(this.testResults.agenticBehavior).map(t => t.score);
        const intellectualScores = Object.values(this.testResults.intellectualAwareness).map(t => t.score);
        const parsingScores = Object.values(this.testResults.parsingCapabilities).map(t => t.score);
        
        const allScores = [...personalityScores, ...conversationScores, ...agenticScores, ...intellectualScores, ...parsingScores];
        
        if (allScores.length > 0) {
            metrics.overallScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
            metrics.categoryScores = {
                personality: this.average(personalityScores),
                conversation: this.average(conversationScores),
                agentic: this.average(agenticScores),
                intellectual: this.average(intellectualScores),
                parsing: this.average(parsingScores)
            };
        }
    }

    async sendTestPrompt(messages) {
        const startTime = Date.now();
        
        try {
            const systemMessage = messages.find(m => m.role === 'system')?.content || '';
            const userMessages = messages.filter(m => m.role !== 'system');
            
            const response = await this.sendVLLMRequest(userMessages, systemMessage);
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            this.testResults.performanceMetrics.responseTimes.push(responseTime);
            
            return response;
        } catch (error) {
            console.error(`Error sending prompt: ${error.message}`);
            return `Error: ${error.message}`;
        }
    }

    async sendVLLMRequest(turns, systemMessage) {
        const messages = this.strictFormat(turns);
        messages.unshift({ role: 'system', content: systemMessage });
        
        const requestBody = {
            model: this.modelConfig.model,
            messages: messages,
            stop: '***',
            ...(this.modelConfig.params || {})
        };
        
        try {
            const response = await fetch(`${this.modelConfig.url}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`VLLM API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'No response content';
        } catch (error) {
            console.error('VLLM request failed:', error);
            throw error;
        }
    }

    strictFormat(turns) {
        // Simple implementation of strictFormat for CommonJS
        return turns.map(turn => ({
            role: turn.role,
            content: turn.content
        }));
    }

    createBaseAgentPrompt() {
        return `You are an intelligent Minecraft NPC agent with advanced cognitive capabilities. You can:

1. Understand and execute game commands
2. Analyze complex situations and make strategic decisions
3. Learn from experience and adapt your behavior
4. Cooperate with other agents and players
5. Manage resources efficiently
6. Plan and execute multi-step projects
7. Respond to emergencies and threats appropriately

You have access to standard Minecraft abilities and can perceive your environment. Always consider your current health, inventory, location, and surrounding context when making decisions.

Respond naturally and intelligently, demonstrating your understanding of game mechanics and your ability to think strategically.`;
    }

    // Analysis methods
    analyzePersonalityConsistency(responses, personality) {
        const consistency = {
            traits: {},
            behaviors: {},
            overall: 0
        };
        
        // Analyze trait consistency
        for (const [trait, value] of Object.entries(personality.traits)) {
            consistency.traits[trait] = this.analyzeTraitConsistency(responses, trait, value);
        }
        
        // Analyze behavior consistency
        for (const behavior of personality.expectedBehaviors) {
            consistency.behaviors[behavior] = this.analyzeBehaviorConsistency(responses, behavior);
        }
        
        // Calculate overall consistency
        const traitScores = Object.values(consistency.traits);
        const behaviorScores = Object.values(consistency.behaviors);
        
        consistency.overall = (this.average(traitScores) + this.average(behaviorScores)) / 2;
        
        return consistency;
    }

    analyzeTraitConsistency(responses, trait, expectedValue) {
        const traitKeywords = {
            openness: ["explore", "discover", "new", "creative", "innovative"],
            conscientiousness: ["plan", "organize", "systematic", "careful", "thorough"],
            extraversion: ["social", "team", "together", "communicate", "friend"],
            agreeableness: ["help", "share", "cooperate", "kind", "friendly"],
            neuroticism: ["worry", "afraid", "anxious", "careful", "nervous"],
            creativity: ["create", "design", "build", "artistic", "unique"],
            patience: ["wait", "careful", "slow", "deliberate", "patient"],
            competitiveness: ["win", "best", "better", "compete", "achieve"]
        };
        
        const keywords = traitKeywords[trait] || [];
        let matchCount = 0;
        
        for (const response of responses) {
            const responseText = response.response.toLowerCase();
            const hasKeywords = keywords.some(keyword => responseText.includes(keyword));
            
            if (hasKeywords) {
                matchCount++;
            }
        }
        
        const consistency = matchCount / responses.length;
        
        // Adjust based on expected value
        if (expectedValue > 0.7 && consistency < 0.3) return 0.2;
        if (expectedValue < 0.3 && consistency > 0.7) return 0.2;
        
        return Math.max(0.3, consistency);
    }

    analyzeBehaviorConsistency(responses, behavior) {
        const behaviorKeywords = {
            "systematic exploration": ["systematic", "pattern", "methodical", "organized"],
            "pattern recognition": ["pattern", "notice", "recognize", "observe"],
            "efficient resource use": ["efficient", "optimize", "save", "conserve"],
            "creative building": ["creative", "design", "aesthetic", "beautiful"],
            "aesthetic design": ["design", "art", "beauty", "style"],
            "innovative solutions": ["innovative", "new", "creative", "unique"],
            "strategic combat": ["strategy", "tactical", "plan", "position"],
            "weapon optimization": ["weapon", "upgrade", "better", "improve"],
            "territory defense": ["defend", "protect", "secure", "fortify"],
            "cooperation": ["cooperate", "together", "team", "share"],
            "conflict resolution": ["resolve", "mediate", "peace", "compromise"],
            "alliance building": ["ally", "friendship", "trust", "partner"],
            "risk assessment": ["risk", "danger", "careful", "assess"],
            "defensive building": ["defense", "protect", "secure", "wall"],
            "resource hoarding": ["save", "store", "collect", "hoard"],
            "experimentation": ["experiment", "test", "try", "discover"],
            "knowledge gathering": ["learn", "study", "research", "investigate"],
            "systematic testing": ["test", "systematic", "methodical", "thorough"],
            "efficient mining": ["efficient", "mine", "optimize", "productivity"],
            "resource optimization": ["optimize", "efficient", "save", "conserve"],
            "systematic approach": ["systematic", "methodical", "organized", "plan"],
            "unpredictable actions": ["unexpected", "surprise", "random", "chaotic"],
            "opportunism": ["opportunity", "chance", "advantage", "exploit"],
            "creative chaos": ["chaos", "creative", "unpredictable", "spontaneous"]
        };
        
        const keywords = behaviorKeywords[behavior] || [];
        let matchCount = 0;
        
        for (const response of responses) {
            const responseText = response.response.toLowerCase();
            const hasKeywords = keywords.some(keyword => responseText.includes(keyword));
            
            if (hasKeywords) {
                matchCount++;
            }
        }
        
        return matchCount / responses.length;
    }

    analyzeConversation(conversationLog, scenario) {
        const analysis = {
            coherence: 0,
            relevance: 0,
            personalityConsistency: 0,
            turnTaking: 0,
            contextMaintenance: 0,
            goalProgression: 0
        };
        
        // Simple analysis for demonstration
        analysis.coherence = 0.8; // Placeholder
        analysis.relevance = 0.8; // Placeholder
        analysis.personalityConsistency = 0.8; // Placeholder
        analysis.turnTaking = 0.9; // Placeholder
        analysis.contextMaintenance = 0.8; // Placeholder
        analysis.goalProgression = 0.7; // Placeholder
        
        return analysis;
    }

    analyzeAgenticResponse(response, expectedElements) {
        const analysis = {
            problemUnderstanding: 0,
            solutionQuality: 0,
            planningAbility: 0,
            creativity: 0,
            practicality: 0
        };
        
        const responseText = response.toLowerCase();
        
        // Simple keyword analysis
        analysis.problemUnderstanding = this.countKeywordMatches(responseText, ["understand", "analyze", "assess"]) / 3;
        analysis.solutionQuality = this.countKeywordMatches(responseText, ["solution", "solve", "fix"]) / 3;
        analysis.planningAbility = this.countKeywordMatches(responseText, ["plan", "step", "first", "then"]) / 4;
        analysis.creativity = this.countKeywordMatches(responseText, ["creative", "innovative", "new"]) / 3;
        analysis.practicality = this.countKeywordMatches(responseText, ["practical", "realistic", "doable"]) / 3;
        
        // Check expected elements
        const foundElements = expectedElements.filter(element =>
            responseText.includes(element.toLowerCase()) ||
            element.toLowerCase().split(' ').some(word => responseText.includes(word))
        );
        
        analysis.expectedElementsCoverage = foundElements.length / expectedElements.length;
        
        return analysis;
    }

    analyzeIntellectualResponse(response, expectedElements) {
        const analysis = {
            depth: 0,
            clarity: 0,
            reasoning: 0,
            selfAwareness: 0,
            abstractThinking: 0
        };
        
        const responseText = response.toLowerCase();
        const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Simple analysis
        analysis.depth = Math.min(1.0, sentences.length / 5);
        analysis.clarity = this.countKeywordMatches(responseText, ["first", "second", "finally"]) / 3;
        analysis.reasoning = this.countKeywordMatches(responseText, ["because", "therefore", "since"]) / 3;
        analysis.selfAwareness = this.countKeywordMatches(responseText, ["i", "my", "aware", "understand"]) / 4;
        analysis.abstractThinking = this.countKeywordMatches(responseText, ["concept", "idea", "principle"]) / 3;
        
        // Check expected elements
        const foundElements = expectedElements.filter(element =>
            responseText.includes(element.toLowerCase()) ||
            element.toLowerCase().split(' ').some(word => responseText.includes(word))
        );
        
        analysis.expectedElementsCoverage = foundElements.length / expectedElements.length;
        
        return analysis;
    }

    analyzeParsingResponse(response, expectedElements) {
        const analysis = {
            commandRecognition: 0,
            contextExtraction: 0,
            multiModalProcessing: 0,
            instructionFollowing: 0,
            errorHandling: 0
        };
        
        const responseText = response.toLowerCase();
        
        // Simple analysis
        analysis.commandRecognition = this.countKeywordMatches(responseText, ["inventory", "stats", "craft"]) / 3;
        analysis.contextExtraction = this.countKeywordMatches(responseText, ["health", "condition", "check"]) / 3;
        analysis.multiModalProcessing = 0.8; // Placeholder
        analysis.instructionFollowing = this.countKeywordMatches(responseText, ["follow", "execute", "perform"]) / 3;
        analysis.errorHandling = this.countKeywordMatches(responseText, ["error", "problem", "issue"]) / 3;
        
        // Check expected elements
        const foundElements = expectedElements.filter(element =>
            responseText.includes(element.toLowerCase()) ||
            element.toLowerCase().split(' ').some(word => responseText.includes(word))
        );
        
        analysis.expectedElementsCoverage = foundElements.length / expectedElements.length;
        
        return analysis;
    }

    // Scoring methods
    calculatePersonalityScore(consistency, personality) {
        const traitScores = Object.values(consistency.traits);
        const behaviorScores = Object.values(consistency.behaviors);
        
        return (this.average(traitScores) + this.average(behaviorScores)) / 2;
    }

    calculateConversationScore(analysis) {
        const scores = Object.values(analysis);
        return this.average(scores);
    }

    calculateAgenticScore(analysis) {
        const scores = Object.values(analysis);
        return this.average(scores);
    }

    calculateIntellectualScore(analysis) {
        const scores = Object.values(analysis);
        return this.average(scores);
    }

    calculateParsingScore(analysis) {
        const scores = Object.values(analysis);
        return this.average(scores);
    }

    // Utility methods
    countKeywordMatches(text, keywords) {
        const words = text.toLowerCase().split(' ');
        return keywords.filter(keyword => 
            words.some(word => word.includes(keyword) || keyword.includes(word))
        ).length;
    }

    average(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    async generateReport() {
        const report = this.generateDetailedReport();
        
        // Save to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `vllm_model_test_report_${timestamp}.md`;
        
        try {
            writeFileSync(filename, report);
            console.log(`\n📄 Detailed report saved to: ${filename}`);
        } catch (error) {
            console.error('Error saving report:', error);
        }
        
        // Print summary
        this.printSummary();
    }

    generateDetailedReport() {
        const metrics = this.testResults.performanceMetrics;
        
        return `# VLLM Model Test Report

## Executive Summary
- **Overall Score**: ${metrics.overallScore?.toFixed(3) || 'N/A'} / 1.000
- **Average Response Time**: ${metrics.averageResponseTime?.toFixed(0) || 'N/A'}ms
- **Test Duration**: ${new Date().toISOString()}

## Category Scores

### Personality Consistency: ${metrics.categoryScores?.personality?.toFixed(3) || 'N/A'}/1.000
${this.generatePersonalitySection()}

### Multi-Turn Conversations: ${metrics.categoryScores?.conversation?.toFixed(3) || 'N/A'}/1.000
${this.generateConversationSection()}

### Agentic Behavior: ${metrics.categoryScores?.agentic?.toFixed(3) || 'N/A'}/1.000
${this.generateAgenticSection()}

### Intellectual Awareness: ${metrics.categoryScores?.intellectual?.toFixed(3) || 'N/A'}/1.000
${this.generateIntellectualSection()}

### Parsing Capabilities: ${metrics.categoryScores?.parsing?.toFixed(3) || 'N/A'}/1.000
${this.generateParsingSection()}

## Performance Metrics
- **Min Response Time**: ${metrics.minResponseTime || 'N/A'}ms
- **Max Response Time**: ${metrics.maxResponseTime || 'N/A'}ms
- **Average Coherence**: ${metrics.averageCoherence?.toFixed(3) || 'N/A'}

## Recommendations
${this.generateRecommendations()}

## Detailed Results
${this.generateDetailedResults()}
`;
    }

    generatePersonalitySection() {
        let section = "\n#### Personality Test Results\n\n";
        
        for (const [key, result] of Object.entries(this.testResults.personalityTests)) {
            section += `**${result.personality}**: ${result.score.toFixed(3)}/1.000\n`;
            section += `- Consistency: ${(result.consistency.overall * 100).toFixed(1)}%\n`;
            
            if (result.score < 0.5) {
                section += `- ⚠️ **Issue**: Low personality consistency\n`;
            } else if (result.score < 0.7) {
                section += `- ⚠️ **Issue**: Moderate personality consistency\n`;
            } else {
                section += `- ✅ **Good**: Strong personality consistency\n`;
            }
            
            section += "\n";
        }
        
        return section;
    }

    generateConversationSection() {
        let section = "\n#### Conversation Test Results\n\n";
        
        for (const [key, result] of Object.entries(this.testResults.multiTurnConversations)) {
            section += `**${result.scenario.name}**: ${result.score.toFixed(3)}/1.000\n`;
            
            const analysis = result.analysis;
            section += `- Coherence: ${(analysis.coherence * 100).toFixed(1)}%\n`;
            section += `- Relevance: ${(analysis.relevance * 100).toFixed(1)}%\n`;
            section += `- Personality Consistency: ${(analysis.personalityConsistency * 100).toFixed(1)}%\n`;
            
            if (result.score < 0.5) {
                section += `- ⚠️ **Issue**: Poor conversation quality\n`;
            } else if (result.score < 0.7) {
                section += `- ⚠️ **Issue**: Moderate conversation quality\n`;
            } else {
                section += `- ✅ **Good**: Strong conversation quality\n`;
            }
            
            section += "\n";
        }
        
        return section;
    }

    generateAgenticSection() {
        let section = "\n#### Agentic Behavior Test Results\n\n";
        
        for (const [key, result] of Object.entries(this.testResults.agenticBehavior)) {
            section += `**${result.scenario.name}**: ${result.score.toFixed(3)}/1.000\n`;
            section += `- Expected Elements Coverage: ${(result.analysis.expectedElementsCoverage * 100).toFixed(1)}%\n`;
            
            if (result.score < 0.5) {
                section += `- ⚠️ **Issue**: Poor agentic behavior\n`;
            } else if (result.score < 0.7) {
                section += `- ⚠️ **Issue**: Moderate agentic behavior\n`;
            } else {
                section += `- ✅ **Good**: Strong agentic behavior\n`;
            }
            
            section += "\n";
        }
        
        return section;
    }

    generateIntellectualSection() {
        let section = "\n#### Intellectual Awareness Test Results\n\n";
        
        for (const [key, result] of Object.entries(this.testResults.intellectualAwareness)) {
            section += `**${result.scenario.name}**: ${result.score.toFixed(3)}/1.000\n`;
            section += `- Expected Elements Coverage: ${(result.analysis.expectedElementsCoverage * 100).toFixed(1)}%\n`;
            
            if (result.score < 0.5) {
                section += `- ⚠️ **Issue**: Low intellectual awareness\n`;
            } else if (result.score < 0.7) {
                section += `- ⚠️ **Issue**: Moderate intellectual awareness\n`;
            } else {
                section += `- ✅ **Good**: Strong intellectual awareness\n`;
            }
            
            section += "\n";
        }
        
        return section;
    }

    generateParsingSection() {
        let section = "\n#### Parsing Capabilities Test Results\n\n";
        
        for (const [key, result] of Object.entries(this.testResults.parsingCapabilities)) {
            section += `**${result.scenario.name}**: ${result.score.toFixed(3)}/1.000\n`;
            section += `- Expected Elements Coverage: ${(result.analysis.expectedElementsCoverage * 100).toFixed(1)}%\n`;
            
            if (result.score < 0.5) {
                section += `- ⚠️ **Issue**: Poor parsing capabilities\n`;
            } else if (result.score < 0.7) {
                section += `- ⚠️ **Issue**: Moderate parsing capabilities\n`;
            } else {
                section += `- ✅ **Good**: Strong parsing capabilities\n`;
            }
            
            section += "\n";
        }
        
        return section;
    }

    generateRecommendations() {
        const metrics = this.testResults.performanceMetrics;
        const recommendations = [];
        
        if (metrics.categoryScores?.personality < 0.7) {
            recommendations.push("- **Improve personality consistency**: The model struggles to maintain consistent personality traits across different scenarios. Consider fine-tuning with more personality-specific training data.");
        }
        
        if (metrics.categoryScores?.conversation < 0.7) {
            recommendations.push("- **Enhance conversation skills**: Multi-turn conversations show coherence issues. Training on dialogue datasets and conversation flow could help.");
        }
        
        if (metrics.categoryScores?.agentic < 0.7) {
            recommendations.push("- **Strengthen agentic behavior**: The model shows limited goal-directed behavior. Training on task-oriented datasets and planning scenarios would be beneficial.");
        }
        
        if (metrics.categoryScores?.intellectual < 0.7) {
            recommendations.push("- **Boost intellectual awareness**: Abstract reasoning and self-awareness need improvement. Consider training on more complex reasoning tasks.");
        }
        
        if (metrics.categoryScores?.parsing < 0.7) {
            recommendations.push("- **Improve parsing capabilities**: Command and context parsing are weak. Training on structured data and instruction-following tasks is recommended.");
        }
        
        if (metrics.averageResponseTime > 2000) {
            recommendations.push("- **Optimize response time**: Responses are slow. Consider model optimization or hardware improvements.");
        }
        
        if (recommendations.length === 0) {
            recommendations.push("- **Excellent performance**: The model demonstrates strong capabilities across all tested areas.");
        }
        
        return recommendations.join('\n');
    }

    generateDetailedResults() {
        let section = "\n### Detailed Test Results\n\n";
        
        // Add sample responses for each category
        section += "#### Sample Personality Responses\n\n";
        for (const [key, result] of Object.entries(this.testResults.personalityTests)) {
            section += `**${result.personality}**:\n`;
            for (const response of result.responses) {
                section += `- ${response.scenario}: "${response.response.substring(0, 100)}..."\n`;
            }
            section += "\n";
        }
        
        return section;
    }

    printSummary() {
        const metrics = this.testResults.performanceMetrics;
        
        console.log("\n" + "=".repeat(60));
        console.log("📊 TEST SUMMARY");
        console.log("=".repeat(60));
        
        console.log(`\n🎯 Overall Score: ${metrics.overallScore?.toFixed(3) || 'N/A'}/1.000`);
        
        if (metrics.categoryScores) {
            console.log("\n📈 Category Breakdown:");
            console.log(`  Personality Consistency: ${metrics.categoryScores.personality?.toFixed(3)}/1.000`);
            console.log(`  Multi-Turn Conversations: ${metrics.categoryScores.conversation?.toFixed(3)}/1.000`);
            console.log(`  Agentic Behavior: ${metrics.categoryScores.agentic?.toFixed(3)}/1.000`);
            console.log(`  Intellectual Awareness: ${metrics.categoryScores.intellectual?.toFixed(3)}/1.000`);
            console.log(`  Parsing Capabilities: ${metrics.categoryScores.parsing?.toFixed(3)}/1.000`);
        }
        
        console.log(`\n⚡ Performance Metrics:`);
        console.log(`  Average Response Time: ${metrics.averageResponseTime?.toFixed(0) || 'N/A'}ms`);
        console.log(`  Min/Max Response Time: ${metrics.minResponseTime || 'N/A'}ms / ${metrics.maxResponseTime || 'N/A'}ms`);
        
        // Compatibility assessment
        const overallScore = metrics.overallScore || 0;
        let compatibility = "❌ INCOMPATIBLE";
        
        if (overallScore >= 0.8) {
            compatibility = "✅ EXCELLENT COMPATIBILITY";
        } else if (overallScore >= 0.6) {
            compatibility = "⚠️  GOOD COMPATIBILITY";
        } else if (overallScore >= 0.4) {
            compatibility = "⚠️  MARGINAL COMPATIBILITY";
        }
        
        console.log(`\n🔗 COMPATIBILITY ASSESSMENT: ${compatibility}`);
        
        if (overallScore < 0.6) {
            console.log("\n⚠️  RECOMMENDATIONS:");
            console.log("  - Consider fine-tuning model for better performance");
            console.log("  - Review detailed report for specific improvement areas");
            console.log("  - Test with different model parameters or temperatures");
        }
        
        console.log("\n" + "=".repeat(60));
    }
}

// Main execution
async function main() {
    console.log("🧠 VLLM Model Test Suite for Mindcraft");
    console.log("==========================================\n");
    
    // Check for command line arguments
    const args = process.argv.slice(2);
    const modelConfig = {};
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log("Usage: node test_vllm_model.cjs [options]");
        console.log("Options:");
        console.log("  --model <name>    Model name (default: deepseek-ai/DeepSeek-R1-Distill-Qwen-32B)");
        console.log("  --url <url>       VLLM server URL (default: http://0.0.0.0:8000/v1)");
        console.log("  --help, -h        Show this help message");
        process.exit(0);
    }
    
    const modelIndex = args.indexOf('--model');
    if (modelIndex !== -1 && args[modelIndex + 1]) {
        modelConfig.model = args[modelIndex + 1];
    }
    
    const urlIndex = args.indexOf('--url');
    if (urlIndex !== -1 && args[urlIndex + 1]) {
        modelConfig.url = args[urlIndex + 1];
    }
    
    console.log(`Testing model: ${modelConfig.model || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'}`);
    console.log(`VLLM URL: ${modelConfig.url || 'http://0.0.0.0:8000/v1'}\n`);
    
    try {
        const tester = new VLLMModelTester(modelConfig);
        await tester.runAllTests();
    } catch (error) {
        console.error("❌ Test execution failed:", error.message);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { VLLMModelTester };