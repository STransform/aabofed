# Common Form Client

## Overview
The Common Form Client is a shared library designed to provide reusable components for form handling across the OSS2 platform. It simplifies the development of consistent and maintainable forms.

## Technology Stack
- **Framework**: Spring Boot 3.2.0
- **Dependencies**:
  - Spring Boot Starter Web (excluding Tomcat)
  - Lombok
  - Jakarta Persistence API
  - Jackson for JSON processing

## Prerequisites
- **Java**: Version 17 or higher
- **Maven**: For dependency management

## Installation

### Clone the Repository
```bash
git clone https://github.com/your-repo/common-form-client.git
```

### Setup and Run
1. Navigate to the project directory:
   ```bash
   cd common-form-client
   ```
2. Build the project:
   ```bash
   mvn clean install
   ```

## Usage
- Include this library as a dependency in your Spring Boot projects to use the provided form components.

## License
This project is licensed under the MIT License.