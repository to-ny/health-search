#!/bin/bash
# Post-edit hook: Run tests after source file modifications
# Triggered by Edit/Write tools on .ts/.tsx files

# Read JSON input from stdin
input=$(cat)

# Extract file path - handle both file_path (Edit) and filePath formats
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# Exit early if no file path
if [[ -z "$file_path" ]]; then
    exit 0
fi

# Only run tests for source files that could impact the app
# Include: src/, tests/, lib/ directories with .ts/.tsx files
# Exclude: config files, markdown, json (except package.json)
if [[ "$file_path" =~ ^.*/src/.*\.(ts|tsx)$ ]] || \
   [[ "$file_path" =~ ^.*/tests/.*\.(ts|tsx)$ ]] || \
   [[ "$file_path" =~ ^.*/lib/.*\.(ts|tsx)$ ]]; then

    cd "$CLAUDE_PROJECT_DIR" || exit 0

    echo "Running tests after edit to: ${file_path##*/}"

    # Run unit tests first (fast feedback)
    bun run test:unit 2>&1 | tail -20
    unit_exit=$?

    if [[ $unit_exit -ne 0 ]]; then
        echo "Unit tests failed!"
        exit 2  # Exit code 2 = blocking error shown to Claude
    fi

    # Run E2E tests (slower but catches runtime issues)
    bun run test:e2e --reporter=line 2>&1 | tail -30
    e2e_exit=$?

    if [[ $e2e_exit -ne 0 ]]; then
        echo "E2E tests failed!"
        exit 2
    fi

    echo "All tests passed!"
    exit 0
fi

# Not a source file, skip
exit 0
