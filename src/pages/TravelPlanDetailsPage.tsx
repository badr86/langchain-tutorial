import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../travel-planner.css';

interface TravelPlanData {
  userId: string;
  timestamp: string;
  travelPlan: {
    destination: string;
    duration: string;
    budget: string;
    interests: string;
    groupSize: string;
  };
  knowledge: string;
  currentConditions: {
    weather: string;
    currency: string;
    restaurants?: string;
    activities?: string;
    budgetBreakdown?: string;
    booking?: string;
  };
  structuredItinerary: {
    destination: string;
    duration: string;
    totalBudget: string;
    dailyItinerary: Array<{
      day: number;
      activities: string[];
      meals: string[];
      estimatedCost: string;
    }>;
    packingList: string[];
    importantNotes: string[];
  };
  recommendations: string[];
  agentResponse?: string;
}

const TravelPlanDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { planData, formData } = location.state || {};

  if (!planData) {
    return (
      <div className="documentation-container">
        <div className="doc-content">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            No travel plan data found. Please generate a new plan.
          </div>
          <button 
            onClick={() => navigate('/travel-planner')}
            className="btn-primary"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  const plan: TravelPlanData = planData;

  return (
    <div className="documentation-container">
      <div className="doc-content">
        <div className="doc-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">
              <a href="/">LangChain Tutorial</a>
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">
              <a href="/travel-planner">Travel Planner</a>
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item current">Your Travel Plan</span>
          </div>
          
          <div className="doc-title-section">
            <h1 className="doc-title gradient-text">
              🎯 Your Personalized Travel Plan
            </h1>
            <p className="doc-subtitle">
              AI-generated itinerary for {plan.travelPlan.destination}
            </p>
            
            <div className="info-cards-grid">
              <div className="info-card">
                <div className="info-card-icon">📍</div>
                <div className="info-card-content">
                  <div className="info-card-label">Destination</div>
                  <div className="info-card-value">{plan.travelPlan.destination}</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">📅</div>
                <div className="info-card-content">
                  <div className="info-card-label">Duration</div>
                  <div className="info-card-value">{plan.travelPlan.duration}</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">💰</div>
                <div className="info-card-content">
                  <div className="info-card-label">Budget</div>
                  <div className="info-card-value">{plan.travelPlan.budget}</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">👥</div>
                <div className="info-card-content">
                  <div className="info-card-label">Group Size</div>
                  <div className="info-card-value">{plan.travelPlan.groupSize}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="doc-section">
          <h2 className="section-title">🌤️ Current Conditions</h2>
          <div className="conditions-grid">
            <div className="condition-card">
              <div className="condition-icon">🌡️</div>
              <div className="condition-content">
                <div className="condition-label">Weather</div>
                <div className="condition-value">{plan.currentConditions.weather}</div>
              </div>
            </div>
            <div className="condition-card">
              <div className="condition-icon">💱</div>
              <div className="condition-content">
                <div className="condition-label">Currency</div>
                <div className="condition-value">{plan.currentConditions.currency}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Context */}
        <div className="doc-section">
          <h2 className="section-title">📚 Destination Knowledge</h2>
          <div className="knowledge-card">
            <p>{plan.knowledge}</p>
          </div>
        </div>

        {/* Structured Itinerary */}
        <div className="doc-section">
          <h2 className="section-title">📅 Detailed Itinerary</h2>
          
          <div className="itinerary-summary">
            <div className="summary-item">
              <span className="summary-label">Total Budget:</span>
              <span className="summary-value">{plan.structuredItinerary.totalBudget}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Days Planned:</span>
              <span className="summary-value">{plan.structuredItinerary.dailyItinerary.length} days</span>
            </div>
          </div>

          <div className="daily-itinerary">
            {plan.structuredItinerary.dailyItinerary.map((day, index) => (
              <div key={index} className="day-card">
                <div className="day-header">
                  <h3 className="day-title">Day {day.day}</h3>
                  <div className="day-cost">{day.estimatedCost}</div>
                </div>
                
                <div className="day-content">
                  <div className="day-section">
                    <h4 className="day-section-title">🎯 Activities</h4>
                    <ul className="activity-list">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="activity-item">{activity}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="day-section">
                    <h4 className="day-section-title">🍽️ Meals</h4>
                    <ul className="meal-list">
                      {day.meals.map((meal, idx) => (
                        <li key={idx} className="meal-item">{meal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Packing List */}
        <div className="doc-section">
          <h2 className="section-title">🎒 Packing List</h2>
          <div className="packing-grid">
            {plan.structuredItinerary.packingList.map((item, index) => (
              <div key={index} className="packing-item">
                <span className="packing-icon">📦</span>
                <span className="packing-text">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="doc-section">
          <h2 className="section-title">⚠️ Important Notes</h2>
          <div className="notes-list">
            {plan.structuredItinerary.importantNotes.map((note, index) => (
              <div key={index} className="note-item">
                <span className="note-icon">💡</span>
                <span className="note-text">{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="doc-section">
          <h2 className="section-title">💡 Personalized Recommendations</h2>
          <div className="recommendations-grid">
            {plan.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-card">
                <div className="recommendation-icon">⭐</div>
                <div className="recommendation-text">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="doc-section">
          <h2 className="section-title">🚀 Recommendations</h2>
          <div className="next-steps-list">
            {plan.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="next-step-item">
                <div className="step-number">{index + 1}</div>
                <div className="step-text">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="doc-section">
          <h2 className="section-title">👤 Your Profile</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="profile-label">User ID:</span>
              <span className="profile-value">{plan.userId}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Interests:</span>
              <span className="profile-value">{plan.travelPlan.interests}</span>
            </div>
            {/* User profile information removed - not available in current API response */}
          </div>
        </div>

        {/* LangChain Integration Info */}
        <div className="doc-section">
          <h2 className="section-title">🧠 AI Integration Details</h2>
          <div className="integration-info">
            <p className="integration-description">
              This travel plan was generated using a comprehensive AI system that integrates 
              all major LangChain concepts working together seamlessly:
            </p>
            
            <div className="concepts-integration-grid">
              <div className="integration-card">
                <div className="integration-icon">📝</div>
                <div className="integration-content">
                  <div className="integration-title">Prompt Templates</div>
                  <div className="integration-desc">Dynamic prompts with your specific travel requirements</div>
                </div>
              </div>
              <div className="integration-card">
                <div className="integration-icon">🔗</div>
                <div className="integration-content">
                  <div className="integration-title">Runnable Sequence</div>
                  <div className="integration-desc">Multi-step workflow from input to structured output</div>
                </div>
              </div>
              <div className="integration-card">
                <div className="integration-icon">📊</div>
                <div className="integration-content">
                  <div className="integration-title">JSON Parsers</div>
                  <div className="integration-desc">Structured itinerary data for easy consumption</div>
                </div>
              </div>
              <div className="integration-card">
                <div className="integration-icon">🛠️</div>
                <div className="integration-content">
                  <div className="integration-title">Tools</div>
                  <div className="integration-desc">Real-time weather and currency information</div>
                </div>
              </div>
              <div className="integration-card">
                <div className="integration-icon">🤖</div>
                <div className="integration-content">
                  <div className="integration-title">Agent</div>
                  <div className="integration-desc">Intelligent decision-making for tool usage</div>
                </div>
              </div>
              <div className="integration-card">
                <div className="integration-icon">📚</div>
                <div className="integration-content">
                  <div className="integration-title">RAG</div>
                  <div className="integration-desc">Knowledge retrieval from travel database</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="doc-section">
          <div className="plan-actions">
            <button 
              onClick={() => navigate('/travel-planner')}
              className="btn-secondary"
            >
              <span>🔄</span>
              <span>Create New Plan</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="btn-primary"
            >
              <span>🖨️</span>
              <span>Print Plan</span>
            </button>
          </div>
        </div>

        {/* Generation Timestamp */}
        <div className="generation-info">
          <p className="generation-timestamp">
            Generated on {new Date(plan.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanDetailsPage;
