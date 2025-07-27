/**
 * Few-Shot Prompt Template Demo
 * 
 * This demo demonstrates few-shot learning with LangChain's FewShotPromptTemplate.
 * It shows how to provide examples to guide the AI's responses and improve accuracy
 * for specific tasks through pattern recognition.
 */

import dotenv from 'dotenv';
import { PromptTemplate, FewShotPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

// Configure dotenv
dotenv.config();

async function runDemo() {
    console.log('🚀 Executing Few-Shot Prompt Template Demo...');
    console.log('=' .repeat(60));
    
    // Step 1: Define examples for few-shot learning
    const examples = [
        { input: "happy", output: "sad" },
        { input: "tall", output: "short" },
        { input: "fast", output: "slow" },
        { input: "bright", output: "dark" },
        { input: "hot", output: "cold" }
    ];
    
    console.log('📚 Created examples for antonym generation:');
    examples.forEach((example, index) => {
        console.log(`   ${index + 1}. ${example.input} → ${example.output}`);
    });
    
    // Step 2: Create the example prompt template
    const examplePrompt = PromptTemplate.fromTemplate(
        "Input: {input}\nOutput: {output}"
    );
    
    console.log('📝 Example prompt template created');
    
    // Step 3: Create the few-shot prompt template
    const fewShotPrompt = new FewShotPromptTemplate({
        examples: examples,
        examplePrompt: examplePrompt,
        prefix: "Give the antonym (opposite) of the following words. Follow the pattern shown in the examples:",
        suffix: "Input: {adjective}\nOutput:",
        inputVariables: ["adjective"],
    });
    
    console.log('🎯 Few-shot prompt template created with prefix, examples, and suffix');
    
    // Step 4: Test with different words
    const testWords = ["beautiful", "strong", "quiet", "expensive"];
    
    for (const word of testWords) {
        console.log(`\n🔄 Testing with word: "${word}"`);
        
        const formattedPrompt = await fewShotPrompt.format({ adjective: word });
        
        console.log('✨ Formatted few-shot prompt:');
        console.log('-'.repeat(40));
        console.log(formattedPrompt);
        console.log('-'.repeat(40));
        
        if (process.env.OPENAI_API_KEY) {
            const llm = new ChatOpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                temperature: 0.3, // Lower temperature for more consistent results
                modelName: 'gpt-3.5-turbo',
            });
            
            try {
                const response = await llm.invoke(formattedPrompt);
                console.log(`🤖 AI Antonym: ${response.content.trim()}`);
            } catch (error) {
                console.error('❌ Error calling OpenAI:', error.message);
            }
        } else {
            console.log('⚠️  OpenAI API Key not found - showing prompt only');
        }
    }
    
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n💡 Set OPENAI_API_KEY in your .env file to see AI-generated antonyms.');
        console.log('🎯 Few-shot learning helps AI understand patterns from examples.');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Few-Shot Prompt Template Demo completed!');
    console.log('💡 Few-shot prompts improve AI accuracy through example-based learning.');
    console.log('🎯 Perfect for tasks requiring consistent patterns or specific formats.');
}

// Execute the demo
runDemo().catch(console.error);
