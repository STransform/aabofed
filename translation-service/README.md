# Translation Service

## Overview
The Translation Service is a microservice designed to handle localization and translation tasks for the OSS2 platform. It ensures that the application supports multiple languages seamlessly.

## Technology Stack
- **Framework**: Spring Boot 3.2.0
- **Database**: MySQL
- **Dependencies**:
  - Spring Boot Starter Data JPA
  - Spring Boot Starter Web
  - Spring Cloud Netflix Eureka Client
  - Lombok
  - Spring Boot Starter Security
  - Spring Boot Starter OAuth2 Resource Server

## Prerequisites
- **Java**: Version 17 or higher
- **Maven**: For dependency management
- **MySQL**: Database setup

## Installation

### Clone the Repository
```bash
git clone https://github.com/your-repo/translation-service.git
```

### Setup and Run
1. Navigate to the project directory:
   ```bash
   cd translation-service
   ```
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## Configuration
- Update the `application.properties` file with your database credentials and Eureka server details.

## Usage
- The service exposes REST APIs for managing translations.
- Register the service with Eureka for service discovery.

## License
This project is licensed under the MIT License.