import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Basic Structured Output Chain Demo
 * 
 * This demo shows how to generate structured JSON output with Zod schemas
 * for validation and type safety. Perfect for building reliable AI APIs.
 */

// Define Zod schemas for structured output
const PersonSchema = z.object({
    name: z.string().describe("Full name of the person"),
    age: z.number().min(0).max(150).describe("Age in years"),
    occupation: z.string().describe("Current job or profession"),
    location: z.string().describe("City and country where they live"),
    skills: z.array(z.string()).describe("List of 3-5 key professional skills"),
    interests: z.array(z.string()).describe("List of 3-5 personal interests and hobbies"),
    personality_traits: z.array(z.string()).describe("List of 3-5 personality traits"),
    email: z.string().email().describe("Professional email address"),
    phone: z.string().describe("Phone number in format +1-XXX-XXX-XXXX")
});

const CompanyAnalysisSchema = z.object({
    company: z.string().describe("Name of the company"),
    industry: z.string().describe("Industry sector"),
    founded: z.number().describe("Year the company was founded"),
    founder: z.string().describe("Company founder or CEO"),
    headquarters: z.string().describe("Company headquarters location"),
    employees: z.number().describe("Number of employees"),
    products: z.array(z.string()).describe("Main products or services"),
    competitors: z.array(z.string()).describe("Main competitors"),
    key_metrics: z.object({
        market_cap: z.string().describe("Market capitalization"),
        revenue_growth: z.string().describe("Revenue growth percentage"),
        gross_margin: z.string().describe("Gross profit margin"),
        operating_margin: z.string().describe("Operating profit margin")
    }).describe("Key financial metrics")
});

async function basicStructuredOutputDemo() {
    console.log('🚀 Executing Basic Structured Output Demo...');
    console.log('='.repeat(60));

    console.log('🏗️ Basic Structured Output Overview:');
    console.log('   • Generate JSON output with predefined Zod schemas');
    console.log('   • Validate and parse LLM responses automatically');
    console.log('   • Ensure type-safe, consistent data structures');
    console.log('   • Perfect for building reliable AI APIs');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing structured output concepts instead...');
        
        showStructuredOutputConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with structured output demo');

    // Initialize components
    console.log('\n🏗️ Initializing Components...');
    
    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.3, // Lower temperature for more consistent structured output
        maxTokens: 1000,
    });

    console.log('✅ Components initialized:');
    console.log('   • LLM: gpt-3.5-turbo (temperature: 0.3)');
    console.log('   • Output Parser: JsonOutputParser with Zod validation');

    // Demo 1: Person Profile Generation
    console.log('\n' + '='.repeat(60));
    console.log('👤 Demo 1: Person Profile Generation');
    console.log('='.repeat(60));

    const personPrompt = ChatPromptTemplate.fromTemplate(`
Generate a detailed person profile based on the given description.

Description: {description}

IMPORTANT: You must respond with valid JSON only. Follow these rules:
- Use double quotes for all property names and string values
- No trailing commas
- No comments or extra text outside the JSON
- Ensure all arrays and objects are properly closed
- Include ALL required fields (do not omit any)

You MUST include ALL of these fields in your response:
- name: Full realistic name
- age: Age as a number
- occupation: Job title or profession
- location: City and country
- skills: Array of 3-5 professional skills
- interests: Array of 3-5 hobbies/interests
- personality_traits: Array of 3-5 personality characteristics
- email: Professional email address
- phone: Phone number in format +1-XXX-XXX-XXXX

Please provide the information in the following JSON format:
{format_instructions}

Make sure ALL fields are filled with realistic and consistent information.
Respond with valid JSON only - no additional text or explanations.
`);

    const personParser = new JsonOutputParser(PersonSchema);

    // Create a custom chain with debugging
    const personChain = RunnableSequence.from([
        {
            description: (input) => input.description,
            format_instructions: () => personParser.getFormatInstructions(),
        },
        personPrompt,
        llm,
        // Add debugging step before parsing
        (llmResponse) => {
            console.log('\n🔍 Raw LLM Response (before parsing):');
            console.log(llmResponse);
            console.log('\n🔄 Attempting to parse with JsonOutputParser...');
            return llmResponse;
        },
        personParser,
    ]);

    console.log('🔗 Person profile chain created with Zod schema validation');

    try {
        console.log('\n🔄 Generating person profile...');
        
        const personResult = await personChain.invoke({
            description: "A 28-year-old software engineer from San Francisco who loves hiking and photography"
        });

        console.log('\n✨ Generated Person Profile:');
        console.log('📋 Name:', personResult.name || 'N/A');
        console.log('🎂 Age:', personResult.age || 'N/A');
        console.log('💼 Occupation:', personResult.occupation || 'N/A');
        console.log('📍 Location:', personResult.location || 'N/A');
        console.log('🛠️ Skills:', (personResult.skills && Array.isArray(personResult.skills)) ? personResult.skills.join(', ') : 'N/A');
        console.log('🎯 Interests:', (personResult.interests && Array.isArray(personResult.interests)) ? personResult.interests.join(', ') : 'N/A');
        console.log('🧠 Personality Traits:', (personResult.personality_traits && Array.isArray(personResult.personality_traits)) ? personResult.personality_traits.join(', ') : 'N/A');
        console.log('📧 Email:', personResult.email || 'N/A');
        console.log('📱 Phone:', personResult.phone || 'N/A');
        
        console.log('\n🔍 Raw Response Structure:');
        console.log(JSON.stringify(personResult, null, 2));

    } catch (error) {
        console.log('\n❌ Error generating person profile:');
        console.log('   Error:', error.message);
        console.log('💡 This might be due to JSON parsing issues or schema validation failures');
    }

    // Demo 2: Company Analysis
    console.log('\n' + '='.repeat(60));
    console.log('🏢 Demo 2: Company Analysis Generation');
    console.log('='.repeat(60));

    const companyPrompt = ChatPromptTemplate.fromTemplate(`
Analyze the following company and provide a comprehensive business analysis.

Company: {company_name}

IMPORTANT: You must respond with valid JSON only. Follow these rules:
- Use double quotes for all property names and string values
- No trailing commas
- No comments or extra text outside the JSON
- Ensure all arrays and objects are properly closed

Please provide the analysis in the following JSON format:
{format_instructions}

Ensure all information is realistic and well-researched based on general knowledge.
Respond with valid JSON only - no additional text or explanations.
`);

    const companyParser = new JsonOutputParser(CompanyAnalysisSchema);

    const companyChain = RunnableSequence.from([
        {
            company_name: (input) => input.company_name,
            format_instructions: () => companyParser.getFormatInstructions(),
        },
        companyPrompt,
        llm,
        companyParser,
    ]);

    console.log('🔗 Company analysis chain created with comprehensive schema');

    try {
        console.log('\n🔄 Analyzing company...');
        
        const companyResult = await companyChain.invoke({
            company_name: "Tesla"
        });

        console.log('\n✨ Company Analysis Results:');
        console.log('🏢 Company:', companyResult.company || 'N/A');
        console.log('🏭 Industry:', companyResult.industry || 'N/A');
        console.log('📅 Founded:', companyResult.founded || 'N/A');
        console.log('👤 Founder:', companyResult.founder || 'N/A');
        console.log('🏢 Headquarters:', companyResult.headquarters || 'N/A');
        console.log('👥 Employees:', companyResult.employees || 'N/A');
        
        console.log('\n📦 Products & Services:');
        if (companyResult.products && Array.isArray(companyResult.products)) {
            companyResult.products.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product}`);
            });
        } else {
            console.log('   No products data available');
        }
        
        console.log('\n⚡ Main Competitors:');
        if (companyResult.competitors && Array.isArray(companyResult.competitors)) {
            companyResult.competitors.forEach((competitor, index) => {
                console.log(`   ${index + 1}. ${competitor}`);
            });
        } else {
            console.log('   No competitors data available');
        }

        console.log('\n💰 Key Financial Metrics:');
        if (companyResult.key_metrics) {
            console.log('💎 Market Cap:', companyResult.key_metrics.market_cap || 'N/A');
            console.log('📈 Revenue Growth:', companyResult.key_metrics.revenue_growth || 'N/A');
            console.log('📊 Gross Margin:', companyResult.key_metrics.gross_margin || 'N/A');
            console.log('📉 Operating Margin:', companyResult.key_metrics.operating_margin || 'N/A');
        } else {
            console.log('   Key metrics not available');
        }
        
        console.log('\n🔍 Raw Response Structure:');
        console.log(JSON.stringify(companyResult, null, 2));

    } catch (error) {
        console.log('\n❌ Error analyzing company:');
        console.log('   Error:', error.message);
        console.log('💡 This might be due to JSON parsing issues or schema validation failures');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 Basic Structured Output Demo Summary');
    console.log('='.repeat(60));
    console.log('✅ Demonstrated two types of structured output:');
    console.log('   1. 👤 Person Profile Generation - Personal data with validation');
    console.log('   2. 🏢 Company Analysis - Business data with nested metrics');
    console.log('\n🎯 Key Benefits:');
    console.log('   • Type-safe JSON output with Zod validation');
    console.log('   • Consistent data structures for API integration');
    console.log('   • Runtime validation prevents malformed responses');
    console.log('   • Perfect for building reliable AI applications');
    console.log('\n💡 Use structured output when you need:');
    console.log('   • Predictable JSON responses for APIs');
    console.log('   • Data that feeds into other systems');
    console.log('   • Type safety and validation');
    console.log('   • Consistent formatting across multiple calls');
}

function showStructuredOutputConcepts() {
    console.log('\n🎭 Basic Structured Output Concepts:');
    console.log('='.repeat(50));
    
    console.log('\n📋 What is Structured Output?');
    console.log('   • Generate JSON with predefined schemas');
    console.log('   • Use JsonOutputParser with Zod for validation');
    console.log('   • Ensure consistent, parseable responses');
    console.log('   • Essential for building reliable AI APIs');
    
    console.log('\n🏗️ Key Components:');
    console.log('   • Zod Schema: Defines the expected JSON structure');
    console.log('   • JsonOutputParser: Parses and validates LLM output');
    console.log('   • Format Instructions: Guide the LLM on output format');
    console.log('   • Error Handling: Manages parsing and validation failures');
    
    console.log('\n🎯 Common Use Cases:');
    console.log('   • API responses with consistent structure');
    console.log('   • Data extraction from unstructured text');
    console.log('   • Form generation and validation');
    console.log('   • User profile and business data generation');
    
    console.log('\n💡 Best Practices:');
    console.log('   • Use lower temperature for consistent output');
    console.log('   • Design schemas that match LLM natural output');
    console.log('   • Provide clear format instructions');
    console.log('   • Handle parsing errors gracefully');
    
    console.log('\n🔧 To run this demo with real AI:');
    console.log('   1. Set OPENAI_API_KEY in your .env file');
    console.log('   2. Restart the application');
    console.log('   3. Run this demo again');
}

// Execute the demo
basicStructuredOutputDemo().catch(console.error);
