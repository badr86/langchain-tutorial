import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { Tool } from 'langchain/tools';
import { DynamicTool } from 'langchain/tools';
// Custom Calculator Tool implementation
class Calculator extends DynamicTool {
    constructor() {
        super({
            name: 'calculator',
            description: 'Useful for mathematical calculations. Input should be a mathematical expression.',
            func: async (input) => {
                try {
                    // Simple eval for basic math operations (in production, use a safer math parser)
                    const result = eval(input.replace(/[^0-9+\-*/().\s]/g, ''));
                    return `The result of ${input} is ${result}`;
                } catch (error) {
                    return `Error calculating ${input}: ${error.message}`;
                }
            }
        });
    }
}
import { ChatPromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Advanced Tool Integration Demo
 * 
 * This demo shows integrating external APIs and services as agent tools.
 * It demonstrates real-world tool integration patterns and best practices.
 */
async function advancedToolIntegrationDemo() {
    console.log('🚀 Executing Advanced Tool Integration Demo...');
    console.log('=' .repeat(60));

    console.log('🔧 Advanced Tool Integration Overview:');
    console.log('   • External API integration');
    console.log('   • Service orchestration');
    console.log('   • Error handling and retries');
    console.log('   • Real-world tool patterns');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing advanced tool integration patterns instead...');
        
        showAdvancedToolPatterns();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with advanced tools demo');

    // Initialize the LLM
    const llm = new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n🤖 LLM Configuration:');
    console.log('   • Model: gpt-3.5-turbo');
    console.log('   • Temperature: 0 (deterministic)');

    // Advanced tool implementations
    console.log('\n🏗️ Creating Advanced Integration Tools...');

    // GitHub API Tool with error handling and retries
    class GitHubTool extends Tool {
        name = 'github_search';
        description = 'Search GitHub repositories. Input should be a search query.';

        constructor() {
            super();
            this.baseUrl = 'https://api.github.com';
            this.maxRetries = 3;
            this.retryDelay = 1000;
        }

        async _call(query) {
            console.log(`🐙 GitHub search: "${query}"`);
            
            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    // Simulate API call with mock data
                    console.log(`   Attempt ${attempt}/${this.maxRetries}`);
                    
                    // Mock GitHub search results
                    const mockRepos = [
                        {
                            name: 'langchain-js',
                            full_name: 'langchain-ai/langchainjs',
                            description: 'LangChain for JavaScript/TypeScript',
                            stars: 8500,
                            language: 'TypeScript',
                            url: 'https://github.com/langchain-ai/langchainjs'
                        },
                        {
                            name: 'openai-node',
                            full_name: 'openai/openai-node',
                            description: 'Official OpenAI Node.js library',
                            stars: 5200,
                            language: 'TypeScript',
                            url: 'https://github.com/openai/openai-node'
                        }
                    ];

                    // Filter based on query
                    const filteredRepos = mockRepos.filter(repo => 
                        repo.name.toLowerCase().includes(query.toLowerCase()) ||
                        repo.description.toLowerCase().includes(query.toLowerCase())
                    );

                    const results = filteredRepos.map(repo => ({
                        name: repo.full_name,
                        description: repo.description,
                        stars: repo.stars,
                        language: repo.language,
                        url: repo.url
                    }));

                    console.log(`   Found ${results.length} repositories`);
                    return JSON.stringify(results, null, 2);

                } catch (error) {
                    console.log(`   Attempt ${attempt} failed: ${error.message}`);
                    
                    if (attempt === this.maxRetries) {
                        return `GitHub search failed after ${this.maxRetries} attempts: ${error.message}`;
                    }
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                }
            }
        }
    }

    // News API Tool with caching simulation
    class NewsTool extends Tool {
        name = 'get_news';
        description = 'Get latest news headlines. Input should be a topic or category.';

        constructor() {
            super();
            this.cache = new Map();
            this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        }

        async _call(topic) {
            console.log(`📰 News search: "${topic}"`);
            
            // Check cache first
            const cacheKey = topic.toLowerCase();
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log('   Using cached results');
                return cached.data;
            }

            try {
                // Simulate news API call
                console.log('   Fetching fresh news data...');
                
                const mockNews = [
                    {
                        title: `Breaking: Major developments in ${topic} sector`,
                        source: 'Tech News Daily',
                        publishedAt: new Date().toISOString(),
                        summary: `Latest updates and analysis on ${topic} trends and implications.`
                    },
                    {
                        title: `Analysis: The future of ${topic} technology`,
                        source: 'Industry Weekly',
                        publishedAt: new Date(Date.now() - 3600000).toISOString(),
                        summary: `Expert insights on where ${topic} is heading in the next decade.`
                    },
                    {
                        title: `Market Report: ${topic} investment surge continues`,
                        source: 'Financial Times',
                        publishedAt: new Date(Date.now() - 7200000).toISOString(),
                        summary: `Investment trends and market analysis for ${topic} sector.`
                    }
                ];

                const result = JSON.stringify(mockNews, null, 2);
                
                // Cache the result
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });

                console.log(`   Cached ${mockNews.length} articles`);
                return result;

            } catch (error) {
                return `Error fetching news: ${error.message}`;
            }
        }
    }

    // File System Tool with validation and security
    class FileSystemTool extends Tool {
        name = 'file_operations';
        description = 'Perform file operations like read, write, list. Input format: "operation:path:content".';

        constructor() {
            super();
            this.allowedExtensions = ['.txt', '.json', '.md', '.csv'];
            this.maxFileSize = 1024 * 1024; // 1MB
            this.mockFileSystem = new Map();
        }

        validatePath(path) {
            // Security validation
            if (!path || path.includes('..') || path.includes('~')) {
                throw new Error('Invalid path: Security violation');
            }

            const ext = path.substring(path.lastIndexOf('.'));
            if (!this.allowedExtensions.includes(ext)) {
                throw new Error(`Unsupported file type: ${ext}`);
            }

            return true;
        }

        async _call(input) {
            console.log(`📁 File operation: ${input}`);
            
            const parts = input.split(':');
            const operation = parts[0];
            const path = parts[1];
            const content = parts.slice(2).join(':');

            try {
                switch (operation) {
                    case 'create':
                    case 'write':
                        this.validatePath(path);
                        
                        if (content.length > this.maxFileSize) {
                            throw new Error(`File too large: ${content.length} bytes`);
                        }

                        this.mockFileSystem.set(path, {
                            content: content,
                            created: new Date().toISOString(),
                            size: content.length
                        });

                        console.log(`   Created file: ${path} (${content.length} bytes)`);
                        return `File "${path}" created successfully with ${content.length} characters`;

                    case 'read':
                        this.validatePath(path);
                        
                        const file = this.mockFileSystem.get(path);
                        if (!file) {
                            return `File not found: ${path}`;
                        }

                        console.log(`   Read file: ${path} (${file.size} bytes)`);
                        return `Content of "${path}":\n${file.content}`;

                    case 'list':
                        const files = Array.from(this.mockFileSystem.keys());
                        console.log(`   Listed ${files.length} files`);
                        return `Files: ${files.join(', ')}`;

                    case 'delete':
                        this.validatePath(path);
                        
                        if (this.mockFileSystem.delete(path)) {
                            console.log(`   Deleted file: ${path}`);
                            return `File "${path}" deleted successfully`;
                        } else {
                            return `File not found: ${path}`;
                        }

                    default:
                        return `Unknown operation: ${operation}. Supported: create, read, list, delete`;
                }

            } catch (error) {
                console.log(`   Error: ${error.message}`);
                return `File operation failed: ${error.message}`;
            }
        }
    }

    // Database Tool with connection pooling simulation
    class DatabaseTool extends Tool {
        name = 'database_query';
        description = 'Execute database queries. Input should be a SQL-like query description.';

        constructor() {
            super();
            this.connectionPool = {
                active: 0,
                max: 5,
                queue: []
            };
            
            this.mockDatabase = [
                { id: 1, name: 'John Doe', department: 'Engineering', salary: 75000 },
                { id: 2, name: 'Jane Smith', department: 'Marketing', salary: 65000 },
                { id: 3, name: 'Mike Johnson', department: 'Engineering', salary: 80000 },
                { id: 4, name: 'Sarah Wilson', department: 'Sales', salary: 70000 },
                { id: 5, name: 'Tom Brown', department: 'Engineering', salary: 85000 }
            ];
        }

        async acquireConnection() {
            return new Promise((resolve) => {
                if (this.connectionPool.active < this.connectionPool.max) {
                    this.connectionPool.active++;
                    console.log(`   DB connection acquired (${this.connectionPool.active}/${this.connectionPool.max})`);
                    resolve();
                } else {
                    console.log('   Waiting for available DB connection...');
                    this.connectionPool.queue.push(resolve);
                }
            });
        }

        releaseConnection() {
            this.connectionPool.active--;
            if (this.connectionPool.queue.length > 0) {
                const next = this.connectionPool.queue.shift();
                this.connectionPool.active++;
                next();
            }
            console.log(`   DB connection released (${this.connectionPool.active}/${this.connectionPool.max})`);
        }

        async _call(query) {
            console.log(`🗄️  Database query: "${query}"`);
            
            await this.acquireConnection();
            
            try {
                // Simulate query processing delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                let results = [...this.mockDatabase];
                const lowerQuery = query.toLowerCase();

                // Simple query processing
                if (lowerQuery.includes('engineering')) {
                    results = results.filter(row => row.department === 'Engineering');
                } else if (lowerQuery.includes('salary') && lowerQuery.includes('80000')) {
                    results = results.filter(row => row.salary >= 80000);
                } else if (lowerQuery.includes('count')) {
                    return `Query result: ${results.length} records found`;
                }

                console.log(`   Query returned ${results.length} records`);
                return JSON.stringify(results, null, 2);

            } catch (error) {
                console.log(`   Query error: ${error.message}`);
                return `Database query failed: ${error.message}`;
            } finally {
                this.releaseConnection();
            }
        }
    }

    // Email Tool with template system
    class EmailTool extends Tool {
        name = 'send_email';
        description = 'Send emails with templates. Input format: "to:subject:template:data".';

        constructor() {
            super();
            this.templates = {
                welcome: 'Welcome {name}! We\'re excited to have you join us.',
                reminder: 'Hi {name}, this is a reminder about {event} on {date}.',
                notification: 'Dear {name}, {message}',
                report: 'Daily report for {date}: {summary}'
            };
            this.sentEmails = [];
        }

        async _call(input) {
            console.log(`📧 Email request: ${input}`);
            
            const parts = input.split(':');
            if (parts.length < 3) {
                return 'Invalid format. Use: "to:subject:template:data"';
            }

            const [to, subject, templateName, ...dataParts] = parts;
            const data = dataParts.join(':');

            try {
                // Get template
                const template = this.templates[templateName];
                if (!template) {
                    return `Template not found: ${templateName}. Available: ${Object.keys(this.templates).join(', ')}`;
                }

                // Parse data (simple JSON)
                let templateData = {};
                if (data) {
                    try {
                        templateData = JSON.parse(data);
                    } catch {
                        return 'Invalid JSON data for template';
                    }
                }

                // Process template
                let body = template;
                for (const [key, value] of Object.entries(templateData)) {
                    body = body.replace(new RegExp(`{${key}}`, 'g'), value);
                }

                // Simulate sending
                const email = {
                    id: Date.now().toString(),
                    to: to,
                    subject: subject,
                    body: body,
                    template: templateName,
                    sentAt: new Date().toISOString()
                };

                this.sentEmails.push(email);
                
                console.log(`   Email sent to ${to}`);
                console.log(`   Subject: ${subject}`);
                console.log(`   Template: ${templateName}`);
                
                return `Email sent successfully to ${to} using ${templateName} template`;

            } catch (error) {
                console.log(`   Email error: ${error.message}`);
                return `Email sending failed: ${error.message}`;
            }
        }
    }

    // Create all advanced tools
    const advancedTools = [
        new GitHubTool(),
        new NewsTool(),
        new FileSystemTool(),
        new DatabaseTool(),
        new EmailTool(),
        new Calculator()
    ];

    console.log('✅ Advanced Tools Created:');
    advancedTools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name}: ${tool.description.substring(0, 60)}...`);
    });

    // Create agent with advanced tools
    console.log('\n🏗️ Creating Agent with Advanced Tool Integration...');

    const prompt = ChatPromptTemplate.fromTemplate(`
Answer the following questions as best you can. You have access to advanced tools with external API integration capabilities.

Available tools:
{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}
    `);

    const agent = await createReactAgent({
        llm,
        tools: advancedTools,
        prompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools: advancedTools,
        verbose: true,
        maxIterations: 5,
    });

    console.log('✅ Advanced integration agent ready!');

    // Test advanced tool integrations
    const testScenarios = [
        {
            query: "Search GitHub for LangChain repositories",
            description: "External API integration with retry logic"
        },
        {
            query: "Get the latest news about artificial intelligence",
            description: "News API with caching"
        },
        {
            query: "Create a file called 'project-notes.txt' with content 'Meeting notes: Discussed AI integration strategy'",
            description: "File system operations with validation"
        },
        {
            query: "Query the database for all engineering department employees",
            description: "Database operations with connection pooling"
        },
        {
            query: "Send a welcome email to john@example.com with subject 'Welcome to the team' using welcome template with data {\"name\": \"John\"}",
            description: "Email service with template system"
        }
    ];

    console.log('\n🧪 Testing Advanced Tool Integration...');

    for (let i = 0; i < testScenarios.length; i++) {
        const scenario = testScenarios[i];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🎯 Test ${i + 1}: ${scenario.description}`);
        console.log(`${'='.repeat(50)}`);
        
        console.log('❓ Query:', scenario.query);
        
        try {
            console.log('\n🔄 Agent executing with advanced tools...');
            
            const result = await agentExecutor.invoke({
                input: scenario.query
            });
            
            console.log('\n✅ Advanced tool integration completed!');
            console.log('📝 Result:', result.output);
            
        } catch (error) {
            console.log('❌ Advanced tool error:', error.message);
        }
        
        // Delay between tests
        if (i < testScenarios.length - 1) {
            console.log('\n⏳ Preparing next test...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Integration best practices
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Advanced Tool Integration Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🛡️ Error Handling:');
    console.log('   • Implement retry logic with exponential backoff');
    console.log('   • Validate inputs before external API calls');
    console.log('   • Provide meaningful error messages');
    console.log('   • Handle rate limiting and timeouts');

    console.log('\n⚡ Performance Optimization:');
    console.log('   • Cache frequently accessed data');
    console.log('   • Use connection pooling for databases');
    console.log('   • Implement request batching where possible');
    console.log('   • Monitor and log performance metrics');

    console.log('\n🔒 Security Considerations:');
    console.log('   • Validate and sanitize all inputs');
    console.log('   • Use secure authentication methods');
    console.log('   • Implement proper access controls');
    console.log('   • Log security-relevant events');

    console.log('\n🔧 Maintenance:');
    console.log('   • Version your tool interfaces');
    console.log('   • Monitor external API changes');
    console.log('   • Implement health checks');
    console.log('   • Document tool capabilities and limitations');

    console.log('\n✅ Advanced Tool Integration Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Advanced tools enable real-world agent capabilities');
    console.log('   • Error handling and retries are crucial');
    console.log('   • Caching and pooling improve performance');
    console.log('   • Security validation prevents vulnerabilities');
    console.log('   • Proper integration patterns enable scalable solutions');
}

function showAdvancedToolPatterns() {
    console.log('\n🔧 Advanced Tool Integration Patterns:');
    
    console.log('\n🔄 Retry Pattern:');
    console.log(`
for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
        return await externalAPI.call();
    } catch (error) {
        if (attempt === maxRetries) throw error;
        await delay(retryDelay * attempt);
    }
}
    `);
    
    console.log('\n💾 Caching Pattern:');
    console.log(`
const cached = this.cache.get(key);
if (cached && !isExpired(cached)) {
    return cached.data;
}
const fresh = await fetchData();
this.cache.set(key, { data: fresh, timestamp: Date.now() });
    `);
    
    console.log('\n🛡️ Validation Pattern:');
    console.log(`
validateInput(input) {
    if (!input || input.includes('..')) {
        throw new Error('Invalid input');
    }
    return true;
}
    `);
    
    console.log('\n📊 Connection Pooling:');
    console.log(`
async acquireConnection() {
    if (pool.active < pool.max) {
        pool.active++;
        return connection;
    }
    await waitForAvailable();
}
    `);
}

// Execute the demo
advancedToolIntegrationDemo().catch(console.error);
