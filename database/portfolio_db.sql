-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Profile table for name/title/avatar
CREATE TABLE IF NOT EXISTS profile (
    id TINYINT PRIMARY KEY CHECK (id = 1),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(150),
    avatar_url VARCHAR(500)
);

-- Table for portfolio sections
CREATE TABLE IF NOT EXISTS portfolio_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(50) UNIQUE,
    content JSON
);

-- Table for contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample About Me
INSERT INTO portfolio_content (section, content)
VALUES ('about', '{"text":"I am a passionate Computer Science student with experience in web development, programming, and UI/UX design. Currently pursuing my BSc in CSE with a CGPA of 3.89."}');

-- Insert sample Skills
INSERT INTO portfolio_content (section, content)
VALUES ('skills', '["HTML5","CSS3","JavaScript","React","Python","C Programming","Java","Bootstrap","Responsive Design"]');

-- Insert sample Projects
INSERT INTO portfolio_content (section, content)
VALUES ('projects', '[{"title":"University Management System","year":2023,"description":"Developed a web-based university management system using HTML, CSS, JS, and PHP."},{"title":"E-commerce Website","year":2022,"description":"Created a responsive e-commerce platform with product listings, shopping cart, and user authentication."},{"title":"Personal Portfolio Website","year":2021,"description":"Designed a personal portfolio website using HTML, CSS, and JS."}]');

-- Insert sample Languages
INSERT INTO portfolio_content (section, content)
VALUES ('languages', '["Bengali (Native)","English (Fluent)","Hindi (Conversational)"]');

-- Seed profile (id fixed to 1)
INSERT INTO profile (id, first_name, last_name, title, avatar_url)
VALUES (1, 'Afrin', 'Jahan', 'Student & Junior Web Developer', NULL)
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), title=VALUES(title), avatar_url=VALUES(avatar_url);
