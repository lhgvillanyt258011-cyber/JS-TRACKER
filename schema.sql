-- =====================================================================
-- JS TRACKER / Student & Young Adult Budget Planner
-- MySQL Database Schema
-- Compatible with MySQL 8.0+ / MariaDB 10.4+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `budget_planner` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `budget_planner`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `currency_symbol` VARCHAR(5) DEFAULT '$',
  `monthly_income_target` DECIMAL(10, 2) DEFAULT 0.00,
  `phone_number` VARCHAR(25) DEFAULT '+1 (555) 382-9104',
  `sms_tracking_enabled` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL, -- NULL means default system category
  `name` VARCHAR(50) NOT NULL,
  `type` ENUM('expense', 'income') NOT NULL DEFAULT 'expense',
  `icon` VARCHAR(50) DEFAULT 'tag',
  `color_hex` VARCHAR(7) DEFAULT '#0D9488',
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. BUDGETS TABLE (Monthly budget limits per category)
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `month_year` CHAR(7) NOT NULL, -- Format: YYYY-MM
  `allocated_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `alert_threshold_pct` TINYINT UNSIGNED DEFAULT 85, -- e.g. warn when >= 85%
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_cat_month` (`user_id`, `category_id`, `month_year`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `date` DATE NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Debit Card',
  `is_recurring` BOOLEAN DEFAULT FALSE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_date` (`user_id`, `date`),
  INDEX `idx_user_cat` (`user_id`, `category_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. SAVINGS GOALS TABLE
CREATE TABLE IF NOT EXISTS `savings_goals` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `target_amount` DECIMAL(10, 2) NOT NULL,
  `current_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `target_date` DATE NOT NULL,
  `category_tag` VARCHAR(50) DEFAULT 'General Savings',
  `icon` VARCHAR(50) DEFAULT 'piggy-bank',
  `color_hex` VARCHAR(7) DEFAULT '#0EA5E9',
  `is_completed` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. RECURRING BILLS TABLE
CREATE TABLE IF NOT EXISTS `recurring_bills` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `billing_day` TINYINT UNSIGNED NOT NULL, -- 1 to 31
  `frequency` ENUM('monthly', 'weekly', 'yearly', 'semester') DEFAULT 'monthly',
  `auto_paid` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. SMS_LOGS TABLE (Incoming SMS expense tracking)
CREATE TABLE IF NOT EXISTS `sms_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `sender_identifier` VARCHAR(50) NOT NULL, -- e.g. 'CHASE-ALERT', 'HDFCBK', '+15552345678'
  `user_mobile_number` VARCHAR(25) NOT NULL,
  `raw_sms` TEXT NOT NULL,
  `parsed_amount` DECIMAL(10, 2) NULL,
  `parsed_type` ENUM('expense', 'income', 'unknown') DEFAULT 'expense',
  `parsed_merchant` VARCHAR(150) NULL,
  `parsed_category_id` INT UNSIGNED NULL,
  `transaction_id` INT UNSIGNED NULL, -- linked transaction once imported
  `status` ENUM('auto_imported', 'pending_review', 'ignored') DEFAULT 'auto_imported',
  `received_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parsed_category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- SEED SAMPLE DATA FOR TESTING (Student / Young Adult Persona: Alex Rivera)
-- =====================================================================

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `currency_symbol`, `monthly_income_target`) VALUES
(1, 'Alex Rivera', 'alex.rivera@campus.edu', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm', '$', 2450.00);

-- Categories
INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `icon`, `color_hex`, `is_default`) VALUES
(1, NULL, 'Food & Dining', 'expense', 'utensils', '#F97316', TRUE),
(2, NULL, 'Groceries', 'expense', 'shopping-cart', '#10B981', TRUE),
(3, NULL, 'Housing & Rent', 'expense', 'home', '#3B82F6', TRUE),
(4, NULL, 'Transit & Commute', 'expense', 'bus', '#6366F1', TRUE),
(5, NULL, 'Books & Learning', 'expense', 'book-open', '#8B5CF6', TRUE),
(6, NULL, 'Entertainment & Outings', 'expense', 'film', '#EC4899', TRUE),
(7, NULL, 'Subscriptions & Tech', 'expense', 'tv', '#06B6D4', TRUE),
(8, NULL, 'Personal & Health', 'expense', 'heart-pulse', '#14B8A6', TRUE),
(9, NULL, 'Campus Work-Study', 'income', 'briefcase', '#10B981', TRUE),
(10, NULL, 'Freelance / Tutoring', 'income', 'laptop', '#0D9488', TRUE),
(11, NULL, 'Family Support / Grant', 'income', 'gift', '#0EA5E9', TRUE);

-- Budgets for September 2026
INSERT INTO `budgets` (`user_id`, `category_id`, `month_year`, `allocated_amount`, `alert_threshold_pct`) VALUES
(1, 1, '2026-09', 240.00, 85),
(1, 2, '2026-09', 320.00, 85),
(1, 3, '2026-09', 850.00, 95),
(1, 4, '2026-09', 95.00, 85),
(1, 5, '2026-09', 140.00, 85),
(1, 6, '2026-09', 160.00, 85),
(1, 7, '2026-09', 45.00, 90),
(1, 8, '2026-09', 70.00, 85);

-- Transactions
INSERT INTO `transactions` (`user_id`, `category_id`, `type`, `amount`, `date`, `description`, `payment_method`, `is_recurring`) VALUES
(1, 9, 'income', 1400.00, '2026-09-01', 'Campus Tech Lab Assistant Stipend', 'Direct Deposit', TRUE),
(1, 10, 'income', 450.00, '2026-09-05', 'Calculus & Coding Tutoring (4 sessions)', 'Venmo', FALSE),
(1, 11, 'income', 600.00, '2026-09-08', 'Fall Semester Academic Grant buffer', 'Bank Transfer', FALSE),
(1, 3, 'expense', 850.00, '2026-09-01', 'Apartment Rent (shared 2-bed)', 'Bank Transfer', TRUE),
(1, 4, 'expense', 45.00, '2026-09-02', 'Monthly Student Transit Pass', 'Campus Card', TRUE),
(1, 2, 'expense', 86.40, '2026-09-03', 'Trader Joe''s Weekly Grocery Run', 'Debit Card', FALSE),
(1, 1, 'expense', 18.50, '2026-09-04', 'Campus Cafe Lunch & Espresso', 'Apple Pay', FALSE),
(1, 7, 'expense', 5.99, '2026-09-05', 'Spotify Student + Hulu Bundle', 'Debit Card', TRUE),
(1, 5, 'expense', 68.20, '2026-09-07', 'Data Structures & Algorithms eBook', 'Credit Card', FALSE),
(1, 2, 'expense', 72.15, '2026-09-11', 'Aldi Bulk Pantry & Fresh Produce', 'Debit Card', FALSE),
(1, 6, 'expense', 32.00, '2026-09-13', 'Friday Movie Night & Popcorn', 'Venmo', FALSE),
(1, 1, 'expense', 26.80, '2026-09-16', 'Thai Bistro Dinner with Study Group', 'Splitwise / Venmo', FALSE),
(1, 7, 'expense', 12.99, '2026-09-18', 'GitHub Copilot + Cloud VPS', 'Debit Card', TRUE),
(1, 8, 'expense', 28.50, '2026-09-20', 'Campus Pharmacy & Skincare', 'Debit Card', FALSE),
(1, 1, 'expense', 14.20, '2026-09-22', 'Cold Brew & Bagel before Exam', 'Apple Pay', FALSE),
(1, 6, 'expense', 48.00, '2026-09-24', 'Campus Concert Ticket', 'Credit Card', FALSE);

-- Savings Goals
INSERT INTO `savings_goals` (`user_id`, `title`, `target_amount`, `current_amount`, `target_date`, `category_tag`, `icon`, `color_hex`) VALUES
(1, 'Emergency Fund Buffer', 1500.00, 1050.00, '2026-12-31', 'Safety Net', 'shield-check', '#0D9488'),
(1, 'Spring Break Road Trip', 650.00, 320.00, '2027-03-15', 'Travel & Adventure', 'compass', '#F59E0B'),
(1, 'Refurbished M-Chip Laptop', 950.00, 420.00, '2027-01-20', 'Tech & School', 'laptop', '#3B82F6');

-- Recurring Bills
INSERT INTO `recurring_bills` (`user_id`, `category_id`, `title`, `amount`, `billing_day`, `frequency`, `auto_paid`) VALUES
(1, 3, 'Apartment Rent (Room Share)', 850.00, 1, 'monthly', TRUE),
(1, 7, 'Spotify Student Bundle', 5.99, 5, 'monthly', TRUE),
(1, 7, 'Mobile Phone Student Plan', 25.00, 15, 'monthly', TRUE),
(1, 7, 'Cloud Hosting / GitHub', 12.99, 18, 'monthly', TRUE),
(1, 4, 'City Transit Card Auto-Refill', 45.00, 28, 'monthly', TRUE);

-- SMS Expense Tracking Logs (Linked to mobile number)
INSERT INTO `sms_logs` (`user_id`, `sender_identifier`, `user_mobile_number`, `raw_sms`, `parsed_amount`, `parsed_type`, `parsed_merchant`, `parsed_category_id`, `transaction_id`, `status`) VALUES
(1, 'CHASE-ALERT', '+1 (555) 382-9104', 'Chase Alert: Your debit card ending in 4102 was charged $18.25 at CAMPUS HUB BURRITO on 09/04/2026. Bal: $1,420.50.', 18.25, 'expense', 'Campus Hub Burrito', 1, 5, 'auto_imported'),
(1, 'HDFCBK', '+1 (555) 382-9104', 'Alert: Acct XX8920 debited by $74.05 on 11-Sep-26 at ALDI GROCERY. Avail Bal: $1,346.45.', 74.05, 'expense', 'Aldi Grocery', 2, 10, 'auto_imported'),
(1, 'VENMO-SMS', '+1 (555) 382-9104', 'Venmo: You paid $38.00 to Maya Chen for Friday Movie Night & Popcorn. Transfer completed.', 38.00, 'expense', 'Maya Chen - Friday Movie Night', 6, 11, 'auto_imported'),
(1, 'PAYROLL-NOTIF', '+1 (555) 382-9104', 'Direct Deposit of $1,450.00 from UNIV CS LAB STIPEND has been credited to your account.', 1450.00, 'income', 'Univ CS Lab Stipend', 9, 1, 'auto_imported');
