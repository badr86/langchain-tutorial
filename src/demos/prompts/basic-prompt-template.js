/**
 * Basic Prompt Template Demo
 * 
 * This demo shows how to use LangChain's PromptTemplate for simple variable substitution.
 * It demonstrates creating a template with placeholders and formatting it with actual values.
 */

import dotenv from 'dotenv';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

// Configure dotenv
dotenv.config();

async function runDemo() {
    console.log('🚀 Executing Basic Prompt Template Demo...');
    console.log('=' .repeat(50));
    
    // Step 1: Create a prompt template with variables
    const template = "Tell me a {adjective} joke about {topic}.";
    const prompt = new PromptTemplate({
        template: template,
        inputVariables: ["adjective", "topic"],
    });
    
    console.log('📝 Template created:', template);
    console.log('🔧 Input variables:', prompt.inputVariables);
    
    // Step 2: Format the prompt with actual values
    const formattedPrompt = await prompt.format({
        adjective: "funny",
        topic: "programming"
    });
    
    console.log('✨ Formatted prompt:', formattedPrompt);
    
    // Step 3: Execute with LLM if API key is available
    if (process.env.OPENAI_API_KEY) {
        console.log('🔄 Sending to OpenAI...');
        
        const llm = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.7,
            modelName: 'gpt-3.5-turbo',
        });
        
        try {
            const response = await llm.invoke(formattedPrompt);
            console.log('🤖 AI Response:', response.content);
        } catch (error) {
            console.error('❌ Error calling OpenAI:', error.message);
        }
    } else {
        console.log('⚠️  OpenAI API Key not found. Set OPENAI_API_KEY in your .env file to see AI responses.');
        console.log('💡 The formatted prompt above is what would be sent to the LLM.');
    }
    
    console.log('=' .repeat(50));
    console.log('✅ Basic Prompt Template Demo completed!');
}

// Execute the demo
runDemo().catch(console.error);
