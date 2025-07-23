import React, { useState, useEffect } from 'react';
import { TopicList, TopicDetail, LoadingSpinner } from './components';
import { Topic, ExecutionResult, HealthStatus } from './types';

const API_BASE = '/api';

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetchTopics();
    checkHealth();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch(`${API_BASE}/topics`);
      const data: Topic[] = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data: HealthStatus = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Failed to check health:', error);
    }
  };

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

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setExecutionResult(null); // Clear previous execution result
  };

  const handleBackClick = () => {
    setSelectedTopic(null);
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner message="Loading tutorial topics..." />
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <TopicDetail
        topic={selectedTopic}
        healthStatus={healthStatus}
        executing={executing}
        executionResult={executionResult}
        onBack={handleBackClick}
        onExecute={executeTopic}
      />
    );
  }

  return (
    <TopicList
      topics={topics}
      healthStatus={healthStatus}
      onTopicClick={handleTopicClick}
    />
  );
}

export default App;
