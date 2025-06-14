import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaRobot, FaPaperPlane, FaTimes, FaUser, FaSpinner } from 'react-icons/fa';
import AIService from '../../services/aiService';
import ProductSuggestionCard from './ProductSuggestionCard';
import './AIChatbot.scss';

const AIChatbot = ({ show, onHide }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Xin chào! Tôi là trợ lý AI của VietTrad. Tôi có thể giúp bạn tìm kiếm sản phẩm thủ công truyền thống Việt Nam phù hợp với nhu cầu của bạn. Bạn đang tìm kiếm gì hôm nay?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [show]);

  // Cleanup effect để đảm bảo unlock scroll khi component unmount
  useEffect(() => {
    return () => {
      try {
        // Chỉ remove CSS classes, không touch DOM elements
        document.body.classList.remove('force-enable-scroll');
        document.documentElement.classList.remove('force-enable-scroll');
        // Đảm bảo remove modal-open class
        document.body.classList.remove('modal-open');
        // Reset scroll style
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      } catch (err) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Effect để xử lý khi modal show/hide
  useEffect(() => {
    if (!show) {
      // Khi modal bị ẩn, đảm bảo cleanup
      setTimeout(() => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 150);
    }
  }, [show]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Cập nhật conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: inputMessage.trim() }
      ];

      const response = await AIService.chatWithAssistant(inputMessage.trim(), newHistory);

      const botMessage = {
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        suggestedProducts: response.suggestedProducts || []
      };

      setMessages(prev => [...prev, botMessage]);
      setSuggestedProducts(response.suggestedProducts || []);
      
      // Cập nhật conversation history
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: response.message }
      ]);

    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: `Xin lỗi, ${error}. Vui lòng thử lại!`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content) => {
    // Xử lý format PRODUCT_ID để không hiển thị
    return content.replace(/\[PRODUCT_ID:[^\]]+\]/g, '');
  };

  const clearChat = () => {
    setMessages([
      {
        type: 'bot',
        content: 'Xin chào! Tôi là trợ lý AI của VietTrad. Tôi có thể giúp bạn tìm kiếm sản phẩm thủ công truyền thống Việt Nam phù hợp với nhu cầu của bạn. Bạn đang tìm kiếm gì hôm nay?',
        timestamp: new Date()
      }
    ]);
    setConversationHistory([]);
    setSuggestedProducts([]);
  };

  const quickQuestions = [
    'Tôi muốn tìm quà tặng cho Tết',
    'Sản phẩm làm từ tre nứa',
    'Áo dài truyền thống',
    'Đồ thủ công dưới 500k',
    'Sản phẩm trang trí nhà'
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Helper function để force unlock scroll - CSS only approach
  const forceUnlockScroll = () => {
    try {
      // Chỉ add CSS class, không manipulate DOM trực tiếp
      document.body.classList.add('force-enable-scroll');
      document.documentElement.classList.add('force-enable-scroll');
      // Đồng thời remove modal-open để đảm bảo
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    } catch (err) {
      console.warn('Error in forceUnlockScroll:', err);
    }
  };

  // Custom onHide để đảm bảo unlock scroll
  const handleModalHide = () => {
    // Reset states trước khi đóng modal
    setIsLoading(false);
    
    // Đơn giản hóa - chỉ gọi onHide, để Bootstrap tự cleanup
    onHide();
    
    // Cleanup ngay lập tức
    forceUnlockScroll();
    
    // Delay nhỏ để đảm bảo modal đã đóng hoàn toàn trước khi unlock scroll
    setTimeout(() => {
      forceUnlockScroll();
    }, 300);
  };

  return (
    <Modal 
      show={show} 
      onHide={handleModalHide} 
      size="lg" 
      className="ai-chatbot-modal"
      backdrop="static"
      keyboard={true}
      centered
      animation={true}
      onExited={() => {
        // Cleanup khi modal đã đóng hoàn toàn
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        forceUnlockScroll();
      }}
    >
      <Modal.Header className="ai-chatbot-header">
        <div className="d-flex align-items-center">
          <div className="ai-avatar me-3">
            <FaRobot />
          </div>
          <div>
            <Modal.Title>Trợ lý AI VietTrad</Modal.Title>
            <small className="text-muted">
              🆓 Local AI - Miễn phí | Tìm sản phẩm thông minh
            </small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={clearChat} className="header-btn refresh-btn">
            🔄 Làm mới
          </Button>
          <Button variant="outline-light" size="sm" onClick={handleModalHide} className="header-btn close-btn">
            <FaTimes />
          </Button>
        </div>
      </Modal.Header>

      <Modal.Body className="ai-chatbot-body p-0">
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'bot' ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-content">
                  <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
                    {formatMessageContent(message.content)}
                  </div>
                  <small className="message-time">
                    {message.timestamp.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </small>
                  
                  {/* Hiển thị sản phẩm gợi ý */}
                  {message.suggestedProducts && message.suggestedProducts.length > 0 && (
                    <div className="suggested-products mt-3">
                      <h6 className="mb-2">
                        <Badge bg="primary">Sản phẩm gợi ý</Badge>
                      </h6>
                      <div className="products-list">
                        {message.suggestedProducts.map((product) => (
                          <ProductSuggestionCard 
                            key={product._id} 
                            product={product} 
                            onProductClick={handleModalHide}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="message-bubble typing">
                    <FaSpinner className="spin" /> Đang suy nghĩ...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="quick-questions">
              <p className="text-muted mb-2">Câu hỏi gợi ý:</p>
              <div className="d-flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="ai-chatbot-footer">
        <div className="input-container w-100">
          <Form.Control
            ref={inputRef}
            as="textarea"
            rows={1}
            placeholder="Nhập tin nhắn của bạn..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="message-input"
          />
          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
            title="Gửi tin nhắn"
          >
            {isLoading ? (
              <FaSpinner className="spin" />
            ) : (
              <span className="send-icon">🚀</span>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AIChatbot; 