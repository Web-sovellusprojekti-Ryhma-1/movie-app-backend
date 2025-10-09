-- Create schema if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'movie_app') THEN
        CREATE SCHEMA movie_app;
    END IF;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    user_id BIGINT NOT NULL,
    tmdb_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, tmdb_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    user_id BIGINT NOT NULL,
    user_email VARCHAR(320) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    tmdb_id BIGINT NOT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tmdb_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    owner_id BIGINT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    user_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    accepted BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Group showtimes table
CREATE TABLE IF NOT EXISTS group_showtimes (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    group_id BIGINT NOT NULL,
    finnkino_db_id BIGINT NOT NULL,
    area_id INTEGER NOT NULL, 
    dateOfShow DATE NOT NULL, --Format: dd.mm.yyyy
    PRIMARY KEY (group_id, finnkino_db_id, area_id, dateOfShow), 
    FOREIGN KEY (group_id) REFERENCES groups(id)
);