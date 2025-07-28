import React from 'react';
import TopicSection from './TopicSection';
import StatusIndicator from './StatusIndicator';
import { Topic, HealthStatus } from '../types';

interface TopicListProps {
  topics: Topic[];
  healthStatus: HealthStatus | null;
  onTopicClick: (topic: Topic) => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, healthStatus, onTopicClick }) => {
  const categories = [
    { name: 'prompts', title: 'Prompt Templates', icon: '📝', description: 'Learn to craft effective prompts for AI models' },
    { name: 'chains', title: 'Chains', icon: '🔗', description: 'Build complex workflows by chaining operations' },
    { name: 'memory', title: 'Memory', icon: '🧠', description: 'Add conversation memory to your AI applications' },
    { name: 'agents', title: 'Agents', icon: '🤖', description: 'Create intelligent agents that can use tools' },
    { name: 'rag', title: 'RAG', icon: '📚', description: 'Retrieval-Augmented Generation for knowledge-based AI' },
    { name: 'workshop', title: 'Smart Travel Planner Workshop', icon: '🌍', description: 'Hands-on workshop: Build an AI-powered travel planning application' },
  ];

  const promptTopics = topics.filter(t => t.category === 'prompts');
  const chainTopics = topics.filter(t => t.category === 'chains');
  const memoryTopics = topics.filter(t => t.category === 'memory');
  const agentTopics = topics.filter(t => t.category === 'agents');
  const ragTopics = topics.filter(t => t.category === 'rag');
  const workshopTopics = topics.filter(t => t.category === 'workshop');

  return (
    <div className="documentation-container">
      {/* Navigation Header */}
      <div className="doc-navigation">
        <div className="doc-nav-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          LangChain Tutorial
        </div>
        <StatusIndicator healthStatus={healthStatus} />
      </div>

      {/* Main Content */}
      <div className="doc-content">
        {/* Header Section */}
        <header className="doc-header">
          <div className="doc-breadcrumb">
            <span className="breadcrumb-item">LangChain Tutorial</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-category">Documentation</span>
          </div>
          
          <h1 className="doc-title">🦜 LangChain Tutorial</h1>
          
          <div className="doc-subtitle">
            Interactive Learning with Live Code Execution - Master LangChain through hands-on examples
          </div>
          
          <div className="doc-meta">
            <div className="meta-badges">
              <span className="badge badge-category" style={{ background: '#4fc3f7' }}>
                Interactive
              </span>
              <span className="badge badge-complexity" style={{ backgroundColor: '#10b981' }}>
                All Levels
              </span>
              <span className="badge badge-category" style={{ background: '#8b5cf6' }}>
                {topics.length} Topics
              </span>
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <div className="doc-sections">
          {/* Overview Section */}
          <section className="doc-section">
            <h2 className="section-title">
              <span className="section-icon">📚</span>
              Learning Modules
            </h2>
            <div className="section-content">
              <p className="section-description">
                Explore comprehensive LangChain concepts through interactive examples. 
                Each module contains practical code examples that you can run and modify in real-time.
              </p>
              
              <div className="topic-sections-container">
                <TopicSection
                  title="Prompt Templates"
                  icon="📝"
                  topics={promptTopics}
                  onTopicClick={onTopicClick}
                />

                <TopicSection
                  title="Chains & LCEL"
                  icon="🔗"
                  topics={chainTopics}
                  onTopicClick={onTopicClick}
                />

                <TopicSection
                  title="Memory & Context"
                  icon="🧠"
                  topics={memoryTopics}
                  onTopicClick={onTopicClick}
                />

                <TopicSection
                  title="Agents & Tools"
                  icon="🤖"
                  topics={agentTopics}
                  onTopicClick={onTopicClick}
                />

                <TopicSection
                  title="Document Processing - RAG"
                  icon="📚"
                  topics={ragTopics}
                  onTopicClick={onTopicClick}
                />

                <TopicSection
                  title="Smart Travel Planner Workshop"
                  icon="🌍"
                  topics={workshopTopics}
                  onTopicClick={onTopicClick}
                />
              </div>
            </div>
          </section>

          {/* Getting Started Section */}
          <section className="doc-section">
            <h2 className="section-title">
              <span className="section-icon">🚀</span>
              Getting Started
            </h2>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">Total Topics</div>
                  <div className="info-value">{topics.length}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Categories</div>
                  <div className="info-value">6</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Framework</div>
                  <div className="info-value">LangChain</div>
                </div>
              </div>
              
              <div className="getting-started-text">
                <p>
                  <strong>Ready to start learning?</strong> Click on any topic above to view detailed 
                  explanations, code examples, and run interactive demonstrations. Each topic is 
                  designed to build your understanding of LangChain step by step.
                </p>
              </div>
            </div>
          </section>

          {/* Workshop Info Section */}
          {workshopTopics.length > 0 && (
            <section className="doc-section">
              <h2 className="section-title">
                <span className="section-icon">🎓</span>
                Workshop: Designing with AI
              </h2>
              <div className="section-content">
                <div className="workshop-info">
                  <h3>Smart Travel Planner Workshop</h3>
                  <p className="workshop-description">
                    Learn to build intelligent travel planning applications using LangChain concepts. 
                    This hands-on workshop teaches you when to use AI vs traditional programming, 
                    and how to implement sophisticated travel planning workflows.
                  </p>
                  
                  <div className="workshop-objectives">
                    <h4>Workshop Objectives:</h4>
                    <ul>
                      <li>Understand when to use AI vs traditional programming</li>
                      <li>Master prompt engineering for travel planning</li>
                      <li>Build chains for complex travel workflows</li>
                      <li>Create intelligent travel agents with tools</li>
                      <li>Implement memory for personalized experiences</li>
                    </ul>
                  </div>

                  <div className="workshop-path">
                    <h4>Learning Path:</h4>
                    <div className="workshop-steps">
                      <div className="workshop-step">
                        <span className="step-number">1</span>
                        <span className="step-title">Travel Prompt Templates</span>
                        <span className="step-description">Build complex prompts with multiple variables</span>
                      </div>
                      <div className="workshop-step">
                        <span className="step-number">2</span>
                        <span className="step-title">Trip Suggestion Pipelines</span>
                        <span className="step-description">Create multi-step travel planning chains</span>
                      </div>
                      <div className="workshop-step">
                        <span className="step-number">3</span>
                        <span className="step-title">Coming Soon</span>
                        <span className="step-description">Travel agents, memory, and RAG integration</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicList;
