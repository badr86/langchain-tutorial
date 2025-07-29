import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import StatusIndicator from './StatusIndicator';
import CapabilitiesSection from './CapabilitiesSection';
import { Topic, HealthStatus, ExecutionResult } from '../types';

const API_BASE = '/api';

interface TopicDetailsPageProps {
  topic: Topic;
  healthStatus: HealthStatus | null;
  onBack: () => void;
}

const TopicDetailsPage: React.FC<TopicDetailsPageProps> = ({
  topic,
  healthStatus,
  onBack,
}) => {
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // Scroll to top when component mounts or topic changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [topic.id]);

  const executeTopic = async () => {
    setExecuting(true);
    setExecutionResult(null);
    
    try {
      const response = await fetch(`${API_BASE}/execute/${topic.id}`, {
        method: 'POST',
      });
      const result: ExecutionResult = await response.json();
      setExecutionResult(result);
    } catch (error: any) {
      setExecutionResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setExecuting(false);
    }
  };

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
          Back to Topics
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
          </div>
          
          <h1 className="doc-title">{topic.title}</h1>
          
          <div className="doc-subtitle">{topic.description}</div>
          
          <div className="doc-meta">
            <div className="meta-badges">
              <span 
                className="badge badge-complexity"
                style={{ backgroundColor: complexity.color }}
              >
                {complexity.level}
              </span>
            </div>
          </div>
        </header>



        {/* Content Sections */}
        <div className="doc-sections">
          {/* Overview Section */}
          <section id="overview" className="doc-section">
            <h2 className="section-title">
              <span className="section-icon">📋</span>
              Overview
            </h2>
            <div className="section-content">
              <p className="section-description">
                This demonstration showcases the implementation and practical usage of{' '}
                <strong>{topic.title}</strong> within the LangChain framework. You'll learn
                how to properly set up, configure, and integrate this feature into your
                AI-powered applications.
              </p>
            </div>
          </section>

          {/* Implementation Section */}
          <section id="implementation" className="doc-section">
            <h2 className="section-title">
              <span className="section-icon">💻</span>
              Implementation
            </h2>
            <div className="section-content">
              <p className="code-description">
                Below is the complete implementation example showing how to use{' '}
                <strong>{topic.title}</strong> in your application:
              </p>
              
              <div className="code-container">
                <div className="code-header">
                  <div className="code-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 1h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/>
                      <path d="M6 8.5l1.5 1.5L10 7.5"/>
                    </svg>
                    {topic.title} Example
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
            </div>
          </section>

          {/* Capabilities Section */}
          {topic.capabilities && (
            <section id="capabilities" className="doc-section">
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

          {/* Interactive Demo Section */}
          <section id="demo" className="doc-section">
            <h2 className="section-title">
              <span className="section-icon">🚀</span>
              Interactive Demo
            </h2>
            <div className="section-content">
              <div className="demo-card enhanced">
                <div className="demo-info">
                  <div className="demo-header">
                    <h3>See {topic.title} in Action</h3>
                    <div className="demo-badges">
                      <span className="demo-badge time">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                          <path d="M7 0a7 7 0 100 14A7 7 0 007 0zM7 1a6 6 0 110 12A6 6 0 017 1zm0 2a.5.5 0 01.5.5v3.293l1.854 1.853a.5.5 0 01-.708.708L6.5 7.207V3.5A.5.5 0 017 3z"/>
                        </svg>
                        ~30 seconds
                      </span>
                      <span className="demo-badge difficulty">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                          <path d="M7 0L8.854 4.292h4.646l-3.76 2.732L11.594 12 7 9.268 2.406 12l1.854-4.976L.5 4.292h4.646L7 0z"/>
                        </svg>
                        {getComplexityLevel(topic.category).level}
                      </span>
                    </div>
                  </div>
                  <p className="demo-description">
                    Execute this live demo to experience how{' '}
                    <strong>{topic.title}</strong> works with real data. 
                    You'll see the actual output and understand the practical implementation.
                  </p>
                  
                  {healthStatus?.hasOpenAIKey ? (
                    <div className="demo-status ready">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.354 6.354l-4 4a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L7 9.293l3.646-3.647a.5.5 0 01.708.708z"/>
                      </svg>
                      Ready to run
                    </div>
                  ) : (
                    <div className="demo-status warning">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 100 2 1 1 0 000-2z"/>
                      </svg>
                      OpenAI API key required
                    </div>
                  )}
                </div>
                
                <div className="execution-controls">
                  <button 
                    className={`demo-button enhanced ${executing ? 'executing' : ''}`} 
                    onClick={executeTopic}
                    disabled={executing || !healthStatus?.hasOpenAIKey}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                    {executing ? (
                      <>
                        <span className="loading-spinner"></span>
                        Running Demo...
                      </>
                    ) : (
                      `Run ${topic.title} Demo`
                    )}
                  </button>
                </div>
              </div>

              {/* Execution Results - Now on separate row */}
              {executionResult && (
                <div className="execution-result">
                  <div className="result-header">
                    <span className={`result-status ${executionResult.success ? 'success' : 'error'}`}>
                      {executionResult.success ? 'Success' : 'Error'}
                    </span>
                    <span className="result-timestamp">
                      {new Date(executionResult.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`result-content ${executionResult.success ? 'success' : 'error'}`}>
                    <pre>
                      {executionResult.success ? executionResult.output : executionResult.error}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TopicDetailsPage;
