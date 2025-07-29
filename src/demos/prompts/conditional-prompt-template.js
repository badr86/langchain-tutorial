import dotenv from 'dotenv';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

// Load environment variables
dotenv.config();

// Helper function to create LLM instance
const createLLM = () => {
    return new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo'
    });
};

/**
 * Conditional Prompt Template Demo
 * 
 * This demo shows how to create dynamic prompts that change based on input conditions.
 * Different prompt templates are selected based on the target audience or context.
 */
async function conditionalPromptTemplateDemo() {
    /*console.log('🚀 Executing Conditional Prompt Template Demo...');
    console.log('=' .repeat(60));

    // Create conditional prompt factory
    const createConditionalPrompt = (audience) => {
        const templates = {
            beginner: "Explain {topic} in simple terms with basic examples that a beginner can understand. Use analogies and avoid technical jargon.",
            intermediate: "Provide a detailed explanation of {topic} with practical applications and some technical details.",
            expert: "Give an advanced analysis of {topic} including edge cases, optimizations, and technical implementation details."
        };
        
        const selectedTemplate = templates[audience] || templates.intermediate;
        console.log(`📝 Selected template for ${audience} audience:`);
        console.log(`   "${selectedTemplate}"`);
        
        return PromptTemplate.fromTemplate(selectedTemplate);
    };

    // Demo with different audiences
    const audiences = ['beginner', 'intermediate', 'expert'];
    const topic = "machine learning algorithms";

    console.log(`\n🎯 Topic: "${topic}"`);
    console.log(`👥 Testing with audiences: ${audiences.join(', ')}`);

    for (const audience of audiences) {
        console.log(`\n${'='.repeat(40)}`);
        console.log(`👤 Audience: ${audience.toUpperCase()}`);
        console.log(`${'='.repeat(40)}`);

        const prompt = createConditionalPrompt(audience);
        
        // Format the prompt
        const formattedPrompt = await prompt.format({ topic });
        console.log('📋 Formatted Prompt:');
        console.log(`   ${formattedPrompt}`);

        // If OpenAI API key is available, get LLM response
        if (process.env.OPENAI_API_KEY) {
            try {
                console.log('🔄 Getting LLM response...');
                const llm = createLLM();
                
                // Create a chain for this audience
                const chain = RunnableSequence.from([
                    prompt,
                    llm,
                    new StringOutputParser()
                ]);

                const response = await chain.invoke({ topic });
                console.log('🤖 AI Response:');
                console.log(`   ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`);
                
            } catch (error) {
                console.log('❌ Error getting LLM response:', error.message);
            }
        } else {
            console.log('⚠️  OpenAI API Key not found. Showing formatted prompt only.');
        }
    }
*/
    // Advanced conditional logic example
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔧 Advanced Conditional Logic Example');
    console.log(`${'='.repeat(60)}`);

    const createAdvancedConditionalPrompt = (context) => {
        const { audience, domain, complexity, includeExamples } = context;
        
        let template = `You are explaining {topic} to a ${audience} audience`;
        
        if (domain) {
            template += ` in the context of ${domain}`;
        }
        
        if (complexity === 'high') {
            template += '. Provide detailed technical analysis';
        } else if (complexity === 'low') {
            template += '. Keep explanations simple and accessible';
        }
        
        if (includeExamples) {
            template += '. Include practical examples and use cases';
        }
        
        template += '. Your explanation:';
        
        return PromptTemplate.fromTemplate(template);
    };

    // Test advanced conditional prompt
    const advancedContext = {
        audience: 'software developer',
        domain: 'web development',
        complexity: 'high',
        includeExamples: true
    };

    console.log('🎛️  Advanced context:', JSON.stringify(advancedContext, null, 2));
    
    const advancedPrompt = createAdvancedConditionalPrompt(advancedContext);
    const advancedFormatted = await advancedPrompt.format({ topic: 'React hooks' });
    
    console.log('📋 Advanced Formatted Prompt:');
    console.log(`   ${advancedFormatted}`);
    
    // Execute the advanced prompt with LLM if API key is available
    if (process.env.OPENAI_API_KEY) {
        console.log('🔄 Getting LLM response for advanced prompt...');
        try {
            const llm = new ChatOpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                temperature: 0.7,
                modelName: 'gpt-3.5-turbo',
            });
            
            const chain = advancedPrompt.pipe(llm);
            const advancedResponse = await chain.invoke({ topic: 'React hooks' });
            
            console.log('🤖 Advanced AI Response:');
            console.log(`   ${advancedResponse.content}`);
        } catch (error) {
            console.log('❌ Error getting LLM response:', error.message);
        }
    } else {
        console.log('⚠️  OpenAI API Key not found. Skipping LLM invocation for advanced example.');
    }

    console.log('\n✅ Conditional Prompt Template Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Prompts can be dynamically selected based on conditions');
    console.log('   • Different audiences require different explanation styles');
    console.log('   • Complex conditional logic can create highly targeted prompts');
    console.log('   • This enables personalized AI interactions');
}

// Execute the demo
conditionalPromptTemplateDemo().catch(console.error);
