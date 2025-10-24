#!/usr/bin/env bash

set -e

. /build-support/shell/common/log.sh

HASHICORP_GPG_KEY_FILEPATH="/usr/share/keyrings/hashicorp-archive-keyring.gpg"

apt update && \
    apt install -y wget gnupg software-properties-common

wget -O- https://apt.releases.hashicorp.com/gpg \
    | gpg --dearmor \
    | tee $HASHICORP_GPG_KEY_FILEPATH

echo "deb [signed-by=${HASHICORP_GPG_KEY_FILEPATH}] https://apt.releases.hashicorp.com $(lsb_release -cs) main" \
    | tee /etc/apt/sources.list.d/hashicorp.list

apt update && \
    apt install terraform
