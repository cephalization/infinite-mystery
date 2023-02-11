# Create a network, which allows containers to communicate
# with each other, by using their container name as a hostname
docker network create infinite_adventure_network

# Build prod using BuildKit engine
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --parallel $1 && \

# Start prod containers in the background
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
