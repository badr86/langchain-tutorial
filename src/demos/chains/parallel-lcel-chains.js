/**
 * Parallel LCEL Chains Demo
 * 
 * This demo shows how to run multiple LangChain operations in parallel using RunnableMap.
 * It demonstrates executing different prompts simultaneously and collecting all results.
 */

require('dotenv').config();
const { PromptTemplate } = require('@langchain/core/prompts');
const { ChatOpenAI } = require('@langchain/openai');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableMap } = require('@langchain/core/runnables');

async function runDemo() {
    console.log('🚀 Executing Parallel LCEL Chains Demo...');
    console.log('=' .repeat(60));
    
    // Step 1: Create multiple prompt templates for different types of content
    const jokePrompt = PromptTemplate.fromTemplate(
        "Tell me a funny, clean joke about {topic}. Make it clever and programming-related."
    );
    
    const factPrompt = PromptTemplate.fromTemplate(
        "Give me an interesting and lesser-known fact about {topic}. Include some technical details."
    );
    
    const quotePrompt = PromptTemplate.fromTemplate(
        "Provide an inspirational quote related to {topic}. Make it motivational for developers."
    );
    
    const tipPrompt = PromptTemplate.fromTemplate(
        "Give me a practical tip or best practice related to {topic} that developers should know."
    );
    
    const topic = "programming";
    console.log(`🎯 Topic: ${topic}`);
    console.log('📝 Created 4 different prompt templates for parallel execution');
    
    // Step 2: Set up parallel execution
    if (process.env.OPENAI_API_KEY) {
        console.log('🔧 Setting up parallel chains with OpenAI...');
        
        const llm = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.7,
            modelName: 'gpt-3.5-turbo',
        });
        
        // Create parallel chains using RunnableMap
        const parallelChain = RunnableMap.from({
            joke: jokePrompt.pipe(llm).pipe(new StringOutputParser()),
            fact: factPrompt.pipe(llm).pipe(new StringOutputParser()),
            quote: quotePrompt.pipe(llm).pipe(new StringOutputParser()),
            tip: tipPrompt.pipe(llm).pipe(new StringOutputParser())
        });
        
        console.log('🔄 Running 4 chains in parallel...');
        console.log('⏱️  This should be faster than running them sequentially!');
        
        const startTime = Date.now();
        
        try {
            const results = await parallelChain.invoke({ topic });
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`⚡ Parallel execution completed in ${duration}ms`);
            console.log('=' .repeat(60));
            
            console.log('😂 JOKE:');
            console.log('-'.repeat(40));
            console.log(results.joke);
            console.log();
            
            console.log('💡 INTERESTING FACT:');
            console.log('-'.repeat(40));
            console.log(results.fact);
            console.log();
            
            console.log('✨ INSPIRATIONAL QUOTE:');
            console.log('-'.repeat(40));
            console.log(results.quote);
            console.log();
            
            console.log('🎯 PRACTICAL TIP:');
            console.log('-'.repeat(40));
            console.log(results.tip);
            
        } catch (error) {
            console.error('❌ Error executing parallel chains:', error.message);
        }
        
    } else {
        console.log('⚠️  OpenAI API Key not found. Showing formatted prompts only.');
        
        const jokeFormatted = await jokePrompt.format({ topic });
        const factFormatted = await factPrompt.format({ topic });
        const quoteFormatted = await quotePrompt.format({ topic });
        const tipFormatted = await tipPrompt.format({ topic });
        
        console.log('😂 Joke Prompt:', jokeFormatted);
        console.log('💡 Fact Prompt:', factFormatted);
        console.log('✨ Quote Prompt:', quoteFormatted);
        console.log('🎯 Tip Prompt:', tipFormatted);
    }
    
    console.log('=' .repeat(60));
    console.log('✅ Parallel LCEL Chains Demo completed!');
    console.log('💡 This demo shows how RunnableMap enables efficient parallel execution.');
}

// Execute the demo
runDemo().catch(console.error);
