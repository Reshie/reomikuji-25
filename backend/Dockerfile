# select python image
FROM python:3.12

ENV PIPENV_VENV_IN_PROJECT=1

# Add non-root user
ARG USERNAME=user
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd -s /bin/bash --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME\
    && chmod 0440 /etc/sudoers.d/$USERNAME \
    && apt-get clean

# Update package lists
RUN apt-get update && \
    apt-get -y upgrade

# Set the working directory in the container
WORKDIR /app

# Copy the Pipfile and Pipfile.lock
COPY . /app

# Install pip
RUN pip install --no-cache-dir --upgrade pip

# Install pipenv
RUN pip install pipenv && \
    pipenv sync

# Expose the port the app runs on
EXPOSE 8080

# Set user
USER $USERNAME

# Run server
ENTRYPOINT ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]