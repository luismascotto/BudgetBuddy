-- AI_GENERATED_CODE_START
-- [AI Generated] Data: 19/03/2024
-- Descrição: Script de inicialização do banco de dados PostgreSQL para BudgetBuddy
-- Gerado por: Cursor AI
-- Versão: PostgreSQL 15

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE budgetbuddy'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'budgetbuddy')\gexec

-- Connect to the budgetbuddy database
\c budgetbuddy;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    billing_day INTEGER,
    is_default BOOLEAN DEFAULT false
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) NOT NULL,
    payment_method_id INTEGER REFERENCES payment_methods(id) NOT NULL,
    date TIMESTAMP DEFAULT NOW() NOT NULL,
    installments INTEGER DEFAULT 1,
    current_installment INTEGER DEFAULT 1,
    parent_expense_id INTEGER REFERENCES expenses(id),
    is_installment BOOLEAN DEFAULT false
);

-- Insert default categories
INSERT INTO categories (name, icon, color, is_default) VALUES
    ('Alimentação', '🍽️', '#FF6B6B', true),
    ('Transporte', '🚗', '#4ECDC4', true),
    ('Moradia', '🏠', '#45B7D1', true),
    ('Saúde', '🏥', '#96CEB4', true),
    ('Educação', '📚', '#FFEAA7', true),
    ('Lazer', '🎮', '#DDA0DD', true),
    ('Vestuário', '👕', '#98D8C8', true),
    ('Serviços', '🔧', '#F7DC6F', true),
    ('Outros', '📦', '#BB8FCE', true)
ON CONFLICT DO NOTHING;

-- Insert default payment methods
INSERT INTO payment_methods (name, type, icon, color, is_default) VALUES
    ('Dinheiro', 'cash', '💵', '#2ECC71', true),
    ('PIX', 'pix', '📱', '#3498DB', true),
    ('Cartão de Crédito', 'credit', '💳', '#E74C3C', true),
    ('Cartão de Débito', 'debit', '💳', '#9B59B6', true),
    ('Transferência', 'transfer', '🏦', '#F39C12', true)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method_id ON expenses(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_parent_id ON expenses(parent_expense_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO budgetbuddy;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO budgetbuddy;
-- AI_GENERATED_CODE_END 