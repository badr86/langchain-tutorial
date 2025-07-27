/**
 * Basic LLM Chain Demo
 * 
 * This demo shows the traditional LangChain LLMChain usage with OpenAI.
 * It demonstrates how to combine a prompt template with an LLM in a chain
 * for structured text generation.
 */

import dotenv from 'dotenv';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { LLMChain } from 'langchain/chains';

// Configure dotenv
dotenv.config();

async function runDemo() {
    console.log('🚀 Executing Basic LLM Chain Demo...');
    console.log('=' .repeat(50));
    
    // Step 1: Create a prompt template
    const prompt = new PromptTemplate({
        template: "Write a {length} {style} story about {topic}.",
        inputVariables: ["length", "style", "topic"],
    });
    
    console.log('📝 Prompt template created');
    console.log('🔧 Template:', prompt.template);
    
    if (process.env.OPENAI_API_KEY) {
        // Step 2: Initialize the LLM
        const model = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.7,
            modelName: 'gpt-3.5-turbo',
        });
        
        console.log('🤖 ChatOpenAI model initialized');
        
        // Step 3: Create the LLM Chain
        const chain = new LLMChain({
            llm: model,
            prompt: prompt,
        });
        
        console.log('⛓️  LLM Chain created');
        
        // Step 4: Execute the chain
        console.log('🔄 Executing chain with story parameters...');
        
        try {
            const result = await chain.call({
                topic: "a time-traveling cat",
                style: "humorous",
                length: "short"
            });
            
            console.log('✨ Generated Story:');
            console.log('=' .repeat(50));
            console.log(result.text);
            console.log('=' .repeat(50));
            
        } catch (error) {
            console.error('❌ Error executing chain:', error.message);
        }
    } else {
        console.log('⚠️  OpenAI API Key not found. Set OPENAI_API_KEY in your .env file.');
        
        // Show what the formatted prompt would look like
        const formattedPrompt = await prompt.format({
            topic: "a time-traveling cat",
            style: "humorous", 
            length: "short"
        });
        
        console.log('💡 Formatted prompt that would be sent to LLM:');
        console.log('-'.repeat(30));
        console.log(formattedPrompt);
        console.log('-'.repeat(30));
    }
    
    console.log('✅ Basic LLM Chain Demo completed!');
    console.log('💡 LLM Chains combine prompts and models for structured generation.');
}

// Execute the demo
runDemo().catch(console.error);
