import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components';
import '../travel-planner.css';

interface TravelFormData {
  userId: string;
  destination: string;
  duration: string;
  budget: string;
  interests: string;
  groupSize: string;
  additionalRequests: string;
}

const TravelPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TravelFormData>({
    userId: '',
    destination: '',
    duration: '',
    budget: '',
    interests: '',
    groupSize: '',
    additionalRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Construct the travel request string
      const request = `I want to travel to ${formData.destination} for ${formData.duration} with a budget of ${formData.budget}. I'm interested in ${formData.interests}. Group size is ${formData.groupSize}. ${formData.additionalRequests}`;

      const response = await fetch('/api/travel-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId || 'user-' + Date.now(),
          request: request
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate travel plan');
      }

      const planData = await response.json();
      
      // Navigate to plan details page with the generated plan
      navigate('/travel-plan', { 
        state: { 
          planData,
          formData 
        } 
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documentation-container">
      <div className="doc-content">
        <div className="doc-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">
              <a href="/">LangChain Tutorial</a>
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item current">Smart Travel Planner</span>
          </div>
          
          <div className="doc-title-section">
            <h1 className="doc-title gradient-text">
              🌍 Smart Travel Planner
            </h1>
            <p className="doc-subtitle">
              AI-powered travel planning using all LangChain concepts
            </p>
            
            <div className="info-cards-grid">
              <div className="info-card">
                <div className="info-card-icon">🤖</div>
                <div className="info-card-content">
                  <div className="info-card-label">AI Features</div>
                  <div className="info-card-value">6 LangChain Concepts</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">⚡</div>
                <div className="info-card-content">
                  <div className="info-card-label">Integration</div>
                  <div className="info-card-value">Complete Workflow</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-icon">🎯</div>
                <div className="info-card-content">
                  <div className="info-card-label">Experience</div>
                  <div className="info-card-value">Production Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="doc-section">
          <h2 className="section-title">Plan Your Perfect Trip</h2>
          <p className="section-description">
            Fill out the form below to generate a personalized travel plan using our AI-powered system 
            that integrates Prompt Templates, Chains, JSON Parsers, Tools, Agents, and RAG.
          </p>

          <form onSubmit={handleSubmit} className="travel-form">
            <div className="form-section">
              <h3 className="form-section-title">Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="userId" className="form-label">
                    User ID <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    placeholder="Leave empty for auto-generation"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="destination" className="form-label required">
                    Destination
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g., Tokyo, Paris, New York"
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Travel Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration" className="form-label required">
                    Duration
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select duration</option>
                    <option value="1 day">1 Day</option>
                    <option value="2 days">2 Days</option>
                    <option value="3 days">3 Days</option>
                    <option value="5 days">5 Days</option>
                    <option value="1 week">1 Week</option>
                    <option value="2 weeks">2 Weeks</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="budget" className="form-label required">
                    Budget (per day)
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select budget</option>
                    <option value="$50 per day">Budget ($50/day)</option>
                    <option value="$100 per day">Mid-range ($100/day)</option>
                    <option value="$200 per day">Comfortable ($200/day)</option>
                    <option value="$500 per day">Luxury ($500/day)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="interests" className="form-label required">
                    Interests
                  </label>
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="e.g., culture, food, adventure, history"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="groupSize" className="form-label required">
                    Group Size
                  </label>
                  <select
                    id="groupSize"
                    name="groupSize"
                    value={formData.groupSize}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select group size</option>
                    <option value="1 person">Solo traveler</option>
                    <option value="2 adults">Couple</option>
                    <option value="family of 4">Family (4 people)</option>
                    <option value="group of 6">Small group (6 people)</option>
                    <option value="large group">Large group (8+ people)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Additional Preferences</h3>
              <div className="form-group full-width">
                <label htmlFor="additionalRequests" className="form-label">
                  Additional Requests <span className="optional">(optional)</span>
                </label>
                <textarea
                  id="additionalRequests"
                  name="additionalRequests"
                  value={formData.additionalRequests}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements, preferences, or questions..."
                  rows={4}
                  className="form-textarea"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner message="" />
                    <span>Generating Plan...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Generate Travel Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="langchain-concepts">
            <h3 className="concepts-title">🧠 LangChain Concepts Used</h3>
            <div className="concepts-grid">
              <div className="concept-card">
                <div className="concept-icon">📝</div>
                <div className="concept-name">Prompt Templates</div>
                <div className="concept-desc">Dynamic prompts with variables</div>
              </div>
              <div className="concept-card">
                <div className="concept-icon">🔗</div>
                <div className="concept-name">Runnable Sequence</div>
                <div className="concept-desc">Multi-step chain workflows</div>
              </div>
              <div className="concept-card">
                <div className="concept-icon">📊</div>
                <div className="concept-name">JSON Parsers</div>
                <div className="concept-desc">Structured output parsing</div>
              </div>
              <div className="concept-card">
                <div className="concept-icon">🛠️</div>
                <div className="concept-name">Tools</div>
                <div className="concept-desc">Weather, currency, booking</div>
              </div>
              <div className="concept-card">
                <div className="concept-icon">🤖</div>
                <div className="concept-name">Agent</div>
                <div className="concept-desc">Intelligent decision making</div>
              </div>
              <div className="concept-card">
                <div className="concept-icon">📚</div>
                <div className="concept-name">RAG</div>
                <div className="concept-desc">Knowledge retrieval system</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPlannerPage;
