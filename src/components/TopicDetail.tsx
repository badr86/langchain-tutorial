import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import StatusIndicator from './StatusIndicator';
import LoadingSpinner from './LoadingSpinner';
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
  return (
    <div className="container">
      <button className="back-button" onClick={onBack}>
        ← Back to Topics
      </button>
      
      <StatusIndicator healthStatus={healthStatus} />

      <div className="topic-detail">
        <div className={`topic-category ${topic.category}`}>
          {topic.category}
        </div>
        <h2 className="topic-title">{topic.title}</h2>
        <p className="topic-description">{topic.description}</p>

        <div className="code-section">
          <h3>Code Example:</h3>
          <div className="code-editor">
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {topic.codeSnippet}
            </SyntaxHighlighter>
          </div>

          <button
            className="execute-button"
            onClick={() => onExecute(topic.id)}
            disabled={executing}
          >
            {executing ? (
              <>
                <div className="spinner"></div>
                Executing...
              </>
            ) : (
              <>
                ▶️ Execute Demo
              </>
            )}
          </button>
        </div>

        {executionResult && (
          <div className="output-section">
            <h3>Output:</h3>
            <div className={`output-block ${executionResult.success ? 'success' : 'error'}`}>
              {executionResult.success ? executionResult.output : executionResult.error}
            </div>
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Executed at: {new Date(executionResult.timestamp).toLocaleString()}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetail;
