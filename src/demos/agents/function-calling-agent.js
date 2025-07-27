import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { DynamicTool } from 'langchain/tools';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Function Calling Agent Demo
 * 
 * This demo shows an agent using OpenAI function calling for structured tool usage.
 * Function calling provides more reliable and structured tool execution.
 */
async function functionCallingAgentDemo() {
    console.log('🚀 Executing Function Calling Agent Demo...');
    console.log('=' .repeat(60));

    console.log('📞 Function Calling Agent Overview:');
    console.log('   • Uses OpenAI function calling capabilities');
    console.log('   • Structured tool usage with JSON schemas');
    console.log('   • More reliable than ReAct for tool execution');
    console.log('   • Deterministic function parameter extraction');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing function calling concepts instead...');
        
        showFunctionCallingConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with function calling demo');

    // Initialize the LLM with function calling support
    const llm = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo-0613', // Function calling compatible model
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n🤖 LLM Configuration:');
    console.log('   • Model: gpt-3.5-turbo-0613 (function calling compatible)');
    console.log('   • Temperature: 0 (deterministic)');
    console.log('   • Function calling: enabled');

    // Create function-calling compatible tools
    console.log('\n🛠️ Creating Function Calling Tools...');

    // Email tool with structured schema
    const emailTool = new DynamicTool({
        name: 'send_email',
        description: 'Send an email to a recipient with subject and body',
        func: async ({ to, subject, body }) => {
            console.log(`📧 Sending email:`);
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            console.log(`   Body: ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`);
            
            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return `Email sent successfully to ${to} with subject "${subject}"`;
        },
        schema: z.object({
            to: z.string().describe('Email recipient address'),
            subject: z.string().describe('Email subject line'),
            body: z.string().describe('Email body content'),
        }),
    });

    // Calendar tool with structured schema
    const calendarTool = new DynamicTool({
        name: 'schedule_meeting',
        description: 'Schedule a meeting in the calendar',
        func: async ({ title, date, duration, attendees }) => {
            console.log(`📅 Scheduling meeting:`);
            console.log(`   Title: ${title}`);
            console.log(`   Date: ${date}`);
            console.log(`   Duration: ${duration} minutes`);
            console.log(`   Attendees: ${attendees ? attendees.join(', ') : 'None specified'}`);
            
            // Simulate calendar booking
            await new Promise(resolve => setTimeout(resolve, 800));
            
            return `Meeting "${title}" scheduled for ${date} (${duration} minutes)`;
        },
        schema: z.object({
            title: z.string().describe('Meeting title'),
            date: z.string().describe('Meeting date and time (YYYY-MM-DD HH:MM format)'),
            duration: z.number().describe('Duration in minutes'),
            attendees: z.array(z.string()).optional().describe('List of attendee email addresses'),
        }),
    });

    // File operations tool
    const fileOperationsTool = new DynamicTool({
        name: 'file_operations',
        description: 'Perform file operations like create, read, or list files',
        func: async ({ operation, filename, content }) => {
            console.log(`📁 File operation: ${operation}`);
            console.log(`   File: ${filename || 'N/A'}`);
            
            switch (operation) {
                case 'create':
                    console.log(`   Content: ${content?.substring(0, 50)}${content && content.length > 50 ? '...' : ''}`);
                    return `File "${filename}" created successfully with ${content?.length || 0} characters`;
                
                case 'read':
                    // Mock file content
                    const mockContent = `This is the content of ${filename}. It contains sample data for demonstration purposes.`;
                    return `Content of "${filename}": ${mockContent}`;
                
                case 'list':
                    // Mock directory listing
                    const mockFiles = ['document1.txt', 'report.pdf', 'data.json', 'notes.md'];
                    return `Files in directory: ${mockFiles.join(', ')}`;
                
                default:
                    return `Unknown operation: ${operation}. Supported: create, read, list`;
            }
        },
        schema: z.object({
            operation: z.enum(['create', 'read', 'list']).describe('File operation to perform'),
            filename: z.string().optional().describe('Name of the file (required for create/read)'),
            content: z.string().optional().describe('File content (required for create operation)'),
        }),
    });

    // Data analysis tool
    const dataAnalysisTool = new DynamicTool({
        name: 'analyze_data',
        description: 'Analyze numerical data and provide statistics',
        func: async ({ data, analysis_type }) => {
            console.log(`📊 Analyzing data: ${data.length} values`);
            console.log(`   Analysis type: ${analysis_type}`);
            
            const numbers = data.map(Number).filter(n => !isNaN(n));
            
            if (numbers.length === 0) {
                return 'No valid numerical data provided';
            }
            
            const sum = numbers.reduce((a, b) => a + b, 0);
            const mean = sum / numbers.length;
            const min = Math.min(...numbers);
            const max = Math.max(...numbers);
            const median = numbers.sort((a, b) => a - b)[Math.floor(numbers.length / 2)];
            
            const results = {
                count: numbers.length,
                sum: sum,
                mean: Math.round(mean * 100) / 100,
                median: median,
                min: min,
                max: max,
                range: max - min
            };
            
            return JSON.stringify(results, null, 2);
        },
        schema: z.object({
            data: z.array(z.union([z.string(), z.number()])).describe('Array of numerical data to analyze'),
            analysis_type: z.enum(['basic', 'detailed']).describe('Type of analysis to perform'),
        }),
    });

    const tools = [emailTool, calendarTool, fileOperationsTool, dataAnalysisTool];

    console.log('✅ Function Calling Tools Created:');
    tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
    });

    // Create function calling agent
    console.log('\n🏗️ Creating Function Calling Agent...');

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'You are a helpful assistant that can send emails, schedule meetings, manage files, and analyze data. Use the available functions to help users with their requests.'],
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const agent = await createOpenAIFunctionsAgent({
        llm,
        tools,
        prompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
        maxIterations: 5,
    });

    console.log('✅ Function calling agent ready!');

    // Test function calling with various scenarios
    const testScenarios = [
        {
            query: "Send an email to john@example.com about our meeting tomorrow at 2 PM. The subject should be 'Meeting Reminder' and mention that we'll discuss the project updates.",
            description: "Single function call - email sending"
        },
        {
            query: "Schedule a meeting titled 'Project Review' for 2024-01-15 14:00, duration 60 minutes, with attendees alice@company.com and bob@company.com",
            description: "Single function call - calendar scheduling"
        },
        {
            query: "Create a file called 'meeting-notes.txt' with the content 'Meeting notes from today: Discussed project timeline and deliverables.'",
            description: "Single function call - file creation"
        },
        {
            query: "Analyze this sales data: [100, 150, 200, 175, 300, 250, 180] and provide basic statistics",
            description: "Single function call - data analysis"
        },
        {
            query: "Send an email to team@company.com about the meeting I'm scheduling for tomorrow at 3 PM titled 'Weekly Standup', then schedule that meeting for 2024-01-16 15:00 for 30 minutes",
            description: "Multiple function calls - email + calendar"
        }
    ];

    console.log('\n🧪 Testing Function Calling Agent...');

    for (let i = 0; i < testScenarios.length; i++) {
        const scenario = testScenarios[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🎯 Test ${i + 1}: ${scenario.description}`);
        console.log(`${'='.repeat(50)}`);
        
        console.log('❓ Request:', scenario.query);
        
        try {
            console.log('\n🔄 Agent processing with function calling...');
            
            const startTime = Date.now();
            const result = await agentExecutor.invoke({
                input: scenario.query
            });
            const endTime = Date.now();
            
            console.log('\n✅ Function calling completed!');
            console.log('📝 Result:', result.output);
            console.log(`⏱️  Processing time: ${endTime - startTime}ms`);
            
        } catch (error) {
            console.log('❌ Function calling error:', error.message);
            console.log('💡 This might be due to API limits or model compatibility');
        }
        
        // Delay between tests
        if (i < testScenarios.length - 1) {
            console.log('\n⏳ Waiting before next test...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Function calling vs ReAct comparison
    console.log(`\n${'='.repeat(60)}`);
    console.log('⚖️ Function Calling vs ReAct Comparison');
    console.log(`${'='.repeat(60)}`);

    console.log('\n📞 Function Calling Advantages:');
    console.log('   • Structured parameter extraction');
    console.log('   • JSON schema validation');
    console.log('   • More reliable tool usage');
    console.log('   • Better error handling');
    console.log('   • Deterministic function calls');

    console.log('\n🤖 ReAct Advantages:');
    console.log('   • More flexible reasoning');
    console.log('   • Works with any LLM');
    console.log('   • Transparent thought process');
    console.log('   • Better for complex multi-step reasoning');

    console.log('\n🎯 When to Use Function Calling:');
    console.log('   • Structured tool interactions');
    console.log('   • API integrations');
    console.log('   • Data processing tasks');
    console.log('   • When reliability is crucial');
    console.log('   • OpenAI models available');

    console.log('\n✅ Function Calling Agent Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Function calling provides structured tool usage');
    console.log('   • JSON schemas ensure proper parameter extraction');
    console.log('   • More reliable than ReAct for deterministic tasks');
    console.log('   • Excellent for API integrations and structured operations');
    console.log('   • Requires OpenAI function calling compatible models');
}

function showFunctionCallingConcepts() {
    console.log('\n📞 Function Calling Concepts:');
    
    console.log('\n🏗️ Function Definition:');
    console.log(`
{
  "name": "send_email",
  "description": "Send an email to a recipient",
  "parameters": {
    "type": "object",
    "properties": {
      "to": {"type": "string", "description": "Recipient email"},
      "subject": {"type": "string", "description": "Email subject"},
      "body": {"type": "string", "description": "Email content"}
    },
    "required": ["to", "subject", "body"]
  }
}
    `);
    
    console.log('\n🔄 Function Calling Flow:');
    console.log('1. 👤 User: "Send email to john@example.com about meeting"');
    console.log('2. 🤖 AI analyzes request and identifies function to call');
    console.log('3. 📞 AI calls send_email function with structured parameters');
    console.log('4. ⚙️  Function executes with validated parameters');
    console.log('5. 📝 Function returns result to AI');
    console.log('6. 🤖 AI provides final response to user');
    
    console.log('\n✅ Benefits:');
    console.log('   • Structured parameter extraction');
    console.log('   • Automatic validation');
    console.log('   • Reliable tool execution');
    console.log('   • Better error handling');
}

// Execute the demo
functionCallingAgentDemo().catch(console.error);
