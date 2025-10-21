#!/usr/bin/env bash

set -eu

###################
##### Imports #####
###################

# Check if running in build container or locally
# to import from correct path
if [ -d /build-support ]
then
    . ${HOME}/.bashrc
    . ${HOME}/.asdf/asdf.sh
    BUILD_SUPPORT_ROOT="/build-support"
else
    BUILD_SUPPORT_ROOT="./build-support"
fi
. "${BUILD_SUPPORT_ROOT}/shell/run/config.sh"
. "${BUILD_SUPPORT_ROOT}/shell/common/log.sh"
. "${BUILD_SUPPORT_ROOT}/shell/common/command-utils.sh"


###############################
##### Container Utilities #####
###############################

run-build-base() {
    ${CONTAINER_RUNTIME} build \
        --target "${BUILD_TARGET_STAGE}" \
        -t "${BUILD_IMAGE_URL}:${BUILD_IMAGE_TAG}" \
        -f build-support/docker/Dockerfile \
        --build-arg DOCKER_GID="${DOCKER_GID}" \
        --build-arg UID="${USERID}" \
        --build-arg USERNAME="${USERNAME}" \
        "${@}" \
        .
}

run-push-base() {
    ${CONTAINER_RUNTIME} push \
        "${@}" \
        "${BUILD_IMAGE_URL}:${BUILD_IMAGE_TAG}"
}

run-in-container() {
    local COMMAND="${1}"
    # If input device is not a TTY don't run with `-it` flags
    local INTERACTIVE_FLAGS="$(test -t 0 && echo '-it' || echo '')"
    # Expose ports on localhost for specific commands
    local PORT_FLAGS=''
    if [ "${COMMAND}" = "dev" ]
    then
        PORT_FLAGS='-p 127.0.0.1:5173:5173'
    elif [ "${COMMAND}" = "preview" ]
    then
        PORT_FLAGS='-p 127.0.0.1:4173:4173'
    fi

    ${CONTAINER_RUNTIME} run \
		--rm \
         ${INTERACTIVE_FLAGS} \
         ${PORT_FLAGS} \
		-u ${USERNAME} \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v $(pwd):/project \
		-w /project \
        --entrypoint ./run.sh \
		${BUILD_IMAGE_URL}:${BUILD_IMAGE_TAG} \
        --local "${@}"
}


####################
##### Commands #####
####################

run-build() {
    run-check

    run-lint

    run-test

    info "Building package with Vite"
    npm run build
}

run-check() {
    info "Checking types with tsc"
    npm run type-check
}

run-clean() {
    info "Removing build artifacts"
    rm -rf \
        coverage/ \
        dist/    
}

run-dev() {
    info "Running dev server"
    npm run dev
}

run-fmt() {
    info "Formatting code with Prettier"
    npm run format
}

run-lint() {
    info "Linting code with ESLint"
    npm run lint
}

run-preview() {
    info "Running server to preview production build"
    npm run preview
}

run-test() {
    info "Running unit tests with vitest"
    npm run test
    info "Running UI tests with vitest"
    npm run test:ui
}

run-update-deps() {
    info "Updating dependencies with npm"
    npm update "${@}"
}


################
##### Main #####
################

print-usage() {
    echo "usage: $(basename ${0}) [-h] [SUBCOMMAND]"
    echo
    echo "subcommands:"
    echo "build             build distribution package (default subcommand)"
    echo "check             type check code with tsc"
    echo "clean             remove build artifacts"
    echo "dev               run dev server"
    echo "exec              execute arbitrary shell commands"
    echo "fmt               format code with Prettier"
    echo "lint              lint code with ESLint"
    echo "preview           run server to preview production build"
    echo "shell             start Bash shell"
    echo "test              run unit tests with Vitest"
    echo "update-deps       update dependencies with npm"
    echo
    echo "optional arguments:"
    echo "-h, --help        show this help message and exit"
    echo "-l, --local       run command on host system instead of build container"
    echo "-c, --container   run command in build container"
    echo
}


while :
do
    case "${1:-}" in
        -c|--container)
            shift
            RUNTIME_CONTEXT="container"
        ;;
        -h|--help)
            print-usage
            exit 0
        ;;
        -l|--local)
            shift
            RUNTIME_CONTEXT="local"
        ;;
        *)
            break
        ;;
    esac
done

if [ -z "${1:-}" ]
then
    COMMAND="${DEFAULT_COMMAND}"
else
    COMMAND="${1}"
    shift
fi

# These commands should explicitly run locally
if ( \
    [ "${COMMAND}" = "build-base" ] \
    || [ "${COMMAND}" = "push-base" ]
)
then
    RUNTIME_CONTEXT="local"
fi

run-command "${COMMAND}" "${@}"
