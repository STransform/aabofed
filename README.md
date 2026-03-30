# Integrated Report Management System (IRMS)

## Overview
The Integrated Report Management System (IRMS) is developed for the FDRE Addis Ababa Finance bureau. It is used by 172 federal organizations, including the Ministry of Finance, and has 245 active users. The system facilitates efficient and transparent financial reporting and auditing processes.

## Project Structure
The project is organized into the following components:

- **eureka-server**: Service registry for microservices.
- **translation-service**: Handles localization and translation.
- **common-form-client**: Shared components for form handling.
- **armas-backend**: Backend services built with Spring Boot.
- **armas-frontend**: Frontend application built with React and Vite.

## Technology Stack
- **Backend**: Spring Boot
- **Frontend**: React.js, Vite
- **Database**: MySQL

## Prerequisites
- **Operating System**: Windows 10/11 or Linux
- **Java**: Version 17 or higher
- **Node.js**: Version 16 or higher
- **Maven**: For managing backend dependencies

## Installation

### Clone the Repository
```bash
git clone https://github.com/STransform/mof_armas.git
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd armas-backend
   ```
2. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd armas-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build and run the application:
   ```bash
   npm run build
   npm start
   ```

## Usage
- Access the application via `http://localhost:3000` for the frontend.
- Backend APIs are available at `http://localhost:8080`.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature.
3. Submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.


