import dotenv from 'dotenv';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

// Load environment variables
dotenv.config();

/**
 * OpenAI Integration Demo
 * 
 * This demo shows how to use prompt templates with OpenAI models for real responses.
 * It demonstrates different model configurations and response handling.
 */
async function openAIPromptTemplateDemo() {
    console.log('🚀 Executing OpenAI Integration Demo...');
    console.log('=' .repeat(60));

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        return;
    }

    console.log('✅ OpenAI API Key found - proceeding with demo');

    // Create different model configurations
    const models = {
        creative: new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.9,
            modelName: 'gpt-3.5-turbo',
            maxTokens: 200
        }),
        balanced: new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.7,
            modelName: 'gpt-3.5-turbo',
            maxTokens: 200
        }),
        precise: new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.1,
            modelName: 'gpt-3.5-turbo',
            maxTokens: 200
        })
    };

    console.log('🤖 Model configurations:');
    console.log('   • Creative (temp: 0.9) - for imaginative content');
    console.log('   • Balanced (temp: 0.7) - for general use');
    console.log('   • Precise (temp: 0.1) - for factual content');

    // Create prompt template
    const storyPrompt = PromptTemplate.fromTemplate(
        "Write a {length} {genre} story about {character}. The story should be {tone} and suitable for {audience}."
    );

    console.log('\n📝 Prompt Template:');
    console.log('   "Write a {length} {genre} story about {character}. The story should be {tone} and suitable for {audience}."');

    // Test parameters
    const storyParams = {
        length: "short",
        genre: "mystery",
        character: "a detective cat named Whiskers",
        tone: "humorous",
        audience: "children"
    };

    console.log('\n🎯 Story Parameters:');
    Object.entries(storyParams).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
    });

    // Test with different model configurations
    for (const [configName, model] of Object.entries(models)) {
        console.log(`\n${'='.repeat(40)}`);
        console.log(`🎭 Testing ${configName.toUpperCase()} model`);
        console.log(`${'='.repeat(40)}`);

        try {
            // Create chain with current model
            const chain = RunnableSequence.from([
                storyPrompt,
                model,
                new StringOutputParser()
            ]);

            console.log('🔄 Generating story...');
            const story = await chain.invoke(storyParams);
            
            console.log('📖 Generated Story:');
            console.log(`${story}`);
            
        } catch (error) {
            console.log(`❌ Error with ${configName} model:`, error.message);
        }
    }

    // Demonstrate different prompt types
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔧 Different Prompt Types Demo');
    console.log(`${'='.repeat(60)}`);

    const prompts = {
        creative: PromptTemplate.fromTemplate(
            "Create an imaginative {type} about {subject}. Be creative and original!"
        ),
        analytical: PromptTemplate.fromTemplate(
            "Analyze {subject} from a {perspective} perspective. Provide structured insights."
        ),
        instructional: PromptTemplate.fromTemplate(
            "Explain how to {action} step by step. Make it clear for {audience}."
        )
    };

    const testCases = [
        {
            promptType: 'creative',
            params: { type: 'poem', subject: 'artificial intelligence' }
        },
        {
            promptType: 'analytical',
            params: { subject: 'renewable energy', perspective: 'economic' }
        },
        {
            promptType: 'instructional',
            params: { action: 'set up a React development environment', audience: 'beginners' }
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n📋 ${testCase.promptType.toUpperCase()} Prompt:`);
        
        const prompt = prompts[testCase.promptType];
        const formattedPrompt = await prompt.format(testCase.params);
        console.log(`   ${formattedPrompt}`);

        try {
            const chain = RunnableSequence.from([
                prompt,
                models.balanced,
                new StringOutputParser()
            ]);

            console.log('🔄 Getting response...');
            const response = await chain.invoke(testCase.params);
            console.log('🤖 AI Response:');
            console.log(`${response.substring(0, 300)}${response.length > 300 ? '...' : ''}`);
            
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }

    // Advanced OpenAI features demo
    console.log(`\n${'='.repeat(60)}`);
    console.log('⚡ Advanced OpenAI Features');
    console.log(`${'='.repeat(60)}`);

    // Streaming example (conceptual - would need streaming setup)
    console.log('🌊 Streaming responses:');
    console.log('   • Real-time token generation');
    console.log('   • Better user experience for long responses');
    console.log('   • Reduced perceived latency');

    // Function calling example (conceptual)
    console.log('\n🔧 Function calling:');
    console.log('   • Structured tool usage');
    console.log('   • JSON schema validation');
    console.log('   • Deterministic function execution');

    console.log('\n✅ OpenAI Integration Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Temperature affects response creativity');
    console.log('   • Different prompts suit different tasks');
    console.log('   • Model configuration impacts output quality');
    console.log('   • Proper error handling is essential');
    console.log('   • OpenAI offers advanced features beyond basic completion');
}

// Execute the demo
openAIPromptTemplateDemo().catch(console.error);
