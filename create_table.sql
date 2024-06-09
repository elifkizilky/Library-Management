DROP TABLE IF EXISTS LoanRecords CASCADE;
DROP TABLE IF EXISTS Books CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Creating the User table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Creating the Book table
CREATE TABLE Books (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    average_score FLOAT DEFAULT -1
);

-- Creating the LoanRecord table
CREATE TABLE LoanRecords (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    book_id INTEGER,
    borrowed_date DATE NOT NULL,
    returned_date DATE,
    score INT,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (book_id) REFERENCES Books(id) ON DELETE SET NULL
);
