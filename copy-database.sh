#!/bin/bash

# create a staging snapshot from postgres 

# https://stackoverflow.com/questions/19331497/set-environment-variables-from-file-of-key-value-pairs
export $(grep -v '^#' .env | xargs)

ssh expendas "export PGPASSWORD=\"${PGPASSWORD}\"; \
echo \"SELECT pg_terminate_backend (pid) FROM pg_stat_activity WHERE datname = 'staging';\" | psql -h localhost -U app postgres; \
echo \"DROP DATABASE IF EXISTS staging;\" | psql -h localhost -U app postgres; \
echo \"SELECT pg_terminate_backend (pid) FROM pg_stat_activity WHERE datname = 'postgres';\" | psql -h localhost -U app postgres; \
echo \"CREATE DATABASE staging WITH TEMPLATE postgres;\" | psql -h localhost -U app postgres \
";

