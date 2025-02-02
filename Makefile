# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tarzan <elakhfif@student.1337.ma>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/02 17:07:10 by tarzan            #+#    #+#              #
#    Updated: 2025/02/02 17:11:04 by tarzan           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

#----------------------------- Colors Variables -------------------------------#

RED			= \033[0;31m
GREEN			= \033[0;32m
NC			= \033[0m

#----------------------------- Docker Variables -------------------------------#

DOCKER			= docker
DOCKER_COMPOSE		= docker compose
COMPOSE_FILE		= core/docker-compose.yml
SCRIPT_PATH 		= datadir.sh
REMOVE_SCRIPT		= sudo rm -rf /home/$USER/data

#---------------------------------- Rules -------------------------------------#

all: up

up: build
	@bash $(SCRIPT_PATH)
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Containers are up and running$(NC)"

down:
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down
	@echo "$(RED)Containers are stopped$(NC)"

build:
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build
	@echo "$(GREEN)Containers are built$(NC)"

clean: down
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) rm
	@echo "$(RED)Containers are removed$(NC)"

fclean: clean
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down -v
	@echo "$(RED)Containers and volumes are removed$(NC)"
	@$(REMOVE_SCRIPT)

prune: fclean
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down --rmi all
	@$(DOCKER) system prune
	@echo "$(RED)Containers, volumes and images are removed$(NC)"

restart: down up
	@echo "$(GREEN)Containers are restarted$(NC)"

.PHONY: all up down build clean restart fclean prune
	@echo "$(GREEN)Containers are up and running$(NC)"

#--------------------------------- End of File ---------------------------------#
