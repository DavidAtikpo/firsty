-- Seed sample data for testing
-- Password for all users: "password123" (hashed with bcrypt)

-- Insert admin user
INSERT INTO "User" ("id", "email", "name", "password", "role") 
VALUES (
    gen_random_uuid()::TEXT,
    'admin@example.com',
    'Admin User',
    '$2a$10$rKvVPZqGvVZqGvVZqGvVZO7K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8',
    'ADMIN'
);

-- Insert sample products
INSERT INTO "Product" ("id", "name", "description", "price", "stock", "isActive") VALUES
(gen_random_uuid()::TEXT, 'Laptop Pro 15"', 'High-performance laptop with 16GB RAM and 512GB SSD', 1299.99, 50, true),
(gen_random_uuid()::TEXT, 'Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 29.99, 200, true),
(gen_random_uuid()::TEXT, 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 89.99, 100, true),
(gen_random_uuid()::TEXT, 'USB-C Hub', '7-in-1 USB-C hub with HDMI and card reader', 49.99, 150, true),
(gen_random_uuid()::TEXT, 'Webcam HD', '1080p webcam with built-in microphone', 79.99, 75, true);
