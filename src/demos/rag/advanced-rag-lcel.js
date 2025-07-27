import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { 
    RunnableSequence, 
    RunnablePassthrough, 
    RunnableMap,
    RunnableLambda 
} from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Advanced RAG with LCEL Demo
 * 
 * This demo showcases advanced RAG patterns using LangChain Expression Language (LCEL)
 * including multi-step reasoning, query enhancement, and sophisticated retrieval strategies.
 */
async function advancedRAGLCELDemo() {
    console.log('🚀 Executing Advanced RAG with LCEL Demo...');
    console.log('=' .repeat(60));

    console.log('🔬 Advanced RAG Features:');
    console.log('   • Query enhancement and rewriting');
    console.log('   • Multi-step reasoning chains');
    console.log('   • Conditional retrieval strategies');
    console.log('   • Response quality assessment');
    console.log('   • Parallel processing with LCEL');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing advanced RAG concepts instead...');
        
        showAdvancedRAGConcepts();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with advanced RAG demo');

    // Initialize components
    console.log('\n🏗️ Initializing Advanced RAG Components...');
    
    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.3,
        maxTokens: 800,
    });

    const creativeLLM = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.8,
        maxTokens: 600,
    });

    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-ada-002',
    });

    console.log('✅ Components initialized:');
    console.log('   • Primary LLM: gpt-3.5-turbo (temp=0.3)');
    console.log('   • Creative LLM: gpt-3.5-turbo (temp=0.8)');
    console.log('   • Embeddings: text-embedding-ada-002');

    // Create comprehensive knowledge base
    console.log('\n📚 Creating Comprehensive Knowledge Base...');
    
    const knowledgeDocuments = [
        {
            content: `# Python Programming Fundamentals

Python is a high-level, interpreted programming language known for its simplicity and readability. It was created by Guido van Rossum and first released in 1991.

## Key Features
- Simple and readable syntax
- Interpreted language (no compilation needed)
- Dynamic typing
- Extensive standard library
- Cross-platform compatibility
- Strong community support

## Data Types
Python supports various built-in data types:
- Numbers: int, float, complex
- Sequences: str, list, tuple
- Mappings: dict
- Sets: set, frozenset
- Boolean: bool

## Control Structures
Python provides standard control flow statements:
- Conditional statements: if, elif, else
- Loops: for, while
- Exception handling: try, except, finally

## Functions and Classes
Python supports both functional and object-oriented programming paradigms. Functions are defined using the 'def' keyword, while classes use the 'class' keyword.`,
            metadata: { topic: 'python_basics', category: 'programming', difficulty: 'beginner' }
        },
        {
            content: `# Machine Learning with Python

Python has become the de facto language for machine learning due to its rich ecosystem of libraries and frameworks.

## Popular ML Libraries
- **NumPy**: Fundamental package for numerical computing
- **Pandas**: Data manipulation and analysis library
- **Scikit-learn**: Machine learning library with simple and efficient tools
- **TensorFlow**: Open-source platform for machine learning
- **PyTorch**: Deep learning framework with dynamic computation graphs
- **Matplotlib/Seaborn**: Data visualization libraries

## Machine Learning Workflow
1. Data Collection and Preparation
2. Exploratory Data Analysis (EDA)
3. Feature Engineering
4. Model Selection and Training
5. Model Evaluation and Validation
6. Model Deployment and Monitoring

## Types of Machine Learning
- **Supervised Learning**: Learning with labeled data (classification, regression)
- **Unsupervised Learning**: Finding patterns in unlabeled data (clustering, dimensionality reduction)
- **Reinforcement Learning**: Learning through interaction with environment

## Best Practices
- Always validate your data quality
- Use cross-validation for model evaluation
- Implement proper train/validation/test splits
- Monitor for overfitting and underfitting
- Document your experiments and results`,
            metadata: { topic: 'machine_learning', category: 'programming', difficulty: 'intermediate' }
        },
        {
            content: `# Web Development with Python

Python offers several frameworks for web development, making it easy to build robust web applications.

## Popular Web Frameworks
- **Django**: Full-featured framework with "batteries included" philosophy
- **Flask**: Lightweight and flexible micro-framework
- **FastAPI**: Modern, fast framework for building APIs
- **Pyramid**: Flexible framework for complex applications

## Django Framework
Django follows the Model-View-Template (MVT) pattern:
- **Models**: Define data structure and database schema
- **Views**: Handle business logic and user requests
- **Templates**: Define presentation layer and user interface

Key Django features:
- Built-in admin interface
- ORM (Object-Relational Mapping)
- Authentication and authorization
- Security features (CSRF protection, SQL injection prevention)
- Internationalization support

## Flask Framework
Flask is minimalist and gives developers more control:
- Lightweight core with extensions
- Flexible routing system
- Template engine (Jinja2)
- Built-in development server
- Easy to learn and get started

## API Development
Modern web development often involves building APIs:
- RESTful API design principles
- JSON data exchange
- HTTP status codes and methods
- Authentication (JWT, OAuth)
- API documentation (Swagger/OpenAPI)`,
            metadata: { topic: 'web_development', category: 'programming', difficulty: 'intermediate' }
        },
        {
            content: `# Data Science and Analytics

Data science combines statistics, programming, and domain expertise to extract insights from data.

## Data Science Process
1. **Problem Definition**: Clearly define the business problem
2. **Data Collection**: Gather relevant data from various sources
3. **Data Cleaning**: Handle missing values, outliers, and inconsistencies
4. **Exploratory Data Analysis**: Understand data patterns and relationships
5. **Feature Engineering**: Create meaningful features for modeling
6. **Modeling**: Apply statistical and machine learning techniques
7. **Evaluation**: Assess model performance and validity
8. **Communication**: Present findings to stakeholders

## Essential Tools
- **Jupyter Notebooks**: Interactive development environment
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Matplotlib/Plotly**: Data visualization
- **Scipy**: Scientific computing
- **Statsmodels**: Statistical modeling

## Statistical Concepts
- Descriptive statistics (mean, median, mode, standard deviation)
- Probability distributions
- Hypothesis testing
- Correlation and causation
- Regression analysis
- Time series analysis

## Data Visualization Best Practices
- Choose appropriate chart types for your data
- Use clear and descriptive labels
- Avoid misleading visualizations
- Consider your audience
- Tell a story with your data`,
            metadata: { topic: 'data_science', category: 'analytics', difficulty: 'intermediate' }
        },
        {
            content: `# Software Engineering Best Practices

Writing maintainable, scalable, and robust software requires following established best practices and principles.

## SOLID Principles
- **Single Responsibility**: A class should have only one reason to change
- **Open/Closed**: Software entities should be open for extension, closed for modification
- **Liskov Substitution**: Objects should be replaceable with instances of their subtypes
- **Interface Segregation**: Clients shouldn't depend on interfaces they don't use
- **Dependency Inversion**: Depend on abstractions, not concretions

## Code Quality
- Write clean, readable code
- Use meaningful variable and function names
- Keep functions small and focused
- Follow consistent coding standards
- Write comprehensive documentation
- Implement proper error handling

## Testing Strategies
- **Unit Testing**: Test individual components in isolation
- **Integration Testing**: Test component interactions
- **End-to-End Testing**: Test complete user workflows
- **Test-Driven Development (TDD)**: Write tests before implementation
- **Continuous Integration**: Automated testing in CI/CD pipelines

## Version Control
- Use Git for version control
- Write meaningful commit messages
- Use branching strategies (Git Flow, GitHub Flow)
- Conduct code reviews
- Tag releases appropriately

## Design Patterns
Common patterns that solve recurring design problems:
- Singleton: Ensure only one instance exists
- Factory: Create objects without specifying exact classes
- Observer: Define one-to-many dependency between objects
- Strategy: Define family of algorithms and make them interchangeable`,
            metadata: { topic: 'software_engineering', category: 'programming', difficulty: 'advanced' }
        }
    ];

    // Create documents and split them
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 100,
        separators: ['\n## ', '\n### ', '\n\n', '\n', ' ', ''],
    });

    let allDocs = [];
    for (const docData of knowledgeDocuments) {
        const chunks = await textSplitter.createDocuments([docData.content], [docData.metadata]);
        allDocs = allDocs.concat(chunks);
    }

    console.log(`✅ Knowledge base created: ${allDocs.length} document chunks`);
    console.log(`   Topics covered: ${knowledgeDocuments.length}`);

    try {
        // Create vector store
        console.log('\n🔄 Creating vector store...');
        const vectorStore = await MemoryVectorStore.fromDocuments(allDocs, embeddings);
        console.log('✅ Vector store created successfully!');

        // Create multiple retrievers with different strategies
        const standardRetriever = vectorStore.asRetriever({ k: 3 });
        const comprehensiveRetriever = vectorStore.asRetriever({ k: 6 });
        const focusedRetriever = vectorStore.asRetriever({ k: 2 });

        console.log('✅ Multiple retrievers configured');

        // Advanced RAG Chain 1: Query Enhancement
        console.log(`\n${'='.repeat(60)}`);
        console.log('🔍 Query Enhancement Chain');
        console.log(`${'='.repeat(60)}`);

        const queryEnhancementPrompt = ChatPromptTemplate.fromTemplate(`
You are a query enhancement specialist. Your job is to improve search queries to get better retrieval results.

Original Query: {query}

Instructions:
- Expand the query with relevant synonyms and related terms
- Add context that might help find relevant documents
- Keep the core intent of the original query
- Make it more specific and searchable
- Return only the enhanced query, no explanation

Enhanced Query:`);

        const queryEnhancer = RunnableSequence.from([
            queryEnhancementPrompt,
            llm,
            new StringOutputParser(),
        ]);

        console.log('\n🔧 Testing query enhancement...');
        const testQuery = "How to start with ML?";
        console.log(`Original query: "${testQuery}"`);

        try {
            const enhancedQuery = await queryEnhancer.invoke({ query: testQuery });
            console.log(`Enhanced query: "${enhancedQuery}"`);

            // Compare retrieval results
            const originalResults = await standardRetriever.getRelevantDocuments(testQuery);
            const enhancedResults = await standardRetriever.getRelevantDocuments(enhancedQuery);

            console.log('\n📊 Retrieval Comparison:');
            console.log(`Original query results: ${originalResults.length} documents`);
            console.log(`Enhanced query results: ${enhancedResults.length} documents`);

            console.log('\nOriginal query top result:');
            console.log(`  "${originalResults[0]?.pageContent.substring(0, 100)}..."`);
            
            console.log('\nEnhanced query top result:');
            console.log(`  "${enhancedResults[0]?.pageContent.substring(0, 100)}..."`);

        } catch (error) {
            console.log(`❌ Query enhancement error: ${error.message}`);
        }

        // Advanced RAG Chain 2: Multi-Step Reasoning
        console.log(`\n${'='.repeat(60)}`);
        console.log('🧠 Multi-Step Reasoning Chain');
        console.log(`${'='.repeat(60)}`);

        const reasoningPrompt = ChatPromptTemplate.fromTemplate(`
You are an expert analyst. Break down this complex question into simpler sub-questions that can be answered step by step.

Complex Question: {question}

Instructions:
- Identify 2-3 key sub-questions that need to be answered
- Each sub-question should be specific and focused
- Sub-questions should build upon each other logically
- Return only the sub-questions, one per line, numbered

Sub-questions:`);

        const synthesisPrompt = ChatPromptTemplate.fromTemplate(`
You are a synthesis expert. Combine the answers to sub-questions into a comprehensive response to the original question.

Original Question: {original_question}

Sub-question Answers:
{sub_answers}

Instructions:
- Synthesize the sub-answers into a coherent, comprehensive response
- Address the original question directly
- Highlight key insights and connections
- Provide a structured, well-organized answer

Comprehensive Answer:`);

        // Create multi-step reasoning chain
        const multiStepChain = RunnableSequence.from([
            // Step 1: Break down the question
            {
                sub_questions: reasoningPrompt.pipe(llm).pipe(new StringOutputParser()),
                original_question: new RunnablePassthrough(),
            },
            // Step 2: Answer each sub-question (simplified for demo)
            RunnableLambda.from(async (input) => {
                const subQuestions = input.sub_questions.split('\n').filter(q => q.trim());
                const subAnswers = [];
                
                for (const subQ of subQuestions.slice(0, 3)) { // Limit to 3 for demo
                    try {
                        const docs = await standardRetriever.getRelevantDocuments(subQ);
                        const context = formatDocumentsAsString(docs);
                        
                        const answerPrompt = ChatPromptTemplate.fromTemplate(`
Context: {context}
Question: {question}
Provide a focused answer based on the context.
Answer:`);
                        
                        const answer = await answerPrompt.pipe(llm).pipe(new StringOutputParser()).invoke({
                            context,
                            question: subQ
                        });
                        
                        subAnswers.push(`${subQ}\nAnswer: ${answer}`);
                    } catch (error) {
                        subAnswers.push(`${subQ}\nAnswer: Unable to retrieve information.`);
                    }
                }
                
                return {
                    original_question: input.original_question,
                    sub_answers: subAnswers.join('\n\n')
                };
            }),
            // Step 3: Synthesize final answer
            synthesisPrompt,
            creativeLLM,
            new StringOutputParser(),
        ]);

        console.log('\n🧠 Testing multi-step reasoning...');
        const complexQuestion = "What are the key considerations when choosing between different Python frameworks for a machine learning web application?";
        console.log(`Complex question: "${complexQuestion}"`);

        try {
            const reasonedAnswer = await multiStepChain.invoke(complexQuestion);
            console.log('\n✅ Multi-step reasoning result:');
            console.log(reasonedAnswer);

        } catch (error) {
            console.log(`❌ Multi-step reasoning error: ${error.message}`);
        }

        // Advanced RAG Chain 3: Conditional Retrieval
        console.log(`\n${'='.repeat(60)}`);
        console.log('🔀 Conditional Retrieval Chain');
        console.log(`${'='.repeat(60)}`);

        const queryClassifier = ChatPromptTemplate.fromTemplate(`
Classify this query into one of these categories: BASIC, DETAILED, COMPARATIVE

Query: {query}

Classification criteria:
- BASIC: Simple, straightforward questions needing concise answers
- DETAILED: Complex questions requiring comprehensive explanations
- COMPARATIVE: Questions asking to compare or contrast multiple concepts

Return only the classification: BASIC, DETAILED, or COMPARATIVE

Classification:`);

        const conditionalRAGChain = RunnableSequence.from([
            // Step 1: Classify the query
            {
                classification: queryClassifier.pipe(llm).pipe(new StringOutputParser()),
                query: new RunnablePassthrough(),
            },
            // Step 2: Choose retrieval strategy based on classification
            RunnableLambda.from(async (input) => {
                const classification = input.classification.trim().toUpperCase();
                let retriever, promptTemplate;
                
                if (classification === 'BASIC') {
                    retriever = focusedRetriever;
                    promptTemplate = ChatPromptTemplate.fromTemplate(`
Context: {context}
Question: {question}

Provide a concise, direct answer based on the context.

Answer:`);
                } else if (classification === 'DETAILED') {
                    retriever = comprehensiveRetriever;
                    promptTemplate = ChatPromptTemplate.fromTemplate(`
Context: {context}
Question: {question}

Provide a comprehensive, detailed answer with examples and explanations based on the context.

Answer:`);
                } else { // COMPARATIVE
                    retriever = comprehensiveRetriever;
                    promptTemplate = ChatPromptTemplate.fromTemplate(`
Context: {context}
Question: {question}

Provide a comparative analysis highlighting similarities, differences, and trade-offs based on the context.

Answer:`);
                }
                
                const docs = await retriever.getRelevantDocuments(input.query);
                const context = formatDocumentsAsString(docs);
                
                return {
                    context,
                    question: input.query,
                    classification,
                    template: promptTemplate
                };
            }),
            // Step 3: Generate answer with appropriate template
            RunnableLambda.from(async (input) => {
                const answer = await input.template.pipe(llm).pipe(new StringOutputParser()).invoke({
                    context: input.context,
                    question: input.question
                });
                
                return {
                    classification: input.classification,
                    answer
                };
            })
        ]);

        console.log('\n🔀 Testing conditional retrieval...');
        const testQueries = [
            { query: "What is Python?", expected: "BASIC" },
            { query: "Explain the complete machine learning workflow with Python libraries and best practices", expected: "DETAILED" },
            { query: "Compare Django vs Flask for web development", expected: "COMPARATIVE" }
        ];

        for (const test of testQueries) {
            console.log(`\n❓ Query: "${test.query}"`);
            console.log(`   Expected: ${test.expected}`);
            
            try {
                const result = await conditionalRAGChain.invoke(test.query);
                console.log(`   Classified as: ${result.classification}`);
                console.log(`   Answer: "${result.answer.substring(0, 150)}..."`);
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }

        // Advanced RAG Chain 4: Parallel Processing
        console.log(`\n${'='.repeat(60)}`);
        console.log('⚡ Parallel Processing Chain');
        console.log(`${'='.repeat(60)}`);

        const parallelRAGChain = RunnableMap.from({
            // Parallel retrieval from different perspectives
            technical_context: standardRetriever.pipe(formatDocumentsAsString),
            practical_examples: RunnableLambda.from(async (query) => {
                const docs = await vectorStore.similaritySearch(query + " examples tutorial", 2);
                return formatDocumentsAsString(docs);
            }),
            best_practices: RunnableLambda.from(async (query) => {
                const docs = await vectorStore.similaritySearch(query + " best practices tips", 2);
                return formatDocumentsAsString(docs);
            }),
            query: new RunnablePassthrough(),
        }).pipe(
            // Combine all contexts
            ChatPromptTemplate.fromTemplate(`
You are an expert technical educator. Provide a comprehensive answer using multiple perspectives.

Query: {query}

Technical Context:
{technical_context}

Practical Examples:
{practical_examples}

Best Practices:
{best_practices}

Instructions:
- Combine information from all three contexts
- Structure your answer with: Overview, Technical Details, Examples, Best Practices
- Ensure the answer is comprehensive yet accessible
- Highlight key insights from each context

Comprehensive Answer:`),
            llm,
            new StringOutputParser()
        );

        console.log('\n⚡ Testing parallel processing...');
        const parallelQuery = "How to implement machine learning models in Python?";
        console.log(`Query: "${parallelQuery}"`);

        try {
            const parallelResult = await parallelRAGChain.invoke(parallelQuery);
            console.log('\n✅ Parallel processing result:');
            console.log(parallelResult);

        } catch (error) {
            console.log(`❌ Parallel processing error: ${error.message}`);
        }

        // Advanced RAG Chain 5: Quality Assessment
        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 Response Quality Assessment');
        console.log(`${'='.repeat(60)}`);

        const qualityAssessmentPrompt = ChatPromptTemplate.fromTemplate(`
Assess the quality of this RAG response on a scale of 1-10 for each criterion:

Question: {question}
Response: {response}

Criteria:
1. Relevance: How well does the response address the question?
2. Accuracy: Is the information factually correct?
3. Completeness: Does it cover all important aspects?
4. Clarity: Is it well-structured and easy to understand?
5. Usefulness: Would this help someone learning the topic?

Provide scores (1-10) and brief explanations:

Assessment:`);

        const qualityAssessmentChain = RunnableSequence.from([
            qualityAssessmentPrompt,
            llm,
            new StringOutputParser(),
        ]);

        console.log('\n📊 Testing quality assessment...');
        const sampleResponse = "Python is a programming language. It's used for many things including web development and data science. You can use libraries like Django for web apps.";
        const assessmentQuery = "How do I get started with Python for web development?";

        try {
            const qualityScore = await qualityAssessmentChain.invoke({
                question: assessmentQuery,
                response: sampleResponse
            });
            
            console.log(`Question: "${assessmentQuery}"`);
            console.log(`Response: "${sampleResponse}"`);
            console.log('\n📊 Quality Assessment:');
            console.log(qualityScore);

        } catch (error) {
            console.log(`❌ Quality assessment error: ${error.message}`);
        }

    } catch (error) {
        console.log('❌ Error in advanced RAG demo:', error.message);
    }

    // Advanced RAG best practices
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Advanced RAG Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🔍 Query Processing:');
    console.log('   • Implement query enhancement and expansion');
    console.log('   • Use query classification for adaptive retrieval');
    console.log('   • Handle multi-part and complex questions');
    console.log('   • Implement query intent detection');

    console.log('\n🧠 Reasoning Strategies:');
    console.log('   • Break complex questions into sub-questions');
    console.log('   • Use chain-of-thought prompting');
    console.log('   • Implement multi-step reasoning workflows');
    console.log('   • Combine multiple information sources');

    console.log('\n⚡ Performance Optimization:');
    console.log('   • Use parallel processing for multiple retrievals');
    console.log('   • Implement caching for frequent queries');
    console.log('   • Optimize retrieval strategies based on query type');
    console.log('   • Use streaming for real-time responses');

    console.log('\n📊 Quality Assurance:');
    console.log('   • Implement automated response quality assessment');
    console.log('   • Use multiple evaluation metrics');
    console.log('   • A/B test different RAG configurations');
    console.log('   • Collect and analyze user feedback');

    console.log('\n🔧 Advanced Techniques:');
    console.log('   • Hybrid search (keyword + semantic)');
    console.log('   • Re-ranking retrieved documents');
    console.log('   • Dynamic prompt adaptation');
    console.log('   • Context-aware retrieval filtering');

    console.log('\n✅ Advanced RAG with LCEL Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • LCEL enables sophisticated RAG workflows');
    console.log('   • Query enhancement improves retrieval quality');
    console.log('   • Multi-step reasoning handles complex questions');
    console.log('   • Conditional logic adapts to different query types');
    console.log('   • Parallel processing improves performance and comprehensiveness');
}

function showAdvancedRAGConcepts() {
    console.log('\n🔬 Advanced RAG Concepts:');
    
    console.log('\n🔍 Query Enhancement:');
    console.log('   • Expand queries with synonyms and related terms');
    console.log('   • Add context to improve retrieval relevance');
    console.log('   • Use query rewriting for better matching');
    console.log('   • Implement query intent classification');
    
    console.log('\n🧠 Multi-Step Reasoning:');
    console.log('   • Break complex questions into sub-questions');
    console.log('   • Chain multiple retrieval and generation steps');
    console.log('   • Use intermediate reasoning for better answers');
    console.log('   • Synthesize information from multiple sources');
    
    console.log('\n🔀 Conditional Processing:');
    console.log('   • Adapt retrieval strategy based on query type');
    console.log('   • Use different prompt templates for different scenarios');
    console.log('   • Implement dynamic parameter adjustment');
    console.log('   • Route queries to specialized handlers');
    
    console.log('\n⚡ Parallel Processing:');
    console.log('   • Retrieve from multiple sources simultaneously');
    console.log('   • Process different aspects of queries in parallel');
    console.log('   • Combine results from parallel chains');
    console.log('   • Improve response time and comprehensiveness');
}

// Execute the demo
advancedRAGLCELDemo().catch(console.error);
