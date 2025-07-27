import { BufferWindowMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Buffer Window Memory Demo
 * 
 * This demo shows how to keep only the last K interactions to limit memory size.
 * Window memory prevents memory from growing indefinitely while maintaining recent context.
 */
async function bufferWindowMemoryDemo() {
    console.log('🚀 Executing Buffer Window Memory Demo...');
    console.log('=' .repeat(60));

    console.log('🪟 Buffer Window Memory Overview:');
    console.log('   • Keeps only the last K message pairs');
    console.log('   • Prevents unlimited memory growth');
    console.log('   • Maintains recent conversation context');
    console.log('   • Automatically discards oldest messages');

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

    // Create buffer window memory with window size of 2
    const windowSize = 2;
    const memory = new BufferWindowMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        k: windowSize, // Keep only last 2 message pairs
    });

    console.log('\n💾 Buffer Window Memory Configuration:');
    console.log('   • Memory Key: chat_history');
    console.log('   • Window Size (k): 2 message pairs');
    console.log('   • Return Messages: true');
    console.log('   • Auto-cleanup: enabled');

    // Create conversation chain with window memory
    const conversationChain = new ConversationChain({
        llm: model,
        memory: memory,
        verbose: true,
    });

    console.log('\n🔗 Conversation Chain Created with Window Memory');

    // Extended conversation to demonstrate window behavior
    const conversationSteps = [
        {
            input: "My favorite color is blue.",
            description: "Personal preference #1"
        },
        {
            input: "I work as a software engineer.",
            description: "Professional information"
        },
        {
            input: "I have a pet cat named Whiskers.",
            description: "Personal information about pet"
        },
        {
            input: "I enjoy hiking on weekends.",
            description: "Hobby information"
        },
        {
            input: "My favorite programming language is Python.",
            description: "Technical preference"
        },
        {
            input: "What do you remember about me?",
            description: "Memory test - should only remember recent interactions"
        }
    ];

    if (process.env.OPENAI_API_KEY) {
        console.log('\n🗣️ Starting Extended Conversation...');
        console.log(`📏 Window size: ${windowSize} message pairs`);
        console.log('🔄 Older messages will be automatically discarded');
        
        for (let i = 0; i < conversationSteps.length; i++) {
            const step = conversationSteps[i];
            
            console.log(`\n${'='.repeat(50)}`);
            console.log(`💬 Conversation Step ${i + 1}`);
            console.log(`${'='.repeat(50)}`);
            
            console.log('👤 Human:', step.input);
            console.log('📝 Context:', step.description);
            
            try {
                console.log('🔄 Processing with window memory...');
                
                const response = await conversationChain.call({
                    input: step.input
                });
                
                console.log('🤖 AI Response:', response.response);
                
                // Show current memory state
                const memoryVariables = await memory.loadMemoryVariables({});
                const messageCount = memoryVariables.chat_history.length;
                const pairCount = Math.floor(messageCount / 2);
                
                console.log('🧠 Memory Window State:');
                console.log(`   Total messages in window: ${messageCount}`);
                console.log(`   Message pairs in window: ${pairCount}/${windowSize}`);
                
                // Show what's currently in the window
                if (messageCount > 0) {
                    console.log('   Current window contents:');
                    memoryVariables.chat_history.forEach((msg, index) => {
                        const role = msg._getType() === 'human' ? '👤' : '🤖';
                        const content = msg.content.substring(0, 50);
                        console.log(`     ${index + 1}. ${role} ${content}${msg.content.length > 50 ? '...' : ''}`);
                    });
                }
                
                // Highlight when window is full and old messages are discarded
                if (pairCount >= windowSize && i < conversationSteps.length - 1) {
                    console.log('⚠️  Window is full - oldest messages will be discarded on next interaction');
                }
                
            } catch (error) {
                console.log('❌ Error in conversation:', error.message);
            }
            
            // Small delay for readability
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } else {
        console.log('\n⚠️  OpenAI API Key not found. Demonstrating window behavior...');
        
        // Simulate window behavior manually
        for (let i = 0; i < conversationSteps.length; i++) {
            const step = conversationSteps[i];
            
            console.log(`\n💬 Step ${i + 1}: ${step.input}`);
            
            // Manually save to memory
            await memory.saveContext(
                { input: step.input },
                { output: `[Simulated response ${i + 1}]` }
            );
            
            const memoryVars = await memory.loadMemoryVariables({});
            const messageCount = memoryVars.chat_history.length;
            const pairCount = Math.floor(messageCount / 2);
            
            console.log(`🪟 Window state: ${pairCount}/${windowSize} pairs (${messageCount} messages)`);
            
            if (pairCount > windowSize) {
                console.log('🗑️  Oldest messages discarded to maintain window size');
            }
        }
    }

    // Compare different window sizes
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Window Size Comparison');
    console.log(`${'='.repeat(60)}`);

    const windowSizes = [1, 3, 5];
    
    for (const k of windowSizes) {
        console.log(`\n🪟 Window Size: ${k}`);
        
        const testMemory = new BufferWindowMemory({
            memoryKey: "chat_history",
            returnMessages: true,
            k: k,
        });
        
        // Add several test messages
        const testMessages = [
            "Message 1", "Message 2", "Message 3", 
            "Message 4", "Message 5", "Message 6"
        ];
        
        for (const msg of testMessages) {
            await testMemory.saveContext(
                { input: msg },
                { output: `Response to ${msg}` }
            );
        }
        
        const finalMemory = await testMemory.loadMemoryVariables({});
        const finalPairs = Math.floor(finalMemory.chat_history.length / 2);
        
        console.log(`   Messages added: ${testMessages.length}`);
        console.log(`   Messages retained: ${finalPairs} pairs (${finalMemory.chat_history.length} total)`);
        console.log(`   Memory efficiency: ${finalPairs <= k ? '✅' : '❌'}`);
    }

    // Window Memory characteristics
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Buffer Window Memory Characteristics');
    console.log(`${'='.repeat(60)}`);

    console.log('✅ Advantages:');
    console.log('   • Fixed memory size prevents unlimited growth');
    console.log('   • Maintains recent conversation context');
    console.log('   • Predictable token usage');
    console.log('   • Automatic cleanup of old messages');
    console.log('   • Good balance of context and efficiency');

    console.log('\n⚠️ Considerations:');
    console.log('   • Loses older conversation context');
    console.log('   • May forget important early information');
    console.log('   • Window size needs careful tuning');
    console.log('   • Not suitable for conversations requiring full history');

    console.log('\n🎯 Best Use Cases:');
    console.log('   • Long conversations with recent context focus');
    console.log('   • Chat applications with memory constraints');
    console.log('   • Customer service with session-based interactions');
    console.log('   • Real-time applications requiring consistent performance');

    console.log('\n🔧 Window Size Guidelines:');
    console.log('   • k=1: Very recent context only');
    console.log('   • k=2-3: Short-term conversation memory');
    console.log('   • k=5-10: Medium-term context retention');
    console.log('   • k>10: Consider other memory types');

    console.log('\n✅ Buffer Window Memory Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Window memory limits conversation history to last K pairs');
    console.log('   • Prevents memory growth while maintaining recent context');
    console.log('   • Window size (k) should match application needs');
    console.log('   • Ideal for long conversations with recent context focus');
    console.log('   • Automatic cleanup makes it maintenance-free');
}

// Execute the demo
bufferWindowMemoryDemo().catch(console.error);
