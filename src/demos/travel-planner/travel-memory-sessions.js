import { BufferMemory, ConversationSummaryMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Custom Travel Memory Manager
class TravelMemoryManager {
  constructor() {
    this.userSessions = new Map(); // Store user sessions
    this.userProfiles = new Map(); // Store user travel profiles
    this.conversationHistory = new Map(); // Store conversation history
  }

  // Create or get user session
  getOrCreateSession(userId) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        id: userId,
        createdAt: new Date(),
        lastActive: new Date(),
        conversationCount: 0,
        preferences: {},
        memory: new BufferMemory({
          memoryKey: 'chat_history',
          returnMessages: true,
        })
      });
    }
    
    const session = this.userSessions.get(userId);
    session.lastActive = new Date();
    return session;
  }

  // Update user travel profile
  updateUserProfile(userId, profileData) {
    const existingProfile = this.userProfiles.get(userId) || {};
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      updatedAt: new Date()
    };
    this.userProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  // Get user travel profile
  getUserProfile(userId) {
    return this.userProfiles.get(userId) || {
      preferredBudget: 'Not specified',
      travelStyle: 'Not specified',
      favoriteDestinations: [],
      avoidedDestinations: [],
      dietaryRestrictions: [],
      accommodationPreference: 'Not specified',
      transportPreference: 'Not specified'
    };
  }

  // Add conversation to history
  addConversation(userId, input, output) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId);
    history.push({
      timestamp: new Date(),
      input,
      output,
      conversationId: history.length + 1
    });

    // Keep only last 10 conversations to manage memory
    if (history.length > 10) {
      history.shift();
    }
  }

  // Get conversation summary
  getConversationSummary(userId) {
    const history = this.conversationHistory.get(userId) || [];
    if (history.length === 0) return 'No previous conversations';

    const recentConversations = history.slice(-3);
    return recentConversations.map(conv => 
      `User asked: "${conv.input.substring(0, 50)}..." | Response: "${conv.output.substring(0, 50)}..."`
    ).join('\n');
  }

  // Extract preferences from conversation
  extractPreferences(input, output) {
    const preferences = {};
    
    // Budget extraction
    const budgetMatch = input.match(/\$(\d+(?:,\d+)?)/);
    if (budgetMatch) {
      preferences.preferredBudget = budgetMatch[0];
    }

    // Travel style extraction
    const styleKeywords = {
      'luxury': 'Luxury',
      'budget': 'Budget',
      'adventure': 'Adventure',
      'cultural': 'Cultural',
      'romantic': 'Romantic',
      'family': 'Family',
      'business': 'Business'
    };

    for (const [keyword, style] of Object.entries(styleKeywords)) {
      if (input.toLowerCase().includes(keyword)) {
        preferences.travelStyle = style;
        break;
      }
    }

    // Destination preferences
    const destinations = ['tokyo', 'paris', 'barcelona', 'costa rica', 'bali', 'new york'];
    for (const dest of destinations) {
      if (input.toLowerCase().includes(dest)) {
        preferences.lastSearchedDestination = dest;
        break;
      }
    }

    return preferences;
  }

  // Get all user sessions (for demo purposes)
  getAllSessions() {
    return Array.from(this.userSessions.entries()).map(([userId, session]) => ({
      userId,
      ...session,
      profile: this.getUserProfile(userId),
      conversationCount: this.conversationHistory.get(userId)?.length || 0
    }));
  }
}

export async function travelMemorySessionsDemo() {
  console.log('🧠 Smart Travel Planner: Memory Management & User Sessions');
  console.log('='.repeat(60));
  console.log('Workshop Session 5: Building Personalized AI with Memory');
  console.log('');

  try {
    // Initialize Travel Memory Manager
    const memoryManager = new TravelMemoryManager();

    console.log('🗄️ Travel Memory Manager Initialized:');
    console.log('   📊 User Sessions: In-memory storage with profiles');
    console.log('   💬 Conversation History: Last 10 conversations per user');
    console.log('   🎯 Preference Learning: Automatic extraction from conversations');
    console.log('   🔄 Session Management: Create, update, and maintain user context');
    console.log('');

    // Demo 1: User Session Management
    console.log('👤 Demo 1: User Session Management');
    console.log('='.repeat(50));

    // Create multiple user sessions
    const users = [
      { id: 'user_001', name: 'Alice (Adventure Seeker)' },
      { id: 'user_002', name: 'Bob (Luxury Traveler)' },
      { id: 'user_003', name: 'Carol (Budget Explorer)' }
    ];

    for (const user of users) {
      const session = memoryManager.getOrCreateSession(user.id);
      console.log(`✅ Created session for ${user.name}:`);
      console.log(`   Session ID: ${session.id}`);
      console.log(`   Created: ${session.createdAt.toISOString()}`);
      console.log(`   Status: Active`);
      console.log('');
    }

    // Demo 2: User Profile Learning
    console.log('🎯 Demo 2: User Profile Learning');
    console.log('='.repeat(50));

    // Simulate user interactions and profile building
    const userInteractions = [
      {
        userId: 'user_001',
        input: 'I want an adventure trip to Costa Rica with a $2000 budget for hiking and zip-lining',
        expectedOutput: 'Costa Rica adventure itinerary with hiking, zip-lining, and wildlife activities'
      },
      {
        userId: 'user_002', 
        input: 'Plan a luxury romantic getaway to Paris, budget is not a concern, prefer 5-star hotels',
        expectedOutput: 'Luxury Paris romantic itinerary with premium accommodations and fine dining'
      },
      {
        userId: 'user_003',
        input: 'Looking for budget travel to Barcelona, around $800 total, hostels are fine',
        expectedOutput: 'Budget-friendly Barcelona itinerary with hostels and free attractions'
      }
    ];

    for (const interaction of userInteractions) {
      console.log(`💬 User ${interaction.userId} conversation:`);
      console.log(`   Input: "${interaction.input}"`);
      
      // Extract and update preferences
      const preferences = memoryManager.extractPreferences(interaction.input, interaction.expectedOutput);
      const profile = memoryManager.updateUserProfile(interaction.userId, preferences);
      
      console.log(`   🎯 Extracted Preferences:`);
      if (preferences.preferredBudget) console.log(`      Budget: ${preferences.preferredBudget}`);
      if (preferences.travelStyle) console.log(`      Style: ${preferences.travelStyle}`);
      if (preferences.lastSearchedDestination) console.log(`      Destination: ${preferences.lastSearchedDestination}`);
      
      // Add to conversation history
      memoryManager.addConversation(interaction.userId, interaction.input, interaction.expectedOutput);
      
      console.log(`   📊 Updated Profile: ${Object.keys(profile).length} preferences stored`);
      console.log('');
    }

    // Demo 3: Memory-Enhanced Conversations
    console.log('🧠 Demo 3: Memory-Enhanced Conversations');
    console.log('='.repeat(50));

    if (process.env.OPENAI_API_KEY) {
      const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo',
      });

      // Create memory-enhanced travel assistant
      const memoryPrompt = new PromptTemplate({
        template: `You are a personalized travel assistant with access to user preferences and conversation history.

User Profile:
- Preferred Budget: {preferredBudget}
- Travel Style: {travelStyle}
- Previous Destinations: {favoriteDestinations}
- Dietary Restrictions: {dietaryRestrictions}
- Accommodation Preference: {accommodationPreference}

Recent Conversation Summary:
{conversationSummary}

Current Conversation:
{chat_history}

User: {input}
Assistant: Based on your preferences and our previous conversations, I'll provide personalized travel recommendations.`,
        inputVariables: ['preferredBudget', 'travelStyle', 'favoriteDestinations', 'dietaryRestrictions', 'accommodationPreference', 'conversationSummary', 'chat_history', 'input']
      });

      // Test memory-enhanced conversations
      for (const user of users.slice(0, 2)) { // Test with first 2 users
        console.log(`🎭 Memory-Enhanced Conversation with ${user.name}:`);
        console.log('-'.repeat(40));
        
        const session = memoryManager.getOrCreateSession(user.id);
        const profile = memoryManager.getUserProfile(user.id);
        const conversationSummary = memoryManager.getConversationSummary(user.id);

        const chain = new ConversationChain({
          llm: model,
          memory: session.memory,
          prompt: memoryPrompt,
        });

        try {
          const followUpQuestions = [
            'What other destinations would you recommend based on my preferences?',
            'Can you suggest activities that match my travel style?'
          ];

          for (const question of followUpQuestions) {
            console.log(`❓ User: "${question}"`);
            
            const response = await chain.call({
              input: question,
              preferredBudget: profile.preferredBudget,
              travelStyle: profile.travelStyle,
              favoriteDestinations: profile.favoriteDestinations.join(', ') || 'None yet',
              dietaryRestrictions: profile.dietaryRestrictions.join(', ') || 'None',
              accommodationPreference: profile.accommodationPreference,
              conversationSummary: conversationSummary
            });

            console.log(`🤖 Assistant: ${response.response}`);
            console.log('');

            // Update conversation history
            memoryManager.addConversation(user.id, question, response.response);
          }
        } catch (error) {
          console.log(`❌ Error in memory-enhanced conversation: ${error.message}`);
        }
        console.log('');
      }
    } else {
      console.log('⚠️  OpenAI API key not found.');
      console.log('💡 Set OPENAI_API_KEY environment variable for live memory demos.');
      console.log('');
      console.log('🧠 Memory-Enhanced Conversation Examples:');
      console.log('');
      console.log('👤 User (returning): "What other destinations would you recommend?"');
      console.log('🤖 Assistant: "Based on your previous interest in adventure travel to Costa Rica');
      console.log('   and your $2000 budget preference, I recommend Nepal for trekking,');
      console.log('   New Zealand for extreme sports, or Peru for Machu Picchu hiking..."');
      console.log('');
      console.log('👤 User (luxury traveler): "Plan another romantic trip"');
      console.log('🤖 Assistant: "Since you enjoyed luxury accommodations in Paris,');
      console.log('   I suggest the Maldives with overwater villas, Santorini with');
      console.log('   premium cave hotels, or Tuscany with luxury vineyard resorts..."');
      console.log('');
    }

    // Demo 4: Session Analytics
    console.log('📊 Demo 4: Session Analytics & Management');
    console.log('='.repeat(50));

    const allSessions = memoryManager.getAllSessions();
    console.log(`📈 Total Active Sessions: ${allSessions.length}`);
    console.log('');

    allSessions.forEach((session, index) => {
      console.log(`👤 Session ${index + 1}:`);
      console.log(`   User ID: ${session.userId}`);
      console.log(`   Created: ${session.createdAt.toLocaleString()}`);
      console.log(`   Last Active: ${session.lastActive.toLocaleString()}`);
      console.log(`   Conversations: ${session.conversationCount}`);
      console.log(`   Profile Data:`);
      console.log(`      Budget: ${session.profile.preferredBudget}`);
      console.log(`      Style: ${session.profile.travelStyle}`);
      console.log(`      Last Destination: ${session.profile.lastSearchedDestination || 'None'}`);
      console.log('');
    });

    // Demo 5: Memory Types Comparison
    console.log('🔄 Demo 5: Memory Types Comparison');
    console.log('='.repeat(50));

    console.log('📝 Buffer Memory:');
    console.log('   • Stores exact conversation history');
    console.log('   • Good for: Short-term context, detailed recall');
    console.log('   • Limitation: Memory grows with conversation length');
    console.log('');

    console.log('📋 Summary Memory:');
    console.log('   • Stores condensed conversation summaries');
    console.log('   • Good for: Long conversations, key information retention');
    console.log('   • Limitation: May lose specific details');
    console.log('');

    console.log('🏷️ Entity Memory:');
    console.log('   • Stores information about specific entities (places, people)');
    console.log('   • Good for: Tracking preferences, relationships, facts');
    console.log('   • Limitation: Requires entity extraction logic');
    console.log('');

    // Workshop Learning Summary
    console.log('🎓 Workshop Learning Summary');
    console.log('='.repeat(60));
    console.log('');
    
    console.log('✅ Key Memory Management Concepts:');
    console.log('   • User session management and persistence');
    console.log('   • Conversation history and context retention');
    console.log('   • Automatic preference extraction and learning');
    console.log('   • Memory types: Buffer, Summary, Entity');
    console.log('   • Personalized AI responses based on user history');
    console.log('');

    console.log('🔧 Memory Architecture Components:');
    console.log('   • Session Manager: User state and profile management');
    console.log('   • Memory Store: Conversation history and preferences');
    console.log('   • Preference Extractor: Automatic learning from interactions');
    console.log('   • Context Builder: Combining profile + history for prompts');
    console.log('   • Memory Types: Different strategies for different use cases');
    console.log('');

    console.log('🚀 Production Memory Patterns:');
    console.log('   • Database persistence for user profiles');
    console.log('   • Redis/cache for session management');
    console.log('   • Vector stores for semantic memory search');
    console.log('   • Memory cleanup and archival strategies');
    console.log('   • Privacy and data retention compliance');
    console.log('');

    console.log('💡 Workshop Exercise Ideas:');
    console.log('   • Implement different memory types (Summary, Entity)');
    console.log('   • Build preference learning algorithms');
    console.log('   • Create memory-based recommendation systems');
    console.log('   • Design privacy-compliant memory management');
    console.log('   • Add memory analytics and insights dashboards');
    console.log('');

    console.log('🔮 Next Workshop Session:');
    console.log('   6. Production: Deploy your complete Smart Travel Planner');
    console.log('');

    console.log('🎯 Complete Smart Travel Planner Architecture:');
    console.log('   Prompts → Chains → Structured Output → Knowledge Base → Agents → Memory → Production');
    console.log('');

    console.log('🏆 Workshop Achievement Unlocked:');
    console.log('   You now have all the components to build a world-class AI travel planning system!');

  } catch (error) {
    console.error('❌ Error in travel memory sessions demo:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute the demo when this file is run directly
(async () => {
  try {
    await travelMemorySessionsDemo();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
})();
