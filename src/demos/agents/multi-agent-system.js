import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { DynamicTool } from 'langchain/tools';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Multi-Agent System Demo
 * 
 * This demo shows how to coordinate multiple specialized agents for complex tasks.
 * Each agent has specific expertise and they work together to solve problems.
 */
async function multiAgentSystemDemo() {
    console.log('🚀 Executing Multi-Agent System Demo...');
    console.log('=' .repeat(60));

    console.log('👥 Multi-Agent System Overview:');
    console.log('   • Multiple specialized agents working together');
    console.log('   • Each agent has specific domain expertise');
    console.log('   • Coordinated workflow for complex tasks');
    console.log('   • Parallel and sequential agent execution');

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.log('\n❌ OpenAI API Key not found in environment variables');
        console.log('💡 Please set OPENAI_API_KEY in your .env file to run this demo');
        console.log('\n🎭 Showing multi-agent system architecture instead...');
        
        showMultiAgentArchitecture();
        return;
    }

    console.log('\n✅ OpenAI API Key found - proceeding with multi-agent demo');

    // Initialize the base LLM
    const llm = new ChatOpenAI({
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n🤖 Base LLM Configuration:');
    console.log('   • Model: gpt-3.5-turbo');
    console.log('   • Temperature: 0.7');
    console.log('   • Shared across all agents');

    // Define specialized agents
    console.log('\n🏗️ Creating Specialized Agents...');

    // Research Agent - specializes in information gathering
    class ResearchAgent {
        constructor(llm) {
            this.llm = llm;
            this.name = 'Research Agent';
            this.expertise = 'Information gathering and fact-finding';
            
            this.prompt = ChatPromptTemplate.fromTemplate(`
You are a specialized Research Agent with expertise in information gathering and analysis.

Your task: Research the topic "{topic}" thoroughly.

Focus on:
- Key facts and definitions
- Current trends and developments  
- Important statistics or data points
- Credible sources and references
- Historical context where relevant

Provide a comprehensive research summary that other agents can build upon.

Research Topic: {topic}
            `);
            
            this.chain = RunnableSequence.from([
                this.prompt,
                this.llm,
                new StringOutputParser()
            ]);
        }

        async research(topic) {
            console.log(`🔍 ${this.name} researching: ${topic}`);
            
            try {
                const result = await this.chain.invoke({ topic });
                console.log(`✅ ${this.name} completed research`);
                return {
                    agent: this.name,
                    task: 'research',
                    topic: topic,
                    result: result,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.log(`❌ ${this.name} error:`, error.message);
                return {
                    agent: this.name,
                    task: 'research',
                    topic: topic,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
    }

    // Writing Agent - specializes in content creation
    class WritingAgent {
        constructor(llm) {
            this.llm = llm;
            this.name = 'Writing Agent';
            this.expertise = 'Content creation and writing';
            
            this.prompt = ChatPromptTemplate.fromTemplate(`
You are a specialized Writing Agent with expertise in creating engaging, well-structured content.

Your task: Create a {style} article based on the research provided.

Research Information:
{research}

Writing Requirements:
- Target audience: {audience}
- Writing style: {style}
- Article length: {length}
- Include clear structure with headings
- Make it engaging and informative
- Use the research data effectively

Create a high-quality article that meets these requirements.
            `);
            
            this.chain = RunnableSequence.from([
                this.prompt,
                this.llm,
                new StringOutputParser()
            ]);
        }

        async write(research, style = 'professional', audience = 'general', length = 'medium') {
            console.log(`✍️  ${this.name} writing ${style} content for ${audience} audience`);
            
            try {
                const result = await this.chain.invoke({ 
                    research: research.result,
                    style,
                    audience,
                    length
                });
                console.log(`✅ ${this.name} completed writing`);
                return {
                    agent: this.name,
                    task: 'writing',
                    style: style,
                    audience: audience,
                    result: result,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.log(`❌ ${this.name} error:`, error.message);
                return {
                    agent: this.name,
                    task: 'writing',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
    }

    // Review Agent - specializes in quality assurance
    class ReviewAgent {
        constructor(llm) {
            this.llm = llm;
            this.name = 'Review Agent';
            this.expertise = 'Quality assurance and content improvement';
            
            this.prompt = ChatPromptTemplate.fromTemplate(`
You are a specialized Review Agent with expertise in quality assurance and content improvement.

Your task: Review and improve the following content.

Original Content:
{content}

Review Criteria:
- Accuracy and factual correctness
- Clarity and readability
- Structure and organization
- Grammar and style
- Completeness and depth

Provide:
1. A quality assessment score (1-10)
2. Specific areas for improvement
3. An improved version of the content
4. Recommendations for future content

Focus on making the content as good as possible while maintaining its original intent.
            `);
            
            this.chain = RunnableSequence.from([
                this.prompt,
                this.llm,
                new StringOutputParser()
            ]);
        }

        async review(content) {
            console.log(`🔍 ${this.name} reviewing content quality`);
            
            try {
                const result = await this.chain.invoke({ content: content.result });
                console.log(`✅ ${this.name} completed review`);
                return {
                    agent: this.name,
                    task: 'review',
                    originalAgent: content.agent,
                    result: result,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.log(`❌ ${this.name} error:`, error.message);
                return {
                    agent: this.name,
                    task: 'review',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
    }

    // Analysis Agent - specializes in data analysis and insights
    class AnalysisAgent {
        constructor(llm) {
            this.llm = llm;
            this.name = 'Analysis Agent';
            this.expertise = 'Data analysis and strategic insights';
            
            this.prompt = ChatPromptTemplate.fromTemplate(`
You are a specialized Analysis Agent with expertise in data analysis and strategic insights.

Your task: Analyze the workflow results and provide strategic insights.

Workflow Data:
{workflowData}

Analysis Focus:
- Process efficiency and bottlenecks
- Quality of outputs at each stage
- Collaboration effectiveness between agents
- Areas for improvement
- Success metrics and KPIs
- Strategic recommendations

Provide a comprehensive analysis with actionable insights.
            `);
            
            this.chain = RunnableSequence.from([
                this.prompt,
                this.llm,
                new StringOutputParser()
            ]);
        }

        async analyze(workflowData) {
            console.log(`📊 ${this.name} analyzing workflow performance`);
            
            try {
                const result = await this.chain.invoke({ 
                    workflowData: JSON.stringify(workflowData, null, 2)
                });
                console.log(`✅ ${this.name} completed analysis`);
                return {
                    agent: this.name,
                    task: 'analysis',
                    result: result,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.log(`❌ ${this.name} error:`, error.message);
                return {
                    agent: this.name,
                    task: 'analysis',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
    }

    // Multi-Agent Orchestrator - coordinates all agents
    class MultiAgentOrchestrator {
        constructor() {
            this.researchAgent = new ResearchAgent(llm);
            this.writingAgent = new WritingAgent(llm);
            this.reviewAgent = new ReviewAgent(llm);
            this.analysisAgent = new AnalysisAgent(llm);
            
            this.workflowHistory = [];
        }

        async executeWorkflow(task) {
            console.log('\n🎯 Starting Multi-Agent Workflow...');
            console.log(`📋 Task: ${JSON.stringify(task, null, 2)}`);
            
            const workflow = {
                taskId: Date.now().toString(),
                task: task,
                startTime: new Date().toISOString(),
                steps: [],
                results: {}
            };

            try {
                // Step 1: Research Phase
                console.log('\n📚 Phase 1: Research');
                const researchResult = await this.researchAgent.research(task.topic);
                workflow.steps.push(researchResult);
                workflow.results.research = researchResult;

                // Step 2: Writing Phase
                console.log('\n✍️  Phase 2: Content Creation');
                const writingResult = await this.writingAgent.write(
                    researchResult, 
                    task.style || 'professional',
                    task.audience || 'general',
                    task.length || 'medium'
                );
                workflow.steps.push(writingResult);
                workflow.results.writing = writingResult;

                // Step 3: Review Phase
                console.log('\n🔍 Phase 3: Quality Review');
                const reviewResult = await this.reviewAgent.review(writingResult);
                workflow.steps.push(reviewResult);
                workflow.results.review = reviewResult;

                // Step 4: Analysis Phase
                console.log('\n📊 Phase 4: Workflow Analysis');
                const analysisResult = await this.analysisAgent.analyze(workflow.steps);
                workflow.steps.push(analysisResult);
                workflow.results.analysis = analysisResult;

                workflow.endTime = new Date().toISOString();
                workflow.status = 'completed';
                workflow.duration = Date.now() - parseInt(workflow.taskId);

                this.workflowHistory.push(workflow);

                return workflow;

            } catch (error) {
                workflow.endTime = new Date().toISOString();
                workflow.status = 'failed';
                workflow.error = error.message;
                
                this.workflowHistory.push(workflow);
                throw error;
            }
        }

        getWorkflowStats() {
            const completed = this.workflowHistory.filter(w => w.status === 'completed').length;
            const failed = this.workflowHistory.filter(w => w.status === 'failed').length;
            const avgDuration = this.workflowHistory
                .filter(w => w.duration)
                .reduce((sum, w) => sum + w.duration, 0) / 
                (this.workflowHistory.length || 1);

            return {
                totalWorkflows: this.workflowHistory.length,
                completed: completed,
                failed: failed,
                successRate: this.workflowHistory.length > 0 ? 
                    Math.round(completed / this.workflowHistory.length * 100) : 0,
                avgDuration: Math.round(avgDuration)
            };
        }
    }

    // Create orchestrator and test multi-agent system
    console.log('\n🎭 Creating Multi-Agent Orchestrator...');
    const orchestrator = new MultiAgentOrchestrator();

    console.log('✅ Multi-Agent System Ready!');
    console.log('\n👥 Agent Team:');
    console.log('   1. Research Agent - Information gathering');
    console.log('   2. Writing Agent - Content creation');
    console.log('   3. Review Agent - Quality assurance');
    console.log('   4. Analysis Agent - Performance analysis');

    // Test scenarios
    const testTasks = [
        {
            topic: 'Artificial Intelligence in Healthcare',
            style: 'technical',
            audience: 'healthcare professionals',
            length: 'comprehensive'
        },
        {
            topic: 'Sustainable Energy Solutions',
            style: 'accessible',
            audience: 'general public',
            length: 'medium'
        }
    ];

    console.log('\n🧪 Testing Multi-Agent Workflows...');

    for (let i = 0; i < testTasks.length; i++) {
        const task = testTasks[i];
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎯 Workflow ${i + 1}: ${task.topic}`);
        console.log(`${'='.repeat(60)}`);
        
        try {
            const startTime = Date.now();
            const workflow = await orchestrator.executeWorkflow(task);
            const endTime = Date.now();
            
            console.log('\n✅ Multi-Agent Workflow Completed!');
            console.log(`⏱️  Total time: ${endTime - startTime}ms`);
            console.log(`📊 Steps completed: ${workflow.steps.length}`);
            
            // Show brief results from each agent
            console.log('\n📋 Agent Results Summary:');
            workflow.steps.forEach((step, index) => {
                console.log(`   ${index + 1}. ${step.agent}: ${step.task} - ${step.error ? '❌ Failed' : '✅ Success'}`);
            });
            
            // Show final output preview
            if (workflow.results.review && workflow.results.review.result) {
                console.log('\n📝 Final Content Preview:');
                console.log(workflow.results.review.result.substring(0, 200) + '...');
            }
            
        } catch (error) {
            console.log('❌ Multi-agent workflow failed:', error.message);
        }
        
        // Delay between workflows
        if (i < testTasks.length - 1) {
            console.log('\n⏳ Preparing next workflow...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Show orchestrator statistics
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Multi-Agent System Statistics');
    console.log(`${'='.repeat(60)}`);

    const stats = orchestrator.getWorkflowStats();
    console.log('\n📈 Performance Metrics:');
    console.log(`   Total workflows: ${stats.totalWorkflows}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Failed: ${stats.failed}`);
    console.log(`   Success rate: ${stats.successRate}%`);
    console.log(`   Average duration: ${stats.avgDuration}ms`);

    console.log('\n✅ Multi-Agent System Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Multiple specialized agents can work together effectively');
    console.log('   • Each agent focuses on its area of expertise');
    console.log('   • Orchestration coordinates the workflow');
    console.log('   • Quality improves through specialized review processes');
    console.log('   • Complex tasks benefit from multi-agent approaches');
}

function showMultiAgentArchitecture() {
    console.log('\n🏗️ Multi-Agent System Architecture:');
    
    console.log('\n👥 Agent Specializations:');
    console.log('   🔍 Research Agent: Information gathering, fact-finding');
    console.log('   ✍️  Writing Agent: Content creation, storytelling');
    console.log('   🔍 Review Agent: Quality assurance, editing');
    console.log('   📊 Analysis Agent: Performance analysis, insights');
    
    console.log('\n🔄 Workflow Coordination:');
    console.log('   1. Task received by orchestrator');
    console.log('   2. Research agent gathers information');
    console.log('   3. Writing agent creates content');
    console.log('   4. Review agent improves quality');
    console.log('   5. Analysis agent provides insights');
    console.log('   6. Final results delivered');
    
    console.log('\n✅ Benefits:');
    console.log('   • Specialized expertise for each task');
    console.log('   • Higher quality through division of labor');
    console.log('   • Scalable and modular architecture');
    console.log('   • Parallel processing capabilities');
    console.log('   • Quality assurance built into workflow');
}

// Execute the demo
multiAgentSystemDemo().catch(console.error);
