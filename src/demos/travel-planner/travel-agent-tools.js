import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { Tool } from '@langchain/core/tools';
import { PromptTemplate } from '@langchain/core/prompts';

// Custom Travel Tools
class WeatherTool extends Tool {
  name = 'weather_checker';
  description = 'Get current weather conditions and forecast for a travel destination. Input should be a city name.';

  async _call(destination) {
    // Simulate weather API call with realistic data
    const weatherData = {
      'tokyo': { temp: '22°C', condition: 'Partly Cloudy', humidity: '65%', forecast: 'Sunny next 3 days' },
      'paris': { temp: '18°C', condition: 'Light Rain', humidity: '78%', forecast: 'Clearing up tomorrow' },
      'barcelona': { temp: '25°C', condition: 'Sunny', humidity: '55%', forecast: 'Perfect weather ahead' },
      'costa rica': { temp: '28°C', condition: 'Tropical', humidity: '85%', forecast: 'Afternoon showers expected' },
      'bali': { temp: '30°C', condition: 'Hot & Humid', humidity: '80%', forecast: 'Typical tropical weather' },
      'new york': { temp: '15°C', condition: 'Cool', humidity: '60%', forecast: 'Getting warmer this week' }
    };

    const city = destination.toLowerCase();
    const weather = weatherData[city] || { 
      temp: '20°C', 
      condition: 'Variable', 
      humidity: '70%', 
      forecast: 'Check local weather services' 
    };

    return `Weather in ${destination}:
🌡️ Temperature: ${weather.temp}
🌤️ Condition: ${weather.condition}
💧 Humidity: ${weather.humidity}
📅 Forecast: ${weather.forecast}`;
  }
}

class CurrencyTool extends Tool {
  name = 'currency_converter';
  description = 'Get exchange rates and convert currency for travel budgeting. Input format: "amount FROM_CURRENCY to TO_CURRENCY"';

  async _call(query) {
    // Simulate currency API with realistic exchange rates
    const rates = {
      'usd_jpy': 150.25, 'usd_eur': 0.85, 'usd_gbp': 0.73, 'usd_cad': 1.35,
      'eur_usd': 1.18, 'eur_jpy': 177.30, 'gbp_usd': 1.37, 'jpy_usd': 0.0067
    };

    const match = query.match(/(\d+)\s*(\w+)\s*to\s*(\w+)/i);
    if (!match) {
      return 'Please use format: "amount FROM_CURRENCY to TO_CURRENCY" (e.g., "100 USD to EUR")';
    }

    const [, amount, fromCurrency, toCurrency] = match;
    const rateKey = `${fromCurrency.toLowerCase()}_${toCurrency.toLowerCase()}`;
    const rate = rates[rateKey] || 1.0;
    const convertedAmount = (parseFloat(amount) * rate).toFixed(2);

    return `💱 Currency Conversion:
${amount} ${fromCurrency.toUpperCase()} = ${convertedAmount} ${toCurrency.toUpperCase()}
📊 Exchange Rate: 1 ${fromCurrency.toUpperCase()} = ${rate} ${toCurrency.toUpperCase()}
💡 Tip: Rates fluctuate daily, check current rates before traveling`;
  }
}

class DistanceTool extends Tool {
  name = 'distance_calculator';
  description = 'Calculate travel distance and estimated time between two locations. Input format: "FROM_CITY to TO_CITY"';

  async _call(query) {
    // Simulate distance calculations with realistic data
    const distances = {
      'tokyo_paris': { distance: '9,720 km', flight: '12h 30m', cost: '$800-1200' },
      'paris_barcelona': { distance: '830 km', flight: '1h 45m', train: '6h 30m', cost: '$150-400' },
      'new york_tokyo': { distance: '10,850 km', flight: '14h 20m', cost: '$900-1500' },
      'barcelona_costa rica': { distance: '8,900 km', flight: '11h 45m', cost: '$700-1100' },
      'tokyo_bali': { distance: '5,800 km', flight: '7h 15m', cost: '$400-800' }
    };

    const match = query.match(/(\w+(?:\s+\w+)*)\s+to\s+(\w+(?:\s+\w+)*)/i);
    if (!match) {
      return 'Please use format: "FROM_CITY to TO_CITY" (e.g., "Tokyo to Paris")';
    }

    const [, fromCity, toCity] = match;
    const routeKey = `${fromCity.toLowerCase().replace(/\s+/g, '_')}_${toCity.toLowerCase().replace(/\s+/g, '_')}`;
    const route = distances[routeKey] || { 
      distance: '~5,000 km', 
      flight: '~8h', 
      cost: '$500-900' 
    };

    return `✈️ Travel Distance: ${fromCity} to ${toCity}
📏 Distance: ${route.distance}
⏱️ Flight Time: ${route.flight}
${route.train ? `🚄 Train Time: ${route.train}` : ''}
💰 Estimated Cost: ${route.cost}`;
  }
}

class RecommendationTool extends Tool {
  name = 'travel_recommender';
  description = 'Get personalized travel recommendations based on interests and travel style. Input: "destination, interests, travel_style"';

  async _call(query) {
    const recommendations = {
      'cultural': ['Visit museums and galleries', 'Explore historic districts', 'Attend cultural performances', 'Try traditional cuisine'],
      'adventure': ['Outdoor activities and hiking', 'Water sports and diving', 'Mountain climbing', 'Wildlife encounters'],
      'romantic': ['Sunset viewpoints', 'Intimate restaurants', 'Couples activities', 'Scenic walks'],
      'family': ['Kid-friendly attractions', 'Interactive museums', 'Parks and playgrounds', 'Family restaurants'],
      'business': ['Business districts', 'Conference centers', 'Professional networking events', 'Efficient transportation']
    };

    const parts = query.split(',').map(part => part.trim().toLowerCase());
    const [destination, interests, travelStyle] = parts;

    const styleRecs = recommendations[travelStyle] || recommendations['cultural'];
    const baseRecs = styleRecs.slice(0, 3);

    return `🎯 Personalized Recommendations for ${destination}:

Based on your interests (${interests}) and ${travelStyle} travel style:

${baseRecs.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

💡 Pro Tips:
• Book popular attractions in advance
• Learn basic local phrases
• Check local customs and etiquette
• Consider travel insurance`;
  }
}

class BookingTool extends Tool {
  name = 'booking_assistant';
  description = 'Simulate booking confirmation for flights, hotels, or activities. Input: "type, destination, dates, details"';

  async _call(query) {
    const parts = query.split(',').map(part => part.trim());
    const [type, destination, dates, details] = parts;

    const bookingId = 'TRV' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const confirmationNumber = 'CNF' + Math.random().toString(36).substr(2, 6).toUpperCase();

    return `✅ Booking Simulation Successful!

📋 Booking Details:
• Type: ${type}
• Destination: ${destination}
• Dates: ${dates}
• Details: ${details}

🎫 Confirmation:
• Booking ID: ${bookingId}
• Confirmation: ${confirmationNumber}
• Status: CONFIRMED

📧 Next Steps:
• Check-in online 24 hours before
• Bring valid ID and confirmation
• Review cancellation policy
• Download mobile tickets if available

⚠️ Note: This is a demo simulation only!`;
  }
}

export async function travelAgentToolsDemo() {
  console.log('🤖 Smart Travel Planner: Travel Agent with Tools');
  console.log('='.repeat(60));
  console.log('Workshop Session 4: Building Intelligent Travel Agents');
  console.log('');

  try {
    // Initialize tools
    const tools = [
      new WeatherTool(),
      new CurrencyTool(),
      new DistanceTool(),
      new RecommendationTool(),
      new BookingTool()
    ];

    console.log('🛠️ Travel Agent Tools Initialized:');
    tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}: ${tool.description.split('.')[0]}`);
    });
    console.log('');

    // Demo tool usage without agent (for educational purposes)
    console.log('🔧 Demo 1: Individual Tool Testing');
    console.log('='.repeat(50));

    console.log('🌤️ Weather Tool Demo:');
    const weatherResult = await tools[0]._call('Tokyo');
    console.log(weatherResult);
    console.log('');

    console.log('💱 Currency Tool Demo:');
    const currencyResult = await tools[1]._call('1000 USD to JPY');
    console.log(currencyResult);
    console.log('');

    console.log('✈️ Distance Tool Demo:');
    const distanceResult = await tools[2]._call('Tokyo to Paris');
    console.log(distanceResult);
    console.log('');

    console.log('🎯 Recommendation Tool Demo:');
    const recResult = await tools[3]._call('Tokyo, temples and food, cultural');
    console.log(recResult);
    console.log('');

    // Agent execution with tools
    if (process.env.OPENAI_API_KEY) {
      console.log('🤖 Demo 2: Intelligent Travel Agent');
      console.log('='.repeat(50));

      const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo',
      });

      // Create ReAct agent prompt
      const agentPrompt = PromptTemplate.fromTemplate(`
You are a professional travel planning agent with access to specialized tools. 
Help users plan their trips by using the available tools to gather information and make recommendations.

Available tools: {tools}
Tool names: {tool_names}

Use the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Question: {input}
Thought: {agent_scratchpad}
`);

      try {
        // Create and configure agent
        const agent = await createReactAgent({
          llm: model,
          tools,
          prompt: agentPrompt,
        });

        const agentExecutor = new AgentExecutor({
          agent,
          tools,
          verbose: true,
          maxIterations: 5,
        });

        // Test agent with travel planning scenarios
        const travelQueries = [
          'I want to visit Tokyo in spring. Check the weather, convert 2000 USD to JPY, and give me cultural recommendations.',
          'Plan a romantic trip to Paris. What\'s the weather like and what romantic activities do you recommend?',
          'I\'m planning a business trip from New York to Tokyo. Calculate the distance and flight time.'
        ];

        for (const query of travelQueries) {
          console.log(`🎯 Travel Query: "${query}"`);
          console.log('-'.repeat(40));
          
          try {
            const result = await agentExecutor.invoke({
              input: query
            });
            
            console.log('🤖 Agent Response:');
            console.log(result.output);
            console.log('');
          } catch (error) {
            console.log(`❌ Agent error: ${error.message}`);
            console.log('');
          }
        }
      } catch (error) {
        console.log(`❌ Agent setup error: ${error.message}`);
        console.log('');
      }
    } else {
      console.log('🤖 Demo 2: Agent Simulation (requires OpenAI API key)');
      console.log('='.repeat(50));
      console.log('');
      console.log('💡 Agent Demo Examples:');
      console.log('');
      console.log('🎯 Query: "Plan a trip to Tokyo, check weather and currency"');
      console.log('🤖 Agent Process:');
      console.log('   1. Thought: I need to check Tokyo weather and currency rates');
      console.log('   2. Action: weather_checker → Tokyo weather info');
      console.log('   3. Action: currency_converter → USD to JPY rates');
      console.log('   4. Final Answer: Comprehensive Tokyo travel plan with weather and budget');
      console.log('');
      console.log('🎯 Query: "Romantic Paris trip recommendations"');
      console.log('🤖 Agent Process:');
      console.log('   1. Thought: Need romantic recommendations for Paris');
      console.log('   2. Action: travel_recommender → Romantic Paris activities');
      console.log('   3. Action: weather_checker → Paris weather conditions');
      console.log('   4. Final Answer: Romantic Paris itinerary with weather considerations');
      console.log('');
    }

    // Workshop Learning Summary
    console.log('🎓 Workshop Learning Summary');
    console.log('='.repeat(60));
    console.log('');
    
    console.log('✅ Key Agent Concepts Learned:');
    console.log('   • Tool-based agent architecture');
    console.log('   • ReAct (Reasoning + Acting) pattern');
    console.log('   • Multi-step decision making');
    console.log('   • External API integration simulation');
    console.log('   • Agent executor and tool orchestration');
    console.log('');

    console.log('🔧 Agent Architecture Components:');
    console.log('   • Custom Tool classes with specific functions');
    console.log('   • LLM-powered reasoning and decision making');
    console.log('   • Agent executor for tool orchestration');
    console.log('   • Structured prompt templates for agent behavior');
    console.log('   • Error handling and fallback mechanisms');
    console.log('');

    console.log('🚀 Advanced Agent Patterns:');
    console.log('   • Multi-agent collaboration systems');
    console.log('   • Tool selection and optimization');
    console.log('   • Memory integration for context retention');
    console.log('   • Real-time API integration');
    console.log('   • Agent performance monitoring and logging');
    console.log('');

    console.log('💡 Workshop Exercise Ideas:');
    console.log('   • Create additional travel tools (reviews, photos, etc.)');
    console.log('   • Build specialized agents for different travel types');
    console.log('   • Implement real API integrations');
    console.log('   • Add error handling and retry mechanisms');
    console.log('   • Design multi-agent travel planning systems');
    console.log('');

    console.log('🔮 Next Workshop Sessions:');
    console.log('   5. Memory: Remember user preferences and conversation history');
    console.log('   6. Production: Deploy your complete Smart Travel Planner');
    console.log('');

    console.log('🎯 Complete Smart Travel Planner Architecture:');
    console.log('   Prompts → Chains → Knowledge Base → Agents → Memory → Production');

  } catch (error) {
    console.error('❌ Error in travel agent tools demo:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute the demo when this file is run directly
(async () => {
  try {
    await travelAgentToolsDemo();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
})();
