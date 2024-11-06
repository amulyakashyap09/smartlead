# SMARTLEAD ASSESSMENT

This project contains multiple modules with separate documentation for each.

## Modules

- [Assessment 1](./assessment1/readme.md): this contains the solution for the first interview problem asked.
```
Interview Problem  1 
Design a High-Throughput API for Logging Millions of Events
Problem:
You need to design a system that ingests millions of log events per hour from multiple sources (clients, applications, etc.) via an HTTP API. Each event contains metadata like timestamp, event type, and message. The system must store these events for future analytics while ensuring scalability and performance.
Requirements:
• Ensure the system can handle a high volume of concurrent requests efficiently.
• Design the database schema to efficiently store and query these log events.
• Handle potential bursts of traffic without losing data.
• Include mechanisms to ensure the system is resilient to partial failures (e.g., database, network timeouts).
• Consider any performance bottlenecks in both API processing and storage.
```

- [Assessment 2](./assessment2/readme.md): this contains the solution for the second interview problem asked.
```
Interview Problem 2
Resilient Distributed Task Processing System
Problem:
Design a backend system to process a set of tasks distributed across multiple workers. The system needs to process millions of tasks daily, with each task requiring an external API call to complete. The external APIs can occasionally be slow or fail.
Requirements:
• Design the system to scale horizontally and handle task processing efficiently.
• Implement retries with exponential backoff for external API calls.
• Handle long-running tasks and ensure they don’t impact the performance of other tasks.
• Ensure that tasks are processed exactly once, even in case of worker failures.
• Address the problem of task prioritization (e.g., some tasks are more important and should be processed sooner)
```


Click on the links above to see each module’s documentation.