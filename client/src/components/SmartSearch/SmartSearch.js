import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaSearch, FaMagic, FaTimes } from 'react-icons/fa';
import AIService from '../../services/aiService';
import './SmartSearch.scss';

const SmartSearch = ({ onSearchResults, onClearSearch }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [showSmartMode, setShowSmartMode] = useState(false);

  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await AIService.smartSearch(query.trim());
      
      setSearchCriteria(response.searchCriteria);
      onSearchResults(response.products, response.searchCriteria);
      
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchCriteria(null);
    setError('');
    onClearSearch();
  };

  const smartSearchSuggestions = [
    'Sản phẩm làm từ tre cho nhà bếp',
    'Quà tặng dưới 300k cho ngày 8/3',
    'Áo dài cưới truyền thống',
    'Đồ trang trí Tết Nguyên Đán',
    'Sản phẩm thủ công từ làng nghề Bát Tràng'
  ];

  return (
    <div className="smart-search">
      <div className="search-container">
        <Form onSubmit={handleSmartSearch} className="search-form">
          <div className="search-input-group">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm thông minh... (VD: 'Tôi muốn quà tặng Tết dưới 500k')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <div className="search-buttons">
              {query && (
                <Button
                  variant="outline-secondary"
                  onClick={handleClearSearch}
                  className="clear-button"
                >
                  <FaTimes />
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={!query.trim() || isLoading}
                className="search-button"
              >
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FaMagic className="me-1" />
                    Tìm kiếm AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </Form>

        {/* Smart Search Toggle */}
        <div className="search-mode-toggle">
          <Button
            variant={showSmartMode ? "success" : "outline-info"}
            size="sm"
            onClick={() => setShowSmartMode(!showSmartMode)}
          >
            <FaMagic className="me-1" />
            {showSmartMode ? 'Ẩn gợi ý' : 'Hiện gợi ý tìm kiếm'}
          </Button>
        </div>

        {/* Smart Search Suggestions */}
        {showSmartMode && (
          <div className="smart-suggestions">
            <p className="suggestions-title">
              <FaMagic className="me-1" />
              Gợi ý tìm kiếm thông minh:
            </p>
            <div className="suggestions-list">
              {smartSearchSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setQuery(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Search Criteria Display */}
        {searchCriteria && (
          <div className="search-criteria">
            <h6>Phân tích tìm kiếm:</h6>
            <div className="criteria-tags">
              {searchCriteria.keywords && (
                <Badge bg="primary" className="me-2">
                  Từ khóa: {searchCriteria.keywords}
                </Badge>
              )}
              {searchCriteria.category && (
                <Badge bg="success" className="me-2">
                  Danh mục: {searchCriteria.category}
                </Badge>
              )}
              {searchCriteria.priceRange && (
                <Badge bg="warning" className="me-2">
                  Giá: {searchCriteria.priceRange.min ? `${searchCriteria.priceRange.min.toLocaleString()}đ` : '0đ'} - {searchCriteria.priceRange.max ? `${searchCriteria.priceRange.max.toLocaleString()}đ` : '∞'}
                </Badge>
              )}
              {searchCriteria.material && (
                <Badge bg="info" className="me-2">
                  Chất liệu: {searchCriteria.material}
                </Badge>
              )}
              {searchCriteria.occasion && (
                <Badge bg="secondary" className="me-2">
                  Dịp: {searchCriteria.occasion}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearch; 