#!/usr/bin/env bash

set -eu
cd "$(dirname "${BASH_SOURCE[0]}")"

vote_file="$1"
timestamp_file="$2"

now=$(date +%s)

# Ensure timestamp file exists
if [ ! -f "$timestamp_file" ]; then
    ./vote_timestamps_from_history.bash "$1" > "$2"
    exit
fi

# Extract current and previous vote keys
git show HEAD:"$vote_file" 2>/dev/null | jq 'keys' >prev_keys.json || echo '[]' >prev_keys.json
jq 'keys' "$vote_file" >curr_keys.json

# Determine new keys
jq -n --argfile curr curr_keys.json --argfile prev prev_keys.json '
    $curr - $prev' >new_keys.json

# Build new timestamp entries
jq -n --arg now "$now" --argfile keys new_keys.json '
    reduce $keys[] as $k ({}; . + { ($k): $now })' >new_entries.json

# Merge new timestamps into existing timestamp file
jq -s '.[0] + .[1]' "$timestamp_file" new_entries.json >updated_timestamps.json
mv updated_timestamps.json "$timestamp_file"

# Clean up
rm -f prev_keys.json curr_keys.json new_keys.json new_entries.json
