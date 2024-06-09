# Library-Management

This Library Management System is designed to manage and maintain book loans and user information. It is built with Node.js, Express, and PostgreSQL, and can be run either directly on your local machine or within Docker containers.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- Node.js (recommended version 14 or above, [20.9.0 for this case])
- npm (usually comes with Node.js)
- PostgreSQL (version 13 or above, [15 for this case])
- Docker and Docker Compose (for Docker setups)

## Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/elifkizilky/Library-Management.git
cd library-management
```

## Configuration

Copy the sample environment configuration and modify it according to your needs:

```bash
cp .env.sample .env
```

Edit the .env file to include your PostgreSQL database settings and other configurations.

## Running the Application

### Using Docker (Recommended for Production)

1. Build and Run with Docker Compose:

```bash
docker-compose up --build
```
This command builds the Docker images for the application and the PostgreSQL database, and then starts the containers. Your application should now be accessible at http://localhost:3000.

2. Migrations

After starting the containers, you may need to run migrations. Execute the following command to run migrations inside the Docker container:

```bash
docker-compose exec app npm run migrate
```

### Locally Without Docker (Recommended for Development)

1. Install Dependencies:
```bash
npm install
```

2. Database Setup:
To set up your database tables, run:
```bash
npm run migrate
```

3. Start the Application:
For development, use:
```bash
npm run dev
```

This will start the application using nodemon and ts-node for hot-reloading.

For a production-like environment locally, first build the project and then start it:

```bash
npm run build
npm start
```

## API Documentation
Once the application is running, you can access the Swagger API documentation at:

    http://localhost:3000/api-docs

This documentation provides an interactive interface to test and explore the API endpoints.

