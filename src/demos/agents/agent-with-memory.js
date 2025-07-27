import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { DynamicTool } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Agent with Memory Demo
 * 
 * This demo shows a persistent agent that remembers previous interactions.
 * Memory enables agents to maintain context across multiple conversations.
 */
async function agentWithMemoryDemo() {
    console.log('🚀 Executing Agent with Memory Demo...');
    console.log('=' .repeat(60));

    console.log('🧠 Agent with Memory Overview:');
    console.log('   • Persistent memory across interactions');
    console.log('   • Context-aware responses');
    console.log('   • Learning from previous conversations');
    console.log('   • Personalized agent behavior');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing memory-enabled agent concepts instead...');
        
        showMemoryAgentConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with memory agent demo');

    // Initialize the LLM
    const llm = new ChatOpenAI({
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n🤖 LLM Configuration:');
    console.log('   • Model: gpt-3.5-turbo');
    console.log('   • Temperature: 0.7');
    console.log('   • Memory integration: enabled');

    // Create tools for the agent
    console.log('\n🛠️ Setting up agent tools...');

    const calculator = new Calculator();

    // Personal information storage tool
    const personalInfoTool = new DynamicTool({
        name: 'store_personal_info',
        description: 'Store personal information about the user for future reference. Input should be key-value pairs.',
        func: async (info) => {
            console.log(`💾 Storing personal info: ${info}`);
            // In a real implementation, this would store to a database
            return `Personal information stored: ${info}`;
        },
    });

    // Preference tracking tool
    const preferenceTool = new DynamicTool({
        name: 'track_preference',
        description: 'Track user preferences and interests. Input should describe the preference.',
        func: async (preference) => {
            console.log(`📝 Tracking preference: ${preference}`);
            return `Preference noted and will be remembered: ${preference}`;
        },
    });

    // Task history tool
    const taskHistoryTool = new DynamicTool({
        name: 'log_task',
        description: 'Log completed tasks for future reference. Input should describe the task.',
        func: async (task) => {
            console.log(`📋 Logging task: ${task}`);
            return `Task logged in history: ${task}`;
        },
    });

    const tools = [calculator, personalInfoTool, preferenceTool, taskHistoryTool];

    console.log('✅ Tools created:');
    tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });

    // Memory-enabled Agent class
    class MemoryAgent {
        constructor(llm, tools) {
            this.llm = llm;
            this.tools = tools;
            this.name = 'Memory Agent';
            
            // Create memory for the agent
            this.memory = new BufferMemory({
                memoryKey: 'chat_history',
                returnMessages: true,
            });

            // Create custom prompt that includes memory
            this.prompt = ChatPromptTemplate.fromMessages([
                ['system', `You are a helpful assistant with memory capabilities. You can remember previous conversations and user information.

Use your memory to:
- Recall previous conversations and context
- Remember user preferences and personal information
- Build on previous interactions
- Provide personalized responses

Available tools: {tools}
Tool names: {tool_names}

Use the following format:
Question: the input question you must answer
Thought: you should always think about what to do, considering previous conversations
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!`],
                new MessagesPlaceholder('chat_history'),
                ['human', '{input}'],
                ['assistant', '{agent_scratchpad}']
            ]);

            this.agent = null;
            this.agentExecutor = null;
        }

        async initialize() {
            console.log(`🏗️ Initializing ${this.name}...`);
            
            this.agent = await createReactAgent({
                llm: this.llm,
                tools: this.tools,
                prompt: this.prompt,
            });

            this.agentExecutor = new AgentExecutor({
                agent: this.agent,
                tools: this.tools,
                memory: this.memory,
                verbose: true,
                maxIterations: 5,
            });

            console.log(`✅ ${this.name} initialized with memory`);
        }

        async chat(input) {
            console.log(`\n💬 User: ${input}`);
            console.log(`🧠 ${this.name} thinking with memory context...`);
            
            try {
                const result = await this.agentExecutor.invoke({
                    input: input
                });

                console.log(`🤖 ${this.name}: ${result.output}`);
                return result.output;

            } catch (error) {
                console.log(`❌ ${this.name} error:`, error.message);
                return `I encountered an error: ${error.message}`;
            }
        }

        async getMemoryContent() {
            const memoryVars = await this.memory.loadMemoryVariables({});
            return memoryVars.chat_history || [];
        }

        async getMemoryStats() {
            const messages = await this.getMemoryContent();
            return {
                totalMessages: messages.length,
                conversations: Math.floor(messages.length / 2),
                memorySize: JSON.stringify(messages).length
            };
        }

        clearMemory() {
            this.memory.clear();
            console.log('🧹 Memory cleared');
        }
    }

    // Create and initialize memory agent
    console.log('\n🏗️ Creating Memory-Enabled Agent...');
    const memoryAgent = new MemoryAgent(llm, tools);
    await memoryAgent.initialize();

    // Simulate a multi-turn conversation to demonstrate memory
    const conversationFlow = [
        {
            input: "Hi, my name is Alice and I'm a software engineer working on AI projects.",
            description: "Initial introduction with personal information"
        },
        {
            input: "I really enjoy working with Python and machine learning frameworks.",
            description: "Sharing preferences and interests"
        },
        {
            input: "Can you help me calculate 15 * 24?",
            description: "Simple calculation task"
        },
        {
            input: "What's my name and what do I work on?",
            description: "Memory test - agent should recall previous information"
        },
        {
            input: "I'm working on a new project involving natural language processing. Can you log this task?",
            description: "New task information to be remembered"
        },
        {
            input: "Based on what you know about me, what programming topics might interest me?",
            description: "Personalized recommendation based on memory"
        },
        {
            input: "What have we talked about so far?",
            description: "Full memory recall test"
        }
    ];

    console.log('\n🗣️ Starting Memory-Enabled Conversation...');
    console.log(`📝 Conversation will have ${conversationFlow.length} exchanges`);

    for (let i = 0; i < conversationFlow.length; i++) {
        const exchange = conversationFlow[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`💬 Exchange ${i + 1}: ${exchange.description}`);
        console.log(`${'='.repeat(50)}`);
        
        await memoryAgent.chat(exchange.input);
        
        // Show memory stats after each exchange
        const stats = await memoryAgent.getMemoryStats();
        console.log(`📊 Memory: ${stats.conversations} conversations, ${stats.totalMessages} messages`);
        
        // Small delay for readability
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Demonstrate memory persistence across sessions
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔄 Memory Persistence Demo');
    console.log(`${'='.repeat(60)}`);

    console.log('\n📋 Current Memory Contents:');
    const memoryContent = await memoryAgent.getMemoryContent();
    memoryContent.forEach((message, index) => {
        const role = message._getType() === 'human' ? '👤 Human' : '🤖 Agent';
        console.log(`   ${index + 1}. ${role}: ${message.content.substring(0, 80)}...`);
    });

    // Simulate "new session" - memory should persist
    console.log('\n🔄 Simulating New Session...');
    console.log('💭 Agent should remember previous conversation');

    await memoryAgent.chat("Hi again! Do you remember our previous conversation?");

    // Memory management demonstration
    console.log(`\n${'='.repeat(60)}`);
    console.log('🛠️ Memory Management');
    console.log(`${'='.repeat(60)}`);

    const finalStats = await memoryAgent.getMemoryStats();
    console.log('\n📊 Final Memory Statistics:');
    console.log(`   Total messages: ${finalStats.totalMessages}`);
    console.log(`   Conversations: ${finalStats.conversations}`);
    console.log(`   Memory size: ${finalStats.memorySize} characters`);

    console.log('\n🧹 Memory Management Options:');
    console.log('   • clearMemory(): Remove all conversation history');
    console.log('   • getMemoryStats(): Get memory usage statistics');
    console.log('   • getMemoryContent(): Access raw memory content');

    // Memory benefits and considerations
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Memory-Enabled Agent Benefits');
    console.log(`${'='.repeat(60)}`);

    console.log('\n✅ Advantages:');
    console.log('   • Personalized interactions based on history');
    console.log('   • Context continuity across conversations');
    console.log('   • Learning from user preferences');
    console.log('   • Building long-term relationships');
    console.log('   • Avoiding repetitive information gathering');

    console.log('\n⚠️ Considerations:');
    console.log('   • Memory usage grows over time');
    console.log('   • Token costs increase with conversation length');
    console.log('   • Privacy concerns with stored information');
    console.log('   • Need for memory management strategies');
    console.log('   • Potential for outdated information');

    console.log('\n🎯 Best Use Cases:');
    console.log('   • Personal assistants');
    console.log('   • Customer support with history');
    console.log('   • Educational tutoring systems');
    console.log('   • Long-term project collaboration');
    console.log('   • Personalized recommendation systems');

    console.log('\n✅ Agent with Memory Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Memory enables personalized agent interactions');
    console.log('   • Context continuity improves user experience');
    console.log('   • Agents can learn and adapt over time');
    console.log('   • Memory management is crucial for long-term use');
    console.log('   • Great for building long-term user relationships');
}

function showMemoryAgentConcepts() {
    console.log('\n🧠 Memory-Enabled Agent Concepts:');
    
    console.log('\n💾 Memory Integration:');
    console.log('   • BufferMemory stores conversation history');
    console.log('   • Memory is passed to agent with each interaction');
    console.log('   • Agent can reference previous conversations');
    console.log('   • Context builds up over multiple sessions');
    
    console.log('\n🔄 Memory Workflow:');
    console.log('   1. User sends message');
    console.log('   2. Agent loads memory context');
    console.log('   3. Agent processes with full history');
    console.log('   4. Agent responds with context awareness');
    console.log('   5. Interaction saved to memory');
    
    console.log('\n📋 Example Memory Usage:');
    console.log('   👤 "My name is Alice, I\'m a developer"');
    console.log('   🤖 "Nice to meet you Alice! I\'ll remember that."');
    console.log('   👤 "What\'s my profession?" (later)');
    console.log('   🤖 "You\'re a developer, Alice!"');
    
    console.log('\n✅ Memory enables:');
    console.log('   • Personalized responses');
    console.log('   • Context continuity');
    console.log('   • Learning user preferences');
    console.log('   • Building relationships');
}

// Execute the demo
agentWithMemoryDemo().catch(console.error);
