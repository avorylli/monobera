#! /bin/bash

# Set error handling
set -e

# Function for logging
log_message() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to safely create directory and copy files
safe_copy_static() {
    local app_name=$1
    local target_dir="apps/$app_name/public/internal-env"
    
    if [ ! -d "apps/$app_name" ]; then
        log_message "Warning: Directory apps/$app_name does not exist, skipping..."
        return
    }
    
    mkdir -p "$target_dir"
    if [ $? -eq 0 ]; then
        cp -r secrets/static/* "$target_dir"
        log_message "Successfully copied static files to $app_name"
    else
        log_message "Error: Failed to create directory for $app_name"
        exit 1
    fi
}

# Ensure the SECRET_SUBMODULE_PAT environment variable is set
if [ -n "$SECRET_SUBMODULE_PAT" ]; then
    # Name of the submodule to update
    SUBMODULE_NAME="secrets"
    AUTH_URL="https://$SECRET_SUBMODULE_PAT@github.com/berachain/internal-dapps-env.git"

    log_message "Updating submodule URL..."
    
    # Update the submodule URL using git commands
    if ! git submodule set-url "$SUBMODULE_NAME" "$AUTH_URL"; then
        log_message "Error: Failed to set submodule URL"
        exit 1
    fi

    # Sync and update the submodule in the Git repository
    log_message "Updating submodules..."
    git submodule deinit --quiet -f packages/b-sdk
    git submodule update --quiet --init --recursive
fi

# if secrets folder exists, copy the static folder to the apps
if [ -d "secrets/static" ]; then
    log_message "Starting static files copy process..."
    
    # List of apps to process
    apps=("hub" "honey" "lend" "perp")
    
    # Process each app
    for app in "${apps[@]}"; do
        safe_copy_static "$app"
    done
else
    log_message "Warning: secrets/static directory not found"
fi

log_message "Installing dependencies..."
if ! pnpm i; then
    log_message "Error: Failed to install dependencies"
    exit 1
fi

log_message "Setting environment..."
pnpm setenv $1
