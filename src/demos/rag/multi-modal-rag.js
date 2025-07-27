import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { 
    RunnableSequence, 
    RunnablePassthrough,
    RunnableLambda 
} from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Multi-Modal RAG Demo
 * 
 * This demo showcases RAG systems that can work with multiple types of content
 * including text, structured data, code, and metadata-rich documents.
 */
async function multiModalRAGDemo() {
    console.log('🚀 Executing Multi-Modal RAG Demo...');
    console.log('=' .repeat(60));

    console.log('🎭 Multi-Modal RAG Features:');
    console.log('   • Handle diverse content types (text, code, data, metadata)');
    console.log('   • Unified search across different modalities');
    console.log('   • Content-type aware retrieval and generation');
    console.log('   • Structured data integration with text');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing multi-modal RAG concepts instead...');
        
        showMultiModalRAGConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with multi-modal RAG demo');

    // Initialize components
    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.3,
        maxTokens: 600,
    });

    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-ada-002',
    });

    // Create multi-modal knowledge base
    const multiModalContent = [
        {
            content: `# API Authentication Guide

API key authentication is one of the simplest forms of authentication. The client includes an API key in the request headers.

## Implementation
- Generate unique API keys for each client
- Include the key in the Authorization header
- Validate the key on the server side
- Rate limit requests per API key

## JWT (JSON Web Tokens)
JWT is a compact, URL-safe means of representing claims between two parties.

### JWT Structure
A JWT consists of three parts:
- Header: Contains token type and signing algorithm
- Payload: Contains claims (user data, permissions)
- Signature: Ensures token integrity`,
            metadata: { 
                type: 'documentation', 
                topic: 'authentication', 
                format: 'text',
                complexity: 'intermediate'
            }
        },
        {
            content: `# Python API Authentication Examples

## API Key Authentication Example

\`\`\`python
import requests
import os

class APIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def get(self, endpoint: str):
        response = self.session.get(f"{self.base_url}/{endpoint}")
        response.raise_for_status()
        return response.json()

# Usage
client = APIClient("https://api.example.com", os.getenv("API_KEY"))
users = client.get("users")
\`\`\`

## JWT Authentication Example

\`\`\`python
import jwt
import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

def generate_jwt_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
\`\`\``,
            metadata: { 
                type: 'code', 
                topic: 'authentication', 
                language: 'python',
                format: 'code_examples',
                complexity: 'intermediate'
            }
        },
        {
            content: `# HTTP Status Codes Reference

## Success Codes (2xx)
- **200 OK**: Request successful, response body contains data
- **201 Created**: Resource successfully created
- **204 No Content**: Request successful, no response body

## Client Error Codes (4xx)
- **400 Bad Request**: Invalid request syntax
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded

## Standard API Response Format

\`\`\`json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
\`\`\``,
            metadata: { 
                type: 'reference', 
                topic: 'api_standards', 
                format: 'structured_data',
                complexity: 'beginner'
            }
        }
    ];

    // Process multi-modal content
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 100,
    });

    let allDocs = [];
    for (const content of multiModalContent) {
        const chunks = await textSplitter.createDocuments([content.content], [content.metadata]);
        allDocs = allDocs.concat(chunks);
    }

    console.log(`✅ Multi-modal content processed: ${allDocs.length} document chunks`);

    try {
        // Create vector store
        const vectorStore = await MemoryVectorStore.fromDocuments(allDocs, embeddings);
        console.log('✅ Vector store created successfully!');

        // Content-type aware retrieval
        const contentTypeRetriever = RunnableLambda.from(async (input) => {
            const { query, contentTypes = [], maxResults = 3 } = input;
            
            if (contentTypes.length === 0) {
                return await vectorStore.similaritySearch(query, maxResults);
            } else {
                const allDocs = await vectorStore.similaritySearch(query, maxResults * 2);
                return allDocs.filter(doc => 
                    contentTypes.includes(doc.metadata.type)
                ).slice(0, maxResults);
            }
        });

        console.log('\n🔍 Testing content-type specific retrieval...');
        
        const retrievalTests = [
            {
                query: "How to implement JWT authentication?",
                contentTypes: ['code'],
                description: "Code examples only"
            },
            {
                query: "API authentication methods",
                contentTypes: ['documentation'],
                description: "Documentation only"
            },
            {
                query: "HTTP status codes",
                contentTypes: ['reference'],
                description: "Reference material"
            }
        ];

        for (const test of retrievalTests) {
            console.log(`\n❓ Query: "${test.query}" (${test.description})`);
            
            try {
                const results = await contentTypeRetriever.invoke({
                    query: test.query,
                    contentTypes: test.contentTypes
                });
                
                console.log(`✅ Retrieved ${results.length} documents:`);
                results.forEach((doc, index) => {
                    console.log(`   ${index + 1}. Type: ${doc.metadata.type}`);
                    console.log(`      "${doc.pageContent.substring(0, 80)}..."`);
                });
                
            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        }

        // Multi-modal RAG chain
        const multiModalPrompt = ChatPromptTemplate.fromTemplate(`
You are a technical assistant working with different content types.

Query: {query}
Retrieved Content: {context}

Instructions:
- Analyze the content types (documentation, code, reference)
- Provide a comprehensive answer using all available content
- Include code examples when available
- Structure your response based on content types

Response:`);

        const multiModalRAGChain = RunnableSequence.from([
            {
                context: RunnableLambda.from(async (input) => {
                    const docs = await vectorStore.similaritySearch(input.query, 4);
                    return formatDocumentsAsString(docs);
                }),
                query: new RunnablePassthrough()
            },
            multiModalPrompt,
            llm,
            new StringOutputParser(),
        ]);

        console.log('\n🧪 Testing multi-modal RAG chain...');
        
        const testQuery = "How do I implement API key authentication in Python?";
        console.log(`Query: "${testQuery}"`);
        
        try {
            const response = await multiModalRAGChain.invoke(testQuery);
            console.log('✅ Multi-modal response:');
            console.log(response);
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

    } catch (error) {
        console.log('❌ Error in multi-modal RAG demo:', error.message);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Multi-Modal RAG Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🎭 Content Type Management:');
    console.log('   • Tag content with appropriate type metadata');
    console.log('   • Use content-type aware text splitting');
    console.log('   • Implement type-specific retrieval filters');
    console.log('   • Maintain consistent metadata schemas');

    console.log('\n🎯 Retrieval Strategies:');
    console.log('   • Implement content-type aware retrieval');
    console.log('   • Use metadata filtering for precision');
    console.log('   • Balance different content types in results');
    console.log('   • Consider user preferences and context');

    console.log('\n✅ Multi-Modal RAG Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Multi-modal RAG handles diverse content types');
    console.log('   • Content-type aware processing improves quality');
    console.log('   • Metadata-driven filtering enables precise selection');
    console.log('   • Unified systems work across text, code, and data');
}

function showMultiModalRAGConcepts() {
    console.log('\n🎭 Multi-Modal RAG Concepts:');
    
    console.log('\n📚 Content Types:');
    console.log('   • Text documentation and explanations');
    console.log('   • Code examples and implementations');
    console.log('   • Structured data and configurations');
    console.log('   • Reference materials and specifications');
    
    console.log('\n🔧 Processing Strategies:');
    console.log('   • Content-type aware text splitting');
    console.log('   • Metadata-driven organization');
    console.log('   • Format-specific embedding approaches');
    console.log('   • Unified retrieval across modalities');
    
    console.log('\n💡 Applications:');
    console.log('   • Technical documentation systems');
    console.log('   • Code search and examples');
    console.log('   • API reference and tutorials');
    console.log('   • Multi-format knowledge bases');
}

// Execute the demo
multiModalRAGDemo().catch(console.error);
