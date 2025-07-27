import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopicList } from '../components';
import { Topic, HealthStatus } from '../types';

interface HomePageProps {
  topics: Topic[];
  healthStatus: HealthStatus | null;
}

const HomePage: React.FC<HomePageProps> = ({ topics, healthStatus }) => {
  const navigate = useNavigate();

  const handleTopicClick = (topic: Topic) => {
    navigate(`/topic/${topic.id}`);
  };

  return (
    <TopicList
      topics={topics}
      healthStatus={healthStatus}
      onTopicClick={handleTopicClick}
    />
  );
};

export default HomePage;
