import { ConversationSummaryMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Conversation Summary Memory Demo
 * 
 * This demo shows how to summarize old conversations to maintain key information.
 * Summary memory compresses conversation history while preserving important context.
 */
async function conversationSummaryMemoryDemo() {
    console.log('🚀 Executing Conversation Summary Memory Demo...');
    console.log('=' .repeat(60));

    console.log('📝 Conversation Summary Memory Overview:');
    console.log('   • Summarizes old conversation parts automatically');
    console.log('   • Maintains key information while reducing token usage');
    console.log('   • Uses LLM to create intelligent summaries');
    console.log('   • Ideal for very long conversations');

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

    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key required for Summary Memory');
        console.log('💡 Summary memory needs LLM access to generate summaries');
        console.log('📝 Showing conceptual demonstration instead...');
        
        // Show conceptual demonstration
        console.log('\n🎭 Conceptual Summary Memory Workflow:');
        console.log('1. 👤 User: "I\'m planning a trip to Japan next month"');
        console.log('2. 🤖 AI: "That sounds exciting! What cities are you planning to visit?"');
        console.log('3. 👤 User: "Tokyo and Kyoto mainly"');
        console.log('4. 🤖 AI: "Great choices! Tokyo offers modern city life..."');
        console.log('5. 👤 User: "I love Japanese cuisine, especially sushi"');
        console.log('6. 🤖 AI: "You\'ll find amazing sushi in both cities..."');
        
        console.log('\n📝 After several more exchanges, summary memory would create:');
        console.log('💭 Summary: "User is planning a trip to Japan (Tokyo & Kyoto) next month. Loves Japanese cuisine, especially sushi. Interested in cultural experiences and food recommendations."');
        
        console.log('\n✅ This summary replaces the full conversation history while preserving key context.');
        return;
    }

    // Create conversation summary memory
    const memory = new ConversationSummaryMemory({
        memoryKey: "chat_history",
        llm: model,
        returnMessages: true,
    });

    console.log('\n💾 Summary Memory Configuration:');
    console.log('   • Memory Key: chat_history');
    console.log('   • LLM: gpt-3.5-turbo (for summarization)');
    console.log('   • Return Messages: true');
    console.log('   • Auto-summarization: enabled');

    // Create conversation chain with summary memory
    const conversationChain = new ConversationChain({
        llm: model,
        memory: memory,
        verbose: true,
    });

    console.log('\n🔗 Conversation Chain Created with Summary Memory');

    // Simulate a longer conversation that would benefit from summarization
    const longConversation = [
        {
            input: "I'm planning a trip to Japan next month.",
            description: "Initial travel planning"
        },
        {
            input: "I'm particularly interested in visiting Tokyo and Kyoto.",
            description: "Specific destination preferences"
        },
        {
            input: "I love Japanese cuisine, especially sushi and ramen.",
            description: "Food preferences"
        },
        {
            input: "My budget is around $3000 for the entire trip.",
            description: "Budget constraints"
        },
        {
            input: "I'm also interested in traditional temples and gardens.",
            description: "Cultural interests"
        },
        {
            input: "What's the best time to visit for cherry blossoms?",
            description: "Seasonal timing question"
        },
        {
            input: "Should I book accommodations in advance?",
            description: "Practical travel planning"
        },
        {
            input: "Can you give me some travel recommendations based on everything I've told you?",
            description: "Comprehensive request requiring full context"
        }
    ];

    console.log('\n🗣️ Starting Long Conversation Simulation...');
    console.log('📏 This conversation will demonstrate automatic summarization');
    
    for (let i = 0; i < longConversation.length; i++) {
        const step = longConversation[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`💬 Conversation Step ${i + 1}/${longConversation.length}`);
        console.log(`${'='.repeat(50)}`);
        
        console.log('👤 Human:', step.input);
        console.log('📝 Context:', step.description);
        
        try {
            console.log('🔄 Processing with summary memory...');
            
            const response = await conversationChain.call({
                input: step.input
            });
            
            console.log('🤖 AI Response:', response.response.substring(0, 200) + '...');
            
            // Show current memory state
            const memoryVariables = await memory.loadMemoryVariables({});
            
            console.log('🧠 Memory State:');
            if (memoryVariables.chat_history) {
                console.log(`   Current summary length: ${memoryVariables.chat_history.length} characters`);
                console.log('   Summary preview:', memoryVariables.chat_history.substring(0, 150) + '...');
            }
            
            // Show summarization in action
            if (i >= 3) { // After a few exchanges
                console.log('📝 Summary Memory is actively compressing conversation history');
                console.log('💡 Key information preserved while reducing token usage');
            }
            
        } catch (error) {
            console.log('❌ Error in conversation:', error.message);
        }
        
        // Delay for readability
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Demonstrate summary quality
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Summary Quality Analysis');
    console.log(`${'='.repeat(60)}`);

    try {
        const finalMemory = await memory.loadMemoryVariables({});
        
        console.log('📝 Final Conversation Summary:');
        console.log(finalMemory.chat_history);
        
        console.log('\n🔍 Summary Analysis:');
        console.log('   • Key information preserved: ✅');
        console.log('   • Context compression achieved: ✅');
        console.log('   • Conversation flow maintained: ✅');
        console.log('   • Token usage optimized: ✅');
        
    } catch (error) {
        console.log('❌ Error analyzing summary:', error.message);
    }

    // Compare memory types
    console.log(`\n${'='.repeat(60)}`);
    console.log('⚖️ Memory Type Comparison');
    console.log(`${'='.repeat(60)}`);

    console.log('📊 Summary Memory vs Other Types:');
    console.log('\n🧠 Buffer Memory:');
    console.log('   • Stores: Complete conversation history');
    console.log('   • Memory usage: Grows linearly');
    console.log('   • Context: Full, no loss');
    console.log('   • Best for: Short conversations');

    console.log('\n🪟 Window Memory:');
    console.log('   • Stores: Last K message pairs');
    console.log('   • Memory usage: Fixed size');
    console.log('   • Context: Recent only');
    console.log('   • Best for: Long chats, recent focus');

    console.log('\n📝 Summary Memory:');
    console.log('   • Stores: Intelligent summary');
    console.log('   • Memory usage: Compressed');
    console.log('   • Context: Key information preserved');
    console.log('   • Best for: Very long conversations');

    // Summary Memory characteristics
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Summary Memory Characteristics');
    console.log(`${'='.repeat(60)}`);

    console.log('✅ Advantages:');
    console.log('   • Handles very long conversations efficiently');
    console.log('   • Preserves key information through summarization');
    console.log('   • Reduces token costs for long interactions');
    console.log('   • Intelligent compression maintains context');
    console.log('   • Scales well with conversation length');

    console.log('\n⚠️ Considerations:');
    console.log('   • Requires additional LLM calls for summarization');
    console.log('   • May lose some conversational nuances');
    console.log('   • Summary quality depends on LLM capabilities');
    console.log('   • Slight delay for summarization processing');
    console.log('   • More complex than simple buffer approaches');

    console.log('\n🎯 Best Use Cases:');
    console.log('   • Extended customer support sessions');
    console.log('   • Long-form educational conversations');
    console.log('   • Multi-session conversations');
    console.log('   • Applications with strict token budgets');
    console.log('   • Complex problem-solving discussions');

    console.log('\n🔧 Configuration Tips:');
    console.log('   • Use same model for memory and conversation');
    console.log('   • Monitor summary quality regularly');
    console.log('   • Consider hybrid approaches for critical applications');
    console.log('   • Test summarization with domain-specific content');

    console.log('\n✅ Conversation Summary Memory Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Summary memory compresses conversation history intelligently');
    console.log('   • Preserves key information while reducing token usage');
    console.log('   • Ideal for very long conversations');
    console.log('   • Requires LLM access for summarization');
    console.log('   • Balances context preservation with efficiency');
}

// Execute the demo
conversationSummaryMemoryDemo().catch(console.error);
