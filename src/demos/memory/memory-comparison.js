import { BufferMemory } from 'langchain/memory';
import { BufferWindowMemory } from 'langchain/memory';
import { ConversationSummaryMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Memory Types Comparison Demo
 * 
 * This demo compares different memory types and their use cases.
 * It provides guidance on choosing the right memory type for your application.
 */
async function memoryComparisonDemo() {
    console.log('🚀 Executing Memory Types Comparison Demo...');
    console.log('=' .repeat(60));

    console.log('🧠 Memory Types Overview:');
    console.log('   • BufferMemory: Complete conversation history');
    console.log('   • BufferWindowMemory: Last K interactions only');
    console.log('   • ConversationSummaryMemory: Intelligent summarization');
    console.log('   • Custom Memory: Tailored to specific needs');

    // Initialize the model (needed for summary memory)
    const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo'
    });

    console.log('\n🤖 Model Configuration:');
    console.log('   • Model: gpt-3.5-turbo');
    console.log('   • Temperature: 0.7');
    console.log('   • API Key:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing');

    // Create different memory types for comparison
    const bufferMemory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
    });

    const windowMemory = new BufferWindowMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        k: 2, // Keep only last 2 message pairs
    });

    let summaryMemory = null;
    if (process.env.OPENAI_API_KEY) {
        summaryMemory = new ConversationSummaryMemory({
            memoryKey: "chat_history",
            llm: model,
            returnMessages: true,
        });
    }

    console.log('\n💾 Memory Instances Created:');
    console.log('   • Buffer Memory: ✅ Ready');
    console.log('   • Window Memory: ✅ Ready (k=2)');
    console.log(`   • Summary Memory: ${summaryMemory ? '✅ Ready' : '❌ Requires API Key'}`);

    // Test conversation for comparison
    const testConversation = [
        { input: "My name is Alice", output: "Nice to meet you, Alice!" },
        { input: "I work as a software engineer", output: "That's a great profession! What technologies do you work with?" },
        { input: "I mainly use Python and JavaScript", output: "Excellent choices! Both are very popular and versatile languages." },
        { input: "I'm working on a web application", output: "Sounds interesting! What kind of web application are you building?" },
        { input: "It's an e-commerce platform", output: "E-commerce is a great field! Are you using any specific frameworks?" },
        { input: "Yes, I'm using React for frontend", output: "React is an excellent choice for e-commerce applications!" }
    ];

    console.log('\n🧪 Testing Memory Types with Sample Conversation...');
    console.log(`📝 Conversation length: ${testConversation.length} exchanges`);

    // Add conversation to all memory types
    for (const exchange of testConversation) {
        // Add to buffer memory
        await bufferMemory.saveContext(
            { input: exchange.input },
            { output: exchange.output }
        );

        // Add to window memory
        await windowMemory.saveContext(
            { input: exchange.input },
            { output: exchange.output }
        );

        // Add to summary memory if available
        if (summaryMemory) {
            await summaryMemory.saveContext(
                { input: exchange.input },
                { output: exchange.output }
            );
        }
    }

    // Compare memory contents
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Memory Comparison Results');
    console.log(`${'='.repeat(60)}`);

    // Buffer Memory Analysis
    console.log('\n🗄️ BUFFER MEMORY:');
    const bufferVars = await bufferMemory.loadMemoryVariables({});
    const bufferMessages = bufferVars.chat_history;
    console.log(`   Messages stored: ${bufferMessages.length}`);
    console.log(`   Memory size: ${JSON.stringify(bufferMessages).length} characters`);
    console.log('   Content preview:');
    bufferMessages.slice(0, 4).forEach((msg, i) => {
        const role = msg._getType() === 'human' ? '👤' : '🤖';
        console.log(`     ${i + 1}. ${role} ${msg.content.substring(0, 50)}...`);
    });
    if (bufferMessages.length > 4) {
        console.log(`     ... and ${bufferMessages.length - 4} more messages`);
    }

    // Window Memory Analysis
    console.log('\n🪟 WINDOW MEMORY (k=2):');
    const windowVars = await windowMemory.loadMemoryVariables({});
    const windowMessages = windowVars.chat_history;
    console.log(`   Messages stored: ${windowMessages.length}`);
    console.log(`   Memory size: ${JSON.stringify(windowMessages).length} characters`);
    console.log('   Content (last 2 pairs only):');
    windowMessages.forEach((msg, i) => {
        const role = msg._getType() === 'human' ? '👤' : '🤖';
        console.log(`     ${i + 1}. ${role} ${msg.content.substring(0, 50)}...`);
    });

    // Summary Memory Analysis
    if (summaryMemory) {
        console.log('\n📝 SUMMARY MEMORY:');
        try {
            const summaryVars = await summaryMemory.loadMemoryVariables({});
            const summaryContent = summaryVars.chat_history;
            console.log(`   Summary length: ${summaryContent.length} characters`);
            console.log('   Summary content:');
            console.log(`     ${summaryContent.substring(0, 200)}...`);
        } catch (error) {
            console.log('   ❌ Error loading summary:', error.message);
        }
    } else {
        console.log('\n📝 SUMMARY MEMORY:');
        console.log('   ❌ Not available (requires OpenAI API key)');
        console.log('   Would contain: Intelligent summary of key conversation points');
    }

    // Performance Comparison
    console.log(`\n${'='.repeat(60)}`);
    console.log('⚡ Performance Comparison');
    console.log(`${'='.repeat(60)}`);

    const bufferSize = JSON.stringify(bufferVars.chat_history).length;
    const windowSize = JSON.stringify(windowVars.chat_history).length;
    
    console.log('📏 Memory Usage:');
    console.log(`   Buffer Memory: ${bufferSize} characters (100%)`);
    console.log(`   Window Memory: ${windowSize} characters (${Math.round(windowSize/bufferSize*100)}%)`);
    if (summaryMemory) {
        console.log(`   Summary Memory: ~${Math.round(bufferSize * 0.3)} characters (estimated 30%)`);
    }

    console.log('\n🚀 Processing Speed:');
    console.log('   Buffer Memory: Fast (no processing)');
    console.log('   Window Memory: Fast (simple truncation)');
    console.log('   Summary Memory: Slower (requires LLM calls)');

    console.log('\n💰 Token Costs:');
    console.log('   Buffer Memory: High (grows with conversation)');
    console.log('   Window Memory: Medium (fixed size)');
    console.log('   Summary Memory: Variable (summarization + usage)');

    // Use Case Recommendations
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎯 Use Case Recommendations');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🗄️ Buffer Memory - Best For:');
    console.log('   ✅ Short conversations (< 10 exchanges)');
    console.log('   ✅ When complete context is crucial');
    console.log('   ✅ Customer support tickets');
    console.log('   ✅ Educational tutoring sessions');
    console.log('   ✅ Debugging and troubleshooting');
    console.log('   ❌ Long conversations (token limits)');
    console.log('   ❌ Memory-constrained environments');

    console.log('\n🪟 Window Memory - Best For:');
    console.log('   ✅ Long conversations with recent focus');
    console.log('   ✅ Chat applications');
    console.log('   ✅ Real-time interactions');
    console.log('   ✅ Memory-constrained environments');
    console.log('   ✅ Streaming conversations');
    console.log('   ❌ When early context is important');
    console.log('   ❌ Complex multi-topic discussions');

    console.log('\n📝 Summary Memory - Best For:');
    console.log('   ✅ Very long conversations (> 20 exchanges)');
    console.log('   ✅ Multi-session conversations');
    console.log('   ✅ Complex problem-solving discussions');
    console.log('   ✅ When key information must be preserved');
    console.log('   ✅ Token budget optimization');
    console.log('   ❌ Real-time applications (latency)');
    console.log('   ❌ When summarization might lose nuance');

    // Decision Matrix
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎯 Memory Type Decision Matrix');
    console.log(`${'='.repeat(60)}`);

    console.log('\n📊 Choose Based On:');
    console.log('\n🔢 Conversation Length:');
    console.log('   • Short (1-10 exchanges): Buffer Memory');
    console.log('   • Medium (10-20 exchanges): Window Memory');
    console.log('   • Long (20+ exchanges): Summary Memory');

    console.log('\n💾 Memory Constraints:');
    console.log('   • No constraints: Buffer Memory');
    console.log('   • Some constraints: Window Memory');
    console.log('   • Strict constraints: Summary Memory');

    console.log('\n⚡ Performance Requirements:');
    console.log('   • Real-time: Window Memory');
    console.log('   • Standard: Buffer Memory');
    console.log('   • Batch processing: Summary Memory');

    console.log('\n🎯 Context Importance:');
    console.log('   • Full context critical: Buffer Memory');
    console.log('   • Recent context sufficient: Window Memory');
    console.log('   • Key points sufficient: Summary Memory');

    // Hybrid Approaches
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔄 Hybrid Approaches');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🔀 Combination Strategies:');
    console.log('   • Buffer + Window: Full context with recent focus');
    console.log('   • Window + Summary: Recent context with historical summary');
    console.log('   • Custom + Any: Domain-specific logic with standard memory');

    console.log('\n🛠️ Implementation Tips:');
    console.log('   • Start with Buffer Memory for prototyping');
    console.log('   • Monitor token usage and conversation length');
    console.log('   • Switch memory types based on conversation phase');
    console.log('   • Consider user preferences and application requirements');
    console.log('   • Test with real conversation patterns');

    console.log('\n✅ Memory Types Comparison Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Different memory types serve different use cases');
    console.log('   • Consider conversation length, performance, and context needs');
    console.log('   • Buffer Memory: Complete context, best for short conversations');
    console.log('   • Window Memory: Recent context, best for long conversations');
    console.log('   • Summary Memory: Key information, best for very long conversations');
    console.log('   • Hybrid approaches can combine benefits of multiple types');
}

// Execute the demo
memoryComparisonDemo().catch(console.error);
