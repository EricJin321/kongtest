# Start local environment (Kong Gateway, Postgres, MockServer)
dockerup:
	docker compose -f deployment/docker-compose.yml up -d

# Stop local environment
dockerdown:
	docker compose -f deployment/docker-compose.yml down

# Delegate tasks to gatewaytest/makefile
install:
	$(MAKE) -C gatewaytest install

test:
	$(MAKE) -C gatewaytest test

test-ui:
	$(MAKE) -C gatewaytest test-ui

test-api:
	$(MAKE) -C gatewaytest test-api
