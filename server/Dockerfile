FROM php:8.2-apache

# Install dependencies for PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Enable Apache mod_rewrite for URL routing
RUN a2enmod rewrite

# Allow .htaccess overrides (important for our routing)
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy source code to web root
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port (Render sets PORT env var, Apache listens on 80 by default)
EXPOSE 80
