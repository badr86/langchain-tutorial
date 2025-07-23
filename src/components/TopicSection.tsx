import React from 'react';
import TopicCard from './TopicCard';
import { Topic } from '../types';

interface TopicSectionProps {
  title: string;
  icon: string;
  topics: Topic[];
  onTopicClick: (topic: Topic) => void;
}

const TopicSection: React.FC<TopicSectionProps> = ({ title, icon, topics, onTopicClick }) => {
  if (topics.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ color: 'white', marginBottom: '16px' }}>
        {icon} {title}
      </h2>
      <div className="topics-grid">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onClick={onTopicClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TopicSection;
