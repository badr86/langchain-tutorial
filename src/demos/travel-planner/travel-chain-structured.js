import dotenv from 'dotenv';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

// Load environment variables
dotenv.config();

export async function travelChainStructuredDemo() {
  console.log('🏗️ Smart Travel Planner: Structured Output Chain');
  console.log('='.repeat(60));
  console.log('Workshop Session 2B: Building Chains with Structured Output');
  console.log('');

  try {
    // Define structured output schemas using Zod
    const destinationAnalysisSchema = z.object({
      destination: z.string().describe('The destination name'),
      bestTimeToVisit: z.object({
        months: z.array(z.string()).describe('Best months to visit'),
        season: z.string().describe('Best season'),
        weather: z.string().describe('Expected weather conditions')
      }),
      budgetAnalysis: z.object({
        feasibility: z.enum(['Low', 'Medium', 'High']).describe('Budget feasibility'),
        dailyBudget: z.object({
          budget: z.string().describe('Recommended daily budget range'),
          accommodation: z.string().describe('Accommodation cost range'),
          food: z.string().describe('Food cost range'),
          activities: z.string().describe('Activities cost range')
        })
      }),
      topAttractions: z.array(z.object({
        name: z.string().describe('Attraction name'),
        type: z.string().describe('Type of attraction'),
        estimatedCost: z.string().describe('Estimated cost'),
        timeNeeded: z.string().describe('Time needed to visit')
      })).length(3).describe('Top 3 must-see attractions'),
      transportation: z.object({
        primary: z.string().describe('Primary transportation method'),
        cost: z.string().describe('Transportation cost estimate'),
        tips: z.array(z.string()).describe('Transportation tips')
      })
    });

    const itinerarySchema = z.object({
      destination: z.string().describe('Destination name'),
      duration: z.string().describe('Trip duration'),
      totalBudget: z.string().describe('Total estimated budget'),
      dailyItinerary: z.array(z.object({
        day: z.number().describe('Day number'),
        theme: z.string().describe('Day theme or focus'),
        activities: z.array(z.object({
          time: z.string().describe('Activity time'),
          activity: z.string().describe('Activity name'),
          location: z.string().describe('Activity location'),
          cost: z.string().describe('Estimated cost'),
          duration: z.string().describe('Activity duration')
        })),
        meals: z.object({
          breakfast: z.string().describe('Breakfast recommendation'),
          lunch: z.string().describe('Lunch recommendation'),
          dinner: z.string().describe('Dinner recommendation')
        }),
        dailyBudget: z.string().describe('Daily budget breakdown'),
        tips: z.array(z.string()).describe('Daily tips and recommendations')
      })),
      packingList: z.array(z.string()).describe('Essential items to pack'),
      culturalTips: z.array(z.string()).describe('Cultural etiquette and tips'),
      emergencyInfo: z.object({
        embassy: z.string().describe('Embassy contact info'),
        emergency: z.string().describe('Emergency numbers'),
        hospitals: z.array(z.string()).describe('Nearby hospitals')
      })
    });

    console.log('📋 Structured Output Schemas Defined:');
    console.log('   🔍 Destination Analysis Schema: 5 main sections with nested objects');
    console.log('   📅 Itinerary Schema: Complete trip plan with daily breakdown');
    console.log('   ✅ Type Safety: Zod validation ensures consistent output format');
    console.log('');

    // Create output parsers
    const analysisParser = new JsonOutputParser({ schema: destinationAnalysisSchema });
    const itineraryParser = new JsonOutputParser({ schema: itinerarySchema });

    // Step 1: Structured Destination Analysis Prompt
    const structuredAnalysisPrompt = new PromptTemplate({
      template: `You are a professional travel analyst. Analyze the destination and provide a comprehensive structured analysis.

Destination: {destination}
Budget: {budget}
Travel Style: {travelStyle}

IMPORTANT: You must respond with ONLY valid JSON using EXACTLY these field names:
- destination: string
- bestTimeToVisit: object with months (array), season (string), weather (string)
- budgetAnalysis: object with feasibility ("Low"|"Medium"|"High"), dailyBudget object
- topAttractions: array of exactly 3 attraction objects
- transportation: object with primary, cost, tips array

Do not use any other field names. Follow this structure exactly:

{analysis_format_instructions}

Return ONLY the JSON object with these exact field names, nothing else.`,
      inputVariables: ['destination', 'budget', 'travelStyle', 'analysis_format_instructions']
    });

    // Step 2: Structured Itinerary Generation Prompt
    const structuredItineraryPrompt = new PromptTemplate({
      template: `You are an expert travel planner. Based on the destination analysis, create a detailed structured itinerary.

Destination Analysis:
{analysis}

Trip Details:
- Duration: {duration}
- Interests: {interests}
- Group Size: {groupSize}

IMPORTANT: You must respond with ONLY valid JSON using EXACTLY these field names:
- destination: string
- duration: string
- totalBudget: string
- dailyItinerary: array of day objects with day, theme, activities, meals, dailyBudget, tips
- packingList: array of strings
- culturalTips: array of strings
- emergencyInfo: object with embassy, emergency, hospitals

Do not use any other field names like "itinerary" wrapper. Follow this structure exactly:

{itinerary_format_instructions}

Return ONLY the JSON object with these exact field names, nothing else.`,
      inputVariables: ['analysis', 'duration', 'destination', 'interests', 'groupSize', 'itinerary_format_instructions']
    });

    console.log('✅ Structured Prompts Created:');
    console.log('   📊 Analysis Prompt: Enforces JSON structure with specific fields');
    console.log('   📅 Itinerary Prompt: Creates detailed daily breakdown with activities');
    console.log('');

    // Initialize OpenAI model
    let model = null;
    let structuredChain = null;

    if (process.env.OPENAI_API_KEY) {
      model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3,  // Lower temperature for more consistent JSON
        maxTokens: 3000,   // Increased tokens for complex structured output
        modelName: 'gpt-3.5-turbo'
      });

      // Let's start with JUST the analysis chain to debug step by step
      const analysisChain = RunnableSequence.from([
        {
          destination: (input) => input.destination,
          budget: (input) => input.budget,
          travelStyle: (input) => input.travelStyle,
          analysis_format_instructions: () => analysisParser.getFormatInstructions()
        },
        structuredAnalysisPrompt,
        model,
        analysisParser
      ]);

      // Create itinerary chain
      const itineraryChain = RunnableSequence.from([
        {
          destination: (input) => input.destination,
          duration: (input) => input.duration,
          interests: (input) => input.interests,
          groupSize: (input) => input.groupSize,
          analysis: (input) => input.analysis,
          itinerary_format_instructions: () => itineraryParser.getFormatInstructions()
        },
        structuredItineraryPrompt,
        model,
        itineraryParser
      ]);

      // Now test both chains together
      structuredChain = {
        invoke: async (input) => {
          console.log('🔍 Debug: Input received:', JSON.stringify(input, null, 2));
          
          // Step 1: Run analysis chain
          console.log('🔄 Running analysis chain...');
          const analysis = await analysisChain.invoke(input);
          
          console.log('✅ Analysis result:', JSON.stringify(analysis, null, 2));
          
          // Step 2: Run itinerary chain using analysis
          console.log('🔄 Running itinerary chain...');
          const itinerary = await itineraryChain.invoke({
            destination: input.destination,
            duration: input.duration,
            interests: input.interests,
            groupSize: input.groupSize,
            analysis: JSON.stringify(analysis, null, 2)
          });
          
          console.log('✅ Itinerary result:', JSON.stringify(itinerary, null, 2));
          
          return itinerary;
        }
      };

      console.log('🤖 AI Model and Structured Chain Initialized');
      console.log('🔗 Chain Components: Analysis → JSON Parse → Itinerary → JSON Parse');
      console.log('');
    } else {
      console.log('⚠️  OpenAI API key not found.');
      console.log('💡 Set OPENAI_API_KEY environment variable to run live structured demos.');
      console.log('');
    }
/*
    // Demo 1: Structured Output Examples
    console.log('🏗️ Demo 1: Structured Output Examples');
    console.log('='.repeat(50));

    // Show example structured outputs
    const exampleAnalysis = {
      destination: "Kyoto, Japan",
      bestTimeToVisit: {
        months: ["March", "April", "May", "September", "October", "November"],
        season: "Spring (Cherry Blossoms) or Autumn (Fall Colors)",
        weather: "Mild temperatures, low humidity, clear skies"
      },
      budgetAnalysis: {
        feasibility: "Medium",
        dailyBudget: {
          budget: "$120-180 per day",
          accommodation: "$60-100 (ryokan/hotel)",
          food: "$30-50 (traditional cuisine)",
          activities: "$20-30 (temples, gardens)"
        }
      },
      topAttractions: [
        {
          name: "Fushimi Inari Shrine",
          type: "Religious/Cultural",
          estimatedCost: "Free",
          timeNeeded: "2-3 hours"
        },
        {
          name: "Arashiyama Bamboo Grove",
          type: "Natural/Scenic",
          estimatedCost: "Free",
          timeNeeded: "1-2 hours"
        },
        {
          name: "Kiyomizu-dera Temple",
          type: "Religious/Historic",
          estimatedCost: "$3 entrance",
          timeNeeded: "1-2 hours"
        }
      ],
      transportation: {
        primary: "Public buses and trains",
        cost: "$15-25 per day",
        tips: ["Get a Kyoto City Bus Pass", "Walk between nearby temples", "Avoid rush hours"]
      }
    };

    console.log('📊 Example Structured Destination Analysis:');
    console.log(JSON.stringify(exampleAnalysis, null, 2));
    console.log('');

    const exampleItinerary = {
      destination: "Kyoto, Japan",
      duration: "3 days",
      totalBudget: "$450-540 for 3 days",
      dailyItinerary: [
        {
          day: 1,
          theme: "Traditional Temples & Culture",
          activities: [
            {
              time: "09:00",
              activity: "Fushimi Inari Shrine",
              location: "Fushimi Ward",
              cost: "Free",
              duration: "2.5 hours"
            },
            {
              time: "14:00",
              activity: "Kiyomizu-dera Temple",
              location: "Eastern Kyoto",
              cost: "$3",
              duration: "2 hours"
            }
          ],
          meals: {
            breakfast: "Hotel breakfast or local café",
            lunch: "Traditional kaiseki near Fushimi Inari",
            dinner: "Pontocho Alley restaurants"
          },
          dailyBudget: "$150-180",
          tips: ["Wear comfortable walking shoes", "Bring camera for torii gates", "Visit early to avoid crowds"]
        }
      ],
      packingList: ["Comfortable walking shoes", "Camera", "Portable charger", "Cash (many places don't accept cards)", "Light jacket"],
      culturalTips: ["Bow when greeting", "Remove shoes when entering temples", "Don't point with chopsticks", "Speak quietly in public"],
      emergencyInfo: {
        embassy: "US Embassy Tokyo: +81-3-3224-5000",
        emergency: "Police: 110, Fire/Ambulance: 119",
        hospitals: ["Kyoto University Hospital", "Japanese Red Cross Kyoto Daini Hospital"]
      }
    };

    console.log('📅 Example Structured Itinerary (Day 1 shown):');
    console.log(JSON.stringify(exampleItinerary, null, 2));
    console.log('');
*/
    // Demo 2: Live Structured Chain Execution
    if (structuredChain) {
      console.log('🤖 Demo 2: Live Structured Chain Execution');
      console.log('='.repeat(50));

      const testRequests = [
        {
          destination: 'Barcelona, Spain',
          budget: '$150 per day',
          travelStyle: 'Cultural Explorer',
          duration: '4 days',
          interests: 'Architecture, Art, Food',
          groupSize: '2 adults'
        }
      ];

      for (const request of testRequests) {
        console.log(`🎯 Structured Request: ${request.destination} (${request.duration})`);
        console.log(`   Budget: ${request.budget} | Style: ${request.travelStyle}`);
        console.log(`   Interests: ${request.interests} | Group: ${request.groupSize}`);
        console.log('-'.repeat(40));
        
        try {
          console.log('🔄 Processing through structured chain...');
          const result = await structuredChain.invoke(request);
          
          console.log('✅ Structured Output Generated:');
          console.log('📊 Type: ' + typeof result);
          console.log('🔑 Keys: ' + Object.keys(result).join(', '));
          console.log('📅 Daily Itinerary Days: ' + (result.dailyItinerary?.length || 'N/A'));
          console.log('🎒 Packing Items: ' + (result.packingList?.length || 'N/A'));
          console.log('');
          console.log('📋 Sample Output (first day):');
          if (result.dailyItinerary && result.dailyItinerary[0]) {
            console.log(JSON.stringify(result, null, 2));
          }
          console.log('');
        } catch (error) {
          console.log(`❌ Error processing structured request: ${error.message}`);
          
          if (error.message.includes('JSON') || error.message.includes('parse')) {
            console.log('💡 JSON Parsing Issue Detected:');
            console.log('   • AI model generated malformed JSON');
            console.log('   • Common causes: unescaped quotes, incomplete responses');
            console.log('   • Solutions: adjust temperature, add JSON format instructions');
            console.log('');
            console.log('🔧 Troubleshooting Tips:');
            console.log('   • Lower temperature (0.3-0.5) for more consistent JSON');
            console.log('   • Add explicit JSON format examples in prompts');
            console.log('   • Use shorter, simpler schema structures');
            console.log('   • Implement retry logic with exponential backoff');
          }
          console.log('');
        }
      }
    } else {
      console.log('🤖 Demo 2: Structured Chain Simulation');
      console.log('='.repeat(50));
      console.log('');
      console.log('💡 With API key, the structured chain would:');
      console.log('   1. Generate structured destination analysis (JSON)');
      console.log('   2. Parse and validate the JSON output');
      console.log('   3. Use structured data to create detailed itinerary (JSON)');
      console.log('   4. Return fully structured, parseable travel plan');
      console.log('');
      console.log('🏗️ Benefits of Structured Output:');
      console.log('   • Consistent, predictable response format');
      console.log('   • Easy integration with frontend applications');
      console.log('   • Type safety and validation');
      console.log('   • Automated processing and storage');
      console.log('   • Better error handling and debugging');
      console.log('');
    }

    // Workshop Learning Summary
    console.log('🎓 Workshop Learning Summary');
    console.log('='.repeat(60));
    console.log('');
    
    console.log('✅ Key Structured Output Concepts:');
    console.log('   • JSON schema definition with Zod validation');
    console.log('   • Consistent output formatting for production use');
    console.log('   • Type-safe data structures for frontend integration');
    console.log('   • Error handling and validation in AI responses');
    console.log('   • Structured prompt engineering techniques');
    console.log('');

    console.log('🔧 Structured Output Best Practices:');
    console.log('   • Define clear JSON schemas before implementation');
    console.log('   • Use validation libraries (Zod) for type safety');
    console.log('   • Provide detailed field descriptions in prompts');
    console.log('   • Handle parsing errors gracefully');
    console.log('   • Test with various input scenarios');
    console.log('');

    console.log('🚀 Production Applications:');
    console.log('   • Frontend integration with predictable data');
    console.log('   • Database storage with consistent schemas');
    console.log('   • API responses with standardized formats');
    console.log('   • Automated processing and workflows');
    console.log('   • Better testing and quality assurance');
    console.log('');

    console.log('💡 Workshop Exercise Ideas:');
    console.log('   • Create schemas for different travel types');
    console.log('   • Add validation and error handling');
    console.log('   • Build frontend components that consume structured data');
    console.log('   • Compare structured vs unstructured outputs');
    console.log('   • Design schemas for multi-destination trips');
    console.log('');

    console.log('🔮 Next Workshop Sessions:');
    console.log('   3. Knowledge Base: RAG with travel information');
    console.log('   4. Agents: Smart decision-making with tools');
    console.log('   5. Memory: Remember user preferences');
    console.log('   6. Production: Deploy your Smart Travel Planner');

  } catch (error) {
    console.error('❌ Error in structured travel chain demo:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute the demo when this file is run directly
(async () => {
  try {
    await travelChainStructuredDemo();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
})();
