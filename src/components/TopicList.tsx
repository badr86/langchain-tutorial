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
    <div className="container">
      <div className="header">
        <h1>🦜 LangChain Tutorial</h1>
        <p>Interactive Learning with Live Code Execution</p>
      </div>

      <StatusIndicator healthStatus={healthStatus} />

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

      <div style={{ textAlign: 'center', marginTop: '40px', color: 'white', opacity: 0.8 }}>
        <p>Click on any topic to view the code and execute it live!</p>
        <p style={{ fontSize: '0.9rem' }}>
          Built with React, TypeScript, and LangChain • 
          Total Topics: {topics.length}
        </p>
      </div>
    </div>
  );
};

export default TopicList;
