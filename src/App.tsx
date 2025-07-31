import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components';
import { Topic, HealthStatus } from './types';
import HomePage from './pages/HomePage';
import TopicDetailsPageRoute from './pages/TopicDetailsPageRoute';
import TravelPlannerPage from './pages/TravelPlannerPage';
import TravelPlanDetailsPage from './pages/TravelPlanDetailsPage';

const API_BASE = '/api';

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="documentation-container">
        <div className="doc-content">
          <LoadingSpinner message="Loading tutorial topics..." />
        </div>
      </div>
    );
  }

  return (
    <div className="documentation-container">
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              topics={topics} 
              healthStatus={healthStatus} 
            />
          } 
        />
        <Route 
          path="/topic/:topicId" 
          element={
            <TopicDetailsPageRoute 
              topics={topics} 
              healthStatus={healthStatus} 
            />
          } 
        />
        <Route 
          path="/travel-planner" 
          element={<TravelPlannerPage />} 
        />
        <Route 
          path="/travel-plan" 
          element={<TravelPlanDetailsPage />} 
        />
      </Routes>
    </div>
  );
}

export default App;
