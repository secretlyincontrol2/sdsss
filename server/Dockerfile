FROM php:8.2-apache

# Install dependencies for PostgreSQL
# Install dependencies for PostgreSQL and Composer
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache mod_rewrite for URL routing
RUN a2enmod rewrite

# Allow .htaccess overrides (important for our routing)
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy source code to web root
COPY . /var/www/html/

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port (Render sets PORT env var, Apache listens on 80 by default)
EXPOSE 80
