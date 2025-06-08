# 📦 Importer Challenge

This project follows a modular, microservice-based architecture for managing and querying historical emission datasets. It is split into two main services: one for importing CSV data and another for exposing it via a REST API. The setup supports flexible querying, clean separation of concerns, and is optimized for local development using Docker.

> 📄 **Click [here](https://drive.google.com/file/d/12n98iNz19cjwC0J58YCy2mmviVLF4ztB/view?usp=sharing) to access the project's complete documentation.**

---

## ⚙️ Tech Stack

- **Node.js** + **TypeScript** using the **NestJS** framework
- **PostgreSQL** as the database
- **Prisma ORM** for type-safe queries
- **ESLint** + **Prettier** for code quality
- **Jest** + **Supertest** for testing
- **Docker + docker-compose** for development

---

## 📁 Project Structure Overview

├── csv-importer-microservice/
│   ├── importer/         # Orchestrates CSV import pipeline
│   ├── access/           # Database access logic
│   └── validator/, parser/, utils/
├── query-api-microservice/
│   ├── emissions/        # Query handling
│   ├── metadata/         # Dataset stats
│   └── utils/
├── prisma/               # Shared Prisma schema
├── data/                 # Raw dataset + analysis notebook
├── docker-compose.yml    # Full stack orchestration
└── .github/              # CI with GitHub Actions

Both microservices follow standard NestJS conventions and include:

- main.ts, app.module.ts for bootstrapping
- prisma/ folder with schema definition and migrations
- .env files for environment config
- Swagger integration for API docs
- Unit tests for core logic
- ESLint and Prettier configurations

> CI/CD is powered by GitHub Actions and runs all tests on push or PR.

### `csv-importer-microservice`

Handles CSV file ingestion into the database. The import pipeline includes:

- parser/: Parses and maps CSV content.
- validator/: Ensures CSV structure and row-level correctness.
- utils/: Contains helpers like normalization and deduplication.
- aggregator/: Summarizes import results.
- access/: Abstracts database logic for countries, sectors, and emissions.

Design considerations:

- Sector hierarchy is implemented as a tree using a self-referencing one-to-many relation.
- The "Other" sector is treated as a special case due to ambiguity in the source dataset.
- Records are stored in long format, which improves filtering, indexing, and scalability.

### `query-api-microservice`

Exposes a read-only API that allows users to query emission records with filtering by country, sector, year, and value range, sorting and pagination, and Dataset metadata. Core modules include:

- emissions/: Handles dynamic querying, DTOs, and normalization
- metadata/: Aggregates and returns dataset-wide stats
- utils/: Contains helpers for text normalization

Queries are optimized through Prisma’s query builder, leveraging the normalized schema and indexes for fast queries.

---

## 🧪 Testing

Both services are covered with unit tests, colocated as *.spec.ts files. These tests mock external dependencies (e.g., Prisma, file operations) for isolation.

- csv-importer-microservice: Focuses on pipeline components (parser, validator, deduplication, mapper, access services)
- query-api-microservice: Tests emissions filtering, metadata accuracy, and DTO validation

---

## 🚀 Getting Started

### 🐳 Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed and **running**

> 📌 Make sure Docker is up and running before continuing. You can verify this by running `docker --version` in your terminal.

### 1. Clone the repository

```bash
git clone https://github.com/laura-riera/importer-challenge.git
cd importer-challenge
```

### 2. Start services with Docker Compose

```bash
docker-compose up --build
```

This will:

- Build both microservices

- Start the containers

- Launch PostgreSQL databases

### 3. Access the APIs

- **CSV Importer**: [http://localhost:3001/api#/](http://localhost:3001/api#/)
- **Query API**: [http://localhost:3002/api#/](http://localhost:3002/api#/)

---
