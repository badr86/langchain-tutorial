import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { OpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

export async function travelKnowledgeBaseDemo() {
  console.log('📚 Smart Travel Planner: Travel Knowledge Base (RAG)');
  console.log('='.repeat(60));
  console.log('Workshop Session 3: Building AI with External Knowledge');
  console.log('');

  try {
    // Create travel knowledge documents
    const travelKnowledge = [
      // Tokyo, Japan
      new Document({
        pageContent: `Tokyo, Japan is a vibrant metropolis blending traditional culture with cutting-edge technology. Best time to visit is March-May (spring) and September-November (autumn). Must-see attractions include Senso-ji Temple (oldest temple, traditional atmosphere), Tokyo Skytree (tallest tower, panoramic views), Shibuya Crossing (world's busiest intersection), and Tsukiji Outer Market (fresh sushi, street food). Transportation: JR Pass for unlimited train travel, very efficient subway system. Cultural tips: Bow when greeting, remove shoes indoors, tipping is not customary. Food specialties: sushi, ramen, tempura, wagyu beef. Budget: $100-200/day for mid-range experience.`,
        metadata: { destination: 'Tokyo', country: 'Japan', category: 'overview' }
      }),
      
      new Document({
        pageContent: `Tokyo neighborhoods each offer unique experiences. Shibuya: youth culture, shopping, nightlife, famous crossing. Harajuku: quirky fashion, Takeshita Street, youth trends. Ginza: luxury shopping, high-end dining, upscale atmosphere. Asakusa: traditional Tokyo, Senso-ji Temple, old-world charm. Shinjuku: business district, skyscrapers, entertainment. Akihabara: electronics, anime culture, gaming. Roppongi: international nightlife, art museums, expat community. Each area has distinct personality and attractions.`,
        metadata: { destination: 'Tokyo', country: 'Japan', category: 'neighborhoods' }
      }),

      // Paris, France
      new Document({
        pageContent: `Paris, France is the City of Light, renowned for art, culture, cuisine, and romance. Best time to visit is April-June and September-October. Iconic attractions include Eiffel Tower (symbol of Paris, stunning views), Louvre Museum (world's largest art museum, Mona Lisa), Notre-Dame Cathedral (Gothic masterpiece), Arc de Triomphe (historic monument), and Champs-Élysées (famous avenue). Transportation: Metro system covers entire city, walking is pleasant. Cultural tips: greet with "Bonjour/Bonsoir", dress elegantly, learn basic French phrases. Food specialties: croissants, cheese, wine, macarons, French cuisine. Budget: $120-250/day for mid-range experience.`,
        metadata: { destination: 'Paris', country: 'France', category: 'overview' }
      }),

      new Document({
        pageContent: `Paris arrondissements (districts) offer diverse experiences. 1st: Louvre, Tuileries, central location. 4th: Marais district, Jewish quarter, trendy boutiques. 5th: Latin Quarter, Sorbonne, student atmosphere. 6th: Saint-Germain, cafés, intellectual vibe. 7th: Eiffel Tower, museums, upscale residential. 8th: Champs-Élysées, luxury shopping, business. 9th: Opera, department stores, nightlife. 18th: Montmartre, Sacré-Cœur, artistic bohemian area. Each arrondissement has unique character and attractions.`,
        metadata: { destination: 'Paris', country: 'France', category: 'neighborhoods' }
      }),

      // Costa Rica
      new Document({
        pageContent: `Costa Rica is a Central American paradise known for biodiversity, eco-tourism, and adventure activities. Best time to visit is December-April (dry season). Top attractions include Manuel Antonio National Park (beaches, wildlife, monkeys), Arenal Volcano (active volcano, hot springs), Monteverde Cloud Forest (unique ecosystem, zip-lining), Tortuguero National Park (sea turtle nesting), and Tamarindo (surfing, beach town). Transportation: rental car recommended, domestic flights available. Cultural tips: "Pura Vida" lifestyle, eco-conscious, friendly locals. Activities: zip-lining, wildlife watching, surfing, hiking. Budget: $80-150/day for mid-range eco-tourism.`,
        metadata: { destination: 'Costa Rica', country: 'Costa Rica', category: 'overview' }
      }),

      // Barcelona, Spain
      new Document({
        pageContent: `Barcelona, Spain combines Gothic architecture, modernist art, Mediterranean beaches, and vibrant culture. Best time to visit is May-June and September-October. Must-see attractions include Sagrada Familia (Gaudí's masterpiece, iconic basilica), Park Güell (whimsical park, city views), Gothic Quarter (medieval streets, historic charm), La Rambla (famous pedestrian street), and Barceloneta Beach (urban beach, seafood). Transportation: efficient metro system, walkable city center. Cultural tips: late dining (9-10pm), siesta culture, Catalan pride. Food specialties: tapas, paella, jamón, cava. Budget: $90-180/day for mid-range experience.`,
        metadata: { destination: 'Barcelona', country: 'Spain', category: 'overview' }
      }),

      // Bali, Indonesia
      new Document({
        pageContent: `Bali, Indonesia is a tropical paradise known for rice terraces, temples, beaches, and spiritual culture. Best time to visit is April-October (dry season). Top attractions include Ubud (cultural heart, rice terraces, yoga retreats), Tanah Lot Temple (sea temple, sunset views), Seminyak Beach (upscale beach clubs, surfing), Uluwatu Temple (clifftop temple, traditional dance), and Mount Batur (sunrise trekking, volcanic landscape). Transportation: scooter rental popular, private drivers available. Cultural tips: Hindu majority, temple etiquette, sarong required. Activities: yoga, surfing, temple visits, spa treatments. Budget: $50-120/day for mid-range tropical experience.`,
        metadata: { destination: 'Bali', country: 'Indonesia', category: 'overview' }
      }),

      // New York City
      new Document({
        pageContent: `New York City, USA is the city that never sleeps, famous for skyscrapers, Broadway, and cultural diversity. Best time to visit is April-June and September-November. Iconic attractions include Statue of Liberty (symbol of freedom), Central Park (urban oasis, 843 acres), Times Square (bright lights, Broadway shows), Empire State Building (Art Deco skyscraper), and Brooklyn Bridge (historic bridge, great views). Transportation: extensive subway system, yellow taxis, walking. Cultural tips: fast-paced lifestyle, tipping expected, diverse neighborhoods. Food specialties: pizza, bagels, delis, international cuisine. Budget: $150-300/day for mid-range urban experience.`,
        metadata: { destination: 'New York City', country: 'USA', category: 'overview' }
      })
    ];

    console.log('📄 Travel Knowledge Base Created:');
    console.log(`   📊 Total Documents: ${travelKnowledge.length}`);
    console.log(`   🌍 Destinations: Tokyo, Paris, Costa Rica, Barcelona, Bali, NYC`);
    console.log(`   📚 Categories: Overview, Neighborhoods, Activities`);
    console.log('');

    // Initialize embeddings and vector store (if API key available)
    let vectorStore = null;
    let retriever = null;

    if (process.env.OPENAI_API_KEY) {
      console.log('🔧 Initializing Vector Store with OpenAI Embeddings...');
      
      const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-ada-002',
      });

      // Create vector store from documents
      vectorStore = await MemoryVectorStore.fromDocuments(
        travelKnowledge,
        embeddings
      );

      retriever = vectorStore.asRetriever({
        k: 3, // Retrieve top 3 most relevant documents
      });

      console.log('✅ Vector Store Created Successfully');
      console.log('🔍 Retriever Configured (k=3 documents)');
      console.log('');
    } else {
      console.log('⚠️  OpenAI API key not found.');
      console.log('💡 Set OPENAI_API_KEY environment variable for full RAG functionality.');
      console.log('');
    }

    // Demo 1: Knowledge Retrieval
    console.log('🔍 Demo 1: Knowledge Retrieval');
    console.log('='.repeat(50));
    
    const queries = [
      'Best time to visit Tokyo and cultural tips',
      'Paris neighborhoods and what makes each unique',
      'Costa Rica adventure activities and wildlife',
      'Barcelona architecture and Gaudí attractions'
    ];

    for (const query of queries) {
      console.log(`❓ Query: "${query}"`);
      
      if (retriever) {
        try {
          const relevantDocs = await retriever.getRelevantDocuments(query);
          console.log(`📋 Retrieved ${relevantDocs.length} relevant documents:`);
          
          relevantDocs.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.metadata.destination} (${doc.metadata.category})`);
            console.log(`      ${doc.pageContent.substring(0, 100)}...`);
          });
        } catch (error) {
          console.log(`❌ Retrieval error: ${error.message}`);
        }
      } else {
        // Show manual matching for demo purposes
        const matchingDocs = travelKnowledge.filter(doc => 
          doc.pageContent.toLowerCase().includes(query.toLowerCase().split(' ')[0]) ||
          doc.metadata.destination.toLowerCase().includes(query.toLowerCase().split(' ')[0])
        );
        console.log(`📋 Matching documents: ${matchingDocs.length}`);
        matchingDocs.slice(0, 2).forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.metadata.destination} (${doc.metadata.category})`);
        });
      }
      console.log('');
    }

    // Demo 2: RAG-Enhanced Travel Planning
    console.log('🤖 Demo 2: RAG-Enhanced Travel Planning');
    console.log('='.repeat(50));

    if (process.env.OPENAI_API_KEY && vectorStore) {
      const model = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        maxTokens: 600,
      });

      // Create RAG chain
      const ragPrompt = new PromptTemplate({
        template: `You are an expert travel planner with access to comprehensive destination knowledge.

Context Information:
{context}

User Request: {question}

Based on the provided context about the destination, create a personalized travel recommendation that incorporates the specific knowledge about attractions, culture, timing, and local tips. Be specific and reference the contextual information.

Travel Recommendation:`,
        inputVariables: ['context', 'question']
      });

      const ragChain = RunnableSequence.from([
        {
          context: async (input) => {
            const docs = await retriever.getRelevantDocuments(input.question);
            return docs.map(doc => doc.pageContent).join('\n\n');
          },
          question: (input) => input.question
        },
        ragPrompt,
        model,
        new StringOutputParser()
      ]);

      // Test RAG with different travel requests
      const travelRequests = [
        'Plan a 3-day cultural trip to Tokyo for first-time visitors',
        'Recommend romantic activities in Paris for an anniversary',
        'Suggest adventure activities in Costa Rica for thrill-seekers'
      ];

      for (const request of travelRequests) {
        console.log(`🎯 Travel Request: "${request}"`);
        console.log('-'.repeat(40));
        
        try {
          const response = await ragChain.invoke({ question: request });
          console.log('🗺️ RAG-Enhanced Recommendation:');
          console.log(response);
          console.log('');
        } catch (error) {
          console.log(`❌ RAG error: ${error.message}`);
          console.log('');
        }
      }
    } else {
      console.log('💡 RAG Demo Examples (requires OpenAI API key):');
      console.log('');
      console.log('🎯 Request: "Plan a 3-day cultural trip to Tokyo"');
      console.log('🔍 Retrieved Context: Tokyo cultural attractions, temple etiquette, neighborhoods');
      console.log('🤖 RAG Response: Detailed 3-day itinerary incorporating Senso-ji Temple,');
      console.log('   Asakusa district, cultural tips about bowing and shoe removal...');
      console.log('');
      console.log('🎯 Request: "Romantic activities in Paris for anniversary"');
      console.log('🔍 Retrieved Context: Paris romantic spots, dining culture, arrondissements');
      console.log('🤖 RAG Response: Seine river cruise, Montmartre sunset, intimate bistros...');
      console.log('');
    }

    // Workshop Learning Summary
    console.log('🎓 Workshop Learning Summary');
    console.log('='.repeat(60));
    console.log('');
    
    console.log('✅ Key RAG Concepts Learned:');
    console.log('   • Document-based knowledge storage');
    console.log('   • Vector embeddings for semantic search');
    console.log('   • Retrieval-Augmented Generation workflow');
    console.log('   • Context-aware AI responses');
    console.log('   • Knowledge base integration with LLMs');
    console.log('');

    console.log('🔧 RAG Architecture Components:');
    console.log('   • Document corpus (travel knowledge)');
    console.log('   • Embedding model (text-embedding-ada-002)');
    console.log('   • Vector store (in-memory for demo)');
    console.log('   • Retriever (similarity search, k=3)');
    console.log('   • RAG chain (retrieve → augment → generate)');
    console.log('');

    console.log('🚀 Advanced RAG Patterns:');
    console.log('   • Multi-document retrieval and ranking');
    console.log('   • Hybrid search (semantic + keyword)');
    console.log('   • Document chunking strategies');
    console.log('   • Persistent vector stores (Pinecone, Chroma)');
    console.log('   • Real-time knowledge updates');
    console.log('');

    console.log('💡 Workshop Exercise Ideas:');
    console.log('   • Add more destinations to knowledge base');
    console.log('   • Create specialized knowledge categories');
    console.log('   • Experiment with different retrieval parameters');
    console.log('   • Build domain-specific travel assistants');
    console.log('   • Compare RAG vs non-RAG responses');
    console.log('');

    console.log('🔮 Next Workshop Sessions:');
    console.log('   4. Memory: Remember user preferences across conversations');
    console.log('   5. Agents: Smart decision-making with travel tools');
    console.log('   6. Production: Deploy your complete Smart Travel Planner');

  } catch (error) {
    console.error('❌ Error in travel knowledge base demo:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Execute the demo when this file is run directly
(async () => {
  try {
    await travelKnowledgeBaseDemo();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
})();
