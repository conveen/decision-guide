#!/usr/bin/env bash

set -e

. /build-support/shell/common/log.sh


if [ -z "${USERNAME}" ]
then
    error "Must set USERNAME environment variable"
    exit 1
fi

info "Installing asdf dependencies"
DEBIAN_FRONTEND=noninteractive apt install -y curl git

info "Installing asdf"
sudo -Hiu $USERNAME bash -c 'git clone https://github.com/asdf-vm/asdf.git $HOME/.asdf'

info "Adding asdf to bash profile"
sudo -Hiu $USERNAME bash -c 'echo ". $HOME/.asdf/asdf.sh" >> "$HOME/.bashrc"'
