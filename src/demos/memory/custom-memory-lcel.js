import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Custom Memory with LCEL Demo
 * 
 * This demo shows how to implement custom memory logic using LCEL patterns.
 * It demonstrates building memory systems tailored to specific application needs.
 */
async function customMemoryLCELDemo() {
    console.log('🚀 Executing Custom Memory with LCEL Demo...');
    console.log('=' .repeat(60));

    console.log('🔧 Custom Memory with LCEL Overview:');
    console.log('   • Implement memory logic using LCEL patterns');
    console.log('   • Full control over memory behavior');
    console.log('   • Domain-specific memory strategies');
    console.log('   • Integration with modern LCEL chains');

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

    // Define conversation turn interface
    interface ConversationTurn {
        human: string;
        ai: string;
        timestamp: string;
        importance?: number;
        category?: string;
    }

    // Simple in-memory storage for conversation history
    let conversationHistory: ConversationTurn[] = [];

    console.log('\n💾 Custom Memory Implementation:');
    console.log('   • In-memory storage with conversation turns');
    console.log('   • Importance scoring for selective retention');
    console.log('   • Category-based organization');
    console.log('   • Timestamp tracking for temporal context');

    // Custom memory functions
    const addToMemory = (human: string, ai: string, importance: number = 1, category: string = 'general') => {
        console.log(`📝 Adding to memory (importance: ${importance}, category: ${category})`);
        
        conversationHistory.push({
            human,
            ai,
            timestamp: new Date().toISOString(),
            importance,
            category
        });
        
        // Keep only the most important interactions (custom retention logic)
        if (conversationHistory.length > 10) {
            // Sort by importance and keep top interactions
            conversationHistory.sort((a, b) => (b.importance || 1) - (a.importance || 1));
            conversationHistory = conversationHistory.slice(0, 8);
            console.log('🗑️  Pruned memory to keep most important interactions');
        }
    };

    const getMemoryContext = (category?: string, minImportance?: number) => {
        console.log(`🔍 Retrieving memory context (category: ${category || 'all'}, minImportance: ${minImportance || 'any'})`);
        
        let relevantHistory = conversationHistory;
        
        // Filter by category if specified
        if (category) {
            relevantHistory = relevantHistory.filter(turn => turn.category === category);
        }
        
        // Filter by importance if specified
        if (minImportance) {
            relevantHistory = relevantHistory.filter(turn => (turn.importance || 1) >= minImportance);
        }
        
        // Sort by timestamp (most recent first)
        relevantHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return relevantHistory
            .map(turn => `Human: ${turn.human}\nAI: ${turn.ai}`)
            .join('\n\n');
    };

    const getMemoryStats = () => {
        const categories = [...new Set(conversationHistory.map(turn => turn.category))];
        const avgImportance = conversationHistory.reduce((sum, turn) => sum + (turn.importance || 1), 0) / conversationHistory.length;
        
        return {
            totalTurns: conversationHistory.length,
            categories: categories,
            avgImportance: Math.round(avgImportance * 100) / 100,
            oldestTimestamp: conversationHistory.length > 0 ? 
                Math.min(...conversationHistory.map(turn => new Date(turn.timestamp).getTime())) : null
        };
    };

    // Create custom prompt template with memory integration
    const customMemoryPrompt = ChatPromptTemplate.fromTemplate(`
Based on our conversation history and the current input, provide a helpful response.

Conversation History:
{history}

Current Input: {input}

Please provide a contextual response that acknowledges our conversation history when relevant.
`);

    // Create LCEL chain with custom memory
    console.log('\n🏗️ Building LCEL Chain with Custom Memory:');
    console.log('   1. Memory context retrieval');
    console.log('   2. Prompt formatting with history');
    console.log('   3. LLM processing');
    console.log('   4. Response generation and memory update');

    const customMemoryChain = RunnableSequence.from([
        // Step 1: Prepare input with memory context
        {
            history: (input: { input: string, category?: string, importance?: number }) => 
                getMemoryContext(input.category, input.importance),
            input: (input: { input: string }) => input.input,
            metadata: (input: { input: string, category?: string, importance?: number }) => ({
                category: input.category || 'general',
                importance: input.importance || 1
            })
        },
        // Step 2: Generate response
        {
            history: (input: any) => input.history,
            input: (input: any) => input.input,
            metadata: (input: any) => input.metadata,
            response: RunnableSequence.from([
                customMemoryPrompt,
                model,
                new StringOutputParser(),
            ])
        },
        // Step 3: Update memory and return result
        (input: any) => {
            // Add interaction to custom memory
            addToMemory(
                input.input,
                input.response,
                input.metadata.importance,
                input.metadata.category
            );
            
            return {
                response: input.response,
                memoryStats: getMemoryStats(),
                contextUsed: input.history.length > 0
            };
        }
    ]);

    // Test the custom memory system
    const testConversations = [
        {
            input: "Hi, I'm working on a machine learning project about image classification.",
            category: "technical",
            importance: 3,
            description: "High-importance technical context"
        },
        {
            input: "I'm using Python and TensorFlow for this project.",
            category: "technical", 
            importance: 2,
            description: "Technical details"
        },
        {
            input: "By the way, I love hiking on weekends.",
            category: "personal",
            importance: 1,
            description: "Low-importance personal info"
        },
        {
            input: "What are some good techniques for improving model accuracy?",
            category: "technical",
            importance: 3,
            description: "High-importance technical question"
        },
        {
            input: "Can you remind me what I told you about my project?",
            category: "technical",
            importance: 2,
            description: "Memory test for technical category"
        }
    ];

    if (process.env.OPENAI_API_KEY) {
        console.log('\n🗣️ Testing Custom Memory System...');
        
        for (let i = 0; i < testConversations.length; i++) {
            const test = testConversations[i];
            
            console.log(`\n${'='.repeat(50)}`);
            console.log(`💬 Test ${i + 1}: ${test.description}`);
            console.log(`${'='.repeat(50)}`);
            
            console.log('👤 Human:', test.input);
            console.log('🏷️ Category:', test.category);
            console.log('⭐ Importance:', test.importance);
            
            try {
                console.log('🔄 Processing with custom memory...');
                
                const result = await customMemoryChain.invoke({
                    input: test.input,
                    category: test.category,
                    importance: test.importance
                });
                
                console.log('🤖 AI Response:', result.response.substring(0, 200) + '...');
                console.log('📊 Memory Stats:', result.memoryStats);
                console.log('🔗 Context Used:', result.contextUsed ? 'Yes' : 'No');
                
            } catch (error) {
                console.log('❌ Error:', error.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } else {
        console.log('\n⚠️  OpenAI API Key not found. Demonstrating memory operations...');
        
        // Demonstrate memory operations without LLM
        for (const test of testConversations) {
            console.log(`\n📝 Adding: "${test.input}" (${test.category}, importance: ${test.importance})`);
            addToMemory(test.input, `[Simulated response]`, test.importance, test.category);
            
            const stats = getMemoryStats();
            console.log('📊 Memory stats:', stats);
        }
    }

    // Demonstrate advanced memory features
    console.log(`\n${'='.repeat(60)}`);
    console.log('🚀 Advanced Custom Memory Features');
    console.log(`${'='.repeat(60)}`);

    // Category-based retrieval
    console.log('\n🏷️ Category-based Memory Retrieval:');
    const technicalContext = getMemoryContext('technical');
    const personalContext = getMemoryContext('personal');
    
    console.log(`   Technical context: ${technicalContext.split('\n').length / 3} interactions`);
    console.log(`   Personal context: ${personalContext.split('\n').length / 3} interactions`);

    // Importance-based filtering
    console.log('\n⭐ Importance-based Filtering:');
    const highImportanceContext = getMemoryContext(undefined, 3);
    const allContext = getMemoryContext();
    
    console.log(`   High importance (≥3): ${highImportanceContext.split('\n').length / 3} interactions`);
    console.log(`   All interactions: ${allContext.split('\n').length / 3} interactions`);

    // Memory analytics
    console.log('\n📊 Memory Analytics:');
    const finalStats = getMemoryStats();
    console.log(`   Total conversations: ${finalStats.totalTurns}`);
    console.log(`   Categories: ${finalStats.categories.join(', ')}`);
    console.log(`   Average importance: ${finalStats.avgImportance}`);

    // Custom Memory benefits
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Custom Memory Benefits');
    console.log(`${'='.repeat(60)}`);

    console.log('✅ Advantages:');
    console.log('   • Full control over memory behavior');
    console.log('   • Domain-specific retention strategies');
    console.log('   • Flexible filtering and retrieval');
    console.log('   • Custom importance scoring');
    console.log('   • Category-based organization');
    console.log('   • Integration with LCEL patterns');

    console.log('\n🎯 Use Cases:');
    console.log('   • Specialized applications with unique memory needs');
    console.log('   • Multi-category conversation systems');
    console.log('   • Importance-based information retention');
    console.log('   • Custom analytics and memory insights');
    console.log('   • Domain-specific conversation patterns');

    console.log('\n🔧 Implementation Patterns:');
    console.log('   • RunnableSequence for memory integration');
    console.log('   • Custom functions for memory operations');
    console.log('   • Metadata tracking for enhanced context');
    console.log('   • Flexible retrieval strategies');
    console.log('   • Memory pruning and optimization');

    console.log('\n✅ Custom Memory with LCEL Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Custom memory provides maximum flexibility');
    console.log('   • LCEL enables seamless memory integration');
    console.log('   • Importance scoring enables intelligent retention');
    console.log('   • Category-based organization improves context relevance');
    console.log('   • Custom memory suits specialized application needs');
}

// Execute the demo
customMemoryLCELDemo().catch(console.error);
