# High-Throughput Event Logging API

## Overview

This system is designed to handle millions of concurrent log events per hour from various sources, such as clients and applications. It provides an HTTP API for ingestion, stores these events in a database, and ensures high performance, scalability, and resilience to system failures.

### Key Features

- **High Throughput**: Can handle millions of events per hour.
- **Scalable**: Designed for horizontal scaling to handle traffic bursts.
- **Resilient**: Fault-tolerant to handle network and database failures.
- **Efficient Storage**: Optimized database schema for fast queries.

## Architecture

### 1. API Gateway & Load Balancer
The API Gateway handles incoming HTTP requests and routes them to the appropriate service instances. A load balancer distributes the load across multiple instances of the logging service.

### 2. Logging Service
A Node.js service to receive, validate, and process incoming log events. The service accepts HTTP requests with log data, including `timestamp`, `event_type`, and `message`. The service is stateless to allow horizontal scaling.

### 3. Message Queue
To handle traffic spikes and improve resilience, incoming log events are queued before being written to the database. This ensures that the service can manage bursts of traffic without losing events.

### 4. Storage Layer
The storage layer is a database optimized for write-heavy workloads and efficient querying. A document-oriented database like MongoDB is ideal here, as it allows flexible data structures and supports high-throughput insert operations.

### 5. Data Schema
The schema for the log events is designed to allow fast retrieval and efficient storage.

#### Schema

- `id`: Unique identifier for the log entry
- `timestamp`: The time the event occurred
- `event_type`: The type of the event (e.g., "INFO", "ERROR", "DEBUG")
- `message`: The log message
- `source`: The origin of the log (e.g., service name or client ID)

### 6. Resilience

- **Retry Logic**: If writing to the database fails, the system retries a few times before logging an error.
- **Fallback Storage**: If the main database is unavailable, a backup storage (like a local file system or backup DB) temporarily stores the events.

### 7. Scaling Strategy

- **Horizontal Scaling**: Multiple instances of the service are deployed behind a load balancer.
- **Database Scaling**: The database is set up to handle sharding and replication for high availability and performance.

## Endpoints

- `POST /log-event`: Accepts JSON payloads containing `timestamp`, `event_type`, `message`, and `source`.

---

## Prerequisites

1. Mongodb, Nodejs should be installed on the system

## Running the Code

1. Install dependencies with `npm install`.
2. Run the server with `npm start`.
3. Run tests with `npm test`.

---

## Example Payload

```json
{
  "timestamp": "2023-11-07T10:00:00Z",
  "event_type": "INFO",
  "message": "User login successful",
  "source": "auth-service"
}
