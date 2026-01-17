# Postgres Database Schema Design for werkaholic-ajax-app

## Overview

This document outlines the design of the Postgres database schema for the werkaholic-ajax-app, based on the analysis of the current Firestore data structure. The schema includes all necessary tables, relationships, and constraints to support the app's functionality.

## Analysis of Current Firestore Structure

Based on the analysis in [`plans/firebase_firestore_analysis.md`](plans/firebase_firestore_analysis.md), the current Firestore structure includes the following collections:

1. **Users**: Stores user data, settings, subscriptions, and onboarding status.
2. **User History**: Stores the history of user interactions and analyses.
3. **Platform Listings**: Stores listings created by users for various platforms.
4. **Sale Transactions**: Stores transaction data for sales made through the app.

## Postgres Schema Design

### 1. Users Table

The `users` table will store user information, including authentication details, settings, and subscription status.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settings JSONB,
    subscription_status VARCHAR(50) DEFAULT 'free',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    migrated_scan_count INTEGER DEFAULT 0,
    migration_completed BOOLEAN DEFAULT FALSE,
    migration_date TIMESTAMP WITH TIME ZONE
);
```

### 2. User History Table

The `user_history` table will store the history of user interactions and analyses.

```sql
CREATE TABLE user_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(255),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    analysis JSONB,
    ad_text TEXT,
    platform VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Platform Listings Table

The `platform_listings` table will store listings created by users for various platforms.

```sql
CREATE TABLE platform_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    analysis_id VARCHAR(255),
    platform VARCHAR(50) NOT NULL,
    platform_listing_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    url VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    title VARCHAR(255) NOT NULL,
    views INTEGER DEFAULT 0,
    watch_count INTEGER DEFAULT 0,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Sale Transactions Table

The `sale_transactions` table will store transaction data for sales made through the app.

```sql
CREATE TABLE sale_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES platform_listings(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    fees DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2),
    buyer_name VARCHAR(255),
    buyer_location VARCHAR(255),
    sold_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(50) DEFAULT 'pending',
    shipping_status VARCHAR(50)
);
```

### 5. Subscriptions Table

The `subscriptions` table will store subscription information for users.

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    plan_type VARCHAR(50),
    scans_used INTEGER DEFAULT 0,
    scans_limit INTEGER DEFAULT 0,
    reset_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    commission_rate DECIMAL(5, 2),
    monthly_revenue DECIMAL(10, 2),
    platforms_limit INTEGER,
    features TEXT[],
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'EUR',
    billing_cycle VARCHAR(50),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Feedback Table

The `feedback` table will store user feedback.

```sql
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    url VARCHAR(255)
);
```

### 7. Batch Jobs Table

The `batch_jobs` table will store batch job information.

```sql
CREATE TABLE batch_jobs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_images INTEGER DEFAULT 0,
    processed_images INTEGER DEFAULT 0,
    error TEXT
);
```

### 8. Batch Results Table

The `batch_results` table will store results of batch jobs.

```sql
CREATE TABLE batch_results (
    id SERIAL PRIMARY KEY,
    batch_job_id INTEGER REFERENCES batch_jobs(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    image_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    analysis JSONB,
    error TEXT,
    processing_time INTEGER
);
```

### 9. Price Optimization Table

The `price_optimization` table will store price optimization data.

```sql
CREATE TABLE price_optimization (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES platform_listings(id) ON DELETE CASCADE,
    current_price DECIMAL(10, 2) NOT NULL,
    suggested_price DECIMAL(10, 2) NOT NULL,
    reasoning TEXT,
    confidence DECIMAL(5, 2),
    market_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMP WITH TIME ZONE
);
```

## Relationships and Constraints

### Foreign Key Constraints

- `user_history.user_id` references `users.id` with `ON DELETE CASCADE`.
- `platform_listings.user_id` references `users.id` with `ON DELETE CASCADE`.
- `sale_transactions.user_id` references `users.id` with `ON DELETE CASCADE`.
- `sale_transactions.listing_id` references `platform_listings.id` with `ON DELETE CASCADE`.
- `subscriptions.user_id` references `users.id` with `ON DELETE CASCADE`.
- `feedback.user_id` references `users.id` with `ON DELETE SET NULL`.
- `batch_results.batch_job_id` references `batch_jobs.id` with `ON DELETE CASCADE`.
- `price_optimization.listing_id` references `platform_listings.id` with `ON DELETE CASCADE`.

### Unique Constraints

- `users.firebase_uid` and `users.email` are unique.
- `platform_listings.platform_listing_id` is unique within the same platform.

### Indexes

Indexes will be created on frequently queried columns to improve performance:

```sql
CREATE INDEX idx_user_history_user_id ON user_history(user_id);
CREATE INDEX idx_platform_listings_user_id ON platform_listings(user_id);
CREATE INDEX idx_sale_transactions_user_id ON sale_transactions(user_id);
CREATE INDEX idx_sale_transactions_listing_id ON sale_transactions(listing_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_batch_results_batch_job_id ON batch_results(batch_job_id);
CREATE INDEX idx_price_optimization_listing_id ON price_optimization(listing_id);
```

## Data Migration Strategy

### From Firestore to Postgres

1. **User Data Migration**:
   - Extract user data from Firestore `users` collection.
   - Transform and load into the `users` table in Postgres.

2. **User History Migration**:
   - Extract history data from Firestore `users/{userId}/history` subcollections.
   - Transform and load into the `user_history` table in Postgres.

3. **Platform Listings Migration**:
   - Extract listings data from Firestore `listings` collection.
   - Transform and load into the `platform_listings` table in Postgres.

4. **Sale Transactions Migration**:
   - Extract transactions data from Firestore `saleTransactions` collection.
   - Transform and load into the `sale_transactions` table in Postgres.

### Tools and Scripts

A migration script will be developed to automate the data migration process. The script will:

1. Connect to both Firestore and Postgres databases.
2. Extract data from Firestore collections.
3. Transform data to match the Postgres schema.
4. Load data into Postgres tables.
5. Validate the migrated data.

## Alignment with App Requirements

The proposed schema aligns with the app's requirements by:

1. **Supporting User Management**: The `users` table stores all necessary user information, including authentication details and settings.
2. **Tracking User History**: The `user_history` table allows for detailed tracking of user interactions and analyses.
3. **Managing Listings**: The `platform_listings` table supports the creation and management of listings across various platforms.
4. **Handling Transactions**: The `sale_transactions` table ensures that all sales data is accurately recorded and can be queried efficiently.
5. **Subscription Management**: The `subscriptions` table provides a robust way to manage user subscriptions and associated features.
6. **Feedback Collection**: The `feedback` table allows for the collection and analysis of user feedback.
7. **Batch Processing**: The `batch_jobs` and `batch_results` tables support batch processing of images and analyses.
8. **Price Optimization**: The `price_optimization` table enables the app to suggest optimal prices based on market data.

## Conclusion

This schema design provides a comprehensive and scalable foundation for the werkaholic-ajax-app's database needs. It ensures data integrity through appropriate constraints and relationships, supports efficient querying with indexes, and aligns with the app's functional requirements. The migration strategy ensures a smooth transition from Firestore to Postgres with minimal downtime and data loss.