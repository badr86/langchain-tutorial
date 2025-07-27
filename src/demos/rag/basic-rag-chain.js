import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Basic RAG Chain Demo
 * 
 * This demo shows how to build a complete Retrieval-Augmented Generation (RAG) system
 * that combines document retrieval with language model generation.
 */
async function basicRAGChainDemo() {
    console.log('🚀 Executing Basic RAG Chain Demo...');
    console.log('=' .repeat(60));

    console.log('🔗 RAG Chain Overview:');
    console.log('   • Retrieve relevant documents based on user query');
    console.log('   • Augment LLM prompt with retrieved context');
    console.log('   • Generate informed responses using retrieved knowledge');
    console.log('   • Combine the power of search and generation');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing RAG chain concepts instead...');
        
        showRAGChainConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with RAG chain demo');

    // Initialize components
    console.log('\n🏗️ Initializing RAG Components...');
    
    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500,
    });

    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-ada-002',
    });

    console.log('✅ Components initialized:');
    console.log('   • LLM: gpt-3.5-turbo');
    console.log('   • Embeddings: text-embedding-ada-002');
    console.log('   • Vector Store: In-memory');

    // Create knowledge base documents
    console.log('\n📚 Creating Knowledge Base...');
    
    const knowledgeBase = `
# LangChain Framework Documentation

## What is LangChain?

LangChain is a framework for developing applications powered by language models. It provides a comprehensive set of tools and abstractions that make it easier to build complex applications that leverage the power of large language models (LLMs).

## Core Components

### LLMs and Chat Models
LangChain provides a standard interface for interacting with various language models, including OpenAI's GPT models, Anthropic's Claude, and open-source alternatives like Llama. The framework abstracts away the differences between different providers, allowing developers to switch between models easily.

### Prompts and Prompt Templates
The framework includes powerful prompt management capabilities. PromptTemplate allows you to create reusable prompts with variables, while ChatPromptTemplate enables structured conversation flows. Few-shot prompting is supported through example selectors.

### Chains
Chains are sequences of calls to LLMs or other utilities. Simple chains might just format a prompt and call an LLM, while complex chains can involve multiple steps, conditional logic, and parallel execution. The new LCEL (LangChain Expression Language) provides a declarative way to build chains.

### Memory
Memory components allow applications to maintain context across multiple interactions. BufferMemory stores the entire conversation history, while ConversationSummaryMemory creates summaries to manage long conversations. Custom memory implementations can be created for specific use cases.

### Agents
Agents are systems that use language models to determine which actions to take and in what order. They can use tools to interact with external systems, APIs, or databases. ReAct agents combine reasoning and acting, while function-calling agents use structured tool definitions.

### Document Loaders and Text Splitters
LangChain includes loaders for various document formats including PDF, Word, CSV, and web pages. Text splitters help break large documents into manageable chunks for processing. The RecursiveCharacterTextSplitter is particularly effective for maintaining semantic coherence.

### Vector Stores and Embeddings
The framework supports various vector databases for storing and retrieving document embeddings. This enables semantic search capabilities that are essential for RAG applications. Popular integrations include Pinecone, Chroma, and FAISS.

### Retrievers
Retrievers are interfaces that return documents given an unstructured query. They are commonly used in RAG applications to find relevant context for answering questions. Various retrieval strategies are supported, including similarity search and MMR (Maximum Marginal Relevance).

## RAG (Retrieval-Augmented Generation)

RAG is a technique that combines information retrieval with text generation. Instead of relying solely on the knowledge encoded in the language model's parameters, RAG systems retrieve relevant documents from a knowledge base and use them to inform the generation process.

### RAG Process
1. **Indexing**: Documents are processed, split into chunks, embedded, and stored in a vector database
2. **Retrieval**: Given a query, relevant document chunks are retrieved using similarity search
3. **Generation**: The retrieved context is combined with the query in a prompt sent to the LLM
4. **Response**: The LLM generates a response based on both its training and the retrieved context

### Benefits of RAG
- Access to up-to-date information not in the model's training data
- Ability to cite sources and provide verifiable information
- Reduced hallucination by grounding responses in actual documents
- Cost-effective way to add domain-specific knowledge

## LCEL (LangChain Expression Language)

LCEL is a declarative way to compose chains in LangChain. It uses a pipe operator (|) to connect different components, making chains more readable and easier to debug.

### LCEL Features
- Streaming support for real-time responses
- Parallel execution for improved performance
- Built-in retry and fallback mechanisms
- Automatic batching for efficiency
- Type safety and validation

## Best Practices

### Prompt Engineering
- Use clear, specific instructions
- Provide examples when possible
- Structure prompts consistently
- Test with various inputs

### Chain Design
- Keep chains modular and reusable
- Handle errors gracefully
- Log intermediate steps for debugging
- Optimize for performance

### Memory Management
- Choose appropriate memory types for your use case
- Monitor memory usage in long conversations
- Implement memory cleanup strategies
- Consider privacy implications

### Vector Store Optimization
- Choose appropriate chunk sizes
- Use meaningful metadata
- Implement proper indexing strategies
- Monitor retrieval quality

## Common Use Cases

### Question Answering
Build systems that can answer questions based on your documents or knowledge base. RAG is particularly effective for this use case.

### Chatbots and Virtual Assistants
Create conversational agents that can maintain context and provide helpful responses based on your organization's knowledge.

### Content Generation
Generate content that is informed by your existing documents and data sources.

### Document Analysis
Analyze and extract insights from large document collections using LLM capabilities combined with retrieval.

### Code Generation and Analysis
Build systems that can generate code based on documentation or analyze existing codebases.

## Getting Started

To get started with LangChain:
1. Install the necessary packages
2. Set up your API keys
3. Choose your components (LLM, embeddings, vector store)
4. Build your first chain
5. Test and iterate

The framework's modular design makes it easy to start simple and add complexity as needed.
`;

    // Split the knowledge base into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ['\n## ', '\n### ', '\n\n', '\n', ' ', ''],
    });

    const docs = await textSplitter.createDocuments([knowledgeBase], [{
        source: 'langchain_documentation',
        type: 'documentation'
    }]);

    console.log(`✅ Knowledge base created: ${docs.length} document chunks`);

    // Create vector store
    console.log('\n🔄 Creating vector store from documents...');
    console.log('⏳ This may take a moment as we generate embeddings...');

    try {
        const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
        console.log('✅ Vector store created successfully!');

        // Create retriever
        const retriever = vectorStore.asRetriever({
            k: 4, // Retrieve top 4 most similar documents
            searchType: 'similarity',
        });

        console.log('✅ Retriever configured (k=4, similarity search)');

        // Create RAG prompt template
        console.log('\n📝 Creating RAG Prompt Template...');
        
        const ragPromptTemplate = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on the provided context.

Context:
{context}

Question: {question}

Instructions:
- Answer the question based primarily on the provided context
- If the context doesn't contain enough information, say so clearly
- Provide specific details from the context when possible
- Be concise but comprehensive
- If you reference specific information, indicate it comes from the context

Answer:`);

        console.log('✅ RAG prompt template created');

        // Build the RAG chain using LCEL
        console.log('\n🔗 Building RAG Chain with LCEL...');
        
        const ragChain = RunnableSequence.from([
            {
                context: retriever.pipe(formatDocumentsAsString),
                question: new RunnablePassthrough(),
            },
            ragPromptTemplate,
            llm,
            new StringOutputParser(),
        ]);

        console.log('✅ RAG chain built successfully!');
        console.log('   Chain components:');
        console.log('   1. Retriever → Document formatting');
        console.log('   2. Question passthrough');
        console.log('   3. RAG prompt template');
        console.log('   4. Language model');
        console.log('   5. String output parser');

        // Test the RAG chain with various questions
        console.log(`\n${'='.repeat(60)}`);
        console.log('🧪 Testing RAG Chain');
        console.log(`${'='.repeat(60)}`);

        const testQuestions = [
            {
                question: "What is LangChain and what are its main purposes?",
                category: "General overview"
            },
            {
                question: "How does RAG work and what are its benefits?",
                category: "RAG explanation"
            },
            {
                question: "What are the different types of memory in LangChain?",
                category: "Memory components"
            },
            {
                question: "What is LCEL and what are its key features?",
                category: "LCEL details"
            },
            {
                question: "What are some best practices for prompt engineering?",
                category: "Best practices"
            },
            {
                question: "How do I build a chatbot using LangChain?",
                category: "Use case specific"
            }
        ];

        for (const test of testQuestions) {
            console.log(`\n❓ Question (${test.category}): "${test.question}"`);
            console.log('🔍 Retrieving relevant context...');
            
            try {
                // Show retrieved documents first
                const retrievedDocs = await retriever.getRelevantDocuments(test.question);
                console.log(`📚 Retrieved ${retrievedDocs.length} relevant documents:`);
                retrievedDocs.forEach((doc, index) => {
                    const preview = doc.pageContent.substring(0, 100).replace(/\n/g, ' ');
                    console.log(`   ${index + 1}. "${preview}..."`);
                });

                // Generate answer using RAG chain
                console.log('\n🤖 Generating answer...');
                const answer = await ragChain.invoke(test.question);
                
                console.log('✅ RAG Response:');
                console.log(`   ${answer}`);
                
            } catch (error) {
                console.log(`❌ Error processing question: ${error.message}`);
            }
        }

        // Demonstrate retrieval quality analysis
        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 Retrieval Quality Analysis');
        console.log(`${'='.repeat(60)}`);

        const analysisQuery = "What are agents in LangChain?";
        console.log(`\n🔍 Analysis Query: "${analysisQuery}"`);

        try {
            const retrievedDocs = await retriever.getRelevantDocuments(analysisQuery);
            
            console.log('\n📈 Retrieval Analysis:');
            console.log(`   Documents retrieved: ${retrievedDocs.length}`);
            
            retrievedDocs.forEach((doc, index) => {
                const wordCount = doc.pageContent.split(/\s+/).length;
                const hasAgentMention = doc.pageContent.toLowerCase().includes('agent');
                const relevanceIndicators = [
                    doc.pageContent.toLowerCase().includes('agent'),
                    doc.pageContent.toLowerCase().includes('tool'),
                    doc.pageContent.toLowerCase().includes('action'),
                    doc.pageContent.toLowerCase().includes('react')
                ].filter(Boolean).length;
                
                console.log(`   Document ${index + 1}:`);
                console.log(`     Word count: ${wordCount}`);
                console.log(`     Contains "agent": ${hasAgentMention}`);
                console.log(`     Relevance indicators: ${relevanceIndicators}/4`);
                console.log(`     Preview: "${doc.pageContent.substring(0, 120).replace(/\n/g, ' ')}..."`);
            });
            
        } catch (error) {
            console.log(`❌ Error in retrieval analysis: ${error.message}`);
        }

        // Demonstrate chain customization
        console.log(`\n${'='.repeat(60)}`);
        console.log('🛠️ Chain Customization Examples');
        console.log(`${'='.repeat(60)}`);

        // Create a more detailed RAG chain with source citations
        console.log('\n📝 Creating enhanced RAG chain with source citations...');
        
        const enhancedPromptTemplate = ChatPromptTemplate.fromTemplate(`
You are a knowledgeable assistant that provides detailed answers with source citations.

Context Documents:
{context}

Question: {question}

Instructions:
- Provide a comprehensive answer based on the context
- Include specific details and examples from the context
- At the end, list the key sources that informed your answer
- If information is missing, clearly state what additional information would be helpful
- Structure your response with clear sections if appropriate

Answer:`);

        const enhancedRAGChain = RunnableSequence.from([
            {
                context: retriever.pipe(formatDocumentsAsString),
                question: new RunnablePassthrough(),
            },
            enhancedPromptTemplate,
            llm,
            new StringOutputParser(),
        ]);

        console.log('✅ Enhanced RAG chain created');

        const enhancedQuery = "How should I choose between different memory types in LangChain?";
        console.log(`\n❓ Enhanced Query: "${enhancedQuery}"`);

        try {
            const enhancedAnswer = await enhancedRAGChain.invoke(enhancedQuery);
            console.log('✅ Enhanced RAG Response:');
            console.log(`   ${enhancedAnswer}`);
            
        } catch (error) {
            console.log(`❌ Error with enhanced chain: ${error.message}`);
        }

    } catch (error) {
        console.log('❌ Error creating vector store:', error.message);
        console.log('💡 This might be due to API limits or network issues');
    }

    // RAG best practices
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 RAG Chain Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🎯 Retrieval Optimization:');
    console.log('   • Choose appropriate chunk sizes for your content');
    console.log('   • Tune the number of retrieved documents (k parameter)');
    console.log('   • Use metadata filtering for better precision');
    console.log('   • Consider hybrid search (keyword + semantic)');

    console.log('\n📝 Prompt Engineering:');
    console.log('   • Clearly instruct the model to use the provided context');
    console.log('   • Include instructions for handling insufficient information');
    console.log('   • Structure prompts for consistent output format');
    console.log('   • Test prompts with various query types');

    console.log('\n🔗 Chain Design:');
    console.log('   • Use LCEL for readable and maintainable chains');
    console.log('   • Implement proper error handling');
    console.log('   • Add logging for debugging and monitoring');
    console.log('   • Consider streaming for better user experience');

    console.log('\n📊 Quality Assurance:');
    console.log('   • Evaluate retrieval relevance regularly');
    console.log('   • Monitor answer quality and accuracy');
    console.log('   • Implement feedback loops for improvement');
    console.log('   • Test with diverse query types and edge cases');

    console.log('\n⚡ Performance Considerations:');
    console.log('   • Cache embeddings and frequent queries');
    console.log('   • Use appropriate vector store for your scale');
    console.log('   • Optimize chunk overlap and size');
    console.log('   • Monitor API usage and costs');

    console.log('\n✅ Basic RAG Chain Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • RAG combines retrieval and generation for informed responses');
    console.log('   • LCEL makes building RAG chains intuitive and maintainable');
    console.log('   • Quality retrieval is crucial for good RAG performance');
    console.log('   • Proper prompt engineering guides the model effectively');
    console.log('   • Regular evaluation ensures consistent quality');
}

function showRAGChainConcepts() {
    console.log('\n🔗 RAG Chain Concepts:');
    
    console.log('\n🔄 RAG Process Flow:');
    console.log('   1. User asks a question');
    console.log('   2. Question is embedded into vector space');
    console.log('   3. Similar documents are retrieved from vector store');
    console.log('   4. Retrieved context is combined with question in prompt');
    console.log('   5. LLM generates answer based on context and question');
    console.log('   6. Response is returned to user');
    
    console.log('\n🏗️ Key Components:');
    console.log('   • Document Store: Contains the knowledge base');
    console.log('   • Embeddings: Convert text to searchable vectors');
    console.log('   • Retriever: Finds relevant documents for queries');
    console.log('   • Prompt Template: Structures context and question');
    console.log('   • Language Model: Generates informed responses');
    
    console.log('\n💡 Benefits of RAG:');
    console.log('   • Access to current, domain-specific information');
    console.log('   • Reduced hallucination through grounding');
    console.log('   • Ability to cite and verify sources');
    console.log('   • Cost-effective knowledge integration');
    
    console.log('\n🎯 Common Applications:');
    console.log('   • Customer support chatbots');
    console.log('   • Document Q&A systems');
    console.log('   • Research assistants');
    console.log('   • Knowledge base search');
}

// Execute the demo
basicRAGChainDemo().catch(console.error);
