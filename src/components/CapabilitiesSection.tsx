import React, { useState } from 'react';
import { Capabilities } from '../types';

interface CapabilitiesSectionProps {
  capabilities: Capabilities;
  title?: string;
}

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`capability-group collapsible ${className}`}>
      <button 
        className={`capability-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="capability-title">
          <span className="capability-icon">{icon}</span>
          {title}
        </span>
        <span className={`collapse-indicator ${isExpanded ? 'expanded' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.427 9.573l3.396-3.396a.25.25 0 01.354 0l3.396 3.396a.25.25 0 01-.177.427H4.604a.25.25 0 01-.177-.427z"/>
          </svg>
        </span>
      </button>
      
      <div className={`capability-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {children}
      </div>
    </div>
  );
};

const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({ 
  capabilities, 
  title = "Capabilities" 
}) => {
  return (
    <div className="capabilities-section">
      {capabilities.whatItCanDo.length > 0 && (
        <CollapsibleSection 
          title="What This Can Do" 
          icon="✅" 
          defaultExpanded={true}
          className="primary"
        >
          <ul className="capability-list">
            {capabilities.whatItCanDo.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {capabilities.bestUseCases.length > 0 && (
        <CollapsibleSection 
          title="Best Use Cases" 
          icon="🎯" 
          defaultExpanded={false}
        >
          <ul className="capability-list">
            {capabilities.bestUseCases.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {capabilities.limitations.length > 0 && (
        <CollapsibleSection 
          title="Limitations" 
          icon="⚠️" 
          defaultExpanded={false}
          className="limitations"
        >
          <ul className="capability-list limitations">
            {capabilities.limitations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {capabilities.keyTakeaways.length > 0 && (
        <CollapsibleSection 
          title="Key Takeaways" 
          icon="💡" 
          defaultExpanded={false}
          className="takeaways"
        >
          <ul className="capability-list takeaways">
            {capabilities.keyTakeaways.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default CapabilitiesSection;
