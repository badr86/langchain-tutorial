import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import StatusIndicator from './StatusIndicator';
import LoadingSpinner from './LoadingSpinner';
import CapabilitiesSection from './CapabilitiesSection';
import { Topic, ExecutionResult, HealthStatus } from '../types';

interface TopicDetailProps {
  topic: Topic;
  healthStatus: HealthStatus | null;
  executing: boolean;
  executionResult: ExecutionResult | null;
  onBack: () => void;
  onExecute: (topicId: string) => void;
}

const TopicDetail: React.FC<TopicDetailProps> = ({
  topic,
  healthStatus,
  executing,
  executionResult,
  onBack,
  onExecute,
}) => {
  const getComplexityLevel = (category: string): { level: string; color: string } => {
    const complexityMap: Record<string, { level: string; color: string }> = {
      prompts: { level: 'Beginner', color: '#10b981' },
      chains: { level: 'Intermediate', color: '#f59e0b' },
      memory: { level: 'Intermediate', color: '#f59e0b' },
      agents: { level: 'Advanced', color: '#ef4444' },
      rag: { level: 'Advanced', color: '#ef4444' }
    };
    return complexityMap[category] || { level: 'Intermediate', color: '#f59e0b' };
  };

  const complexity = getComplexityLevel(topic.category);

  return (
    <div className="documentation-container">
      {/* Navigation Header */}
      <div className="doc-navigation">
        <button className="doc-back-button" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.5 2.5L3 8l5.5 5.5L9.5 12 5.5 8l4-4L8.5 2.5z"/>
          </svg>
          Back to Topic Details
        </button>
        <StatusIndicator healthStatus={healthStatus} />
      </div>

      {/* Main Documentation Content */}
      <div className="doc-content">
        {/* Header Section */}
        <header className="doc-header">
          <div className="doc-breadcrumb">
            <span className="breadcrumb-item">LangChain Tutorial</span>
            <span className="breadcrumb-separator">›</span>
            <span className={`breadcrumb-category category-${topic.category}`}>
              {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">Live Demo</span>
          </div>
          
          <h1 className="doc-title">{topic.title}</h1>
          
          <div className="doc-subtitle">{topic.description}</div>
          
          <div className="doc-meta">
            <div className="meta-badges">
              <span className={`badge badge-category category-${topic.category}`}>
                {topic.category.toUpperCase()}
              </span>
              <span 
                className="badge badge-complexity"
                style={{ backgroundColor: complexity.color }}
              >
                {complexity.level}
              </span>
              <span className="badge badge-category" style={{ background: '#8b5cf6' }}>
                Live Demo
              </span>
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <div className="doc-sections">
          {/* Capabilities Section */}
          {topic.capabilities && (
            <section className="doc-section">
              <h2 className="section-title">
                <span className="section-icon">⚡</span>
                Capabilities
              </h2>
              <div className="section-content">
                <CapabilitiesSection 
                  capabilities={topic.capabilities} 
                  title=""
                />
              </div>
            </section>
          )}

          {/* Code Execution Section */}
          <section className="doc-section">
            <h2 className="section-title">
              <span className="section-icon">💻</span>
              Live Code Execution
            </h2>
            <div className="section-content">
              <p className="code-description">
                Execute the <strong>{topic.title}</strong> example below to see it in action. 
                The code will run in a live environment and display real results.
              </p>
              
              <div className="code-container">
                <div className="code-header">
                  <div className="code-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 1h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/>
                      <path d="M6 8.5l1.5 1.5L10 7.5"/>
                    </svg>
                    {topic.title} - Live Demo
                  </div>
                  <div className="code-language">TypeScript</div>
                </div>
                
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 12px 12px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    padding: '20px',
                    maxHeight: '500px',
                    overflow: 'auto',
                  }}
                  showLineNumbers={true}
                  wrapLines={true}
                >
                  {topic.codeSnippet}
                </SyntaxHighlighter>
              </div>

              <div className="execution-controls">
                <button
                  className={`demo-button ${executing ? 'executing' : ''}`}
                  onClick={() => onExecute(topic.id)}
                  disabled={executing}
                >
                  {executing ? (
                    <>
                      <LoadingSpinner />
                      Executing...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                      </svg>
                      Execute Live Demo
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Output Section */}
          {executionResult && (
            <section className="doc-section">
              <h2 className="section-title">
                <span className="section-icon">{executionResult.success ? '✅' : '❌'}</span>
                Execution Results
              </h2>
              <div className="section-content">
                <div className="execution-result">
                  <div className="result-header">
                    <span className={`result-status ${executionResult.success ? 'success' : 'error'}`}>
                      {executionResult.success ? 'Success' : 'Error'}
                    </span>
                    <span className="result-timestamp">
                      {new Date(executionResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className={`result-content ${executionResult.success ? 'success' : 'error'}`}>
                    <pre>{executionResult.success ? executionResult.output : executionResult.error}</pre>
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

export default TopicDetail;
