import dotenv from 'dotenv';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { JsonOutputParser, StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { Tool } from '@langchain/core/tools';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

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
    
    // Initialize AgentExecutor
    await this.initializeAgent();
    
    // Memory functionality removed for simplification
    console.log('✅ Memory functionality disabled for simplified implementation');
    
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
          'costa rica': '28°C, Tropical, Afternoon showers expected',
          'bali': '30°C, Humid, Tropical paradise weather',
          'new york': '15°C, Clear, Crisp autumn day'
        };
        return weatherData[destination.toLowerCase()] || '20°C, Variable conditions';
      }
    }

    // Currency Tool
    class CurrencyTool extends Tool {
      name = 'currency_converter';
      description = 'Convert currency for travel budgeting';

      async _call(query) {
        const rates = { 
          'usd_jpy': 150.25, 'usd_eur': 0.85, 'usd_gbp': 0.73,
          'usd_cad': 1.35, 'usd_aud': 1.52, 'usd_inr': 83.12
        };
        const match = query.match(/(\d+)\s*(\w+)\s*to\s*(\w+)/i);
        if (!match) return 'Format: "amount FROM_CURRENCY to TO_CURRENCY"';
        
        const [, amount, from, to] = match;
        const rate = rates[`${from.toLowerCase()}_${to.toLowerCase()}`] || 1.0;
        const converted = (parseFloat(amount) * rate).toFixed(2);
        return `${amount} ${from.toUpperCase()} = ${converted} ${to.toUpperCase()}`;
      }
    }

    // Restaurant Finder Tool (NEW)
    class RestaurantTool extends Tool {
      name = 'restaurant_finder';
      description = 'Find restaurants and dining recommendations for destinations';

      async _call(query) {
        const restaurants = {
          'tokyo': [
            'Sukiyabashi Jiro - World-famous sushi ($200-300)',
            'Ramen Yashichi - Authentic tonkotsu ramen ($15-20)',
            'Nabezo - All-you-can-eat shabu-shabu ($30-40)'
          ],
          'paris': [
            'Le Comptoir du Relais - Classic bistro ($40-60)',
            'L\'As du Fallafel - Best falafel in Marais ($8-12)',
            'Pierre Hermé - Macarons and pastries ($5-15)'
          ],
          'barcelona': [
            'Cal Pep - Traditional tapas bar ($25-35)',
            'Disfrutar - Michelin-starred innovation ($150-200)',
            'La Boqueria Market - Fresh local produce ($10-20)'
          ]
        };
        
        const destination = query.toLowerCase();
        const restaurantList = restaurants[destination] || [
          'Local family restaurant - Traditional cuisine ($20-30)',
          'Street food market - Authentic local flavors ($5-15)',
          'Rooftop dining - City views and international menu ($40-60)'
        ];
        
        return `🍽️ Restaurant recommendations for ${query}:\n${restaurantList.map(r => `• ${r}`).join('\n')}`;
      }
    }

    // Activity Recommender Tool (NEW)
    class ActivityTool extends Tool {
      name = 'activity_recommender';
      description = 'Recommend activities and attractions based on interests';

      async _call(query) {
        const [destination, interests] = query.split('|').map(s => s.trim());
        
        const activities = {
          'tokyo': {
            'culture': ['Visit Senso-ji Temple', 'Explore Tokyo National Museum', 'Traditional tea ceremony'],
            'food': ['Tsukiji Outer Market tour', 'Ramen tasting tour', 'Sake brewery visit'],
            'art': ['TeamLab Borderless', 'Mori Art Museum', 'Street art in Harajuku']
          },
          'paris': {
            'culture': ['Louvre Museum', 'Notre-Dame Cathedral', 'Versailles Palace'],
            'food': ['Cooking class in Le Marais', 'Wine tasting tour', 'Pastry workshop'],
            'art': ['Musée d\'Orsay', 'Montmartre artist district', 'Street art in Belleville']
          },
          'barcelona': {
            'culture': ['Sagrada Familia', 'Gothic Quarter walking tour', 'Flamenco show'],
            'food': ['Tapas crawl in El Born', 'Paella cooking class', 'Market tour'],
            'art': ['Picasso Museum', 'Park Güell', 'Street art in El Raval']
          }
        };
        
        const destActivities = activities[destination.toLowerCase()] || {
          'culture': ['Local cultural center', 'Historical walking tour', 'Traditional performance'],
          'food': ['Local food tour', 'Cooking class', 'Market visit'],
          'art': ['Local art museum', 'Gallery district', 'Street art tour']
        };
        
        const interestList = interests ? interests.split(',').map(i => i.trim().toLowerCase()) : ['culture'];
        let recommendations = [];
        
        interestList.forEach(interest => {
          if (destActivities[interest]) {
            recommendations.push(...destActivities[interest]);
          }
        });
        
        return `🎯 Activity recommendations for ${destination} (${interests}):\n${recommendations.slice(0, 5).map(a => `• ${a}`).join('\n')}`;
      }
    }

    // Budget Optimizer Tool (NEW)
    class BudgetTool extends Tool {
      name = 'budget_optimizer';
      description = 'Optimize budget allocation for travel expenses';

      async _call(query) {
        const [budget, duration, destination] = query.split('|').map(s => s.trim());
        const dailyBudget = parseFloat(budget.replace(/[^0-9.]/g, ''));
        const days = parseInt(duration.match(/\d+/)?.[0] || '3');
        const totalBudget = dailyBudget * days;
        
        const budgetBreakdown = {
          accommodation: Math.round(totalBudget * 0.35),
          food: Math.round(totalBudget * 0.25),
          activities: Math.round(totalBudget * 0.20),
          transportation: Math.round(totalBudget * 0.15),
          miscellaneous: Math.round(totalBudget * 0.05)
        };
        
        return `💰 Budget optimization for ${destination} (${duration}, $${dailyBudget}/day):\n` +
               `• Total Budget: $${totalBudget}\n` +
               `• Accommodation (35%): $${budgetBreakdown.accommodation}\n` +
               `• Food & Dining (25%): $${budgetBreakdown.food}\n` +
               `• Activities (20%): $${budgetBreakdown.activities}\n` +
               `• Transportation (15%): $${budgetBreakdown.transportation}\n` +
               `• Miscellaneous (5%): $${budgetBreakdown.miscellaneous}`;
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

    this.tools = [
      new WeatherTool(), 
      new CurrencyTool(), 
      new RestaurantTool(), 
      new ActivityTool(), 
      new BudgetTool(), 
      new BookingTool()
    ];
    console.log('✅ Enhanced Travel Tools initialized (Weather, Currency, Restaurants, Activities, Budget, Booking)');
  }

  // Initialize AgentExecutor for proper agent-based execution
  async initializeAgent() {
    console.log('🤖 Initializing AgentExecutor...');

    try {
      // Create a proper ReAct prompt template
      const agentPrompt = PromptTemplate.fromTemplate(
        `Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}`
      );

      // Create the ReAct agent
      const agent = await createReactAgent({
        llm: this.model,
        tools: this.tools,
        prompt: agentPrompt
      });

      // Create the AgentExecutor with better configuration
      this.agentExecutor = new AgentExecutor({
        agent,
        tools: this.tools,
        verbose: true,
        maxIterations: 10,
        returnIntermediateSteps: true,
        handleParsingErrors: true
      });

      console.log('✅ AgentExecutor initialized with ReAct agent');
    } catch (error) {
      console.log('⚠️  AgentExecutor initialization failed:', error.message);
      console.log('   Falling back to direct tool calls');
    }
  }

  // Extract budget from user input
  extractBudget(input) {
    const budgetMatch = input.match(/\$(\d+(?:,\d+)?)/);
    return budgetMatch ? budgetMatch[0] + ' per day' : null;
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
    // Define structured output schema using Zod
    const itinerarySchema = z.object({
      destination: z.string().describe('Destination name'),
      duration: z.string().describe('Trip duration'),
      totalBudget: z.string().describe('Total estimated budget'),
      dailyItinerary: z.array(z.object({
        day: z.number().describe('Day number'),
        activities: z.array(z.string()).describe('List of activities for the day'),
        meals: z.array(z.string()).describe('Meal recommendations'),
        estimatedCost: z.string().describe('Estimated daily cost')
      })),
      packingList: z.array(z.string()).describe('Essential items to pack'),
      importantNotes: z.array(z.string()).describe('Important travel notes and tips')
    });

    // Create output parser
    const parser = new JsonOutputParser({ schema: itinerarySchema });

    const structuredPrompt = new PromptTemplate({
      template: `Create a detailed travel itinerary for the following trip:

Destination: {destination}
Duration: {duration}
Budget: {budget}
Interests: {interests}
Group: {groupSize}

Provide a comprehensive travel plan with daily activities, meals, packing list, and important notes.

{format_instructions}`,
      inputVariables: ['destination', 'duration', 'budget', 'interests', 'groupSize', 'format_instructions']
    });

    if (this.model) {
      try {
        const chain = RunnableSequence.from([
          structuredPrompt,
          this.model,
          parser
        ]);

        return await chain.invoke({
          destination, duration, budget, interests, groupSize,
          format_instructions: parser.getFormatInstructions()
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
          activities: [
            `Morning: Explore ${destination} city center and main attractions`,
            `Afternoon: Visit local markets and cultural sites`,
            `Evening: Enjoy traditional ${destination} cuisine`
          ],
          meals: [
            "Breakfast at local café",
            "Lunch at traditional restaurant", 
            "Dinner featuring local specialties"
          ],
          estimatedCost: budget || "$120-150"
        }
      ],
      packingList: [
        "Comfortable walking shoes",
        "Camera for sightseeing",
        "Weather-appropriate clothing",
        "Travel documents and ID",
        "Portable phone charger"
      ],
      importantNotes: [
        `Check visa requirements for ${destination}`,
        "Research local customs and etiquette",
        "Book accommodations in advance",
        "Keep emergency contacts handy"
      ]
    };
  }

  // Complete travel planning workflow (simplified - no session management)
  async planTravel(userId, request) {
    console.log(`🎯 Planning travel for user ${userId}:`);
    console.log(`   Request: "${request}"`);
    console.log('');

    // Step 1: Parse travel request directly
    const destination = this.extractDestination(request);
    const duration = this.extractDuration(request) || '3 days';
    const budget = this.extractBudget(request) || '$150 per day';
    const interests = this.extractInterests(request) || 'sightseeing, culture';
    const groupSize = this.extractGroupSize(request) || '2 adults';

    console.log('✅ Step 1: Travel request parsed');
    console.log(`   Destination: ${destination}`);
    console.log(`   Duration: ${duration}`);
    console.log(`   Budget: ${budget}`);
    console.log(`   Interests: ${interests}`);
    console.log(`   Group Size: ${groupSize}`);

    // Step 2: Retrieve relevant knowledge
    const knowledge = await this.retrieveKnowledge(`${destination} travel guide attractions culture`);
    console.log('✅ Step 2: Knowledge retrieved from travel database');

    // Step 5: Use AgentExecutor for proper agent-based execution
    let agentResults = {
      weatherInfo: 'Weather data unavailable',
      currencyInfo: 'Currency data unavailable', 
      restaurantInfo: 'Restaurant data unavailable',
      activityInfo: 'Activity data unavailable',
      budgetInfo: 'Budget data unavailable',
      bookingInfo: 'Booking assistance available'
    };
    
    if (this.agentExecutor) {
      try {
        console.log('🤖 Using AgentExecutor for intelligent travel planning...');
        console.log(`   🎯 Agent analyzing: ${destination}, ${duration}, ${budget}, interests: ${interests}`);
        
        // Create a comprehensive travel planning request for the agent
        const agentInput = `Plan a comprehensive travel experience for:
- Destination: ${destination}
- Duration: ${duration}
- Budget: ${budget}
- Interests: ${interests}
- Group size: ${groupSize}

Please use the available tools to gather weather information, currency details, restaurant recommendations, activity suggestions, budget optimization, and booking assistance as appropriate for this request.`;
        
        // Execute the agent with the travel planning request
        const agentResponse = await this.agentExecutor.invoke({
          input: agentInput
        });
        
        console.log('🤖 AgentExecutor completed travel planning');
        console.log('   Agent output:', agentResponse.output);
        
        // Parse agent results from intermediate steps
        if (agentResponse.intermediateSteps && agentResponse.intermediateSteps.length > 0) {
          console.log(`   Tools used: ${agentResponse.intermediateSteps.length} tool calls`);
          
          agentResponse.intermediateSteps.forEach((step, index) => {
            const toolName = step.action.tool;
            const toolInput = step.action.toolInput;
            const toolOutput = step.observation;
            
            console.log(`   Tool ${index + 1}: ${toolName} -> ${toolOutput.substring(0, 50)}...`);
            
            // Map tool outputs to result structure
            if (toolName === 'weather_checker') {
              agentResults.weatherInfo = toolOutput;
            } else if (toolName === 'currency_converter') {
              agentResults.currencyInfo = toolOutput;
            } else if (toolName === 'restaurant_finder') {
              agentResults.restaurantInfo = toolOutput;
            } else if (toolName === 'activity_recommender') {
              agentResults.activityInfo = toolOutput;
            } else if (toolName === 'budget_optimizer') {
              agentResults.budgetInfo = toolOutput;
            } else if (toolName === 'booking_assistant') {
              agentResults.bookingInfo = toolOutput;
            }
          });
        }
        
        // Store the agent's final response for reference
        agentResults.agentResponse = agentResponse.output;
        
      } catch (error) {
        console.log('⚠️ AgentExecutor failed, using direct tool calls:', error.message);
        // Fallback to direct tool calls to ensure we get dynamic data
        try {
          console.log('🔧 Using direct tool calls for dynamic data...');
          
          // Always get weather
          agentResults.weatherInfo = await this.tools[0]._call(destination);
          console.log('   ✅ Weather tool called directly');
          
          // Get currency if budget specified
          if (budget.includes('$')) {
            const amount = budget.match(/\$([0-9]+)/)?.[1] || '200';
            agentResults.currencyInfo = await this.tools[1]._call(`${amount} USD to EUR`);
            console.log('   ✅ Currency tool called directly');
          }
          
          // Get restaurants if food interest
          if (interests.toLowerCase().includes('food') || interests.toLowerCase().includes('culinary')) {
            agentResults.restaurantInfo = await this.tools[2]._call(destination);
            console.log('   ✅ Restaurant tool called directly');
          }
          
          // Get activities for interests
          if (interests && interests !== 'sightseeing, culture') {
            agentResults.activityInfo = await this.tools[3]._call(`${destination}|${interests}`);
            console.log('   ✅ Activity tool called directly');
          }
          
          // Get budget optimization
          if (budget.includes('$') && duration) {
            agentResults.budgetInfo = await this.tools[4]._call(`${budget}|${duration}|${destination}`);
            console.log('   ✅ Budget tool called directly');
          }
          
          // Get booking for groups or long trips
          const groupNum = parseInt(groupSize.match(/\d+/)?.[0] || '1');
          const tripDays = parseInt(duration.match(/\d+/)?.[0] || '3');
          if (groupNum > 2 || tripDays > 3) {
            agentResults.bookingInfo = await this.tools[5]._call(`${groupSize} group booking for ${destination}, ${duration}`);
            console.log('   ✅ Booking tool called directly');
          }
          
          agentResults.agentResponse = `Dynamic travel plan generated using direct tool calls for ${destination}`;
          
        } catch (toolError) {
          console.log('⚠️ Direct tool calls failed, using simulation data:', toolError.message);
        }
      }
    } else {
      // Simulation mode - use mock data with dynamic content
      console.log('🤖 Running in simulation mode (no AgentExecutor)');
      agentResults.weatherInfo = `${destination}: Pleasant weather, 22°C, partly cloudy`;
      agentResults.currencyInfo = budget.includes('$') ? '1 USD = 0.85 EUR (simulated)' : 'Currency conversion available';
      agentResults.restaurantInfo = `🍽️ Restaurant recommendations for ${destination}:\n• Local specialty restaurant - Traditional cuisine ($20-30)`;
      agentResults.activityInfo = `🎯 Activity recommendations for ${destination} (${interests}):\n• Cultural walking tour\n• Local market visit`;
      agentResults.budgetInfo = `💰 Budget optimization for ${destination} (${duration}, simulation mode)`;
      agentResults.agentResponse = `Simulated comprehensive travel plan for ${destination}`;
    }
    
    // Create response object with agent results
    const response = {
      userId,
      timestamp: new Date().toISOString(),
      travelPlan: {
        destination,
        duration,
        budget,
        interests,
        groupSize
      },
      knowledge: knowledge.substring(0, 300) + '...',
      currentConditions: {
        weather: agentResults.weatherInfo,
        currency: agentResults.currencyInfo,
        restaurants: agentResults.restaurantInfo,
        activities: agentResults.activityInfo,
        budgetBreakdown: agentResults.budgetInfo,
        booking: agentResults.bookingInfo
      },
      structuredItinerary: {
        destination,
        duration,
        totalBudget: budget,
        dailyItinerary: [{
          day: 1,
          activities: [`Explore ${destination} based on ${interests}`],
          meals: ['Local breakfast', 'Traditional lunch', 'Authentic dinner'],
          estimatedCost: budget
        }],
        packingList: ['Comfortable shoes', 'Camera', 'Travel documents'],
        importantNotes: [`Check visa requirements for ${destination}`]
      },
      recommendations: [
        'Review and customize your itinerary',
        'Book accommodations and flights in advance',
        'Check visa requirements for your destination',
        'Consider purchasing travel insurance'
      ],
      agentResponse: agentResults.agentResponse || 'Travel plan generated successfully'
    };

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
    
    console.log('🎯 Smart Travel Planner initialized and ready!');
    console.log('The planner is now ready to process real requests from the frontend form.');
  } catch (error) {
    console.error('❌ Error in complete Smart Travel Planner demo:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Export the SmartTravelPlanner class for API usage
export { SmartTravelPlanner };
export default SmartTravelPlanner;

// Execute the demo when this file is run directly
(async () => {
  try {
    await smartTravelPlannerCompleteDemo();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
})();
