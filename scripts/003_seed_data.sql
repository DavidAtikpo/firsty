-- Insert sample products (only if no products exist)
insert into public.products (name, description, price, stock, image_url)
select * from (
  values
    ('Laptop Pro', 'High-performance laptop for professionals', 1299.99, 50, '/placeholder.svg?height=400&width=400'),
    ('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 29.99, 200, '/placeholder.svg?height=400&width=400'),
    ('Mechanical Keyboard', 'RGB mechanical keyboard with custom switches', 149.99, 100, '/placeholder.svg?height=400&width=400'),
    ('USB-C Hub', '7-in-1 USB-C hub with multiple ports', 49.99, 150, '/placeholder.svg?height=400&width=400'),
    ('Webcam HD', '1080p HD webcam with auto-focus', 79.99, 80, '/placeholder.svg?height=400&width=400')
) as data(name, description, price, stock, image_url)
where not exists (select 1 from public.products limit 1);
