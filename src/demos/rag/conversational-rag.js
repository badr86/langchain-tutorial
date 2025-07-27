import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { 
    RunnableSequence, 
    RunnablePassthrough,
    RunnableLambda 
} from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Conversational RAG Demo
 * 
 * This demo shows how to build RAG systems that maintain conversation context
 * and can handle follow-up questions, references to previous exchanges, and
 * multi-turn dialogues while retrieving relevant information.
 */
async function conversationalRAGDemo() {
    console.log('🚀 Executing Conversational RAG Demo...');
    console.log('=' .repeat(60));

    console.log('💬 Conversational RAG Features:');
    console.log('   • Maintain conversation history and context');
    console.log('   • Handle follow-up questions and references');
    console.log('   • Combine memory with document retrieval');
    console.log('   • Support multi-turn dialogues');
    console.log('   • Context-aware query reformulation');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing conversational RAG concepts instead...');
        
        showConversationalRAGConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with conversational RAG demo');

    // Initialize components
    console.log('\n🏗️ Initializing Conversational RAG Components...');
    
    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.4,
        maxTokens: 600,
    });

    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-ada-002',
    });

    console.log('✅ Components initialized');

    // Create knowledge base for technology topics
    console.log('\n📚 Creating Technology Knowledge Base...');
    
    const techKnowledgeBase = [
        {
            content: `# React.js Framework

React is a JavaScript library for building user interfaces, particularly web applications. It was developed by Facebook and is now maintained by Meta and the open-source community.

## Key Concepts

### Components
React applications are built using components - reusable pieces of UI that can manage their own state and lifecycle. Components can be functional or class-based.

### JSX
JSX is a syntax extension that allows you to write HTML-like code in JavaScript. It makes React components more readable and easier to write.

### State Management
React provides built-in state management through the useState hook for functional components or this.state for class components. For complex applications, external state management libraries like Redux or Zustand are often used.

### Virtual DOM
React uses a virtual DOM to optimize rendering performance. It creates a virtual representation of the UI in memory and efficiently updates only the parts that have changed.

### Hooks
Hooks are functions that let you use state and other React features in functional components. Common hooks include useState, useEffect, useContext, and useReducer.

## Popular React Ecosystem
- **Next.js**: Full-stack React framework with server-side rendering
- **Create React App**: Tool for setting up React projects quickly
- **React Router**: Client-side routing for single-page applications
- **Material-UI**: React component library implementing Google's Material Design
- **Styled Components**: CSS-in-JS library for styling React components`,
            metadata: { topic: 'react', category: 'frontend', framework: 'javascript' }
        },
        {
            content: `# Node.js Runtime Environment

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows developers to run JavaScript on the server side, enabling full-stack JavaScript development.

## Core Features

### Event-Driven Architecture
Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. This is particularly well-suited for I/O-intensive applications.

### NPM (Node Package Manager)
NPM is the default package manager for Node.js, providing access to hundreds of thousands of reusable packages. It's the largest software registry in the world.

### Modules and CommonJS
Node.js uses the CommonJS module system, allowing developers to organize code into reusable modules using require() and module.exports.

### Asynchronous Programming
Node.js heavily relies on callbacks, promises, and async/await for handling asynchronous operations, making it excellent for handling concurrent requests.

## Popular Node.js Frameworks
- **Express.js**: Minimal and flexible web application framework
- **Koa.js**: Next-generation web framework designed by the Express team
- **NestJS**: Progressive Node.js framework for building scalable server-side applications
- **Fastify**: Fast and low overhead web framework
- **Hapi.js**: Rich framework for building applications and services

## Use Cases
- Web servers and APIs
- Real-time applications (chat, gaming)
- Microservices architecture
- Command-line tools
- Desktop applications (with Electron)`,
            metadata: { topic: 'nodejs', category: 'backend', framework: 'javascript' }
        },
        {
            content: `# Python Web Development

Python offers several powerful frameworks for web development, each with its own philosophy and strengths.

## Django Framework

Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. It follows the "batteries included" philosophy.

### Key Features
- **ORM (Object-Relational Mapping)**: Built-in database abstraction layer
- **Admin Interface**: Automatic admin interface for managing application data
- **Authentication System**: Built-in user authentication and authorization
- **Template Engine**: Powerful template system for generating HTML
- **URL Routing**: Clean and flexible URL configuration
- **Security Features**: Protection against common web vulnerabilities

### Django Architecture
Django follows the Model-View-Template (MVT) pattern:
- **Models**: Define data structure and database schema
- **Views**: Handle business logic and process requests
- **Templates**: Define presentation layer and user interface

## Flask Framework

Flask is a lightweight and flexible micro-framework that gives developers more control over components and architecture.

### Flask Characteristics
- **Minimalist Core**: Small core with extensions for additional functionality
- **Flexibility**: Developers choose their own tools and libraries
- **Easy to Learn**: Simple and straightforward for beginners
- **Extensible**: Rich ecosystem of extensions
- **Template Engine**: Uses Jinja2 templating engine

## FastAPI Framework

FastAPI is a modern, fast web framework for building APIs with Python 3.6+ based on standard Python type hints.

### FastAPI Benefits
- **High Performance**: One of the fastest Python frameworks
- **Type Safety**: Built-in support for Python type hints
- **Automatic Documentation**: Auto-generated interactive API docs
- **Modern Standards**: Based on OpenAPI and JSON Schema
- **Easy Testing**: Built-in testing support`,
            metadata: { topic: 'python_web', category: 'backend', framework: 'python' }
        },
        {
            content: `# Database Technologies

Modern applications rely on various database technologies, each optimized for different use cases and data patterns.

## Relational Databases (SQL)

### PostgreSQL
PostgreSQL is a powerful, open-source object-relational database system with strong standards compliance and advanced features.

**Key Features:**
- ACID compliance
- Advanced indexing
- Full-text search
- JSON support
- Extensibility with custom functions
- Strong data integrity

### MySQL
MySQL is one of the most popular open-source relational database management systems, known for its reliability and ease of use.

**Characteristics:**
- High performance
- Scalability
- Security features
- Cross-platform support
- Large community

## NoSQL Databases

### MongoDB
MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents.

**Advantages:**
- Schema flexibility
- Horizontal scaling
- Rich query language
- Aggregation framework
- GridFS for file storage

### Redis
Redis is an in-memory data structure store used as a database, cache, and message broker.

**Use Cases:**
- Caching
- Session storage
- Real-time analytics
- Message queuing
- Leaderboards

## Database Design Principles
- **Normalization**: Organize data to reduce redundancy
- **Indexing**: Optimize query performance
- **ACID Properties**: Ensure data consistency and reliability
- **Scalability**: Design for growth and performance
- **Security**: Implement proper access controls and encryption`,
            metadata: { topic: 'databases', category: 'backend', framework: 'general' }
        }
    ];

    // Create documents and split them
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 600,
        chunkOverlap: 100,
    });

    let allDocs = [];
    for (const docData of techKnowledgeBase) {
        const chunks = await textSplitter.createDocuments([docData.content], [docData.metadata]);
        allDocs = allDocs.concat(chunks);
    }

    console.log(`✅ Knowledge base created: ${allDocs.length} document chunks`);

    try {
        // Create vector store
        console.log('\n🔄 Creating vector store...');
        const vectorStore = await MemoryVectorStore.fromDocuments(allDocs, embeddings);
        const retriever = vectorStore.asRetriever({ k: 3 });
        console.log('✅ Vector store and retriever created');

        // Conversational RAG Implementation
        console.log(`\n${'='.repeat(60)}`);
        console.log('💬 Building Conversational RAG System');
        console.log(`${'='.repeat(60)}`);

        // Create conversation history storage
        let conversationHistory = [];

        // Query reformulation for context awareness
        const queryReformulationPrompt = ChatPromptTemplate.fromTemplate(`
Given the conversation history and the current question, reformulate the question to be more specific and context-aware for better document retrieval.

Conversation History:
{chat_history}

Current Question: {question}

Instructions:
- If the question refers to "it", "that", "this", or other pronouns, replace them with specific terms from the conversation history
- Add relevant context from previous exchanges if it helps clarify the question
- Keep the core intent of the original question
- Make the question more specific and searchable
- If the question is already clear and specific, return it unchanged

Reformulated Question:`);

        const queryReformulator = RunnableSequence.from([
            queryReformulationPrompt,
            llm,
            new StringOutputParser(),
        ]);

        // Conversational RAG prompt
        const conversationalRAGPrompt = ChatPromptTemplate.fromTemplate(`
You are a helpful technical assistant. Answer the question based on the provided context and conversation history.

Conversation History:
{chat_history}

Retrieved Context:
{context}

Current Question: {question}

Instructions:
- Use the retrieved context as your primary source of information
- Consider the conversation history to maintain context and continuity
- If the question refers to previous topics, acknowledge the connection
- Provide specific, accurate information from the context
- If the context doesn't contain enough information, say so clearly
- Be conversational and maintain the flow of dialogue

Answer:`);

        // Build conversational RAG chain
        const conversationalRAGChain = RunnableSequence.from([
            // Step 1: Reformulate query with conversation context
            {
                reformulated_question: RunnableLambda.from(async (input) => {
                    const chatHistory = conversationHistory.map(msg => 
                        `${msg.type === 'human' ? 'Human' : 'Assistant'}: ${msg.content}`
                    ).join('\n');
                    
                    return await queryReformulator.invoke({
                        chat_history: chatHistory,
                        question: input.question
                    });
                }),
                original_question: RunnableLambda.from(async (input) => input.question),
                chat_history: RunnableLambda.from(async () => {
                    return conversationHistory.map(msg => 
                        `${msg.type === 'human' ? 'Human' : 'Assistant'}: ${msg.content}`
                    ).join('\n');
                })
            },
            // Step 2: Retrieve documents using reformulated query
            {
                context: RunnableLambda.from(async (input) => {
                    const docs = await retriever.getRelevantDocuments(input.reformulated_question);
                    return formatDocumentsAsString(docs);
                }),
                question: RunnableLambda.from(async (input) => input.original_question),
                chat_history: RunnableLambda.from(async (input) => input.chat_history),
                reformulated_question: RunnableLambda.from(async (input) => input.reformulated_question)
            },
            // Step 3: Generate conversational response
            conversationalRAGPrompt,
            llm,
            new StringOutputParser(),
        ]);

        console.log('✅ Conversational RAG chain built');

        // Simulate a multi-turn conversation
        console.log(`\n${'='.repeat(60)}`);
        console.log('🗣️ Multi-Turn Conversation Simulation');
        console.log(`${'='.repeat(60)}`);

        const conversationFlow = [
            {
                question: "What is React and what are its main features?",
                context: "Starting a new conversation about React"
            },
            {
                question: "How does the Virtual DOM work in it?",
                context: "Following up on React, asking about Virtual DOM"
            },
            {
                question: "What are some popular libraries that work well with React?",
                context: "Asking about React ecosystem"
            },
            {
                question: "Can you compare it to Node.js?",
                context: "Comparing React to Node.js (should clarify the comparison)"
            },
            {
                question: "What about database options for a full-stack application?",
                context: "Expanding to discuss databases for full-stack development"
            },
            {
                question: "Which database would be best for a real-time chat application?",
                context: "Specific use case question about databases"
            }
        ];

        for (let i = 0; i < conversationFlow.length; i++) {
            const turn = conversationFlow[i];
            console.log(`\n--- Turn ${i + 1} ---`);
            console.log(`👤 Human: ${turn.question}`);
            console.log(`📝 Context: ${turn.context}`);

            try {
                // Show query reformulation
                const chatHistory = conversationHistory.map(msg => 
                    `${msg.type === 'human' ? 'Human' : 'Assistant'}: ${msg.content}`
                ).join('\n');

                if (chatHistory) {
                    const reformulatedQuery = await queryReformulator.invoke({
                        chat_history: chatHistory,
                        question: turn.question
                    });
                    console.log(`🔄 Reformulated: "${reformulatedQuery}"`);
                }

                // Get response from conversational RAG
                const response = await conversationalRAGChain.invoke({
                    question: turn.question
                });

                console.log(`🤖 Assistant: ${response}`);

                // Update conversation history
                conversationHistory.push({ type: 'human', content: turn.question });
                conversationHistory.push({ type: 'assistant', content: response });

                // Keep conversation history manageable (last 10 messages)
                if (conversationHistory.length > 10) {
                    conversationHistory = conversationHistory.slice(-10);
                }

            } catch (error) {
                console.log(`❌ Error in turn ${i + 1}: ${error.message}`);
            }
        }

        // Demonstrate conversation memory analysis
        console.log(`\n${'='.repeat(60)}`);
        console.log('🧠 Conversation Memory Analysis');
        console.log(`${'='.repeat(60)}`);

        console.log('\n📊 Conversation Statistics:');
        console.log(`   Total exchanges: ${conversationHistory.length / 2}`);
        console.log(`   Messages in history: ${conversationHistory.length}`);

        console.log('\n💭 Conversation Topics Covered:');
        const topics = ['React', 'Virtual DOM', 'Node.js', 'databases', 'real-time', 'chat'];
        topics.forEach(topic => {
            const mentions = conversationHistory.filter(msg => 
                msg.content.toLowerCase().includes(topic.toLowerCase())
            ).length;
            if (mentions > 0) {
                console.log(`   • ${topic}: ${mentions} mentions`);
            }
        });

        // Advanced conversational features
        console.log(`\n${'='.repeat(60)}`);
        console.log('🔧 Advanced Conversational Features');
        console.log(`${'='.repeat(60)}`);

        // Context summarization for long conversations
        const contextSummarizationPrompt = ChatPromptTemplate.fromTemplate(`
Summarize the key points from this conversation history, focusing on the main topics discussed and important information shared.

Conversation History:
{chat_history}

Instructions:
- Identify the main topics and themes
- Highlight key technical information discussed
- Note any preferences or specific requirements mentioned
- Keep the summary concise but comprehensive
- Focus on information that would be useful for future questions

Summary:`);

        console.log('\n📝 Generating conversation summary...');
        try {
            const chatHistory = conversationHistory.map(msg => 
                `${msg.type === 'human' ? 'Human' : 'Assistant'}: ${msg.content}`
            ).join('\n');

            const conversationSummary = await contextSummarizationPrompt
                .pipe(llm)
                .pipe(new StringOutputParser())
                .invoke({ chat_history: chatHistory });

            console.log('✅ Conversation Summary:');
            console.log(conversationSummary);

        } catch (error) {
            console.log(`❌ Error generating summary: ${error.message}`);
        }

        // Intent detection for better routing
        const intentDetectionPrompt = ChatPromptTemplate.fromTemplate(`
Analyze the user's question and classify the intent. Choose from these categories:

INFORMATION_SEEKING: User wants to learn about a topic
COMPARISON: User wants to compare different technologies or approaches
TROUBLESHOOTING: User has a problem and needs help solving it
RECOMMENDATION: User wants suggestions or best practices
CLARIFICATION: User wants to clarify something from previous conversation
FOLLOW_UP: User is asking a follow-up question to previous topic

Question: {question}
Conversation Context: {context}

Return only the intent category.

Intent:`);

        console.log('\n🎯 Testing intent detection...');
        const intentTestQuestions = [
            "What is the difference between React and Vue?",
            "I'm getting an error when trying to connect to MongoDB",
            "Which database should I use for my e-commerce project?",
            "Can you explain more about what you mentioned earlier?"
        ];

        for (const testQ of intentTestQuestions) {
            try {
                const intent = await intentDetectionPrompt
                    .pipe(llm)
                    .pipe(new StringOutputParser())
                    .invoke({
                        question: testQ,
                        context: "Previous discussion about web development technologies"
                    });

                console.log(`   Question: "${testQ}"`);
                console.log(`   Intent: ${intent.trim()}`);

            } catch (error) {
                console.log(`   Question: "${testQ}" - Error: ${error.message}`);
            }
        }

    } catch (error) {
        console.log('❌ Error in conversational RAG demo:', error.message);
    }

    // Conversational RAG best practices
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Conversational RAG Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n💭 Memory Management:');
    console.log('   • Keep conversation history manageable (sliding window)');
    console.log('   • Summarize long conversations to preserve context');
    console.log('   • Implement conversation topic tracking');
    console.log('   • Use conversation metadata for better retrieval');

    console.log('\n🔄 Query Processing:');
    console.log('   • Reformulate queries using conversation context');
    console.log('   • Resolve pronouns and references to previous topics');
    console.log('   • Maintain topic continuity across turns');
    console.log('   • Handle context switches gracefully');

    console.log('\n🎯 Intent Understanding:');
    console.log('   • Classify user intents for better routing');
    console.log('   • Detect follow-up questions and clarifications');
    console.log('   • Handle multi-intent queries appropriately');
    console.log('   • Adapt response style based on intent');

    console.log('\n🔗 Context Integration:');
    console.log('   • Combine retrieved documents with conversation history');
    console.log('   • Prioritize recent context over older information');
    console.log('   • Handle conflicting information sources');
    console.log('   • Maintain coherent narrative across turns');

    console.log('\n📊 Quality Assurance:');
    console.log('   • Monitor conversation flow and coherence');
    console.log('   • Track topic drift and guide conversations back');
    console.log('   • Implement conversation satisfaction metrics');
    console.log('   • Provide conversation reset mechanisms');

    console.log('\n✅ Conversational RAG Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Conversational RAG maintains context across multiple turns');
    console.log('   • Query reformulation improves retrieval with conversation context');
    console.log('   • Memory management is crucial for long conversations');
    console.log('   • Intent detection enables better response routing');
    console.log('   • Context integration creates coherent dialogue experiences');
}

function showConversationalRAGConcepts() {
    console.log('\n💬 Conversational RAG Concepts:');
    
    console.log('\n🔄 Conversation Flow:');
    console.log('   • Maintain context across multiple exchanges');
    console.log('   • Handle follow-up questions and references');
    console.log('   • Resolve pronouns using conversation history');
    console.log('   • Track topic evolution throughout dialogue');
    
    console.log('\n🧠 Memory Integration:');
    console.log('   • Combine conversation history with document retrieval');
    console.log('   • Use sliding window for manageable context');
    console.log('   • Summarize long conversations to preserve key information');
    console.log('   • Weight recent context higher than older exchanges');
    
    console.log('\n🎯 Query Enhancement:');
    console.log('   • Reformulate queries using conversation context');
    console.log('   • Add missing context from previous turns');
    console.log('   • Resolve ambiguous references');
    console.log('   • Maintain query intent while adding context');
    
    console.log('\n💡 Applications:');
    console.log('   • Customer support chatbots');
    console.log('   • Educational tutoring systems');
    console.log('   • Technical documentation assistants');
    console.log('   • Interactive research tools');
}

// Execute the demo
conversationalRAGDemo().catch(console.error);
