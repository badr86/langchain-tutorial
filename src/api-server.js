import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure dotenv
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        rag: topicsData.rag?.length || 0,
        workshop: topicsData.workshop?.length || 0
    });
} catch (error) {
    console.error('Error loading topics:', error.message);
    topicsData = { prompts: [], chains: [], memory: [], agents: [], rag: [], workshop: [] };
}

// Flatten all topics into a single array with capabilities metadata
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
    if (topicsData.workshop) {
        allTopics.push(...topicsData.workshop);
    }
    
    // Use capabilities data directly from JSON, fallback to file extraction if not present
    return allTopics.map(topic => {
        if (topic.capabilities) {
            // Use capabilities data directly from JSON
            return topic;
        } else if (topic.demoFile) {
            // Fallback: extract capabilities from demo file
            const capabilities = extractCapabilities(topic.demoFile);
            return {
                ...topic,
                capabilities: capabilities
            };
        }
        return topic;
    });
};

// Import required LangChain modules
import { PromptTemplate, ChatPromptTemplate, FewShotPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI, OpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnableMap } from '@langchain/core/runnables';
import { BufferMemory, BufferWindowMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { extractCapabilities } from './utils/capabilitiesExtractor.js';

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

// Demo files are now specified directly in topics.json as 'demoFile' property

// File-based demo execution system - no legacy inline functions needed.

// Execute demo file and capture output
const executeDemoFile = async (filePath) => {
    return new Promise((resolve) => {
        const fullPath = path.join(__dirname, '..', filePath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            resolve({
                success: false,
                output: '',
                error: `Demo file not found: ${filePath}`
            });
            return;
        }
        
        console.log(`Executing demo file: ${fullPath}`);
        
        // Execute ES6 module file
        const child = spawn('node', [fullPath], {
            cwd: path.join(__dirname, '..'),
            env: { ...process.env },
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            console.log(text.trim()); // Also log to server console
        });
        
        child.stderr.on('data', (data) => {
            const text = data.toString();
            errorOutput += text;
            console.error(text.trim()); // Also log to server console
        });
        
        child.on('close', (code) => {
            resolve({
                success: code === 0,
                output: output || 'Demo executed successfully!',
                error: code !== 0 ? (errorOutput || `Process exited with code ${code}`) : null
            });
        });
        
        child.on('error', (error) => {
            resolve({
                success: false,
                output: '',
                error: `Failed to execute demo: ${error.message}`
            });
        });
        
        // Set a timeout to prevent hanging
        setTimeout(() => {
            if (!child.killed) {
                child.kill();
                resolve({
                    success: false,
                    output: output,
                    error: 'Demo execution timed out after 30 seconds'
                });
            }
        }, 30000);
    });
};

// Capture console output for demo execution (legacy function)
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
        
        console.log(`Executing demo: ${topic.demoFunction}`);
        
        // Execute using the file-based system from topics.json
        const demoFilePath = topic.demoFile;
        console.log(`Demo file path for ${topic.demoFunction}:`, demoFilePath);
        
        if (demoFilePath) {
            console.log(`Using file-based execution: ${demoFilePath}`);
            const result = await executeDemoFile(demoFilePath);
            console.log('File execution result:', result);
            
            res.json({
                success: result.success,
                output: result.output || `Demo "${topic.title}" executed successfully!`,
                error: result.error || null,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // No demo file found - return error
        return res.status(404).json({ 
            error: 'Demo file not found',
            output: `Demo file for "${topic.demoFunction}" is not implemented yet. Please check that the demo file exists at the specified path.`,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: result.success,
            output: result.output || `Demo "${topic.title}" executed successfully!`,
            error: result.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error executing demo:', error);
        res.status(500).json({ 
            success: false, 
            output: '', 
            error: error.message,
            timestamp: new Date().toISOString()
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
