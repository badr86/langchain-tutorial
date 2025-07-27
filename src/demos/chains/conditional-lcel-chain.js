/**
 * Conditional LCEL Chain Demo
 * 
 * This demo demonstrates how to create dynamic chains that change behavior based on input conditions.
 * It shows how to build different prompt templates for different audience levels and chain them with LLMs.
 */

require('dotenv').config();
const { PromptTemplate } = require('@langchain/core/prompts');
const { ChatOpenAI } = require('@langchain/openai');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');

async function runDemo() {
    console.log('🚀 Executing Conditional LCEL Chain Demo...');
    console.log('=' .repeat(60));
    
    // Step 1: Define different templates for different audiences
    const createConditionalChain = (audience) => {
        const templates = {
            beginner: "Explain {topic} in simple terms with basic examples that a beginner can understand.",
            intermediate: "Provide a detailed explanation of {topic} with practical applications and some technical details.",
            expert: "Give an advanced analysis of {topic} including edge cases, optimizations, and implementation details."
        };
        
        const selectedTemplate = templates[audience] || templates.intermediate;
        console.log(`📝 Creating ${audience} chain with template:`, selectedTemplate);
        
        const prompt = PromptTemplate.fromTemplate(selectedTemplate);
        
        if (process.env.OPENAI_API_KEY) {
            const llm = new ChatOpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                temperature: 0.7,
                modelName: 'gpt-3.5-turbo',
            });
            
            // Create a chain: prompt -> llm -> output parser
            return RunnableSequence.from([
                prompt,
                llm,
                new StringOutputParser()
            ]);
        } else {
            // Return just the prompt for demonstration
            return prompt;
        }
    };
    
    // Step 2: Create chains for different audiences
    console.log('🔧 Creating conditional chains for different audiences...');
    
    const beginnerChain = createConditionalChain('beginner');
    const intermediateChain = createConditionalChain('intermediate');
    const expertChain = createConditionalChain('expert');
    
    const topic = "React hooks";
    console.log(`🎯 Topic: ${topic}`);
    
    // Step 3: Execute chains based on conditions
    if (process.env.OPENAI_API_KEY) {
        console.log('🔄 Executing beginner-level explanation...');
        try {
            const beginnerResult = await beginnerChain.invoke({ topic });
            console.log('👶 Beginner Response:');
            console.log('-'.repeat(40));
            console.log(beginnerResult);
            console.log('-'.repeat(40));
            
            console.log('🔄 Executing expert-level explanation...');
            const expertResult = await expertChain.invoke({ topic });
            console.log('🎓 Expert Response:');
            console.log('-'.repeat(40));
            console.log(expertResult);
            console.log('-'.repeat(40));
        } catch (error) {
            console.error('❌ Error executing chains:', error.message);
        }
    } else {
        console.log('⚠️  OpenAI API Key not found. Showing formatted prompts only.');
        
        const beginnerPrompt = await beginnerChain.invoke({ topic });
        const expertPrompt = await expertChain.invoke({ topic });
        
        console.log('👶 Beginner Prompt:', beginnerPrompt);
        console.log('🎓 Expert Prompt:', expertPrompt);
    }
    
    console.log('=' .repeat(60));
    console.log('✅ Conditional LCEL Chain Demo completed!');
    console.log('💡 This demo shows how to create dynamic chains that adapt to different contexts.');
}

// Execute the demo
runDemo().catch(console.error);
