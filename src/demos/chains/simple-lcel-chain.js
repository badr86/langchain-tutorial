import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Simple LCEL Chain Demo
 * 
 * This demo shows modern LangChain Expression Language (LCEL) with pipe operators.
 * LCEL provides a declarative way to compose LangChain components.
 */
async function simpleLCELChainDemo() {
    console.log('🚀 Executing Simple LCEL Chain Demo...');
    console.log('=' .repeat(60));

    console.log('🔗 LangChain Expression Language (LCEL) Overview:');
    console.log('   • Modern declarative syntax for building chains');
    console.log('   • Uses pipe operators for component composition');
    console.log('   • Supports streaming, async, and batch operations');
    console.log('   • Better error handling and debugging');

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

    // Create a simple translation prompt
    const translationPrompt = ChatPromptTemplate.fromTemplate(
        "Translate the following text to {target_language}: {text}"
    );

    console.log('\n📝 Translation Prompt Template:');
    console.log('   "Translate the following text to {target_language}: {text}"');

    // LCEL Chain using pipe operator - this is the key feature!
    console.log('\n🔗 Building LCEL Chain with pipe operators:');
    console.log('   chain = prompt.pipe(model).pipe(outputParser)');
    
    const translationChain = translationPrompt.pipe(model).pipe(new StringOutputParser());

    // Test translations
    const translations = [
        {
            text: "Hello, how are you today?",
            target_language: "Spanish",
            expected: "Hola, ¿cómo estás hoy?"
        },
        {
            text: "The weather is beautiful today.",
            target_language: "French",
            expected: "Le temps est magnifique aujourd'hui."
        },
        {
            text: "I love programming with LangChain.",
            target_language: "German",
            expected: "Ich liebe es, mit LangChain zu programmieren."
        }
    ];

    for (const translation of translations) {
        console.log(`\n${'='.repeat(40)}`);
        console.log(`🌍 Translation: English → ${translation.target_language}`);
        console.log(`${'='.repeat(40)}`);
        
        console.log('📝 Input text:', `"${translation.text}"`);
        console.log('🎯 Target language:', translation.target_language);

        if (process.env.OPENAI_API_KEY) {
            try {
                console.log('🔄 Executing LCEL chain...');
                
                const result = await translationChain.invoke({
                    text: translation.text,
                    target_language: translation.target_language
                });

                console.log('✅ Translation result:', `"${result}"`);
                console.log('💡 Expected:', `"${translation.expected}"`);
                
            } catch (error) {
                console.log('❌ Translation error:', error.message);
            }
        } else {
            console.log('⚠️  OpenAI API Key not found. Showing formatted prompt only.');
            const formattedPrompt = await translationPrompt.format({
                text: translation.text,
                target_language: translation.target_language
            });
            console.log('📋 Formatted prompt:', `"${formattedPrompt}"`);
        }
    }

    // Demonstrate different LCEL patterns
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎨 Different LCEL Patterns');
    console.log(`${'='.repeat(60)}`);

    // Pattern 1: Simple linear chain
    console.log('\n1️⃣ Simple Linear Chain:');
    console.log('   prompt.pipe(model).pipe(parser)');
    
    const simpleChain = ChatPromptTemplate.fromTemplate("Explain {concept} in one sentence.")
        .pipe(model)
        .pipe(new StringOutputParser());

    // Pattern 2: Multiple output parsers
    console.log('\n2️⃣ Chain with Custom Processing:');
    console.log('   prompt.pipe(model).pipe(customParser)');

    const customOutputParser = {
        parse: (text) => {
            return {
                response: text,
                wordCount: text.split(' ').length,
                timestamp: new Date().toISOString()
            };
        }
    };

    // Pattern 3: Conditional chain (conceptual)
    console.log('\n3️⃣ Conditional Chain Logic:');
    console.log('   Different chains based on input conditions');

    // Test simple concept explanation
    if (process.env.OPENAI_API_KEY) {
        console.log('\n🧠 Testing concept explanation:');
        try {
            const concept = "machine learning";
            console.log(`📚 Concept: ${concept}`);
            
            const explanation = await simpleChain.invoke({ concept });
            console.log('💡 Explanation:', explanation);
            
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }

    // LCEL Benefits demonstration
    console.log(`\n${'='.repeat(60)}`);
    console.log('⚡ LCEL Benefits');
    console.log(`${'='.repeat(60)}`);

    console.log('🚀 Performance Benefits:');
    console.log('   • Streaming support out of the box');
    console.log('   • Automatic parallelization where possible');
    console.log('   • Optimized execution paths');

    console.log('\n🛠️ Developer Experience:');
    console.log('   • Intuitive pipe syntax');
    console.log('   • Better error messages');
    console.log('   • Built-in debugging tools');

    console.log('\n🔧 Operational Benefits:');
    console.log('   • Automatic retries and fallbacks');
    console.log('   • Built-in observability');
    console.log('   • Easy testing and validation');

    console.log('\n✅ Simple LCEL Chain Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • LCEL uses pipe operators for clean composition');
    console.log('   • Chains are built declaratively, not imperatively');
    console.log('   • Better performance and developer experience');
    console.log('   • Modern replacement for traditional LangChain patterns');
}

// Execute the demo
simpleLCELChainDemo().catch(console.error);
