import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnableMap } from '@langchain/core/runnables';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Complex LCEL Chain Demo
 * 
 * This demo shows multi-step LCEL chains with RunnableSequence and RunnableMap.
 * It demonstrates advanced composition patterns for complex workflows.
 */
async function complexLCELChainDemo() {
    console.log('🚀 Executing Complex LCEL Chain Demo...');
    console.log('=' .repeat(60));

    console.log('🔗 Complex LCEL Chain Features:');
    console.log('   • Multi-step processing with RunnableSequence');
    console.log('   • Parallel execution with RunnableMap');
    console.log('   • Data transformation between steps');
    console.log('   • Advanced composition patterns');

    // Initialize the model
    const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo'
    });

    console.log('\n🤖 Model Configuration:');
    console.log('   • Model: gpt-3.5-turbo');
    console.log('   • Temperature: 0.7');
    console.log('   • API Key:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing');

    // Create a complex multi-step chain
    console.log('\n🏗️ Building Complex Multi-Step Chain:');
    console.log('   Step 1: Generate poem about topic');
    console.log('   Step 2: Translate poem to target language');
    console.log('   Step 3: Analyze the translated poem');

    const complexChain = RunnableSequence.from([
        // Step 1: Input processing and poem generation
        {
            topic: (input) => input.topic,
            language: (input) => input.language,
        },
        {
            topic: (input) => input.topic,
            language: (input) => input.language,
            poem: RunnableSequence.from([
                ChatPromptTemplate.fromTemplate(
                    "Write a short, beautiful poem about {topic}. Make it creative and inspiring."
                ),
                model,
                new StringOutputParser(),
            ]),
        },
        // Step 2: Translation
        {
            topic: (input) => input.topic,
            language: (input) => input.language,
            originalPoem: (input) => input.poem,
            translatedPoem: RunnableSequence.from([
                ChatPromptTemplate.fromTemplate(
                    "Translate this poem to {language}, maintaining its poetic beauty and meaning:\n\n{poem}"
                ),
                model,
                new StringOutputParser(),
            ]),
        },
        // Step 3: Analysis
        {
            result: RunnableSequence.from([
                ChatPromptTemplate.fromTemplate(
                    `Analyze this poetry translation:

Original Topic: {topic}
Target Language: {language}
Original Poem: {originalPoem}
Translated Poem: {translatedPoem}

Provide analysis of:
1. Translation quality
2. Poetic elements preserved
3. Cultural adaptation
4. Overall effectiveness`
                ),
                model,
                new StringOutputParser(),
            ]),
            metadata: (input) => ({
                topic: input.topic,
                language: input.language,
                processingSteps: 3,
                timestamp: new Date().toISOString()
            })
        },
    ]);

    // Test the complex chain
    const testInputs = [
        { topic: "artificial intelligence", language: "Spanish" },
        { topic: "ocean waves", language: "French" },
        { topic: "mountain sunrise", language: "Italian" }
    ];

    for (const input of testInputs) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🎨 Processing: ${input.topic} → ${input.language}`);
        console.log(`${'='.repeat(50)}`);

        if (process.env.OPENAI_API_KEY) {
            try {
                console.log('🔄 Executing complex chain...');
                console.log('   ⏳ Step 1: Generating poem...');
                console.log('   ⏳ Step 2: Translating poem...');
                console.log('   ⏳ Step 3: Analyzing translation...');

                const result = await complexChain.invoke(input);
                
                console.log('✅ Complex chain completed!');
                console.log('\n📊 Results:');
                console.log('🎭 Analysis:', result.result.substring(0, 300) + '...');
                console.log('📋 Metadata:', JSON.stringify(result.metadata, null, 2));
                
            } catch (error) {
                console.log('❌ Error in complex chain:', error.message);
            }
        } else {
            console.log('⚠️  OpenAI API Key not found. Showing chain structure only.');
        }
    }

    // Demonstrate parallel processing with RunnableMap
    console.log(`\n${'='.repeat(60)}`);
    console.log('⚡ Parallel Processing with RunnableMap');
    console.log(`${'='.repeat(60)}`);

    const parallelAnalysisChain = RunnableSequence.from([
        // Parallel analysis of the same topic
        RunnableMap.from({
            summary: RunnableSequence.from([
                ChatPromptTemplate.fromTemplate("Provide a 2-sentence summary of: {topic}"),
                model,
                new StringOutputParser(),
            ]),
            pros_cons: RunnableSequence.from([
                ChatPromptTemplate.fromTemplate("List 3 pros and 3 cons of: {topic}"),
                model,
                new StringOutputParser(),
            ]),
            questions: RunnableSequence.from([
                ChatPromptTemplate.fromTemplate("Generate 3 thoughtful questions about: {topic}"),
                model,
                new StringOutputParser(),
            ]),
            keywords: RunnableSequence.from([
                ChatPromptTemplate.fromTemplate("Extract 5 key terms related to: {topic}"),
                model,
                new StringOutputParser(),
            ]),
        }),
        // Combine results
        (results) => ({
            topic: "Renewable Energy",
            analysis: {
                summary: results.summary,
                pros_cons: results.pros_cons,
                questions: results.questions,
                keywords: results.keywords,
            },
            generated_at: new Date().toISOString(),
        }),
    ]);

    if (process.env.OPENAI_API_KEY) {
        console.log('\n🔄 Testing parallel analysis chain...');
        try {
            const parallelResult = await parallelAnalysisChain.invoke({ 
                topic: "renewable energy technologies" 
            });
            
            console.log('✅ Parallel analysis completed!');
            console.log('\n📊 Comprehensive Analysis Results:');
            console.log('📝 Summary:', parallelResult.analysis.summary);
            console.log('⚖️ Pros/Cons:', parallelResult.analysis.pros_cons.substring(0, 200) + '...');
            console.log('❓ Questions:', parallelResult.analysis.questions.substring(0, 200) + '...');
            console.log('🏷️ Keywords:', parallelResult.analysis.keywords);
            
        } catch (error) {
            console.log('❌ Error in parallel chain:', error.message);
        }
    }

    // Advanced pattern: Conditional branching
    console.log(`\n${'='.repeat(60)}`);
    console.log('🌿 Advanced Pattern: Conditional Branching');
    console.log(`${'='.repeat(60)}`);

    console.log('🔀 Conditional Chain Logic:');
    console.log('   • Different processing paths based on input');
    console.log('   • Dynamic chain selection');
    console.log('   • Context-aware responses');

    const conditionalChain = RunnableSequence.from([
        // Determine processing path
        (input) => ({
            ...input,
            processingType: input.complexity === 'high' ? 'detailed' : 'simple'
        }),
        // Branch based on complexity
        (input) => {
            if (input.processingType === 'detailed') {
                return RunnableSequence.from([
                    ChatPromptTemplate.fromTemplate(
                        "Provide a comprehensive, technical analysis of {topic} including implementation details, challenges, and future prospects."
                    ),
                    model,
                    new StringOutputParser(),
                ]).invoke(input);
            } else {
                return RunnableSequence.from([
                    ChatPromptTemplate.fromTemplate(
                        "Explain {topic} in simple, easy-to-understand terms."
                    ),
                    model,
                    new StringOutputParser(),
                ]).invoke(input);
            }
        }
    ]);

    console.log('\n🧪 Testing conditional branching:');
    const conditionalTests = [
        { topic: "quantum computing", complexity: "high" },
        { topic: "quantum computing", complexity: "low" }
    ];

    for (const test of conditionalTests) {
        console.log(`\n📋 Input: ${test.topic} (complexity: ${test.complexity})`);
        if (process.env.OPENAI_API_KEY) {
            try {
                const result = await conditionalChain.invoke(test);
                console.log(`✅ ${test.complexity === 'high' ? 'Detailed' : 'Simple'} response generated`);
                console.log(`📝 Response preview: ${result.substring(0, 150)}...`);
            } catch (error) {
                console.log('❌ Error:', error.message);
            }
        }
    }

    console.log('\n✅ Complex LCEL Chain Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • RunnableSequence enables multi-step processing');
    console.log('   • RunnableMap allows parallel execution');
    console.log('   • Complex data transformations between steps');
    console.log('   • Conditional logic for dynamic processing');
    console.log('   • Powerful composition patterns for sophisticated workflows');
}

// Execute the demo
complexLCELChainDemo().catch(console.error);
