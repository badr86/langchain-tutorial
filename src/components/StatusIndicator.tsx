import React from 'react';

interface HealthStatus {
  status: string;
  timestamp: string;
  hasOpenAIKey: boolean;
}

interface StatusIndicatorProps {
  healthStatus: HealthStatus | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ healthStatus }) => {
  const getStatusInfo = () => {
    if (!healthStatus) return { text: 'Checking...', className: 'disconnected' };
    
    if (healthStatus.status !== 'healthy') {
      return { text: 'API Server Disconnected', className: 'disconnected' };
    }
    
    if (!healthStatus.hasOpenAIKey) {
      return { text: 'OpenAI API Key Missing (Some demos will be limited)', className: 'no-key' };
    }
    
    return { text: 'All Systems Ready', className: 'connected' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="status-indicator">
      <div className={`status-dot ${statusInfo.className}`}></div>
      {statusInfo.text}
    </div>
  );
};

export default StatusIndicator;
