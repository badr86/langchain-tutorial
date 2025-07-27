import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
// Custom Calculator Tool implementation
class Calculator extends DynamicTool {
    constructor() {
        super({
            name: 'calculator',
            description: 'Useful for mathematical calculations. Input should be a mathematical expression.',
            func: async (input) => {
                try {
                    // Simple eval for basic math operations (in production, use a safer math parser)
                    const result = eval(input.replace(/[^0-9+\-*/().\s]/g, ''));
                    return `The result of ${input} is ${result}`;
                } catch (error) {
                    return `Error calculating ${input}: ${error.message}`;
                }
            }
        });
    }
}
import { DynamicTool } from 'langchain/tools';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Basic ReAct Agent Demo
 * 
 * This demo shows a simple agent that can reason and act with built-in tools.
 * ReAct (Reasoning + Acting) agents can use tools to solve complex problems.
 */
async function basicReactAgentDemo() {
    console.log('🚀 Executing Basic ReAct Agent Demo...');
    console.log('=' .repeat(60));

    console.log('🤖 ReAct Agent Overview:');
    console.log('   • ReAct = Reasoning + Acting');
    console.log('   • Can use tools to solve problems');
    console.log('   • Iterative thought-action-observation cycle');
    console.log('   • Self-correcting and adaptive');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing conceptual ReAct agent workflow instead...');
        
        showConceptualWorkflow();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with agent demo');

    // Initialize the LLM
    const llm = new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n🤖 LLM Configuration:');
    console.log('   • Model: gpt-3.5-turbo');
    console.log('   • Temperature: 0 (deterministic)');
    console.log('   • Purpose: Agent reasoning and planning');

    // Define available tools
    console.log('\n🛠️ Setting up agent tools...');

    // Calculator tool for mathematical operations
    const calculator = new Calculator();

    // Custom search tool (mock implementation)
    const searchTool = new DynamicTool({
        name: 'search',
        description: 'Search for information on the internet. Input should be a search query.',
        func: async (query) => {
            console.log(`🔍 Searching for: "${query}"`);
            
            // Mock search results based on query
            const mockResults = {
                'weather': 'Current weather: Sunny, 75°F with light breeze',
                'python': 'Python is a high-level programming language known for its simplicity and readability',
                'langchain': 'LangChain is a framework for developing applications powered by language models',
                'react': 'React is a JavaScript library for building user interfaces, developed by Facebook'
            };
            
            const result = Object.keys(mockResults).find(key => 
                query.toLowerCase().includes(key)
            );
            
            return result ? mockResults[result] : `Search results for "${query}": No specific information available in mock database.`;
        },
    });

    // Time tool for current date/time
    const timeTool = new DynamicTool({
        name: 'current_time',
        description: 'Get the current date and time.',
        func: async () => {
            const now = new Date();
            return `Current date and time: ${now.toLocaleString()}`;
        },
    });

    const tools = [calculator, searchTool, timeTool];

    console.log('🔧 Available Tools:');
    tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
    });

    // Get the ReAct prompt template from LangChain Hub
    console.log('\n📋 Loading ReAct prompt template...');
    let prompt;
    try {
        prompt = await pull('hwchase17/react');
        console.log('✅ ReAct prompt template loaded from LangChain Hub');
    } catch (error) {
        console.log('⚠️  Could not load from hub, using fallback prompt');
        // Fallback prompt if hub is unavailable
        const { ChatPromptTemplate } = await import('@langchain/core/prompts');
        prompt = ChatPromptTemplate.fromTemplate(`
Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}
        `);
    }

    // Create the ReAct agent
    console.log('\n🏗️ Creating ReAct agent...');
    const agent = await createReactAgent({
        llm,
        tools,
        prompt,
    });

    // Create agent executor
    const agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
        maxIterations: 5,
        returnIntermediateSteps: true,
    });

    console.log('✅ ReAct agent created and ready!');
    console.log('\n🎯 Agent Configuration:');
    console.log('   • Max iterations: 5');
    console.log('   • Verbose mode: enabled');
    console.log('   • Intermediate steps: tracked');

    // Test queries for the agent
    const testQueries = [
        {
            query: "What is the square root of 144 multiplied by 7?",
            description: "Mathematical calculation requiring calculator tool"
        },
        {
            query: "What time is it right now and what's 25 + 17?",
            description: "Multi-tool query requiring time and calculator"
        },
        {
            query: "Search for information about Python programming language",
            description: "Information retrieval using search tool"
        }
    ];

    console.log('\n🧪 Testing ReAct Agent with Various Queries...');

    for (let i = 0; i < testQueries.length; i++) {
        const test = testQueries[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🎯 Test ${i + 1}: ${test.description}`);
        console.log(`${'='.repeat(50)}`);
        
        console.log('❓ Query:', test.query);
        
        try {
            console.log('\n🔄 Agent is thinking and acting...');
            console.log('💭 Watch the ReAct cycle: Thought → Action → Observation');
            
            const startTime = Date.now();
            const result = await agentExecutor.invoke({
                input: test.query
            });
            const endTime = Date.now();
            
            console.log('\n✅ Agent completed successfully!');
            console.log('📝 Final Answer:', result.output);
            console.log(`⏱️  Processing time: ${endTime - startTime}ms`);
            
            // Show intermediate steps
            if (result.intermediateSteps && result.intermediateSteps.length > 0) {
                console.log('\n🔍 Agent Reasoning Steps:');
                result.intermediateSteps.forEach((step, index) => {
                    console.log(`   Step ${index + 1}:`);
                    console.log(`     Tool: ${step.action.tool}`);
                    console.log(`     Input: ${step.action.toolInput}`);
                    console.log(`     Output: ${step.observation.substring(0, 100)}...`);
                });
            }
            
        } catch (error) {
            console.log('❌ Agent error:', error.message);
            console.log('💡 This might be due to API limits or network issues');
        }
        
        // Delay between tests
        if (i < testQueries.length - 1) {
            console.log('\n⏳ Waiting before next test...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Agent capabilities summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('🚀 ReAct Agent Capabilities');
    console.log(`${'='.repeat(60)}`);

    console.log('\n✅ What ReAct Agents Can Do:');
    console.log('   • Break down complex problems into steps');
    console.log('   • Use multiple tools in sequence');
    console.log('   • Self-correct when tools return unexpected results');
    console.log('   • Reason about which tool to use for each subtask');
    console.log('   • Combine information from multiple sources');

    console.log('\n🎯 Best Use Cases:');
    console.log('   • Mathematical problem solving');
    console.log('   • Information research and synthesis');
    console.log('   • Multi-step task automation');
    console.log('   • Data analysis and reporting');
    console.log('   • Customer support with tool access');

    console.log('\n⚠️ Limitations:');
    console.log('   • Limited by available tools');
    console.log('   • Can make reasoning errors');
    console.log('   • Token usage grows with complexity');
    console.log('   • May get stuck in reasoning loops');

    console.log('\n✅ Basic ReAct Agent Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • ReAct agents combine reasoning with tool usage');
    console.log('   • They can solve complex multi-step problems');
    console.log('   • Tool selection and usage is automatic');
    console.log('   • Verbose mode helps understand agent reasoning');
    console.log('   • Great foundation for building intelligent assistants');
}

function showConceptualWorkflow() {
    console.log('\n🎭 Conceptual ReAct Agent Workflow:');
    console.log('\n📝 Example: "What is the square root of 144 multiplied by 7?"');
    
    console.log('\n💭 Thought: I need to calculate the square root of 144 first, then multiply by 7');
    console.log('🔧 Action: calculator');
    console.log('📥 Action Input: sqrt(144)');
    console.log('👁️  Observation: 12');
    
    console.log('\n💭 Thought: Now I need to multiply 12 by 7');
    console.log('🔧 Action: calculator');
    console.log('📥 Action Input: 12 * 7');
    console.log('👁️  Observation: 84');
    
    console.log('\n💭 Thought: I now know the final answer');
    console.log('✅ Final Answer: The square root of 144 multiplied by 7 is 84');
    
    console.log('\n🔄 This demonstrates the ReAct cycle:');
    console.log('   1. Reason about the problem');
    console.log('   2. Choose appropriate action/tool');
    console.log('   3. Execute the action');
    console.log('   4. Observe the result');
    console.log('   5. Repeat until problem is solved');
}

// Execute the demo
basicReactAgentDemo().catch(console.error);
