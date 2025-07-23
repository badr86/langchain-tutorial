import React from 'react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onClick: (topic: Topic) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  return (
    <div
      className="topic-card"
      onClick={() => onClick(topic)}
    >
      <div className={`topic-category ${topic.category}`}>
        {topic.category}
      </div>
      <div className="topic-title">{topic.title}</div>
      <div className="topic-description">{topic.description}</div>
    </div>
  );
};

export default TopicCard;
