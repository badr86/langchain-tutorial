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
  const promptTopics = topics.filter(t => t.category === 'prompts');
  const chainTopics = topics.filter(t => t.category === 'chains');
  const memoryTopics = topics.filter(t => t.category === 'memory');
  const agentTopics = topics.filter(t => t.category === 'agents');
  const ragTopics = topics.filter(t => t.category === 'rag');

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
                  <div className="info-value">5</div>
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
        </div>
      </div>
    </div>
  );
};

export default TopicList;
