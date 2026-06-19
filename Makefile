.PHONY: up down migrate seed restart status

up:
	docker-compose up -d
	@echo "Waiting for database to start..."
	npx prisma db push
	npm run db:seed

down:
	docker-compose down -v

migrate:
	npx prisma migrate dev

seed:
	npm run db:seed

restart:
	docker-compose down -v
	docker-compose up -d
	npx prisma db push
	npm run db:seed

status:
	docker-compose ps
