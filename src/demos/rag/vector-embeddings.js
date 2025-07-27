import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Vector Embeddings & Storage Demo
 * 
 * This demo shows how to create embeddings and store documents in vector databases.
 * Vector embeddings enable semantic search and similarity matching in RAG systems.
 */
async function vectorEmbeddingsDemo() {
    console.log('🚀 Executing Vector Embeddings & Storage Demo...');
    console.log('=' .repeat(60));

    console.log('🔢 Vector Embeddings Overview:');
    console.log('   • Convert text into high-dimensional numerical vectors');
    console.log('   • Enable semantic similarity search');
    console.log('   • Foundation for RAG retrieval systems');
    console.log('   • Support for various embedding models');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing vector embeddings concepts instead...');
        
        showVectorEmbeddingsConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with embeddings demo');

    // Initialize embeddings model
    console.log('\n🏗️ Initializing Embeddings Model...');
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-ada-002',
        maxRetries: 3,
    });

    console.log('✅ Embeddings model initialized:');
    console.log('   • Model: text-embedding-ada-002');
    console.log('   • Dimensions: 1536');
    console.log('   • Max retries: 3');

    // Create sample documents for embedding
    const sampleDocuments = [
        new Document({
            pageContent: "LangChain is a framework for developing applications powered by language models. It provides tools for document loading, text splitting, embeddings, and vector stores.",
            metadata: { source: "langchain_docs", topic: "framework", category: "technology" }
        }),
        new Document({
            pageContent: "Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models that enable computers to improve their performance on a specific task through experience.",
            metadata: { source: "ml_textbook", topic: "machine_learning", category: "technology" }
        }),
        new Document({
            pageContent: "Python is a high-level programming language known for its simplicity and readability. It's widely used in data science, web development, and artificial intelligence applications.",
            metadata: { source: "python_guide", topic: "programming", category: "technology" }
        }),
        new Document({
            pageContent: "Vector databases are specialized databases designed to store and query high-dimensional vectors efficiently. They enable fast similarity search and are essential for AI applications.",
            metadata: { source: "vector_db_guide", topic: "databases", category: "technology" }
        }),
        new Document({
            pageContent: "Natural language processing (NLP) is a branch of AI that helps computers understand, interpret, and manipulate human language. It combines computational linguistics with machine learning.",
            metadata: { source: "nlp_handbook", topic: "nlp", category: "technology" }
        }),
        new Document({
            pageContent: "The weather today is sunny with a temperature of 75°F. It's a perfect day for outdoor activities like hiking, picnicking, or playing sports in the park.",
            metadata: { source: "weather_report", topic: "weather", category: "lifestyle" }
        }),
        new Document({
            pageContent: "Cooking pasta is simple: boil water, add salt, cook pasta for 8-12 minutes until al dente, then drain and serve with your favorite sauce. Fresh herbs enhance the flavor.",
            metadata: { source: "cooking_tips", topic: "cooking", category: "lifestyle" }
        }),
        new Document({
            pageContent: "Regular exercise is important for maintaining good health. It helps strengthen muscles, improve cardiovascular health, boost mood, and increase energy levels throughout the day.",
            metadata: { source: "health_guide", topic: "fitness", category: "lifestyle" }
        })
    ];

    console.log('\n📚 Sample Documents Created:');
    console.log(`   Total documents: ${sampleDocuments.length}`);
    sampleDocuments.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.metadata.topic}: "${doc.pageContent.substring(0, 60)}..."`);
    });

    // Create vector store from documents
    console.log(`\n${'='.repeat(60)}`);
    console.log('🗄️ Creating Vector Store');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🔄 Generating embeddings and creating vector store...');
    console.log('⏳ This may take a moment as we call the OpenAI API...');

    try {
        const vectorStore = await MemoryVectorStore.fromDocuments(
            sampleDocuments,
            embeddings
        );

        console.log('✅ Vector store created successfully!');
        console.log(`   Documents embedded: ${sampleDocuments.length}`);
        console.log('   Storage: In-memory (for demo purposes)');

        // Demonstrate similarity search
        console.log(`\n${'='.repeat(60)}`);
        console.log('🔍 Similarity Search Demonstrations');
        console.log(`${'='.repeat(60)}`);

        const searchQueries = [
            {
                query: "What is artificial intelligence?",
                description: "Technology-related query"
            },
            {
                query: "How do I cook food?",
                description: "Lifestyle-related query"
            },
            {
                query: "Programming languages for data science",
                description: "Technical programming query"
            },
            {
                query: "Outdoor activities on a nice day",
                description: "Weather and activities query"
            }
        ];

        for (const searchTest of searchQueries) {
            console.log(`\n🔍 Search: "${searchTest.query}"`);
            console.log(`📝 Context: ${searchTest.description}`);
            
            try {
                const similarDocs = await vectorStore.similaritySearch(searchTest.query, 3);
                
                console.log(`✅ Found ${similarDocs.length} similar documents:`);
                similarDocs.forEach((doc, index) => {
                    console.log(`   ${index + 1}. Topic: ${doc.metadata.topic} (${doc.metadata.category})`);
                    console.log(`      Content: "${doc.pageContent.substring(0, 80)}..."`);
                });
                
            } catch (error) {
                console.log(`❌ Search error: ${error.message}`);
            }
        }

        // Demonstrate similarity search with scores
        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 Similarity Search with Scores');
        console.log(`${'='.repeat(60)}`);

        const scoreQuery = "machine learning and AI frameworks";
        console.log(`\n🎯 Query: "${scoreQuery}"`);
        
        try {
            const docsWithScores = await vectorStore.similaritySearchWithScore(scoreQuery, 4);
            
            console.log('✅ Results with similarity scores:');
            docsWithScores.forEach(([doc, score], index) => {
                console.log(`   ${index + 1}. Score: ${score.toFixed(4)} | Topic: ${doc.metadata.topic}`);
                console.log(`      Content: "${doc.pageContent.substring(0, 100)}..."`);
            });
            
            console.log('\n📈 Score Interpretation:');
            console.log('   • Lower scores = Higher similarity');
            console.log('   • Scores represent cosine distance');
            console.log('   • Typical range: 0.0 (identical) to 2.0 (opposite)');
            
        } catch (error) {
            console.log(`❌ Scored search error: ${error.message}`);
        }

        // Demonstrate metadata filtering
        console.log(`\n${'='.repeat(60)}`);
        console.log('🏷️ Metadata Filtering');
        console.log(`${'='.repeat(60)}`);

        const filterQuery = "learning and development";
        console.log(`\n🔍 Query: "${filterQuery}"`);
        console.log('🏷️ Filter: category = "technology"');
        
        try {
            const filteredDocs = await vectorStore.similaritySearch(
                filterQuery,
                3,
                { category: 'technology' }
            );
            
            console.log(`✅ Filtered results (${filteredDocs.length} documents):`);
            filteredDocs.forEach((doc, index) => {
                console.log(`   ${index + 1}. ${doc.metadata.topic} (${doc.metadata.category})`);
                console.log(`      "${doc.pageContent.substring(0, 80)}..."`);
            });
            
            // Compare with unfiltered search
            console.log('\n🔄 Comparing with unfiltered search...');
            const unfilteredDocs = await vectorStore.similaritySearch(filterQuery, 3);
            
            console.log('📊 Unfiltered results:');
            unfilteredDocs.forEach((doc, index) => {
                console.log(`   ${index + 1}. ${doc.metadata.topic} (${doc.metadata.category})`);
            });
            
        } catch (error) {
            console.log(`❌ Filtered search error: ${error.message}`);
        }

        // Demonstrate adding new documents
        console.log(`\n${'='.repeat(60)}`);
        console.log('➕ Adding New Documents');
        console.log(`${'='.repeat(60)}`);

        const newDocuments = [
            new Document({
                pageContent: "React is a JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM for efficient rendering and state management.",
                metadata: { source: "react_docs", topic: "react", category: "technology" }
            }),
            new Document({
                pageContent: "Meditation is a practice that involves focusing the mind to achieve mental clarity and emotional stability. Regular meditation can reduce stress and improve overall well-being.",
                metadata: { source: "wellness_guide", topic: "meditation", category: "lifestyle" }
            })
        ];

        console.log('\n📝 Adding new documents to vector store...');
        try {
            await vectorStore.addDocuments(newDocuments);
            
            console.log('✅ New documents added successfully!');
            console.log(`   Documents added: ${newDocuments.length}`);
            
            // Test search with new documents
            const testQuery = "JavaScript frameworks for web development";
            console.log(`\n🔍 Testing search with new documents: "${testQuery}"`);
            
            const updatedResults = await vectorStore.similaritySearch(testQuery, 3);
            console.log('📊 Updated search results:');
            updatedResults.forEach((doc, index) => {
                console.log(`   ${index + 1}. ${doc.metadata.topic}: "${doc.pageContent.substring(0, 60)}..."`);
            });
            
        } catch (error) {
            console.log(`❌ Error adding documents: ${error.message}`);
        }

        // Demonstrate working with larger document sets
        console.log(`\n${'='.repeat(60)}`);
        console.log('📈 Scaling with Larger Document Sets');
        console.log(`${'='.repeat(60)}`);

        // Create a larger set of documents by splitting a long text
        const longText = `
        Artificial intelligence has revolutionized many industries in recent years. From healthcare to finance, AI applications are transforming how we work and live.

        In healthcare, AI is being used for medical imaging analysis, drug discovery, and personalized treatment plans. Machine learning algorithms can detect diseases in medical scans with accuracy that matches or exceeds human specialists.

        The finance industry has embraced AI for fraud detection, algorithmic trading, and risk assessment. Banks use machine learning to analyze transaction patterns and identify suspicious activities in real-time.

        Transportation is another sector experiencing AI transformation. Autonomous vehicles use computer vision and sensor fusion to navigate roads safely. While fully self-driving cars are still being perfected, AI has already improved vehicle safety through features like automatic emergency braking.

        In education, AI-powered tutoring systems provide personalized learning experiences. These systems adapt to individual student needs and learning styles, helping improve educational outcomes.

        The retail industry uses AI for inventory management, demand forecasting, and customer recommendation systems. E-commerce platforms analyze user behavior to suggest products that customers are likely to purchase.

        Manufacturing has integrated AI for predictive maintenance, quality control, and supply chain optimization. Smart factories use AI to monitor equipment health and predict when maintenance is needed.

        Entertainment and media companies use AI for content recommendation, automated content creation, and audience analysis. Streaming platforms use machine learning to suggest movies and shows based on viewing history.

        As AI continues to evolve, we can expect to see even more innovative applications across various industries. The key to successful AI implementation is understanding the specific needs of each domain and choosing the right AI techniques to address those challenges.
        `;

        console.log('\n✂️ Splitting long text into chunks...');
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 300,
            chunkOverlap: 50,
        });

        const splitDocs = await textSplitter.createDocuments([longText], [{
            source: "ai_industries_report",
            topic: "ai_applications",
            category: "technology"
        }]);

        console.log(`📄 Created ${splitDocs.length} document chunks`);

        try {
            console.log('🔄 Creating new vector store with larger document set...');
            const largeVectorStore = await MemoryVectorStore.fromDocuments(
                [...sampleDocuments, ...newDocuments, ...splitDocs],
                embeddings
            );

            console.log('✅ Large vector store created!');
            console.log(`   Total documents: ${sampleDocuments.length + newDocuments.length + splitDocs.length}`);

            // Test search performance
            const performanceQuery = "AI applications in different industries";
            console.log(`\n⚡ Performance test: "${performanceQuery}"`);
            
            const startTime = Date.now();
            const performanceResults = await largeVectorStore.similaritySearch(performanceQuery, 5);
            const endTime = Date.now();
            
            console.log(`✅ Search completed in ${endTime - startTime}ms`);
            console.log('🎯 Top results:');
            performanceResults.forEach((doc, index) => {
                console.log(`   ${index + 1}. "${doc.pageContent.substring(0, 80)}..."`);
            });

        } catch (error) {
            console.log(`❌ Error with large vector store: ${error.message}`);
        }

    } catch (error) {
        console.log('❌ Error creating vector store:', error.message);
        console.log('💡 This might be due to API limits or network issues');
    }

    // Vector embeddings best practices
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Vector Embeddings Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🎯 Embedding Model Selection:');
    console.log('   • OpenAI text-embedding-ada-002: General purpose, good performance');
    console.log('   • Consider domain-specific models for specialized content');
    console.log('   • Balance between model quality and cost');
    console.log('   • Ensure consistent model usage across your application');

    console.log('\n📏 Chunk Size Optimization:');
    console.log('   • Smaller chunks: More precise retrieval, may lose context');
    console.log('   • Larger chunks: More context, may reduce precision');
    console.log('   • Test different sizes for your specific use case');
    console.log('   • Consider your embedding model\'s token limits');

    console.log('\n🏷️ Metadata Strategy:');
    console.log('   • Include relevant filtering attributes');
    console.log('   • Add source, topic, and category information');
    console.log('   • Enable efficient filtering and organization');
    console.log('   • Balance metadata richness with storage efficiency');

    console.log('\n⚡ Performance Considerations:');
    console.log('   • Batch embedding operations when possible');
    console.log('   • Use persistent vector stores for production');
    console.log('   • Consider indexing strategies for large datasets');
    console.log('   • Monitor embedding API usage and costs');

    console.log('\n🔒 Production Considerations:');
    console.log('   • Use persistent storage (Pinecone, Chroma, etc.)');
    console.log('   • Implement proper error handling and retries');
    console.log('   • Monitor vector store performance and accuracy');
    console.log('   • Plan for embedding model updates and migrations');

    console.log('\n✅ Vector Embeddings & Storage Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Vector embeddings enable semantic similarity search');
    console.log('   • Proper document chunking is crucial for good results');
    console.log('   • Metadata filtering enhances search precision');
    console.log('   • Vector stores are the foundation of RAG systems');
    console.log('   • Consider performance and cost when scaling');
}

function showVectorEmbeddingsConcepts() {
    console.log('\n🔢 Vector Embeddings Concepts:');
    
    console.log('\n📊 What are Embeddings?');
    console.log('   • Numerical representations of text in high-dimensional space');
    console.log('   • Similar texts have similar vector representations');
    console.log('   • Enable mathematical operations on semantic meaning');
    console.log('   • Typical dimensions: 384, 768, 1536, etc.');
    
    console.log('\n🎯 Similarity Search Process:');
    console.log('   1. Convert query text to vector embedding');
    console.log('   2. Calculate distance/similarity to stored vectors');
    console.log('   3. Return documents with highest similarity scores');
    console.log('   4. Common metrics: cosine similarity, dot product');
    
    console.log('\n🏗️ Vector Store Architecture:');
    console.log('   • Document storage with associated embeddings');
    console.log('   • Efficient indexing for fast similarity search');
    console.log('   • Metadata filtering capabilities');
    console.log('   • Scalable storage and retrieval systems');
    
    console.log('\n💡 Example Use Cases:');
    console.log('   • Semantic search in document collections');
    console.log('   • Question answering systems');
    console.log('   • Content recommendation engines');
    console.log('   • Duplicate detection and clustering');
}

// Execute the demo
vectorEmbeddingsDemo().catch(console.error);
