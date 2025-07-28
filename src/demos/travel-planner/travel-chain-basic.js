import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { OpenAI } from '@langchain/openai';

export async function travelChainBasicDemo() {
  console.log('🔗 Smart Travel Planner: Basic Chain Pipeline');
  console.log('='.repeat(60));
  console.log('Workshop Session 2: Building Multi-Step Travel Workflows');
  console.log('');

  try {
    // Step 1: Destination Analysis Prompt
    const destinationAnalysisPrompt = new PromptTemplate({
      template: `Analyze the travel destination: {destination}
Budget: {budget}
Travel Style: {travelStyle}

Provide:
1. Best time to visit
2. Budget feasibility analysis
3. Top 3 must-see attractions
4. Local transportation options

Keep response concise and factual.`,
      inputVariables: ['destination', 'budget', 'travelStyle']
    });

    // Step 2: Itinerary Generation Prompt
    const itineraryPrompt = new PromptTemplate({
      template: `Based on this destination analysis:
{analysis}

Create a {duration} itinerary for {destination}.
Interests: {interests}
Group: {groupSize}

Provide day-by-day activities with timing and costs.`,
      inputVariables: ['analysis', 'duration', 'destination', 'interests', 'groupSize']
    });

    console.log('✅ Chain Components Created:');
    console.log('   📊 Step 1: Destination Analysis');
    console.log('   📅 Step 2: Itinerary Generation');
    console.log('');

    // Initialize OpenAI model if API key is available
    let model = null;
    let travelPlanningChain = null;

    if (process.env.OPENAI_API_KEY) {
      model = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        maxTokens: 600,
      });

      // Create the travel planning chain
      travelPlanningChain = RunnableSequence.from([
        // Step 1: Analyze destination
        {
          analysis: destinationAnalysisPrompt.pipe(model).pipe(new StringOutputParser()),
          destination: (input) => input.destination,
          duration: (input) => input.duration,
          interests: (input) => input.interests,
          groupSize: (input) => input.groupSize
        },
        // Step 2: Generate itinerary
        itineraryPrompt.pipe(model).pipe(new StringOutputParser())
      ]);

      console.log('🤖 AI Model Initialized');
      console.log('🔗 Travel Planning Chain Created');
      console.log('');
    } else {
      console.log('⚠️  OpenAI API key not found.');
      console.log('💡 Set OPENAI_API_KEY environment variable to run live chain demos.');
      console.log('');
    }

    // Workshop Example 1: Tokyo Business Trip
    console.log('🗾 Workshop Example 1: Tokyo Business Trip');
    console.log('-'.repeat(50));
    
    const tokyoRequest = {
      destination: 'Tokyo, Japan',
      budget: '$3000 per person',
      travelStyle: 'Business + Cultural',
      duration: '4-day',
      interests: 'Technology, Business meetings, Local cuisine',
      groupSize: '1 business traveler'
    };

    console.log('📋 Travel Request:');
    console.log(`   🎯 Destination: ${tokyoRequest.destination}`);
    console.log(`   💰 Budget: ${tokyoRequest.budget}`);
    console.log(`   🎨 Style: ${tokyoRequest.travelStyle}`);
    console.log(`   ⏱️  Duration: ${tokyoRequest.duration}`);
    console.log(`   🎪 Interests: ${tokyoRequest.interests}`);
    console.log(`   👥 Group: ${tokyoRequest.groupSize}`);
    console.log('');

    if (travelPlanningChain) {
      try {
        console.log('🔄 Processing through chain...');
        const tokyoResult = await travelPlanningChain.invoke(tokyoRequest);
        console.log('✅ Complete Travel Plan Generated:');
        console.log('-'.repeat(40));
        console.log(tokyoResult);
        console.log('');
      } catch (error) {
        console.log('❌ Error processing Tokyo request:', error.message);
        console.log('');
      }
    }

    // Workshop Example 2: Barcelona Family Vacation
    console.log('🇪🇸 Workshop Example 2: Barcelona Family Vacation');
    console.log('-'.repeat(50));
    
    const barcelonaRequest = {
      destination: 'Barcelona, Spain',
      budget: '$1800 per person',
      travelStyle: 'Family-Friendly',
      duration: '6-day',
      interests: 'Architecture, Beaches, Family activities',
      groupSize: '2 adults + 2 children (ages 8, 12)'
    };

    console.log('📋 Travel Request:');
    console.log(`   🎯 Destination: ${barcelonaRequest.destination}`);
    console.log(`   💰 Budget: ${barcelonaRequest.budget}`);
    console.log(`   🎨 Style: ${barcelonaRequest.travelStyle}`);
    console.log(`   ⏱️  Duration: ${barcelonaRequest.duration}`);
    console.log(`   🎪 Interests: ${barcelonaRequest.interests}`);
    console.log(`   👥 Group: ${barcelonaRequest.groupSize}`);
    console.log('');

    if (travelPlanningChain) {
      try {
        console.log('🔄 Processing through chain...');
        const barcelonaResult = await travelPlanningChain.invoke(barcelonaRequest);
        console.log('✅ Complete Travel Plan Generated:');
        console.log('-'.repeat(40));
        console.log(barcelonaResult);
        console.log('');
      } catch (error) {
        console.log('❌ Error processing Barcelona request:', error.message);
        console.log('');
      }
    }

    // Demonstrate chain structure without API
    console.log('🔍 Chain Architecture Deep Dive');
    console.log('='.repeat(60));
    console.log('');

    console.log('📊 Step 1: Destination Analysis');
    console.log('   Input: destination, budget, travelStyle');
    console.log('   Output: analysis (best time, budget feasibility, attractions, transport)');
    console.log('');

    const step1Example = await destinationAnalysisPrompt.format({
      destination: 'Bali, Indonesia',
      budget: '$1500 per person',
      travelStyle: 'Relaxation & Adventure'
    });

    console.log('📝 Step 1 Formatted Prompt:');
    console.log(step1Example);
    console.log('');

    console.log('📅 Step 2: Itinerary Generation');
    console.log('   Input: analysis + duration, destination, interests, groupSize');
    console.log('   Output: detailed day-by-day itinerary');
    console.log('');

    const step2Example = await itineraryPrompt.format({
      analysis: 'Best time: April-October (dry season). Budget: Feasible for mid-range experience. Top attractions: Ubud rice terraces, Tanah Lot temple, Seminyak beaches. Transport: Scooter rental or private driver recommended.',
      duration: '5-day',
      destination: 'Bali, Indonesia',
      interests: 'Temples, Beaches, Local culture',
      groupSize: '2 adults'
    });

    console.log('📝 Step 2 Formatted Prompt:');
    console.log(step2Example);
    console.log('');

    // Workshop Learning Summary
    console.log('🎓 Workshop Learning Summary');
    console.log('='.repeat(60));
    console.log('');
    
    console.log('✅ Key Chain Concepts Learned:');
    console.log('   • Multi-step workflow design');
    console.log('   • Data flow between chain components');
    console.log('   • RunnableSequence composition');
    console.log('   • Output parsing and transformation');
    console.log('   • Error handling in chains');
    console.log('');

    console.log('🔧 Chain Building Best Practices:');
    console.log('   • Clear separation of concerns per step');
    console.log('   • Consistent data passing between steps');
    console.log('   • Proper error handling and validation');
    console.log('   • Modular prompt design for reusability');
    console.log('   • Efficient token usage across steps');
    console.log('');

    console.log('🚀 Advanced Chain Patterns:');
    console.log('   • Conditional branching based on analysis');
    console.log('   • Parallel processing for multiple destinations');
    console.log('   • Memory integration for user preferences');
    console.log('   • Tool integration for real-time data');
    console.log('   • Agent-based decision making');
    console.log('');

    console.log('💡 Workshop Exercise Ideas:');
    console.log('   • Add a third step for budget optimization');
    console.log('   • Create conditional chains based on travel style');
    console.log('   • Implement error recovery mechanisms');
    console.log('   • Add validation steps between chain components');
    console.log('   • Design chains for different travel scenarios');
    console.log('');

    console.log('🔮 Next Workshop Sessions:');
    console.log('   3. Memory: Remember user preferences across sessions');
    console.log('   4. Agents: Smart decision-making with tools');
    console.log('   5. RAG: Integrate real travel databases');
    console.log('   6. Production: Deploy your Smart Travel Planner');

  } catch (error) {
    console.error('❌ Error in travel chain basic demo:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute the demo when this file is run directly
(async () => {
  try {
    await travelChainBasicDemo();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
})();
