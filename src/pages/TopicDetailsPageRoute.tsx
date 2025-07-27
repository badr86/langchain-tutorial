import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopicDetailsPage } from '../components';
import { Topic, HealthStatus } from '../types';

interface TopicDetailsPageRouteProps {
  topics: Topic[];
  healthStatus: HealthStatus | null;
}

const TopicDetailsPageRoute: React.FC<TopicDetailsPageRouteProps> = ({ 
  topics, 
  healthStatus 
}) => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

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

  const handleBack = () => {
    navigate('/');
  };

  return (
    <TopicDetailsPage
      topic={topic}
      healthStatus={healthStatus}
      onBack={handleBack}
    />
  );
};

export default TopicDetailsPageRoute;
