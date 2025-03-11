# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:56:09 by elakhfif          #+#    #+#              #
#    Updated: 2025/02/21 17:12:35 by elakhfif         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=restapi.settings

# Install dependencies including curl
RUN apt-get update -y && \
    apt-get install --no-install-recommends -y gcc libpq-dev postgresql-client curl && \
    rm -rf /var/lib/apt/lists/* 

# Create non-root user
RUN groupadd -r app && \
    useradd -r -g app -d /home/app -m app

WORKDIR /home/app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set proper permissions
RUN chown -R app:app /home/app

# Switch to non-root user
USER app

EXPOSE 8000/tcp

# Start Django server directly
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
