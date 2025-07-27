import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Basic Buffer Memory Demo
 * 
 * This demo shows how to store complete conversation history for context.
 * Buffer memory maintains all previous interactions in the conversation.
 */
async function basicBufferMemoryDemo() {
    console.log('🚀 Executing Basic Buffer Memory Demo...');
    console.log('=' .repeat(60));

    console.log('🧠 Buffer Memory Overview:');
    console.log('   • Stores complete conversation history');
    console.log('   • Maintains full context for AI responses');
    console.log('   • Simple and straightforward implementation');
    console.log('   • Best for short to medium conversations');

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

    // Create buffer memory
    const memory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
    });

    console.log('\n💾 Buffer Memory Configuration:');
    console.log('   • Memory Key: chat_history');
    console.log('   • Return Messages: true');
    console.log('   • Storage: In-memory (temporary)');

    // Create conversation chain with memory
    const conversationChain = new ConversationChain({
        llm: model,
        memory: memory,
        verbose: true,
    });

    console.log('\n🔗 Conversation Chain Created with Buffer Memory');

    // Simulate a conversation
    const conversationSteps = [
        {
            input: "Hi, my name is Alice and I love programming.",
            description: "Initial introduction with personal information"
        },
        {
            input: "What programming languages do you think I should learn?",
            description: "Follow-up question (AI should remember Alice's interest in programming)"
        },
        {
            input: "I'm particularly interested in web development.",
            description: "Additional context about programming interests"
        },
        {
            input: "What's my name and what do I love?",
            description: "Memory test - AI should recall previous information"
        },
        {
            input: "Can you recommend some web development frameworks?",
            description: "Contextual question based on previous conversation"
        }
    ];

    if (process.env.OPENAI_API_KEY) {
        console.log('\n🗣️ Starting Conversation Simulation...');
        
        for (let i = 0; i < conversationSteps.length; i++) {
            const step = conversationSteps[i];
            
            console.log(`\n${'='.repeat(50)}`);
            console.log(`💬 Conversation Step ${i + 1}`);
            console.log(`${'='.repeat(50)}`);
            
            console.log('👤 Human:', step.input);
            console.log('📝 Context:', step.description);
            
            try {
                console.log('🔄 Processing with memory...');
                
                const response = await conversationChain.call({
                    input: step.input
                });
                
                console.log('🤖 AI Response:', response.response);
                
                // Show current memory state
                const memoryVariables = await memory.loadMemoryVariables({});
                console.log('🧠 Memory State:');
                console.log(`   Messages in memory: ${memoryVariables.chat_history.length}`);
                
                if (i === conversationSteps.length - 1) {
                    console.log('\n📚 Complete Memory History:');
                    memoryVariables.chat_history.forEach((msg, index) => {
                        const role = msg._getType() === 'human' ? '👤 Human' : '🤖 AI';
                        console.log(`   ${index + 1}. ${role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
                    });
                }
                
            } catch (error) {
                console.log('❌ Error in conversation:', error.message);
            }
            
            // Small delay between steps for readability
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } else {
        console.log('\n⚠️  OpenAI API Key not found. Demonstrating memory structure only...');
        
        // Simulate adding messages to memory manually
        for (const step of conversationSteps) {
            console.log(`\n👤 Human: ${step.input}`);
            console.log(`📝 Context: ${step.description}`);
            
            // Manually save to memory (simulation)
            await memory.saveContext(
                { input: step.input },
                { output: `[Simulated AI response to: ${step.input}]` }
            );
            
            const memoryVars = await memory.loadMemoryVariables({});
            console.log(`🧠 Memory now contains ${memoryVars.chat_history.length} messages`);
        }
    }

    // Demonstrate memory operations
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔧 Memory Operations Demo');
    console.log(`${'='.repeat(60)}`);

    // Show memory loading
    console.log('\n📖 Loading Memory Variables:');
    const currentMemory = await memory.loadMemoryVariables({});
    console.log(`   Total messages: ${currentMemory.chat_history.length}`);
    console.log(`   Memory key: ${memory.memoryKey}`);

    // Show memory clearing
    console.log('\n🧹 Memory Management:');
    console.log('   • clear(): Removes all conversation history');
    console.log('   • saveContext(): Adds new interaction to memory');
    console.log('   • loadMemoryVariables(): Retrieves current memory state');

    // Create a second conversation chain to show memory isolation
    console.log('\n🔄 Memory Isolation Demo:');
    const newMemory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
    });

    const newMemoryVars = await newMemory.loadMemoryVariables({});
    console.log(`   New memory instance: ${newMemoryVars.chat_history.length} messages`);
    console.log(`   Original memory: ${currentMemory.chat_history.length} messages`);
    console.log('   ✅ Memory instances are properly isolated');

    // Buffer Memory characteristics
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Buffer Memory Characteristics');
    console.log(`${'='.repeat(60)}`);

    console.log('✅ Advantages:');
    console.log('   • Complete conversation context preserved');
    console.log('   • Simple implementation and usage');
    console.log('   • No information loss');
    console.log('   • Perfect recall of all interactions');

    console.log('\n⚠️ Considerations:');
    console.log('   • Memory usage grows with conversation length');
    console.log('   • Token costs increase with longer conversations');
    console.log('   • May hit model context limits in very long chats');
    console.log('   • No automatic cleanup or summarization');

    console.log('\n🎯 Best Use Cases:');
    console.log('   • Short to medium conversations');
    console.log('   • When complete context is crucial');
    console.log('   • Customer support interactions');
    console.log('   • Educational or tutoring applications');

    console.log('\n✅ Basic Buffer Memory Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Buffer memory stores complete conversation history');
    console.log('   • Provides full context for AI responses');
    console.log('   • Simple to implement and understand');
    console.log('   • Best for shorter conversations where full context matters');
    console.log('   • Memory grows linearly with conversation length');
}

// Execute the demo
basicBufferMemoryDemo().catch(console.error);
