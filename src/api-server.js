require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Load topics from JSON file
let topicsData = {};
try {
    const topicsPath = path.join(__dirname, '..', 'data', 'topics.json');
    const rawData = fs.readFileSync(topicsPath, 'utf8');
    topicsData = JSON.parse(rawData);
    console.log('Topics loaded successfully:', {
        prompts: topicsData.prompts?.length || 0,
        chains: topicsData.chains?.length || 0,
        memory: topicsData.memory?.length || 0,
        agents: topicsData.agents?.length || 0,
        rag: topicsData.rag?.length || 0
    });
} catch (error) {
    console.error('Error loading topics:', error.message);
    topicsData = { prompts: [], chains: [], memory: [], agents: [], rag: [] };
}

// Flatten all topics into a single array
const getAllTopics = () => {
    const allTopics = [];
    
    if (topicsData.prompts) {
        allTopics.push(...topicsData.prompts);
    }
    if (topicsData.chains) {
        allTopics.push(...topicsData.chains);
    }
    if (topicsData.memory) {
        allTopics.push(...topicsData.memory);
    }
    if (topicsData.agents) {
        allTopics.push(...topicsData.agents);
    }
    if (topicsData.rag) {
        allTopics.push(...topicsData.rag);
    }
    
    return allTopics;
};

// Import required LangChain modules
const { PromptTemplate, ChatPromptTemplate, FewShotPromptTemplate } = require('@langchain/core/prompts');
const { ChatOpenAI, OpenAI } = require('@langchain/openai');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence, RunnableMap } = require('@langchain/core/runnables');
const { BufferMemory, BufferWindowMemory } = require('langchain/memory');
const { ConversationChain } = require('langchain/chains');

// Initialize OpenAI models (will check for API key in each function)
const createLLM = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required for demo execution');
    }
    return new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo',
    });
};

// Demo function registry - maps function names to actual functions
const demoFunctions = {
    // Prompt Template Demos
    basicPromptTemplateDemo: async () => {
        console.log('🚀 Executing Basic Prompt Template Demo...');
        
        const template = "Tell me a {adjective} joke about {topic}.";
        const prompt = new PromptTemplate({
            template: template,
            inputVariables: ["adjective", "topic"],
        });

        const formattedPrompt = await prompt.format({
            adjective: "funny",
            topic: "programming"
        });

        console.log('📝 Formatted Prompt:', formattedPrompt);
        
        if (process.env.OPENAI_API_KEY) {
            const llm = createLLM();
            const response = await llm.invoke(formattedPrompt);
            console.log('🤖 AI Response:', response.content);
        } else {
            console.log('⚠️  OpenAI API Key not found. Showing formatted prompt only.');
        }
    },

    chatPromptTemplateDemo: async () => {
        console.log('🚀 Executing Chat Prompt Template Demo...');
        
        const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant that translates {input_language} to {output_language}."],
            ["human", "{text}"]
        ]);

        const formattedMessages = await chatPrompt.formatMessages({
            input_language: "English",
            output_language: "French",
            text: "I love programming."
        });

        console.log('📝 Formatted Messages:', formattedMessages.map(m => `${m._getType()}: ${m.content}`));
        
        if (process.env.OPENAI_API_KEY) {
            const llm = createLLM();
            const response = await llm.invoke(formattedMessages);
            console.log('🤖 AI Translation:', response.content);
        } else {
            console.log('⚠️  OpenAI API Key not found. Showing formatted messages only.');
        }
    },

    complexPromptTemplateDemo: async () => {
        console.log('🚀 Executing Complex Prompt Template Demo...');
        
        const complexTemplate = `You are an expert {role} with {experience} years of experience.

Task: {task}

Context:
{context}

Instructions:
1. Analyze the given information
2. Provide a detailed response
3. Include specific examples
4. Conclude with actionable recommendations

Response:`;

        const prompt = new PromptTemplate({
            template: complexTemplate,
            inputVariables: ["role", "experience", "task", "context"],
        });

        const formattedPrompt = await prompt.format({
            role: "Software Architect",
            experience: "10",
            task: "Design a scalable microservices architecture",
            context: "E-commerce platform with 1M+ users, high traffic during sales events"
        });

        console.log('📝 Complex Prompt Generated');
        
        if (process.env.OPENAI_API_KEY) {
            const llm = createLLM();
            const response = await llm.invoke(formattedPrompt);
            console.log('🤖 Expert Analysis:', response.content.substring(0, 300) + '...');
        } else {
            console.log('⚠️  OpenAI API Key not found. Complex prompt template created successfully.');
        }
    },

    conditionalPromptTemplateDemo: async () => {
        console.log('🚀 Executing Conditional Prompt Template Demo...');
        
        const createConditionalPrompt = (audience) => {
            const templates = {
                beginner: "Explain {topic} in simple terms with basic examples.",
                intermediate: "Provide a detailed explanation of {topic} with practical applications.",
                expert: "Give an advanced analysis of {topic} including edge cases and optimizations."
            };
            
            return new PromptTemplate({
                template: templates[audience] || templates.intermediate,
                inputVariables: ["topic"]
            });
        };

        const beginnerPrompt = createConditionalPrompt('beginner');
        const formattedPrompt = await beginnerPrompt.format({ topic: 'machine learning' });
        
        console.log('📝 Conditional Prompt (Beginner Level):', formattedPrompt);
        
        if (process.env.OPENAI_API_KEY) {
            const llm = createLLM();
            const response = await llm.invoke(formattedPrompt);
            console.log('🤖 Beginner-Friendly Explanation:', response.content.substring(0, 200) + '...');
        } else {
            console.log('⚠️  OpenAI API Key not found. Conditional prompt created successfully.');
        }
    },

    fewShotPromptTemplateDemo: async () => {
        console.log('🚀 Executing Few-Shot Prompt Template Demo...');
        
        const examples = [
            { input: "happy", output: "sad" },
            { input: "tall", output: "short" },
            { input: "fast", output: "slow" }
        ];

        const examplePrompt = PromptTemplate.fromTemplate(
            "Input: {input}\nOutput: {output}"
        );

        const fewShotPrompt = new FewShotPromptTemplate({
            examples: examples,
            examplePrompt: examplePrompt,
            prefix: "Give the antonym of the word.",
            suffix: "Input: {adjective}\nOutput:",
            inputVariables: ["adjective"],
        });

        const formattedPrompt = await fewShotPrompt.format({ adjective: "bright" });
        console.log('📝 Few-Shot Prompt:', formattedPrompt);
        
        if (process.env.OPENAI_API_KEY) {
            const llm = createLLM();
            const response = await llm.invoke(formattedPrompt);
            console.log('🤖 AI Antonym:', response.content.trim());
        } else {
            console.log('⚠️  OpenAI API Key not found. Few-shot prompt created successfully.');
        }
    },

    promptTemplateWithOpenAIDemo: async () => {
        console.log('🚀 Executing OpenAI Integration Demo...');
        
        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️  OPENAI_API_KEY is required for this demo');
            return;
        }

        const llm = createLLM();
        const prompt = new PromptTemplate({
            template: "Write a creative {length} story about {character} who discovers {discovery}.",
            inputVariables: ["length", "character", "discovery"],
        });

        const chain = prompt.pipe(llm).pipe(new StringOutputParser());

        const result = await chain.invoke({
            length: "short",
            character: "a young scientist",
            discovery: "a portal to parallel dimensions"
        });

        console.log('🤖 Generated Story:', result);
    },

    // Chain & LCEL Demos
    basicLLMChainDemo: async () => {
        console.log('🚀 Executing Basic LLM Chain Demo...');
        
        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️  OPENAI_API_KEY is required for this demo');
            return;
        }

        const llm = createLLM();
        const prompt = new PromptTemplate({
            template: "Explain {concept} in simple terms.",
            inputVariables: ["concept"],
        });

        const chain = prompt.pipe(llm).pipe(new StringOutputParser());
        const result = await chain.invoke({ concept: "quantum computing" });
        
        console.log('🤖 Chain Result:', result);
    },

    simpleLCELChainDemo: async () => {
        console.log('🚀 Executing Simple LCEL Chain Demo...');
        
        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️  OPENAI_API_KEY is required for this demo');
            return;
        }

        const llm = createLLM();
        const prompt = ChatPromptTemplate.fromTemplate(
            "Translate the following text to {target_language}: {text}"
        );

        // LCEL Chain using pipe operator
        const chain = prompt.pipe(llm).pipe(new StringOutputParser());

        const result = await chain.invoke({
            text: "Hello, how are you today?",
            target_language: "Spanish"
        });

        console.log('🤖 LCEL Translation:', result);
    },

    // Memory Demos
    basicBufferMemoryDemo: async () => {
        console.log('🚀 Executing Basic Buffer Memory Demo...');
        
        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️  OPENAI_API_KEY is required for this demo');
            return;
        }

        const llm = createLLM();
        const memory = new BufferMemory({
            memoryKey: "chat_history",
            returnMessages: true,
        });

        const conversation = new ConversationChain({
            llm: llm,
            memory: memory,
        });

        // First interaction
        const response1 = await conversation.call({
            input: "Hi, my name is Alice and I'm a software engineer."
        });
        console.log('🤖 Response 1:', response1.response);

        // Second interaction (should remember Alice)
        const response2 = await conversation.call({
            input: "What's my profession?"
        });
        console.log('🤖 Response 2 (with memory):', response2.response);
    },

    // Agent Demos (simplified for now)
    basicReactAgentDemo: async () => {
        console.log('🚀 Executing Basic ReAct Agent Demo...');
        console.log('🤖 Agent Demo: This would create a ReAct agent with tools like Calculator and Search');
        console.log('📝 Note: Full agent implementation requires additional tool setup');
    },

    // RAG Demos (simplified for now)
    basicDocumentLoadingDemo: async () => {
        console.log('🚀 Executing Basic Document Loading Demo...');
        console.log('📄 Document Loading: This would load PDF, DOCX, and TXT files');
        console.log('📝 Note: Full RAG implementation requires document files and vector storage');
    },

    // Add placeholder implementations for other functions
    complexLCELChainDemo: async () => console.log('🚀 Complex LCEL Chain Demo executed'),
    lcelWithCustomFunctionsDemo: async () => console.log('🚀 LCEL with Custom Functions Demo executed'),
    parallelLCELChainsDemo: async () => console.log('🚀 Parallel LCEL Chains Demo executed'),
    conditionalLCELChainDemo: async () => console.log('🚀 Conditional LCEL Chain Demo executed'),
    bufferWindowMemoryDemo: async () => console.log('🚀 Buffer Window Memory Demo executed'),
    conversationSummaryMemoryDemo: async () => console.log('🚀 Conversation Summary Memory Demo executed'),
    customMemoryLCELDemo: async () => console.log('🚀 Custom Memory LCEL Demo executed'),
    memoryComparisonDemo: async () => console.log('🚀 Memory Comparison Demo executed'),
    customToolsDemo: async () => console.log('🚀 Custom Tools Demo executed'),
    functionCallingAgentDemo: async () => console.log('🚀 Function Calling Agent Demo executed'),
    multiAgentSystemDemo: async () => console.log('🚀 Multi-Agent System Demo executed'),
    agentWithMemoryDemo: async () => console.log('🚀 Agent with Memory Demo executed'),
    advancedToolIntegrationDemo: async () => console.log('🚀 Advanced Tool Integration Demo executed'),
    textSplittingDemo: async () => console.log('🚀 Text Splitting Demo executed'),
    vectorEmbeddingsDemo: async () => console.log('🚀 Vector Embeddings Demo executed'),
    basicRagChainDemo: async () => console.log('🚀 Basic RAG Chain Demo executed'),
    advancedRagLcelDemo: async () => console.log('🚀 Advanced RAG LCEL Demo executed'),
    conversationalRagDemo: async () => console.log('🚀 Conversational RAG Demo executed'),
    multiModalRagDemo: async () => console.log('🚀 Multi-Modal RAG Demo executed')
};

// Capture console output for demo execution
const captureConsoleOutput = async (fn) => {
    const originalLog = console.log;
    const originalError = console.error;
    let output = [];
    
    console.log = (...args) => {
        output.push(args.join(' '));
        originalLog(...args);
    };
    
    console.error = (...args) => {
        output.push('ERROR: ' + args.join(' '));
        originalError(...args);
    };
    
    try {
        await fn();
        return { success: true, output: output.join('\n') };
    } catch (error) {
        return { success: false, output: output.join('\n'), error: error.message };
    } finally {
        console.log = originalLog;
        console.error = originalError;
    }
};

// API Routes
app.get('/api/topics', (req, res) => {
    try {
        const topics = getAllTopics().map(({ demoFunction, ...topic }) => topic);
        console.log(`Serving ${topics.length} topics`);
        res.json(topics);
    } catch (error) {
        console.error('Error serving topics:', error);
        res.status(500).json({ error: 'Failed to load topics' });
    }
});

app.get('/api/topics/:id', (req, res) => {
    try {
        const topic = getAllTopics().find(t => t.id === req.params.id);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        const { demoFunction, ...topicData } = topic;
        res.json(topicData);
    } catch (error) {
        console.error('Error serving topic:', error);
        res.status(500).json({ error: 'Failed to load topic' });
    }
});

app.post('/api/execute/:id', async (req, res) => {
    try {
        const topic = getAllTopics().find(t => t.id === req.params.id);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        const demoFunction = demoFunctions[topic.demoFunction];
        if (!demoFunction) {
            return res.status(404).json({ 
                error: 'Demo function not found',
                output: `Demo function "${topic.demoFunction}" is not implemented yet.`
            });
        }
        
        console.log(`Executing demo: ${topic.demoFunction}`);
        const result = await captureConsoleOutput(demoFunction);
        
        res.json({
            success: result.success,
            output: result.output || `Demo "${topic.title}" executed successfully!`,
            error: result.error || null
        });
    } catch (error) {
        console.error('Error executing demo:', error);
        res.status(500).json({ 
            success: false, 
            output: '', 
            error: error.message 
        });
    }
});

app.get('/api/health', (req, res) => {
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        hasOpenAIKey,
        topicsLoaded: getAllTopics().length
    });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`🚀 LangChain Tutorial API Server running on http://localhost:${PORT}`);
    console.log(`📚 Topics loaded: ${getAllTopics().length} total`);
    console.log('🔑 OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
});
