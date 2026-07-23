# Deployment Guide - Production Setup

This guide covers deploying the Document AI Service to production.

## Pre-Deployment Checklist

- [ ] Application tested locally with test data
- [ ] All verification checks passed (see [VERIFY_SETUP.md](./VERIFY_SETUP.md))
- [ ] Production PostgreSQL database ready
- [ ] Server resources allocated (CPU, RAM, Disk)
- [ ] SSL/HTTPS certificates ready
- [ ] Firewall rules configured

## Environment Configuration

### 1. Create Production `.env` File

```env
# PostgreSQL Production
DB_URL=jdbc:postgresql://prod-db-server:5432/document_ai
DB_USERNAME=app_user
DB_PASSWORD=strong_password_here
DB_CONNECTION_POOL_SIZE=20

# Hibernate - Use 'update' to preserve data
DDL_AUTO=update
SHOW_SQL=false

# Application
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Performance
HIBERNATE_BATCH_SIZE=50
HIBERNATE_FETCH_SIZE=100

# Logging
LOG_LEVEL_SPRING=WARN
LOG_LEVEL_HIBERNATE=WARN
```

### 2. Create PostgreSQL User for Application

```sql
-- Connect as admin
psql -U postgres

-- Create dedicated app user
CREATE USER app_user WITH PASSWORD 'strong_password_here';

-- Create production database
CREATE DATABASE document_ai_prod OWNER app_user;

-- Grant permissions
GRANT CONNECT ON DATABASE document_ai_prod TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT CREATE ON SCHEMA public TO app_user;

-- Connect to database and grant all permissions
\c document_ai_prod
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

## Backend Deployment

### 1. Build Production JAR

```bash
cd backend
mvn clean package -DskipTests
# Creates: target/document-ai-service-0.0.1-SNAPSHOT.jar
```

### 2. Copy to Server

```bash
scp target/document-ai-service-0.0.1-SNAPSHOT.jar user@prod-server:/opt/app/
scp .env user@prod-server:/opt/app/.env
```

### 3. Run on Server

```bash
# SSH into server
ssh user@prod-server

cd /opt/app

# Run with nohup for persistence
nohup java -Xmx2g -Xms512m \
  -Dspring.profiles.active=prod \
  -jar document-ai-service-0.0.1-SNAPSHOT.jar > app.log 2>&1 &

# Verify it's running
ps aux | grep java
tail -f app.log
```

### 4. Setup Systemd Service (Linux)

Create `/etc/systemd/system/document-ai.service`:

```ini
[Unit]
Description=Document AI Service
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/app
Environment="PATH=/opt/app:$PATH"
Environment="SPRING_PROFILES_ACTIVE=prod"
ExecStart=/usr/bin/java -Xmx2g -Xms512m -jar /opt/app/document-ai-service-0.0.1-SNAPSHOT.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable document-ai
sudo systemctl start document-ai
sudo systemctl status document-ai
```

## Frontend Deployment

### 1. Build Production Bundle

```bash
npm install
npm run build
# Creates: dist/ folder with optimized build
```

### 2. Deploy to Web Server

#### Option A: Using Nginx

```bash
# Copy built files to web server
scp -r dist/* user@prod-server:/var/www/html/

# Create nginx config
sudo cat > /etc/nginx/sites-available/document-ai << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    root /var/www/html;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # React SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/document-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Option B: Using Apache

```bash
# Copy files
scp -r dist/* user@prod-server:/var/www/html/

# Enable mod_rewrite
sudo a2enmod rewrite

# Create .htaccess
cat > .htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF
```

#### Option C: Using Docker

```dockerfile
# Dockerfile for frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Build and run:
```bash
docker build -t document-ai-frontend .
docker run -d -p 80:80 document-ai-frontend
```

## Database Backups

### Automated Backup Script

Create `backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/document_ai"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="document_ai_prod"
DB_USER="app_user"

mkdir -p $BACKUP_DIR

# Full backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
```

Setup cron job:
```bash
0 2 * * * /opt/scripts/backup-db.sh  # Daily at 2 AM
```

### Restore from Backup

```bash
gunzip < backup_20240101_020000.sql.gz | psql -U app_user document_ai_prod
```

## Monitoring & Logging

### Setup Log Rotation

Create `/etc/logrotate.d/document-ai`:

```
/opt/app/app.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 app app
    sharedscripts
    postrotate
        systemctl reload document-ai > /dev/null 2>&1 || true
    endscript
}
```

### Monitor Application

```bash
# Check status
systemctl status document-ai

# View logs
journalctl -u document-ai -f

# Check database connection
psql -U app_user -d document_ai_prod -c "SELECT version();"

# Monitor disk usage
df -h /var

# Monitor memory
free -h

# Monitor database size
psql -U app_user -d document_ai_prod -c "
    SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## Security Hardening

### 1. Update application.yml

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: your-auth-server  # If using OAuth2
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  servlet:
    context-path: /
  error:
    include-message: never      # Don't expose error messages
    include-binding-errors: never
    include-stacktrace: never
    include-exception: false
```

### 2. Enable HTTPS/SSL

```yaml
server:
  ssl:
    enabled: true
    key-store: file:/opt/app/keystore.jks
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: JKS
```

### 3. Setup Firewall

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny from any to any port 8080  # Hide backend port
sudo ufw enable
```

### 4. Database Security

- Use strong password for `app_user`
- Restrict database access to localhost or specific IPs
- Enable PostgreSQL SSL connections
- Regular security updates for PostgreSQL

## Performance Tuning

### Java Options

```bash
java -Xmx2g \           # Max heap 2GB
     -Xms512m \         # Min heap 512MB
     -XX:+UseG1GC \     # Use G1 garbage collector
     -XX:MaxGCPauseMillis=200 \
     -jar document-ai-service-0.0.1-SNAPSHOT.jar
```

### Database Connection Pool

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      max-lifetime: 1800000
```

### Hibernate Batch

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 50
          fetch_size: 100
```

## Rollback Plan

If deployment fails:

1. Keep previous version running
2. Check application logs for errors
3. Verify database connectivity
4. Check file permissions
5. Restore from backup if needed

```bash
# Stop current version
systemctl stop document-ai

# Restore previous version
cp /opt/app/backups/document-ai-service-old.jar /opt/app/document-ai-service-0.0.1-SNAPSHOT.jar

# Restore database from backup
gunzip < /backups/document_ai/backup_latest.sql.gz | psql -U app_user document_ai_prod

# Start service
systemctl start document-ai
```

## Post-Deployment Checklist

- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Frontend loads and displays correctly
- [ ] Can upload test file
- [ ] Data appears in database
- [ ] Backups running daily
- [ ] Logs are rotating
- [ ] Monitoring is active
- [ ] SSL certificate valid
- [ ] Firewall rules in place
- [ ] Performance acceptable
- [ ] Team trained on operations

## Monitoring & Alerts

Consider using:
- **Prometheus** + **Grafana** for metrics
- **ELK Stack** for centralized logging
- **Sentry** for error tracking
- **PagerDuty** for alerts

Setup example with Prometheus:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

## Support & Maintenance

- Document all custom configurations
- Maintain runbooks for common issues
- Schedule regular database maintenance
- Plan for capacity upgrades
- Keep software updated
- Monitor logs regularly
- Test backup/restore procedures

---

**Your production system is now deployed and ready for users!**
