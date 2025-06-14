import React, { useState } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import AIChatbot from './AIChatbot';
import './ChatbotToggle.scss';

const ChatbotToggle = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  const handleToggle = () => {
    setShowChatbot(!showChatbot);
  };

  const handleClose = () => {
    setShowChatbot(false);
  };

  return (
    <>
      <div className={`chatbot-toggle ${showChatbot ? 'active' : ''}`} onClick={handleToggle}>
        <div className="toggle-icon">
          {showChatbot ? <FaTimes /> : <FaRobot />}
        </div>
        <div className="pulse-ring"></div>
        <div className="pulse-ring-2"></div>
      </div>

      {!showChatbot && (
        <div className="chatbot-tooltip">
          <div className="tooltip-content">
            Tôi có thể giúp bạn tìm sản phẩm! 
            <div className="tooltip-arrow"></div>
          </div>
        </div>
      )}

      <AIChatbot show={showChatbot} onHide={handleClose} />
    </>
  );
};

export default ChatbotToggle; 