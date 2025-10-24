#!/usr/bin/env bash

set -e

. /build-support/shell/common/log.sh

apt update && \
    apt install -y unzip groff

curl 'https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip' -o /tmp/awscliv2.zip
cd /tmp
unzip awscliv2.zip
./aws/install
rm -rf /tmp/awscliv2.zip /tmp/aws/
