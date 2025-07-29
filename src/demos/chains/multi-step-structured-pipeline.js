import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Multi-Step Structured Pipeline Demo
 * 
 * This demo shows how to chain multiple structured outputs together,
 * where the output of one step becomes the input for the next step.
 * Perfect for complex workflows requiring multiple AI processing stages.
 */

// Define Zod schemas for each step of the pipeline
const ProductIdeaSchema = z.object({
    name: z.string().describe("Name of the product"),
    description: z.string().describe("Brief description of the product"),
    category: z.string().describe("Product category or industry"),
    target_audience: z.array(z.string()).describe("List of target audience segments"),
    key_features: z.array(z.string()).describe("List of 3-5 key product features"),
    unique_value_proposition: z.string().describe("What makes this product unique"),
    estimated_price_range: z.string().describe("Expected price range"),
    monetization_options: z.array(z.string()).describe("Ways to generate revenue")
});

const MarketAnalysisSchema = z.object({
    market_size: z.string().describe("Total addressable market size"),
    growth_rate: z.string().describe("Annual market growth rate"),
    competition_level: z.enum(['Low', 'Medium', 'High']).describe("Level of competition"),
    key_competitors: z.array(z.string()).describe("List of main competitors"),
    market_trends: z.array(z.string()).describe("Current market trends"),
    opportunities: z.array(z.string()).describe("Market opportunities"),
    challenges: z.array(z.string()).describe("Potential challenges"),
    success_probability: z.enum(['Low', 'Medium', 'High']).describe("Probability of success"),
    recommended_strategy: z.string().describe("Recommended go-to-market strategy")
});

async function multiStepStructuredPipelineDemo() {
    console.log('🚀 Executing Multi-Step Structured Pipeline Demo...');
    console.log('='.repeat(60));

    console.log('🏗️ Multi-Step Pipeline Overview:');
    console.log('   • Chain multiple structured outputs together');
    console.log('   • Output of Step 1 becomes input for Step 2');
    console.log('   • Build complex workflows with validated data flow');
    console.log('   • Perfect for multi-stage analysis and processing');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing multi-step pipeline concepts instead...');
        
        showMultiStepPipelineConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with multi-step pipeline demo');

    // Initialize components
    console.log('\n🏗️ Initializing Components...');
    
    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.4, // Slightly higher for creative product ideas
        maxTokens: 1500,
    });

    console.log('✅ Components initialized:');
    console.log('   • LLM: gpt-3.5-turbo (temperature: 0.4)');
    console.log('   • Pipeline: Product Idea → Market Analysis');

    // Step 1: Product Idea Generation
    console.log('\n' + '='.repeat(60));
    console.log('💡 Step 1: Product Idea Generation');
    console.log('='.repeat(60));

    const productIdeaPrompt = ChatPromptTemplate.fromTemplate(`
Generate a detailed product idea based on the given industry and problem.

Industry: {industry}
Problem to Solve: {problem}

IMPORTANT: You must respond with valid JSON only. Follow these rules:
- Use double quotes for all property names and string values
- No trailing commas
- No comments or extra text outside the JSON
- Ensure all arrays and objects are properly closed
- Use EXACTLY the field names specified below

You MUST include ALL of these fields in your response:
- name: Product name as a string
- description: Brief product description as a string
- category: Product category as a string
- target_audience: Array of target audience segments
- key_features: Array of 3-5 key product features
- unique_value_proposition: What makes it unique as a string
- estimated_price_range: Expected price range as a string
- monetization_options: Array of revenue generation methods

Please provide the product idea in the following JSON format:
{format_instructions}

Be creative but realistic. Ensure all information is coherent and market-viable.
Respond with valid JSON only - no additional text or explanations.
`);

    const productIdeaParser = new JsonOutputParser(ProductIdeaSchema);

    const productIdeaChain = RunnableSequence.from([
        {
            industry: (input) => input.industry,
            problem: (input) => input.problem,
            format_instructions: () => productIdeaParser.getFormatInstructions(),
        },
        productIdeaPrompt,
        llm,
        productIdeaParser,
    ]);

    console.log('🔗 Product idea generation chain created');

    let productIdea;
    try {
        console.log('\n🔄 Generating product idea...');
        
        productIdea = await productIdeaChain.invoke({
            industry: "Health & Wellness",
            problem: "People struggle to maintain consistent exercise routines at home"
        });

        console.log('\n✨ Generated Product Idea:');
        console.log('📦 Product Name:', productIdea.name || 'N/A');
        console.log('📝 Description:', productIdea.description || 'N/A');
        console.log('🏷️ Category:', productIdea.category || 'N/A');
        console.log('💰 Price Range:', productIdea.estimated_price_range || 'N/A');
        
        console.log('\n🎯 Target Audience:');
        if (productIdea.target_audience && Array.isArray(productIdea.target_audience)) {
            productIdea.target_audience.forEach((audience, index) => {
                console.log(`   ${index + 1}. ${audience}`);
            });
        } else {
            console.log('   No target audience data available');
        }
        
        console.log('\n🔧 Key Features:');
        if (productIdea.key_features && Array.isArray(productIdea.key_features)) {
            productIdea.key_features.forEach((feature, index) => {
                console.log(`   ${index + 1}. ${feature}`);
            });
        } else {
            console.log('   No features data available');
        }
        
        console.log('\n💎 Unique Value Proposition:');
        console.log(`   ${productIdea.unique_value_proposition || 'N/A'}`);
        
        console.log('\n💰 Monetization Options:');
        if (productIdea.monetization_options && Array.isArray(productIdea.monetization_options)) {
            productIdea.monetization_options.forEach((option, index) => {
                console.log(`   ${index + 1}. ${option}`);
            });
        } else {
            console.log('   No monetization options available');
        }
        
        console.log('\n🔍 Raw Product Idea Structure:');
        console.log(JSON.stringify(productIdea, null, 2));

    } catch (error) {
        console.log('\n❌ Error generating product idea:');
        console.log('   Error:', error.message);
        console.log('💡 Cannot proceed to market analysis without product idea');
        return;
    }

    // Step 2: Market Analysis (using product idea from Step 1)
    console.log('\n' + '='.repeat(60));
    console.log('📊 Step 2: Market Analysis (Based on Product Idea)');
    console.log('='.repeat(60));

    const marketAnalysisPrompt = ChatPromptTemplate.fromTemplate(`
Conduct a comprehensive market analysis for the following product:

Product Name: {name}
Description: {description}
Category: {category}
Target Audience: {target_audience}
Key Features: {key_features}
Unique Value Proposition: {unique_value_proposition}
Price Range: {estimated_price_range}
Monetization Options: {monetization_options}

IMPORTANT: You must respond with valid JSON only. Follow these rules:
- Use double quotes for all property names and string values
- No trailing commas
- No comments or extra text outside the JSON
- Ensure all arrays and objects are properly closed
- Use EXACTLY the field names specified below

You MUST include ALL of these fields in your response:
- market_size: Total addressable market size as a string
- growth_rate: Annual market growth rate as a string
- competition_level: Must be exactly "Low", "Medium", or "High"
- key_competitors: Array of main competitor names
- market_trends: Array of current market trends
- opportunities: Array of market opportunities
- challenges: Array of potential challenges
- success_probability: Must be exactly "Low", "Medium", or "High"
- recommended_strategy: Go-to-market strategy as a string

Please provide the market analysis in the following JSON format:
{format_instructions}

Base your analysis on realistic market data and trends. Be thorough and professional.
Respond with valid JSON only - no additional text or explanations.
`);

    const marketAnalysisParser = new JsonOutputParser(MarketAnalysisSchema);

    const marketAnalysisChain = RunnableSequence.from([
        {
            name: (input) => input.name,
            description: (input) => input.description,
            category: (input) => input.category,
            target_audience: (input) => Array.isArray(input.target_audience) ? input.target_audience.join(', ') : 'N/A',
            key_features: (input) => Array.isArray(input.key_features) ? input.key_features.join(', ') : 'N/A',
            unique_value_proposition: (input) => input.unique_value_proposition,
            estimated_price_range: (input) => input.estimated_price_range,
            monetization_options: (input) => Array.isArray(input.monetization_options) ? input.monetization_options.join(', ') : 'N/A',
            format_instructions: () => marketAnalysisParser.getFormatInstructions(),
        },
        marketAnalysisPrompt,
        llm,
        marketAnalysisParser,
    ]);

    console.log('🔗 Market analysis chain created (using product idea as input)');

    try {
        console.log('\n🔄 Conducting market analysis...');
        
        const marketAnalysis = await marketAnalysisChain.invoke(productIdea);

        console.log('\n✨ Market Analysis Results:');
        console.log('📈 Market Size:', marketAnalysis.market_size || 'N/A');
        console.log('📊 Growth Rate:', marketAnalysis.growth_rate || 'N/A');
        console.log('⚔️ Competition Level:', marketAnalysis.competition_level || 'N/A');
        console.log('🎯 Success Probability:', marketAnalysis.success_probability || 'N/A');
        
        console.log('\n🏢 Key Competitors:');
        if (marketAnalysis.key_competitors && Array.isArray(marketAnalysis.key_competitors)) {
            marketAnalysis.key_competitors.forEach((competitor, index) => {
                console.log(`   ${index + 1}. ${competitor}`);
            });
        } else {
            console.log('   No competitors data available');
        }
        
        console.log('\n📈 Market Trends:');
        if (marketAnalysis.market_trends && Array.isArray(marketAnalysis.market_trends)) {
            marketAnalysis.market_trends.forEach((trend, index) => {
                console.log(`   ${index + 1}. ${trend}`);
            });
        } else {
            console.log('   No trends data available');
        }
        
        console.log('\n🚀 Opportunities:');
        if (marketAnalysis.opportunities && Array.isArray(marketAnalysis.opportunities)) {
            marketAnalysis.opportunities.forEach((opportunity, index) => {
                console.log(`   ${index + 1}. ${opportunity}`);
            });
        } else {
            console.log('   No opportunities data available');
        }
        
        console.log('\n⚠️ Challenges:');
        if (marketAnalysis.challenges && Array.isArray(marketAnalysis.challenges)) {
            marketAnalysis.challenges.forEach((challenge, index) => {
                console.log(`   ${index + 1}. ${challenge}`);
            });
        } else {
            console.log('   No challenges data available');
        }
        
        console.log('\n🎯 Recommended Strategy:');
        console.log(`   ${marketAnalysis.recommended_strategy || 'N/A'}`);
        
        console.log('\n🔍 Raw Market Analysis Structure:');
        console.log(JSON.stringify(marketAnalysis, null, 2));

        // Step 3: Combined Pipeline Results
        console.log('\n' + '='.repeat(60));
        console.log('🔗 Multi-Step Pipeline Results Summary');
        console.log('='.repeat(60));
        
        console.log('✅ Pipeline completed successfully!');
        console.log('\n📊 Data Flow Summary:');
        console.log(`   Step 1 Input: Industry + Problem`);
        console.log(`   Step 1 Output: ${productIdea.product_name} (${productIdea.category})`);
        console.log(`   Step 2 Input: Complete product idea data`);
        console.log(`   Step 2 Output: Market analysis with ${marketAnalysis.success_probability} success probability`);
        
        console.log('\n🎯 Final Recommendation:');
        console.log(`   Product: ${productIdea.product_name}`);
        console.log(`   Market: ${marketAnalysis.market_size} market with ${marketAnalysis.growth_rate} growth`);
        console.log(`   Competition: ${marketAnalysis.competition_level} competition level`);
        console.log(`   Success Probability: ${marketAnalysis.success_probability}`);
        console.log(`   Strategy: ${marketAnalysis.recommended_strategy}`);

    } catch (error) {
        console.log('\n❌ Error conducting market analysis:');
        console.log('   Error:', error.message);
        console.log('💡 This might be due to JSON parsing issues or schema validation failures');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 Multi-Step Pipeline Demo Summary');
    console.log('='.repeat(60));
    console.log('✅ Demonstrated multi-step structured pipeline:');
    console.log('   1. 💡 Product Idea Generation - Creative ideation with structure');
    console.log('   2. 📊 Market Analysis - Data-driven analysis using Step 1 output');
    console.log('\n🎯 Key Benefits:');
    console.log('   • Chained processing with validated data flow');
    console.log('   • Complex workflows broken into manageable steps');
    console.log('   • Each step builds upon previous structured output');
    console.log('   • Perfect for multi-stage business processes');
    console.log('\n💡 Use multi-step pipelines when you need:');
    console.log('   • Complex analysis requiring multiple AI calls');
    console.log('   • Sequential processing where each step depends on the previous');
    console.log('   • Structured workflows with intermediate validation');
    console.log('   • Business processes that mirror human decision-making');
}

function showMultiStepPipelineConcepts() {
    console.log('\n🎭 Multi-Step Structured Pipeline Concepts:');
    console.log('='.repeat(50));
    
    console.log('\n📋 What is a Multi-Step Pipeline?');
    console.log('   • Chain multiple structured outputs together');
    console.log('   • Output of one step becomes input for the next');
    console.log('   • Each step has its own schema and validation');
    console.log('   • Build complex workflows with AI processing');
    
    console.log('\n🏗️ Key Components:');
    console.log('   • Multiple Zod Schemas: One for each pipeline step');
    console.log('   • Chained RunnableSequences: Connect steps together');
    console.log('   • Data Flow Management: Pass data between steps');
    console.log('   • Error Handling: Manage failures at each step');
    
    console.log('\n🎯 Common Use Cases:');
    console.log('   • Product development workflows');
    console.log('   • Multi-stage content creation');
    console.log('   • Business analysis and planning');
    console.log('   • Research and recommendation systems');
    
    console.log('\n💡 Best Practices:');
    console.log('   • Design schemas that work well together');
    console.log('   • Handle errors gracefully at each step');
    console.log('   • Validate data between pipeline stages');
    console.log('   • Keep individual steps focused and manageable');
    
    console.log('\n🔧 To run this demo with real AI:');
    console.log('   1. Set OPENAI_API_KEY in your .env file');
    console.log('   2. Restart the application');
    console.log('   3. Run this demo again');
}

// Execute the demo
multiStepStructuredPipelineDemo().catch(console.error);
