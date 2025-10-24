# Base, language-agnostic image with Bash shell and new user
FROM ubuntu:jammy AS base

ARG UID
ARG USERNAME

# Update base packages
RUN DEBIAN_FRONTEND=noninteractive \
    apt update && \
    apt upgrade -y

# Add Bash
# Used as shell for new user.
RUN DEBIAN_FRONTEND=noninteractive \
    apt install -y bash

# Copy docker build scripts
COPY build-support/shell/common/ /build-support/shell/common/
COPY build-support/shell/run/config.sh /build-support/shell/run/config.sh

# Create new user
# This user is used to run all user-specified commands
# in the container, and the UID/USERNAME should match
# the local (host) user to ensure file permissions of generated
# or touched files are correct.
COPY build-support/docker/adduser.sh /build-support/docker/adduser.sh
RUN UID=$UID \
    USERNAME=$USERNAME \
    /build-support/docker/adduser.sh

# Base image for using NPM, Node, and Terraform for deployment
# Uses the asdf-vm project to manage tool installations
FROM base AS js_base

# Must match USERNAME in base image
ARG USERNAME

# Install asdf
COPY build-support/docker/install-asdf.sh /build-support/docker/install-asdf.sh
RUN USERNAME=$USERNAME \
    /build-support/docker/install-asdf.sh

# Install NodeJS
COPY build-support/docker/install-nodejs.sh /build-support/docker/install-nodejs.sh
RUN USERNAME=$USERNAME \
    /build-support/docker/install-nodejs.sh

# Install Terraform
COPY build-support/docker/install-terraform.sh /build-support/docker/install-terraform.sh
RUN /build-support/docker/install-terraform.sh

# Install AWS CLI
COPY build-support/docker/install-aws-cli.sh /build-support/docker/install-aws-cli.sh
RUN /build-support/docker/install-aws-cli.sh

FROM js_base AS build

ENTRYPOINT ["./run.sh"]

CMD ["build"]
