#!/usr/bin/env bash

set -eux

vote_file="$1"
del=:

declare -A known_keys

f_current=$(mktemp)

# Get all commits that touched the vote file, in chronological order
for commit in $(git log --reverse --format="%at$del%H" -- "$vote_file"); do
    timestamp=$(cut -d$del -f1 <<<"$commit")
    sha=$(cut -d$del -f2 <<<"$commit")

    # Extract JSON from this commit
    git show "$sha:$vote_file" >"$f_current" 2>/dev/null || continue

    # Extract keys from the current state
    new_keys=$(jq -r 'keys_unsorted[]' "$f_current")

    for key in $new_keys; do
        # If the key hasn't been seen before, add it with this commit's timestamp
        if [[ -z "${known_keys[$key]-}" ]]; then
            known_keys[$key]="$timestamp"
        fi
    done
done

set -x

for i in "${!known_keys[@]}"; do
    echo "$i"
    echo "${known_keys[$i]}"
done | jq -nR 'reduce inputs as $i ({}; . + { ($i): (input|(tonumber? // .)) })'
