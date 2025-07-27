/**
 * Chat Prompt Template Demo
 * 
 * This demo shows how to use ChatPromptTemplate for structured conversation prompts
 * with system and human messages. It demonstrates the difference between regular
 * prompts and chat-based prompts for conversational AI.
 */

import dotenv from 'dotenv';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

// Configure dotenv
dotenv.config();

async function runDemo() {
    console.log('🚀 Executing Chat Prompt Template Demo...');
    console.log('=' .repeat(60));
    
    // Step 1: Create a chat prompt template with system and human messages
    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant that translates {input_language} to {output_language}. Provide accurate translations and explain any cultural context when relevant."],
        ["human", "{text}"]
    ]);
    
    console.log('📝 Chat prompt template created with system and human messages');
    console.log('🔧 Input variables:', chatPrompt.inputVariables);
    
    // Step 2: Format the chat prompt with actual values
    const formattedMessages = await chatPrompt.formatMessages({
        input_language: "English",
        output_language: "French",
        text: "I love programming and creating innovative solutions."
    });
    
    console.log('✨ Formatted chat messages:');
    formattedMessages.forEach((message, index) => {
        console.log(`   ${index + 1}. ${message._getType()}: ${message.content}`);
    });
    
    // Step 3: Execute with ChatOpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
        console.log('🔄 Sending to ChatOpenAI...');
        
        const llm = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.7,
            modelName: 'gpt-3.5-turbo',
        });
        
        try {
            const response = await llm.invoke(formattedMessages);
            console.log('🤖 AI Translation Response:');
            console.log('-'.repeat(40));
            console.log(response.content);
            console.log('-'.repeat(40));
            
            // Demonstrate with another example
            console.log('🔄 Trying another translation example...');
            const secondMessages = await chatPrompt.formatMessages({
                input_language: "Spanish",
                output_language: "English",
                text: "Me encanta la inteligencia artificial y el aprendizaje automático."
            });
            
            const secondResponse = await llm.invoke(secondMessages);
            console.log('🤖 Second Translation Response:');
            console.log('-'.repeat(40));
            console.log(secondResponse.content);
            console.log('-'.repeat(40));
            
        } catch (error) {
            console.error('❌ Error calling ChatOpenAI:', error.message);
        }
    } else {
        console.log('⚠️  OpenAI API Key not found. Set OPENAI_API_KEY in your .env file to see AI responses.');
        console.log('💡 The formatted messages above would be sent to the chat model.');
    }
    
    console.log('=' .repeat(60));
    console.log('✅ Chat Prompt Template Demo completed!');
    console.log('💡 Chat prompts enable structured conversations with system context.');
}

// Execute the demo
runDemo().catch(console.error);
