-- Insert sample tasks
INSERT INTO tasks (title, description, status, created_at) VALUES
  ('Design Homepage', 'Create wireframes and mockups for the new homepage layout', 'todo', '2024-01-15T10:00:00Z'),
  ('Setup Database', 'Configure PostgreSQL database and create initial schema', 'in-progress', '2024-01-14T14:30:00Z'),
  ('User Authentication', 'Implement login and registration functionality', 'done', '2024-01-13T09:15:00Z')
ON CONFLICT (id) DO NOTHING;
