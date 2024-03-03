# Asynchronous Architecture

My humble study project.

Monorepo managed with Turborepo.

## Setup

Node.js `>= 20.6` is required.

All ports are hardcoded
- Zookeeper 2181
- Kafka 9092, 9101
- Node Apps 3333, 3334

Every service require own domain to properly set session and auth cookies

```text
# /etc/hosts

127.0.0.1   auth.popug.test
127.0.0.1   tasks.popug.test
```

Start fresh 

```shell
# up infra
docker compose up -d

# install dependencies
npm install

# auth service
cd apps/auth
cp .env.example .env
node ace.js migration:run
node ace.js db:seed
cd ../..

# tasks service
cd apps/tasks
cp .env.example .env
node ace.js migration:run
cd ../..
```

## Admin User

Auth service has seed data for default admin user.

Login: admin@test.com  
Password: admin
