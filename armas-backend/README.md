# inventoryms-api
This the official repository for Inventory Management System API being developed by Kindson and used solely for education purposes
The UI application can be found here https://github.com/KindsonTheGenius/inventoryms-react-ui

# ARMAS Backend

## Overview
The ARMAS Backend is the core backend service for the Integrated Report Management System (IRMS). It provides APIs and handles business logic for the application.

## Technology Stack
- **Framework**: Spring Boot 3.3.2
- **Database**: MySQL
- **Dependencies**:
  - Spring Boot Starter Thymeleaf
  - Jakarta Transaction API
  - Jackson Databind
  - Apache Commons Lang

## Prerequisites
- **Java**: Version 17 or higher
- **Maven**: For dependency management
- **MySQL**: Database setup

## Installation

### Clone the Repository
```bash
git clone https://github.com/your-repo/armas-backend.git
```

### Setup and Run
1. Navigate to the project directory:
   ```bash
   cd armas-backend
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
- Update the `application.properties` file with your database credentials.

## Usage
- The backend provides REST APIs for the frontend and other services.

## License
This project is licensed under the MIT License.
