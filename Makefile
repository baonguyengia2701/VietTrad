# Makefile for VietTrad Docker Management

.PHONY: help build up down logs clean restart dev prod

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build all Docker images"
	@echo "  up        - Start all services"
	@echo "  down      - Stop all services"
	@echo "  logs      - View logs from all services"
	@echo "  clean     - Remove all containers, images, and volumes"
	@echo "  restart   - Restart all services"
	@echo "  dev       - Start in development mode"
	@echo "  prod      - Start in production mode"

# Build all images
build:
	docker-compose build --no-cache

# Start all services
up:
	docker-compose up -d
	@echo "Services started! Access:"
	@echo "  Frontend: http://localhost:80"
	@echo "  Backend API: http://localhost:5000"
	@echo "  With Reverse Proxy: http://localhost:8080"
	@echo "  MongoDB: localhost:27017"

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Clean everything
clean:
	docker-compose down -v
	docker system prune -af
	docker volume prune -f

# Restart all services
restart: down up

# Development mode (with file watching)
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production mode
prod:
	docker-compose up -d

# Build and run specific service
build-client:
	docker-compose build client

build-server:
	docker-compose build server

# Database operations
db-reset:
	docker-compose stop mongodb
	docker volume rm viettrad_mongodb_data
	docker-compose up -d mongodb

# Health check
health:
	@echo "Checking service health..."
	@docker-compose ps 