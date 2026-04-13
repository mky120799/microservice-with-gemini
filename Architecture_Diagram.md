# Zenith Banking - Architecture Diagram (Mermaid)

Copy the following block into a Notion "Code" block (set to Mermaid) to render the diagram.

```mermaid
graph TD
    subgraph "Frontend Layer"
        UI["React Web Application"]
    end

    subgraph "API Gateway Layer"
        GW["API Gateway (Port 8000)"]
    end

    subgraph "Messaging"
        RMQ{{"RabbitMQ Event Bus"}}
    end

    subgraph "Ticketing Service"
        TC["Ticketing Logic Core"]
        CRON[["⏰ Cron Worker: Stale Ticket Detection"]]
        TC --- CRON
    end

    subgraph "Financial Services"
        LD["Ledger Service"]
        TR["Transfer Service"]
    end

    subgraph "Support Services"
        ID["Identity Service"]
        NT["Notification Service"]
        AN["Analytics Service"]
    end

    subgraph "Data & Storage"
        DB_PG[("Postgres DBs")]
        REDIS[("Redis Cache")]
        DB_NOSQL[("MongoDB / InfluxDB")]
        MIRROR[("📂 Local Mirror Folder")]
        CLOUD[("☁️ Cloudinary backup")]
    end

    %% Routing
    UI --> GW
    GW --> ID
    GW --> TC
    GW --> TR
    GW --> NT

    %% Connections
    TC --- DB_PG
    TC --- MIRROR
    TC --- CLOUD
    
    TR --- REDIS
    TR --> LD
    LD --- DB_PG

    %% Automation flow
    CRON -.->|Auto-archive| DB_PG
    CRON -.->|Notify Staff| NT

    %% Event Bus
    ID -.-> RMQ
    LD -.-> RMQ
    TC -.-> RMQ
    RMQ -.-> NT
    RMQ -.-> AN
```
