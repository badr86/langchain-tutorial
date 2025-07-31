/**
 * Parallel Agent, RAG, and JSON Parser Chain Demo
 * 
 * This demo demonstrates how to run multiple LangChain operations in parallel using RunnableMap:
 * 1. A ReAct Agent with tools for dynamic reasoning and actions
 * 2. A RAG chain to retrieve relevant information from a knowledge base
 * 3. A JSON parser chain to structure the output
 * 
 * The results are combined and processed in parallel for efficient execution.
 */

import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { DynamicTool } from '@langchain/core/tools';
import { RunnableMap, RunnableSequence, RunnableLambda } from '@langchain/core/runnables';
import { JsonOutputParser, StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';

// Load environment variables from .env file
dotenv.config();

// Define simple tools for the ReAct agent
function createSimpleTools() {
  return [
    new DynamicTool({
      name: "calculate_budget",
      description: "Calculate estimated travel budget for Paris. Input should be the number of days as a string.",
      func: async (days) => {
        const numDays = parseInt(days) || 5;
        const dailyBudget = 120; // EUR per day for mid-range travel
        const total = dailyBudget * numDays;
        return `For ${numDays} days in Paris: approximately €${total} (mid-range budget including accommodation, meals, and attractions)`;
      }
    }),
    new DynamicTool({
      name: "get_weather_info",
      description: "Get weather information for Paris in mid-June. No input required.",
      func: async () => {
        return "Paris in mid-June: Pleasant weather with temperatures 18-25°C (64-77°F). Expect some light rain, so pack an umbrella. Long daylight hours until 9 PM, perfect for sightseeing!";
      }
    }),
    new DynamicTool({
      name: "cultural_etiquette_tips",
      description: "Get cultural etiquette tips for Paris. No input required.",
      func: async () => {
        return "Paris etiquette: Always say 'Bonjour' when entering shops. Learn basic French phrases - locals appreciate the effort. Tipping 10-15% at restaurants is standard. Dress nicely, especially for dinner. Avoid speaking loudly in public.";
      }
    })
  ];
}

// Sample travel knowledge base (in a real app, this would be a proper vector store)
async function createSampleKnowledgeBase() {
  const docs = [
    new Document({
      pageContent: "Paris is known as the City of Light and is famous for its art, fashion, and cuisine. Must-visit places include the Eiffel Tower, Louvre Museum, and Montmartre. The weather in mid-June is pleasant with temperatures around 20-25°C.",
      metadata: { source: "travel_guide_paris", type: "destination_info" }
    }),
    new Document({
      pageContent: "Paris cultural etiquette: French people appreciate when visitors attempt to speak French, even basic phrases. It's polite to say 'Bonjour' when entering shops. Tipping 10-15% at restaurants is customary.",
      metadata: { source: "cultural_etiquette_paris", type: "cultural_info" }
    }),
    new Document({
      pageContent: "Budget for Paris: Mid-range travelers can expect to spend €100-150 per day including accommodation, meals, and attractions. Budget travelers can manage with €50-80 per day.",
      metadata: { source: "budget_guide_paris", type: "budget_info" }
    }),
    new Document({
      pageContent: "Paris in June: Perfect weather for sightseeing, long daylight hours until 9 PM, many outdoor cafés open, ideal for walking tours and Seine river cruises.",
      metadata: { source: "seasonal_guide_paris", type: "seasonal_info" }
    })
  ];

  return await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY })
  );
}



async function runParallelChains() {
  console.log('🚀 Running Parallel Agent, RAG, and JSON Parser Chains...');
  console.log('='.repeat(70));

  // Initialize the language model
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    modelName: 'gpt-3.5-turbo',
  });

  // Initialize the knowledge base
  console.log('📚 Initializing knowledge base...');
  const knowledgeBase = await createSampleKnowledgeBase();
  
  // Create tools for the agent
  console.log('🔧 Setting up agent tools...');
  const tools = createSimpleTools();

  // Define the user query
  const userQuery = "I'm planning a 5-day trip to Paris in mid-June. What should I know about the weather, budget, and cultural etiquette?";
  console.log(`\n💬 User Query: ${userQuery}\n`);

  // Create the parallel chains using RunnableMap
  console.log('🔗 Setting up parallel chains with RunnableMap...');
  
  // 1. Agent Chain - Create a runnable that executes the ReAct agent
  const agentRunnable = RunnableLambda.from(async (input) => {
    console.log('🤖 Agent chain processing...');
    
    // Create a simple prompt template for the React agent
    const prompt = PromptTemplate.fromTemplate(
      `Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format EXACTLY:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action (even if no input is needed, write "none")
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

IMPORTANT: Always include "Action Input:" even if the tool needs no input. Write "none" if no input is required.

Begin!

Question: {input}
Thought:{agent_scratchpad}`
    );
    
    try {
      const agent = await createReactAgent({
        llm: model,
        tools,
        prompt,
      });
      
      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: false, // Disable verbose to reduce noise in parallel execution
        maxIterations: 5, // Limit iterations for faster execution
        returnIntermediateSteps: false,
        handleParsingErrors: true, // Handle parsing errors gracefully
      });
      
      console.log('Invoking agent with query:', input.query);
      const result = await agentExecutor.invoke({
        input: input.query,
      });
      
      console.log('Agent completed successfully');
      return result.output;
    } catch (error) {
      console.log('Agent error details:', error.message);
      
      // Try to use tools directly as fallback
      try {
        console.log('Attempting direct tool usage as fallback...');
        const budgetResult = await tools[0].func('5');
        const weatherResult = await tools[1].func();
        const cultureResult = await tools[2].func();
        
        return `Based on my analysis using available tools:\n\n${budgetResult}\n\n${weatherResult}\n\n${cultureResult}`;
      } catch (toolError) {
        console.log('Tool fallback also failed:', toolError.message);
        return 'For a 5-day Paris trip in mid-June: Budget around €600 total, expect pleasant 18-25°C weather with some rain, and remember to greet locals with "Bonjour" and tip 10-15% at restaurants.';
      }
    }
  });

  // 2. RAG Chain - Create a runnable that performs retrieval and generation
  const ragRunnable = RunnableLambda.from(async (input) => {
    console.log('🔍 RAG chain processing...');
    const retriever = knowledgeBase.asRetriever(2); // Get top 2 most relevant documents
    const relevantDocs = await retriever.invoke(input.query);
    
    // Process the relevant documents
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    
    const ragPrompt = `Based on the following context, answer the user's question: ${input.query}
    
    Context:
    ${context}
    
    Answer:`;
    
    const response = await model.invoke(ragPrompt);
    return response.content;
  });

  // 3. JSON Parser Chain - Create a runnable that structures the output
  const jsonParserRunnable = RunnableLambda.from(async (input) => {
    console.log('📝 JSON Parser chain processing...');
    const jsonPrompt = `Extract the following information from this travel query: "${input.query}"
    
    Format the response as a JSON object with the following structure:
    {
      "destination": "string - The travel destination",
      "duration": "number - Duration of the trip in days",
      "budgetEstimate": "string - Estimated budget range",
      "weatherInfo": "string - Weather information",
      "culturalTips": "string - Cultural tips and etiquette",
      "recommendedActivities": ["array of strings - List of recommended activities"]
    }
    
    Fill in the information based on general knowledge about the destination.`;
    
    const parser = new JsonOutputParser();
    const chain = RunnableSequence.from([
      () => jsonPrompt,
      model,
      parser
    ]);
    
    return await chain.invoke({});
  });

  // Create the parallel chain using RunnableMap
  const parallelChain = RunnableMap.from({
    agent: agentRunnable,
    rag: ragRunnable,
    structured: jsonParserRunnable
  });

  // Execute all chains in parallel using RunnableMap
  try {
    console.log('\n🚀 Executing all chains in parallel with RunnableMap...');
    const startTime = Date.now();
    
    const results = await parallelChain.invoke({ query: userQuery });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⚡ Parallel execution completed in ${duration}ms`);
    
    // Results are now directly accessible as properties
    const combinedResult = {
      agent: results.agent,
      rag: results.rag,
      structured: results.structured
    };
    
    console.log('\n✅ All chains completed successfully!');
    console.log('='.repeat(70));
    console.log('\n📊 Combined Results:');
    console.log('='.repeat(70));
    
    // Display agent result
    console.log('\n🤖 Agent Response:');
    console.log('-' .repeat(60));
    console.log(combinedResult.agent);
    
    // Display RAG result
    console.log('\n📚 Knowledge Base Information:');
    console.log('-' .repeat(60));
    console.log(combinedResult.rag);
    
    // Display structured result
    console.log('\n📋 Structured Information:');
    console.log('-' .repeat(60));
    console.log(JSON.stringify(combinedResult.structured, null, 2));
    
    // Generate a final summary using the model
    console.log('\n🔍 Generating final summary...');
    const summaryPrompt = `Based on the following information from different sources, provide a comprehensive travel recommendation:
    
    Agent Response: ${combinedResult.agent}
    Knowledge Base: ${combinedResult.rag}
    Structured Data: ${JSON.stringify(combinedResult.structured)}
    
    Create a well-organized travel recommendation that combines all this information.`;
    
    const finalResponse = await model.invoke(summaryPrompt);
    
    console.log('\n✨ Final Travel Recommendation:');
    console.log('=' .repeat(70));
    console.log(finalResponse.content);
    
  } catch (error) {
    console.error('❌ Error executing parallel chains:', error);
  }
}

// Run the demo
runParallelChains().catch(console.error);
