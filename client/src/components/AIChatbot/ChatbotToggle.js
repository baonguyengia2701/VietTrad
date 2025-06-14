import React, { useState, useEffect } from 'react';
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

  // Cleanup effect để đảm bảo không có modal nào bị stuck
  useEffect(() => {
    return () => {
      // Cleanup khi component unmount
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  // Effect để xử lý ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && showChatbot) {
        handleClose();
      }
    };
    
    if (showChatbot) {
      document.addEventListener('keydown', handleEsc, false);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc, false);
    };
  }, [showChatbot]);

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