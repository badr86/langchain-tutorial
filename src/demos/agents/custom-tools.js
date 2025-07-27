import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { Tool } from 'langchain/tools';
import { DynamicTool } from 'langchain/tools';
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
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Custom Tools Creation Demo
 * 
 * This demo shows how to create and use custom tools with agents.
 * Custom tools extend agent capabilities for domain-specific tasks.
 */
async function customToolsDemo() {
    console.log('🚀 Executing Custom Tools Creation Demo...');
    console.log('=' .repeat(60));

    console.log('🛠️ Custom Tools Overview:');
    console.log('   • Extend agent capabilities with custom logic');
    console.log('   • Domain-specific functionality');
    console.log('   • Integration with external APIs and services');
    console.log('   • Structured input validation with schemas');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing custom tools structure and examples instead...');
        
        showCustomToolsStructure();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with custom tools demo');

    // Initialize the LLM
    const llm = new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n🤖 LLM Configuration:');
    console.log('   • Model: gpt-3.5-turbo');
    console.log('   • Temperature: 0 (deterministic)');

    // Create custom tools
    console.log('\n🏗️ Creating Custom Tools...');

    // 1. Weather Tool (Class-based approach)
    class WeatherTool extends Tool {
        name = 'weather';
        description = 'Get current weather for a city. Input should be a city name.';

        schema = z.object({
            city: z.string().describe('The city name to get weather for'),
        });

        async _call(input) {
            console.log(`🌤️  Getting weather for: ${input}`);
            
            // Mock weather data (in real implementation, call weather API)
            const weatherData = {
                'New York': 'Sunny, 75°F with light breeze. Humidity: 45%',
                'London': 'Cloudy, 60°F with chance of rain. Humidity: 70%',
                'Tokyo': 'Partly cloudy, 68°F with mild wind. Humidity: 55%',
                'Paris': 'Overcast, 62°F with light drizzle. Humidity: 80%',
                'Sydney': 'Clear skies, 78°F with ocean breeze. Humidity: 50%'
            };
            
            const weather = weatherData[input] || `Weather data not available for ${input}. Try: New York, London, Tokyo, Paris, or Sydney.`;
            console.log(`   Result: ${weather}`);
            return weather;
        }
    }

    // 2. Database Query Tool (Class-based approach)
    class DatabaseTool extends Tool {
        name = 'database_query';
        description = 'Query user database for information. Input should describe what user information you need.';

        async _call(query) {
            console.log(`🗄️  Querying database: ${query}`);
            
            // Mock database with user information
            const mockDatabase = [
                { id: 1, name: 'John Doe', age: 30, role: 'Software Engineer', city: 'New York' },
                { id: 2, name: 'Jane Smith', age: 25, role: 'Data Scientist', city: 'London' },
                { id: 3, name: 'Mike Johnson', age: 35, role: 'Product Manager', city: 'Tokyo' },
                { id: 4, name: 'Sarah Wilson', age: 28, role: 'UX Designer', city: 'Paris' }
            ];
            
            // Simple query processing
            let results = mockDatabase;
            
            if (query.toLowerCase().includes('engineer')) {
                results = results.filter(user => user.role.toLowerCase().includes('engineer'));
            } else if (query.toLowerCase().includes('age')) {
                if (query.includes('30')) {
                    results = results.filter(user => user.age >= 30);
                }
            } else if (query.toLowerCase().includes('city')) {
                const cities = ['new york', 'london', 'tokyo', 'paris'];
                const mentionedCity = cities.find(city => query.toLowerCase().includes(city));
                if (mentionedCity) {
                    results = results.filter(user => user.city.toLowerCase() === mentionedCity);
                }
            }
            
            const response = JSON.stringify(results, null, 2);
            console.log(`   Found ${results.length} results`);
            return response;
        }
    }

    // 3. Text Analysis Tool (DynamicTool approach)
    const textAnalysisTool = new DynamicTool({
        name: 'text_analysis',
        description: 'Analyze text for sentiment, word count, and key metrics. Input should be the text to analyze.',
        func: async (text) => {
            console.log(`📊 Analyzing text: "${text.substring(0, 50)}..."`);
            
            // Basic text analysis
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const characters = text.length;
            
            // Simple sentiment analysis
            const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'awesome'];
            const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor'];
            
            const positiveCount = positiveWords.filter(word => 
                text.toLowerCase().includes(word)
            ).length;
            const negativeCount = negativeWords.filter(word => 
                text.toLowerCase().includes(word)
            ).length;
            
            let sentiment = 'neutral';
            if (positiveCount > negativeCount) sentiment = 'positive';
            else if (negativeCount > positiveCount) sentiment = 'negative';
            
            const analysis = {
                wordCount: words.length,
                sentenceCount: sentences.length,
                characterCount: characters,
                averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length * 10) / 10 : 0,
                sentiment: sentiment,
                positiveWords: positiveCount,
                negativeWords: negativeCount
            };
            
            console.log(`   Analysis: ${words.length} words, ${sentiment} sentiment`);
            return JSON.stringify(analysis, null, 2);
        },
    });

    // 4. Unit Converter Tool (DynamicTool approach)
    const unitConverterTool = new DynamicTool({
        name: 'unit_converter',
        description: 'Convert between different units. Format: "value from_unit to to_unit" (e.g., "100 fahrenheit to celsius")',
        func: async (input) => {
            console.log(`🔄 Converting units: ${input}`);
            
            const parts = input.toLowerCase().split(' ');
            if (parts.length < 4) {
                return 'Invalid format. Use: "value from_unit to to_unit"';
            }
            
            const value = parseFloat(parts[0]);
            const fromUnit = parts[1];
            const toUnit = parts[3];
            
            let result;
            
            // Temperature conversions
            if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
                result = (value - 32) * 5/9;
                return `${value}°F = ${Math.round(result * 100) / 100}°C`;
            } else if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
                result = (value * 9/5) + 32;
                return `${value}°C = ${Math.round(result * 100) / 100}°F`;
            }
            
            // Length conversions
            else if (fromUnit === 'meters' && toUnit === 'feet') {
                result = value * 3.28084;
                return `${value} meters = ${Math.round(result * 100) / 100} feet`;
            } else if (fromUnit === 'feet' && toUnit === 'meters') {
                result = value / 3.28084;
                return `${value} feet = ${Math.round(result * 100) / 100} meters`;
            }
            
            // Weight conversions
            else if (fromUnit === 'kilograms' && toUnit === 'pounds') {
                result = value * 2.20462;
                return `${value} kg = ${Math.round(result * 100) / 100} lbs`;
            } else if (fromUnit === 'pounds' && toUnit === 'kilograms') {
                result = value / 2.20462;
                return `${value} lbs = ${Math.round(result * 100) / 100} kg`;
            }
            
            return `Conversion not supported. Available: fahrenheit/celsius, meters/feet, kilograms/pounds`;
        },
    });

    // Combine all custom tools
    const customTools = [
        new WeatherTool(),
        new DatabaseTool(),
        textAnalysisTool,
        unitConverterTool,
        new Calculator() // Include standard calculator
    ];

    console.log('✅ Custom Tools Created:');
    customTools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name}: ${tool.description.substring(0, 60)}...`);
    });

    // Create agent with custom tools
    console.log('\n🏗️ Creating Agent with Custom Tools...');

    const prompt = ChatPromptTemplate.fromTemplate(`
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

    const agent = await createReactAgent({
        llm,
        tools: customTools,
        prompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools: customTools,
        verbose: true,
        maxIterations: 5,
    });

    console.log('✅ Agent with custom tools ready!');

    // Test custom tools
    const testQueries = [
        {
            query: "What's the weather like in Tokyo?",
            description: "Testing weather tool"
        },
        {
            query: "Find all software engineers in the database",
            description: "Testing database query tool"
        },
        {
            query: "Analyze this text: 'I love this amazing product! It's fantastic and works great!'",
            description: "Testing text analysis tool"
        },
        {
            query: "Convert 100 fahrenheit to celsius",
            description: "Testing unit converter tool"
        },
        {
            query: "What's the weather in London and convert 20 celsius to fahrenheit?",
            description: "Testing multiple custom tools in one query"
        }
    ];

    console.log('\n🧪 Testing Custom Tools...');

    for (let i = 0; i < testQueries.length; i++) {
        const test = testQueries[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🎯 Test ${i + 1}: ${test.description}`);
        console.log(`${'='.repeat(50)}`);
        
        console.log('❓ Query:', test.query);
        
        try {
            console.log('\n🔄 Agent processing with custom tools...');
            
            const result = await agentExecutor.invoke({
                input: test.query
            });
            
            console.log('\n✅ Custom tools execution completed!');
            console.log('📝 Final Answer:', result.output);
            
        } catch (error) {
            console.log('❌ Error with custom tools:', error.message);
        }
        
        // Delay between tests
        if (i < testQueries.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Custom tools best practices
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Custom Tools Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🏗️ Tool Design:');
    console.log('   • Clear, descriptive names and descriptions');
    console.log('   • Specific input format requirements');
    console.log('   • Robust error handling');
    console.log('   • Consistent output formats');
    console.log('   • Schema validation where applicable');

    console.log('\n🔧 Implementation Tips:');
    console.log('   • Use Tool class for complex tools');
    console.log('   • Use DynamicTool for simple functions');
    console.log('   • Add logging for debugging');
    console.log('   • Handle edge cases gracefully');
    console.log('   • Test tools independently first');

    console.log('\n✅ Custom Tools Creation Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Custom tools extend agent capabilities significantly');
    console.log('   • Both class-based and function-based approaches work');
    console.log('   • Clear descriptions help agents choose the right tool');
    console.log('   • Error handling is crucial for reliable agents');
    console.log('   • Custom tools enable domain-specific functionality');
}

function showCustomToolsStructure() {
    console.log('\n🏗️ Custom Tool Implementation Patterns:');
    
    console.log('\n1️⃣ Class-based Tool (Tool class):');
    console.log(`
class CustomTool extends Tool {
    name = 'tool_name';
    description = 'What the tool does';
    
    async _call(input) {
        // Tool logic here
        return result;
    }
}
    `);
    
    console.log('\n2️⃣ Function-based Tool (DynamicTool):');
    console.log(`
const customTool = new DynamicTool({
    name: 'tool_name',
    description: 'What the tool does',
    func: async (input) => {
        // Tool logic here
        return result;
    },
});
    `);
    
    console.log('\n🎯 Custom Tool Examples:');
    console.log('   • Weather API integration');
    console.log('   • Database queries');
    console.log('   • File system operations');
    console.log('   • Text analysis and processing');
    console.log('   • Unit conversions');
    console.log('   • Email sending');
    console.log('   • Calendar management');
    console.log('   • External service integration');
}

// Execute the demo
customToolsDemo().catch(console.error);
