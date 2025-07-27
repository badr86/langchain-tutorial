/**
 * Complex Prompt Template Demo
 * 
 * This demo demonstrates advanced prompt templating with multiple variables,
 * detailed instructions, and structured output formatting. It shows how to
 * create sophisticated prompts for complex tasks.
 */

import dotenv from 'dotenv';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

// Configure dotenv
dotenv.config();

async function runDemo() {
    console.log('🚀 Executing Complex Prompt Template Demo...');
    console.log('=' .repeat(60));
    
    // Step 1: Create a complex multi-variable prompt template
    const complexTemplate = `You are an expert {role} with {experience} years of experience.

Task: {task}

Context:
{context}

Instructions:
1. Analyze the given information thoroughly
2. Provide a detailed response with specific examples
3. Include both advantages and potential challenges
4. Conclude with actionable recommendations
5. Format your response professionally

Additional Requirements:
- Target audience: {audience}
- Response length: {length}
- Include relevant {domain} terminology

Response:`;

    const prompt = new PromptTemplate({
        template: complexTemplate,
        inputVariables: ["role", "experience", "task", "context", "audience", "length", "domain"],
    });
    
    console.log('📝 Complex prompt template created with 7 variables');
    console.log('🔧 Input variables:', prompt.inputVariables);
    
    // Step 2: Format the prompt with comprehensive data
    const promptData = {
        role: "Software Architect",
        experience: "15",
        task: "Design a scalable microservices architecture for an e-commerce platform",
        context: "The company is transitioning from a monolithic architecture to microservices. They handle 100K+ daily transactions, have a team of 20 developers, and need to support multiple regions. Current pain points include slow deployment cycles, difficulty scaling individual components, and tight coupling between modules.",
        audience: "Technical leadership and senior developers",
        length: "comprehensive analysis (500-800 words)",
        domain: "cloud computing and distributed systems"
    };
    
    const formattedPrompt = await prompt.format(promptData);
    
    console.log('✨ Formatted complex prompt:');
    console.log('-'.repeat(60));
    console.log(formattedPrompt);
    console.log('-'.repeat(60));
    
    // Step 3: Execute with LLM if API key is available
    if (process.env.OPENAI_API_KEY) {
        console.log('🔄 Sending complex prompt to OpenAI...');
        
        const llm = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.7,
            modelName: 'gpt-3.5-turbo',
        });
        
        try {
            const response = await llm.invoke(formattedPrompt);
            console.log('🤖 Expert Analysis Response:');
            console.log('='.repeat(60));
            console.log(response.content);
            console.log('='.repeat(60));
            
        } catch (error) {
            console.error('❌ Error calling OpenAI:', error.message);
        }
    } else {
        console.log('⚠️  OpenAI API Key not found. Set OPENAI_API_KEY in your .env file to see AI responses.');
        console.log('💡 The formatted prompt above would generate a comprehensive expert analysis.');
    }
    
    console.log('✅ Complex Prompt Template Demo completed!');
    console.log('💡 Complex prompts enable sophisticated, structured AI interactions.');
    console.log('🎯 Key benefits: detailed context, clear instructions, professional formatting.');
}

// Execute the demo
runDemo().catch(console.error);
