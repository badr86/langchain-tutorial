import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { JsonOutputParser, StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';

// ===== SMART TRAVEL PLANNER: COMPLETE INTEGRATION =====
// This demo integrates all workshop components into one comprehensive system

class SmartTravelPlanner {
  constructor() {
    this.userSessions = new Map();
    this.knowledgeBase = null;
    this.tools = [];
    this.model = null;
    this.initialized = false;
  }

  async initialize() {
    console.log('🚀 Initializing Smart Travel Planner...');
    
    // Initialize AI model if API key available
    if (process.env.OPENAI_API_KEY) {
      this.model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo',
      });
      console.log('✅ AI Model initialized');
    } else {
      console.log('⚠️  OpenAI API key not found - running in simulation mode');
    }

    // Initialize knowledge base
    await this.initializeKnowledgeBase();
    
    // Initialize tools
    this.initializeTools();
    
    this.initialized = true;
    console.log('🎯 Smart Travel Planner fully initialized!');
    console.log('');
  }

  async initializeKnowledgeBase() {
    // Travel knowledge documents (from RAG demo)
    const travelKnowledge = [
      new Document({
        pageContent: `Tokyo, Japan is a vibrant metropolis blending traditional culture with cutting-edge technology. Best time to visit is March-May (spring) and September-November (autumn). Must-see attractions include Senso-ji Temple (oldest temple, traditional atmosphere), Tokyo Skytree (tallest tower, panoramic views), Shibuya Crossing (world's busiest intersection), and Tsukiji Outer Market (fresh sushi, street food). Transportation: JR Pass for unlimited train travel, very efficient subway system. Cultural tips: Bow when greeting, remove shoes indoors, tipping is not customary. Food specialties: sushi, ramen, tempura, wagyu beef. Budget: $100-200/day for mid-range experience.`,
        metadata: { destination: 'Tokyo', country: 'Japan', category: 'overview' }
      }),
      new Document({
        pageContent: `Paris, France is the City of Light, renowned for art, culture, cuisine, and romance. Best time to visit is April-June and September-October. Iconic attractions include Eiffel Tower (symbol of Paris, stunning views), Louvre Museum (world's largest art museum, Mona Lisa), Notre-Dame Cathedral (Gothic masterpiece), Arc de Triomphe (historic monument), and Champs-Élysées (famous avenue). Transportation: Metro system covers entire city, walking is pleasant. Cultural tips: greet with "Bonjour/Bonsoir", dress elegantly, learn basic French phrases. Food specialties: croissants, cheese, wine, macarons, French cuisine. Budget: $120-250/day for mid-range experience.`,
        metadata: { destination: 'Paris', country: 'France', category: 'overview' }
      }),
      new Document({
        pageContent: `Barcelona, Spain combines Gothic architecture, modernist art, Mediterranean beaches, and vibrant culture. Best time to visit is May-June and September-October. Must-see attractions include Sagrada Familia (Gaudí's masterpiece, iconic basilica), Park Güell (whimsical park, city views), Gothic Quarter (medieval streets, historic charm), La Rambla (famous pedestrian street), and Barceloneta Beach (urban beach, seafood). Transportation: efficient metro system, walkable city center. Cultural tips: late dining (9-10pm), siesta culture, Catalan pride. Food specialties: tapas, paella, jamón, cava. Budget: $90-180/day for mid-range experience.`,
        metadata: { destination: 'Barcelona', country: 'Spain', category: 'overview' }
      }),
      new Document({
        pageContent: `Costa Rica is a Central American paradise known for biodiversity, eco-tourism, and adventure activities. Best time to visit is December-April (dry season). Top attractions include Manuel Antonio National Park (beaches, wildlife, monkeys), Arenal Volcano (active volcano, hot springs), Monteverde Cloud Forest (unique ecosystem, zip-lining), Tortuguero National Park (sea turtle nesting), and Tamarindo (surfing, beach town). Transportation: rental car recommended, domestic flights available. Cultural tips: "Pura Vida" lifestyle, eco-conscious, friendly locals. Activities: zip-lining, wildlife watching, surfing, hiking. Budget: $80-150/day for mid-range eco-tourism.`,
        metadata: { destination: 'Costa Rica', country: 'Costa Rica', category: 'overview' }
      })
    ];

    if (this.model) {
      try {
        const embeddings = new OpenAIEmbeddings({
          apiKey: process.env.OPENAI_API_KEY,
          modelName: 'text-embedding-ada-002',
        });

        this.knowledgeBase = await MemoryVectorStore.fromDocuments(
          travelKnowledge,
          embeddings
        );
        console.log('✅ Knowledge Base initialized with vector embeddings');
      } catch (error) {
        console.log('⚠️  Knowledge Base initialized without embeddings (simulation mode)');
        this.knowledgeBase = { documents: travelKnowledge };
      }
    } else {
      this.knowledgeBase = { documents: travelKnowledge };
      console.log('✅ Knowledge Base initialized (simulation mode)');
    }
  }

  initializeTools() {
    // Weather Tool
    class WeatherTool extends Tool {
      name = 'weather_checker';
      description = 'Get current weather conditions for a destination';

      async _call(destination) {
        const weatherData = {
          'tokyo': '22°C, Partly Cloudy, Perfect for sightseeing',
          'paris': '18°C, Light Rain, Bring an umbrella',
          'barcelona': '25°C, Sunny, Great beach weather',
          'costa rica': '28°C, Tropical, Afternoon showers expected'
        };
        return weatherData[destination.toLowerCase()] || '20°C, Variable conditions';
      }
    }

    // Currency Tool
    class CurrencyTool extends Tool {
      name = 'currency_converter';
      description = 'Convert currency for travel budgeting';

      async _call(query) {
        const rates = { 'usd_jpy': 150.25, 'usd_eur': 0.85, 'usd_gbp': 0.73 };
        const match = query.match(/(\d+)\s*(\w+)\s*to\s*(\w+)/i);
        if (!match) return 'Format: "amount FROM_CURRENCY to TO_CURRENCY"';
        
        const [, amount, from, to] = match;
        const rate = rates[`${from.toLowerCase()}_${to.toLowerCase()}`] || 1.0;
        const converted = (parseFloat(amount) * rate).toFixed(2);
        return `${amount} ${from.toUpperCase()} = ${converted} ${to.toUpperCase()}`;
      }
    }

    // Booking Tool
    class BookingTool extends Tool {
      name = 'booking_assistant';
      description = 'Simulate travel booking confirmations';

      async _call(details) {
        const bookingId = 'TRV' + Math.random().toString(36).substr(2, 6).toUpperCase();
        return `✅ Booking confirmed! ID: ${bookingId} | Details: ${details}`;
      }
    }

    this.tools = [new WeatherTool(), new CurrencyTool(), new BookingTool()];
    console.log('✅ Travel Tools initialized (Weather, Currency, Booking)');
  }

  // User Session Management (from Memory demo)
  getOrCreateUserSession(userId) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        id: userId,
        profile: {
          preferredBudget: null,
          travelStyle: null,
          favoriteDestinations: [],
          dietaryRestrictions: []
        },
        conversationHistory: [],
        memory: new BufferMemory({
          memoryKey: 'chat_history',
          returnMessages: true,
        }),
        createdAt: new Date()
      });
    }
    return this.userSessions.get(userId);
  }

  // Extract preferences from user input (from Memory demo)
  extractPreferences(input) {
    const preferences = {};
    
    // Budget extraction
    const budgetMatch = input.match(/\$(\d+(?:,\d+)?)/);
    if (budgetMatch) preferences.preferredBudget = budgetMatch[0];

    // Travel style extraction
    const styles = ['luxury', 'budget', 'adventure', 'cultural', 'romantic', 'family'];
    for (const style of styles) {
      if (input.toLowerCase().includes(style)) {
        preferences.travelStyle = style.charAt(0).toUpperCase() + style.slice(1);
        break;
      }
    }

    return preferences;
  }

  // Knowledge retrieval (from RAG demo)
  async retrieveKnowledge(query) {
    if (this.knowledgeBase && this.knowledgeBase.asRetriever) {
      try {
        const retriever = this.knowledgeBase.asRetriever({ k: 2 });
        const docs = await retriever.getRelevantDocuments(query);
        return docs.map(doc => doc.pageContent).join('\n\n');
      } catch (error) {
        console.log('Using fallback knowledge retrieval');
      }
    }
    
    // Fallback: simple keyword matching
    const relevantDocs = this.knowledgeBase.documents.filter(doc =>
      query.toLowerCase().split(' ').some(word => 
        doc.pageContent.toLowerCase().includes(word) || 
        doc.metadata.destination.toLowerCase().includes(word)
      )
    );
    return relevantDocs.slice(0, 2).map(doc => doc.pageContent).join('\n\n');
  }

  // Structured travel planning (from Structured Chain demo)
  async generateStructuredItinerary(destination, duration, budget, interests, groupSize) {
    const structuredPrompt = new PromptTemplate({
      template: `Create a detailed travel itinerary in JSON format:

Destination: {destination}
Duration: {duration}
Budget: {budget}
Interests: {interests}
Group: {groupSize}

Return a JSON object with this structure:
{{
  "destination": "destination name",
  "duration": "trip duration", 
  "totalBudget": "estimated total budget",
  "dailyItinerary": [
    {{
      "day": 1,
      "theme": "day theme",
      "activities": [
        {{
          "time": "HH:MM",
          "activity": "activity name",
          "location": "location",
          "cost": "cost estimate"
        }}
      ],
      "meals": {{
        "breakfast": "recommendation",
        "lunch": "recommendation",
        "dinner": "recommendation"
      }},
      "dailyBudget": "daily cost breakdown"
    }}
  ],
  "packingList": ["item1", "item2"],
  "culturalTips": ["tip1", "tip2"]
}}`,
      inputVariables: ['destination', 'duration', 'budget', 'interests', 'groupSize']
    });

    if (this.model) {
      try {
        const chain = RunnableSequence.from([
          structuredPrompt,
          this.model,
          new JsonOutputParser()
        ]);

        return await chain.invoke({
          destination, duration, budget, interests, groupSize
        });
      } catch (error) {
        console.log('Using fallback structured response');
      }
    }

    // Fallback structured response
    return {
      destination,
      duration,
      totalBudget: budget,
      dailyItinerary: [
        {
          day: 1,
          theme: `Exploring ${destination}`,
          activities: [
            {
              time: "09:00",
              activity: "City tour and main attractions",
              location: "City center",
              cost: "$50-80"
            }
          ],
          meals: {
            breakfast: "Local café",
            lunch: "Traditional restaurant",
            dinner: "Recommended local cuisine"
          },
          dailyBudget: "$120-180"
        }
      ],
      packingList: ["Comfortable shoes", "Camera", "Travel documents"],
      culturalTips: ["Research local customs", "Learn basic phrases", "Respect local traditions"]
    };
  }

  // Complete travel planning workflow
  async planTravel(userId, request) {
    console.log(`🎯 Planning travel for user ${userId}:`);
    console.log(`   Request: "${request}"`);
    console.log('');

    // Step 1: Get or create user session
    const session = this.getOrCreateUserSession(userId);
    console.log('✅ Step 1: User session retrieved');

    // Step 2: Extract and update preferences
    const newPreferences = this.extractPreferences(request);
    Object.assign(session.profile, newPreferences);
    console.log('✅ Step 2: Preferences extracted and updated');
    if (Object.keys(newPreferences).length > 0) {
      console.log(`   New preferences: ${JSON.stringify(newPreferences)}`);
    }

    // Step 3: Parse travel request
    const destination = this.extractDestination(request);
    const duration = this.extractDuration(request) || '3 days';
    const budget = session.profile.preferredBudget || '$150 per day';
    const interests = this.extractInterests(request) || 'sightseeing, culture';
    const groupSize = this.extractGroupSize(request) || '2 adults';

    console.log('✅ Step 3: Travel request parsed');
    console.log(`   Destination: ${destination}`);
    console.log(`   Duration: ${duration}`);
    console.log(`   Budget: ${budget}`);

    // Step 4: Retrieve relevant knowledge
    const knowledge = await this.retrieveKnowledge(`${destination} travel guide attractions culture`);
    console.log('✅ Step 4: Knowledge retrieved from travel database');

    // Step 5: Check weather and currency (using tools)
    let weatherInfo = 'Weather data unavailable';
    let currencyInfo = 'Currency data unavailable';
    
    try {
      weatherInfo = await this.tools[0]._call(destination);
      if (budget.includes('$')) {
        const amount = budget.match(/\$(\d+)/)?.[1] || '1000';
        currencyInfo = await this.tools[1]._call(`${amount} USD to EUR`);
      }
    } catch (error) {
      console.log('Using fallback tool data');
    }
    
    console.log('✅ Step 5: Tools executed (Weather, Currency)');

    // Step 6: Generate structured itinerary
    const itinerary = await this.generateStructuredItinerary(
      destination, duration, budget, interests, groupSize
    );
    console.log('✅ Step 6: Structured itinerary generated');

    // Step 7: Create comprehensive response
    const response = {
      userId,
      timestamp: new Date().toISOString(),
      userProfile: session.profile,
      travelPlan: {
        destination,
        duration,
        budget,
        interests,
        groupSize
      },
      knowledge: knowledge.substring(0, 300) + '...',
      currentConditions: {
        weather: weatherInfo,
        currency: currencyInfo
      },
      structuredItinerary: itinerary,
      recommendations: this.generatePersonalizedRecommendations(session.profile, destination),
      nextSteps: [
        'Review and customize your itinerary',
        'Book accommodations and flights',
        'Check visa requirements',
        'Purchase travel insurance'
      ]
    };

    // Step 8: Update conversation history
    session.conversationHistory.push({
      request,
      response: 'Comprehensive travel plan generated',
      timestamp: new Date()
    });

    console.log('✅ Step 7: Comprehensive response compiled');
    console.log('✅ Step 8: Conversation history updated');
    console.log('');

    return response;
  }

  // Helper methods for parsing user requests
  extractDestination(request) {
    const destinations = ['tokyo', 'paris', 'barcelona', 'costa rica', 'bali', 'new york'];
    for (const dest of destinations) {
      if (request.toLowerCase().includes(dest)) {
        return dest.charAt(0).toUpperCase() + dest.slice(1);
      }
    }
    return 'Paris'; // Default destination
  }

  extractDuration(request) {
    const durationMatch = request.match(/(\d+)\s*(day|week)/i);
    return durationMatch ? `${durationMatch[1]} ${durationMatch[2]}s` : null;
  }

  extractInterests(request) {
    const interests = [];
    const keywords = ['food', 'culture', 'adventure', 'art', 'history', 'nature', 'shopping', 'nightlife'];
    for (const keyword of keywords) {
      if (request.toLowerCase().includes(keyword)) {
        interests.push(keyword);
      }
    }
    return interests.length > 0 ? interests.join(', ') : null;
  }

  extractGroupSize(request) {
    const groupMatch = request.match(/(\d+)\s*(people|adults|person)/i);
    return groupMatch ? `${groupMatch[1]} ${groupMatch[2]}` : null;
  }

  generatePersonalizedRecommendations(profile, destination) {
    const recommendations = [];
    
    if (profile.travelStyle === 'Adventure') {
      recommendations.push('Consider adventure activities and outdoor experiences');
    } else if (profile.travelStyle === 'Luxury') {
      recommendations.push('Look for premium accommodations and fine dining');
    } else if (profile.travelStyle === 'Budget') {
      recommendations.push('Focus on free attractions and budget-friendly options');
    }

    recommendations.push(`Based on your interest in ${destination}, also consider nearby destinations`);
    recommendations.push('Book popular attractions in advance to avoid disappointment');

    return recommendations;
  }

  // Demo method to show complete workflow
  async demonstrateCompleteWorkflow() {
    console.log('🌟 SMART TRAVEL PLANNER: COMPLETE WORKFLOW DEMONSTRATION');
    console.log('='.repeat(70));
    console.log('Integrating: Prompts + Chains + Structured Output + RAG + Agents + Memory');
    console.log('');

    // Demo scenarios
    const scenarios = [
      {
        userId: 'user_alice',
        request: 'I want a 5-day adventure trip to Costa Rica with a $2000 budget for hiking and wildlife'
      },
      {
        userId: 'user_bob', 
        request: 'Plan a luxury romantic getaway to Paris for 3 days, budget is flexible'
      },
      {
        userId: 'user_alice', // Returning user
        request: 'What other adventure destinations would you recommend based on my preferences?'
      }
    ];

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`🎭 SCENARIO ${i + 1}: ${scenario.userId === 'user_alice' && i === 2 ? 'Returning User' : 'New Request'}`);
      console.log('='.repeat(50));
      
      try {
        const result = await this.planTravel(scenario.userId, scenario.request);
        
        console.log('📋 COMPREHENSIVE TRAVEL PLAN GENERATED:');
        console.log('');
        console.log(`👤 User Profile:`);
        console.log(`   Budget Preference: ${result.userProfile.preferredBudget || 'Not specified'}`);
        console.log(`   Travel Style: ${result.userProfile.travelStyle || 'Not specified'}`);
        console.log('');
        console.log(`🎯 Travel Plan:`);
        console.log(`   Destination: ${result.travelPlan.destination}`);
        console.log(`   Duration: ${result.travelPlan.duration}`);
        console.log(`   Budget: ${result.travelPlan.budget}`);
        console.log(`   Interests: ${result.travelPlan.interests}`);
        console.log('');
        console.log(`📚 Knowledge Retrieved:`);
        console.log(`   ${result.knowledge}`);
        console.log('');
        console.log(`🌤️ Current Conditions:`);
        console.log(`   Weather: ${result.currentConditions.weather}`);
        console.log(`   Currency: ${result.currentConditions.currency}`);
        console.log('');
        console.log(`📅 Structured Itinerary:`);
        console.log(`   Days Planned: ${result.structuredItinerary.dailyItinerary.length}`);
        console.log(`   Total Budget: ${result.structuredItinerary.totalBudget}`);
        console.log(`   Packing Items: ${result.structuredItinerary.packingList.length}`);
        console.log('');
        console.log(`💡 Personalized Recommendations:`);
        result.recommendations.forEach((rec, idx) => {
          console.log(`   ${idx + 1}. ${rec}`);
        });
        console.log('');
        console.log(`🚀 Next Steps:`);
        result.nextSteps.forEach((step, idx) => {
          console.log(`   ${idx + 1}. ${step}`);
        });
        
      } catch (error) {
        console.log(`❌ Error in scenario ${i + 1}: ${error.message}`);
      }
      
      console.log('');
      console.log('─'.repeat(70));
      console.log('');
    }

    // Show session analytics
    console.log('📊 SESSION ANALYTICS');
    console.log('='.repeat(30));
    console.log(`Total Active Sessions: ${this.userSessions.size}`);
    
    for (const [userId, session] of this.userSessions) {
      console.log(`👤 ${userId}:`);
      console.log(`   Conversations: ${session.conversationHistory.length}`);
      console.log(`   Profile Completeness: ${Object.values(session.profile).filter(v => v).length}/4 fields`);
      console.log(`   Last Active: ${session.conversationHistory[session.conversationHistory.length - 1]?.timestamp.toLocaleTimeString() || 'N/A'}`);
    }
    console.log('');

    // Workshop completion message
    console.log('🎓 WORKSHOP COMPLETION SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ All Components Successfully Integrated:');
    console.log('   📝 Advanced Prompt Templates with multiple variables');
    console.log('   🔗 Multi-step Chain workflows with data flow');
    console.log('   🏗️ Structured JSON output for production use');
    console.log('   📚 RAG Knowledge Base with semantic search');
    console.log('   🤖 Intelligent Agents with external tools');
    console.log('   🧠 Memory Management with user personalization');
    console.log('');
    console.log('🏆 CONGRATULATIONS!');
    console.log('You have successfully built a complete Smart Travel Planner');
    console.log('that demonstrates all essential AI application patterns!');
    console.log('');
    console.log('🚀 Ready for Production:');
    console.log('   • Add database persistence for user data');
    console.log('   • Integrate real travel APIs (weather, booking, etc.)');
    console.log('   • Build frontend interface for user interactions');
    console.log('   • Deploy to cloud infrastructure');
    console.log('   • Add monitoring, logging, and analytics');
  }
}

export async function smartTravelPlannerCompleteDemo() {
  console.log('🌍 SMART TRAVEL PLANNER: COMPLETE INTEGRATION DEMO');
  console.log('='.repeat(60));
  console.log('Workshop Capstone: All Components Working Together');
  console.log('');

  try {
    // Initialize the complete Smart Travel Planner
    const planner = new SmartTravelPlanner();
    await planner.initialize();

    // Run the complete workflow demonstration
    await planner.demonstrateCompleteWorkflow();

  } catch (error) {
    console.error('❌ Error in complete Smart Travel Planner demo:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute the demo when this file is run directly
(async () => {
  try {
    await smartTravelPlannerCompleteDemo();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
})();
