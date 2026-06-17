-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schemas to mirror production separation
CREATE SCHEMA IF NOT EXISTS relational;
CREATE SCHEMA IF NOT EXISTS vectors;
