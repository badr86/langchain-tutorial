import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopicDetail } from '../components';
import { Topic, HealthStatus, ExecutionResult } from '../types';

interface TopicExecutionPageProps {
  topics: Topic[];
  healthStatus: HealthStatus | null;
}

const API_BASE = '/api';

const TopicExecutionPage: React.FC<TopicExecutionPageProps> = ({ 
  topics, 
  healthStatus 
}) => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  const topic = topics.find(t => t.id === topicId);

  if (!topic) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Topic Not Found</h2>
          <p>The requested topic could not be found.</p>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Topics
          </button>
        </div>
      </div>
    );
  }

  const executeTopic = async (topicId: string) => {
    setExecuting(true);
    setExecutionResult(null);
    
    try {
      const response = await fetch(`${API_BASE}/execute/${topicId}`, {
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

  const handleBack = () => {
    navigate(`/topic/${topicId}`);
  };

  return (
    <TopicDetail
      topic={topic}
      healthStatus={healthStatus}
      executing={executing}
      executionResult={executionResult}
      onBack={handleBack}
      onExecute={executeTopic}
    />
  );
};

export default TopicExecutionPage;
