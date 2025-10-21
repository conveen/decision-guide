#!/usr/bin/env bash

set -e

###################
##### Imports #####
###################

__SCRIPT_ROOT=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null 2>&1 && pwd )
. "${__SCRIPT_ROOT}/../run/config.sh"
. "${__SCRIPT_ROOT}/log.sh"


###############################
##### Container Utilities #####
###############################

util-run-build-base() {
    local BUILD_ROOT="${1:-${REPO_ROOT}}"
    shift

    ${CONTAINER_RUNTIME} build \
        --target "${BUILD_TARGET_STAGE}" \
        -t "${BUILD_IMAGE_URL}:${BUILD_IMAGE_TAG}" \
        -f ${BUILD_SUPPORT_ROOT}/docker/Dockerfile \
        --build-arg UID="${USERID}" \
        --build-arg USERNAME="${USERNAME}" \
        "${@}" \
        "${BUILD_ROOT}"
}

run-build-base() {
    util-run-build-base
}

run-push-base() {
    ${CONTAINER_RUNTIME} push \
        "${@}" \
        "${BUILD_IMAGE_URL}:${BUILD_IMAGE_TAG}"
}

run-in-container() {
    # Capture where script is being run from in repo relative to repo root
    local RUN_REL_ROOT="$(realpath --relative-to=${REPO_ROOT} $(pwd))"
    # If input device is not a TTY don't run with `-it` flags
    local INTERACTIVE_FLAGS="$(test -t 0 && echo '-it' || echo '')"
    ${CONTAINER_RUNTIME} run \
		--rm \
         ${INTERACTIVE_FLAGS} \
		-u ${USERNAME} \
        -v /var/run/docker.sock:/var/run/docker.sock \
		-v ${REPO_ROOT}:/project \
		-w /project/${RUN_REL_ROOT} \
        --entrypoint ./run.sh \
		${BUILD_IMAGE_URL}:${BUILD_IMAGE_TAG} \
        --local "${@}"
}


#############################
##### Command Utilities #####
#############################

run-command() {
    local COMMAND="${1}"
    shift

    if [ ${RUNTIME_CONTEXT} = "container" ]
    then
        run-in-container "${COMMAND}" "${@}"
    elif [ ${RUNTIME_CONTEXT} = "local" ]
    then
        run-${COMMAND} "${@}"
    else
        error "Invalid value for RUNTIME_CONTEXT: ${RUNTIME_CONTEXT}"
        exit 1
    fi
}


####################
##### Commands #####
####################

run-exec() {
    info "Running command: ${*}"
    ${@}
}

run-shell() {
    info "Entering shell"
    bash
}
