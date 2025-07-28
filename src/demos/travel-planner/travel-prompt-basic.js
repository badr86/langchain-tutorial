import { PromptTemplate } from '@langchain/core/prompts';
import { OpenAI } from '@langchain/openai';

export async function travelPromptBasicDemo() {
  console.log('🌍 Smart Travel Planner: Basic Prompt Template');
  console.log('='.repeat(60));
  console.log('Workshop Session 1: Building Your First Travel AI Prompt');
  console.log('');

  try {
    // Create the travel planning prompt template
    const travelPrompt = new PromptTemplate({
      template: `You are an expert travel planner. Create a personalized {duration} travel itinerary for {destination}.

Traveler Profile:
- Budget: {budget}
- Travel Style: {travelStyle}
- Interests: {interests}
- Group Size: {groupSize}
- Special Requirements: {specialRequirements}

Please provide:
1. Daily itinerary with activities
2. Accommodation recommendations
3. Transportation suggestions
4. Budget breakdown
5. Local tips and cultural insights

Format your response as a detailed, actionable travel plan.`,
      inputVariables: [
        'duration', 'destination', 'budget', 'travelStyle', 
        'interests', 'groupSize', 'specialRequirements'
      ],
    });

    console.log('✅ Travel Prompt Template Created Successfully');
    console.log('📋 Input Variables:', travelPrompt.inputVariables);
    console.log('🔢 Total Variables:', travelPrompt.inputVariables.length);
    console.log('');

    // Workshop Example 1: Tokyo Cultural Explorer
    console.log('🗾 Workshop Example 1: Tokyo Cultural Explorer');
    console.log('-'.repeat(50));
    
    const tokyoExample = {
      duration: '5-day',
      destination: 'Tokyo, Japan',
      budget: '$2000 per person',
      travelStyle: 'Cultural Explorer',
      interests: 'Food, Temples, Technology',
      groupSize: '2 adults',
      specialRequirements: 'Vegetarian meals preferred'
    };

    const tokyoPrompt = await travelPrompt.format(tokyoExample);
    console.log('📝 Formatted Prompt for Tokyo:');
    console.log(tokyoPrompt);
    console.log('');

    // Workshop Example 2: Paris Romantic Getaway
    console.log('🇫🇷 Workshop Example 2: Paris Romantic Getaway');
    console.log('-'.repeat(50));
    
    const parisExample = {
      duration: '3-day',
      destination: 'Paris, France',
      budget: '$1500 per person',
      travelStyle: 'Romantic',
      interests: 'Art, Wine, Architecture',
      groupSize: '2 adults (couple)',
      specialRequirements: 'Anniversary celebration'
    };

    const parisPrompt = await travelPrompt.format(parisExample);
    console.log('📝 Formatted Prompt for Paris:');
    console.log(parisPrompt);
    console.log('');

    // Workshop Example 3: Costa Rica Adventure
    console.log('🌴 Workshop Example 3: Costa Rica Adventure');
    console.log('-'.repeat(50));
    
    const costaRicaExample = {
      duration: '7-day',
      destination: 'Costa Rica',
      budget: '$1200 per person',
      travelStyle: 'Adventure Seeker',
      interests: 'Wildlife, Hiking, Zip-lining',
      groupSize: '4 friends',
      specialRequirements: 'Eco-friendly accommodations'
    };

    const costaRicaPrompt = await travelPrompt.format(costaRicaExample);
    console.log('📝 Formatted Prompt for Costa Rica:');
    console.log(costaRicaPrompt);
    console.log('');

    // Generate AI responses if API key is available
    if (process.env.OPENAI_API_KEY) {
      console.log('🤖 Generating Live AI Travel Plans...');
      console.log('='.repeat(60));

      const model = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        maxTokens: 800,
      });

      // Generate Tokyo travel plan
      console.log('🗾 AI-Generated Tokyo Travel Plan:');
      console.log('-'.repeat(40));
      try {
        const tokyoResponse = await model.invoke(tokyoPrompt);
        console.log(tokyoResponse);
        console.log('');
      } catch (error) {
        console.log('❌ Error generating Tokyo plan:', error.message);
      }

      // Generate Paris travel plan
      console.log('🇫🇷 AI-Generated Paris Travel Plan:');
      console.log('-'.repeat(40));
      try {
        const parisResponse = await model.invoke(parisPrompt);
        console.log(parisResponse);
        console.log('');
      } catch (error) {
        console.log('❌ Error generating Paris plan:', error.message);
      }

    } else {
      console.log('⚠️  OpenAI API key not found.');
      console.log('💡 Set OPENAI_API_KEY environment variable to see live AI responses.');
      console.log('');
    }

    // Workshop Learning Summary
    console.log('🎓 Workshop Learning Summary');
    console.log('='.repeat(60));
    console.log('');
    
    console.log('✅ Key Concepts Learned:');
    console.log('   • Complex Variable Management (7+ variables)');
    console.log('   • Structured Output Instructions');
    console.log('   • AI Role Definition ("expert travel planner")');
    console.log('   • Flexible Template Design');
    console.log('   • Production-Ready Prompt Engineering');
    console.log('');

    console.log('🔧 Prompt Engineering Best Practices:');
    console.log('   • Clear role definition for the AI');
    console.log('   • Structured input requirements');
    console.log('   • Explicit output format instructions');
    console.log('   • Comprehensive variable coverage');
    console.log('   • Consistent template structure');
    console.log('');

    console.log('🚀 Next Workshop Steps:');
    console.log('   1. Build chains to process travel requests');
    console.log('   2. Add memory for user preferences');
    console.log('   3. Create travel agents with tools');
    console.log('   4. Integrate real travel APIs');
    console.log('   5. Build complete Smart Travel Planner');
    console.log('');

    console.log('💡 Workshop Exercise Ideas:');
    console.log('   • Modify variables for your dream destination');
    console.log('   • Create prompts for different travel types');
    console.log('   • Add new variables (weather, season, etc.)');
    console.log('   • Design prompts for specific use cases');
    console.log('   • Compare prompt variations and results');

  } catch (error) {
    console.error('❌ Error in travel prompt basic demo:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute the demo when this file is run directly
(async () => {
  try {
    await travelPromptBasicDemo();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
})();
