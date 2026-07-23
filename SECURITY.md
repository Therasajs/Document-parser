# Security Configuration Guide

## Overview

This Document Import Engine includes Spring Security with role-based access control to protect destructive operations.

## Security Features Implemented

### 1. Environment Variable Configuration
**File**: `backend/src/main/resources/application.yml`

Database credentials are now loaded from environment variables:
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/document_ai}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:changeme}
```

### 2. Spring Security Configuration
**File**: `backend/src/main/java/com/example/documentai/config/SecurityConfig.java`

Access control rules:
- ✅ **Public (No Auth)**:
  - `POST /api/documents/upload` - File upload
  - `POST /api/documents/preview` - Preview without import
  - `GET /api/questions/**` - Read-only question access
  - `GET /api/documents/**` - Read-only document access

- 🔒 **Protected (Authentication Required)**:
  - `DELETE /api/questions/{id}` - Delete single question (ADMIN role)
  - `DELETE /api/questions` - Delete all questions (ADMIN role)
  - `DELETE /api/documents/{id}` - Delete document (ADMIN role)

### 3. Role-Based Authorization
**File**: `backend/src/main/java/com/example/documentai/controller/QuestionController.java`

Destructive endpoints require ADMIN role:
```java
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) { ... }
```

## Deployment Setup

### 1. Set Environment Variables (Production)

#### Windows PowerShell
```powershell
$env:DB_URL = "jdbc:postgresql://your-host:5432/document_ai"
$env:DB_USERNAME = "secure_user"
$env:DB_PASSWORD = "very_secure_password_here"

# Run application
java -jar document-ai-service.jar --spring.profiles.active=prod
```

#### Linux/Mac
```bash
export DB_URL="jdbc:postgresql://your-host:5432/document_ai"
export DB_USERNAME="secure_user"
export DB_PASSWORD="very_secure_password_here"

java -jar document-ai-service.jar --spring.profiles.active=prod
```

#### Docker
```dockerfile
FROM openjdk:21
COPY target/document-ai-service.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
```

Run with:
```bash
docker run -e DB_USERNAME=user -e DB_PASSWORD=pass image_name
```

### 2. Testing Authentication

#### Test Public Endpoint (No Auth Required)
```bash
curl http://localhost:8080/api/questions
# Returns: 200 OK with all questions
```

#### Test Protected Endpoint (Auth Required)
```bash
# Without credentials - should fail
curl -X DELETE http://localhost:8080/api/questions/1
# Returns: 401 Unauthorized

# With credentials - requires ADMIN role
curl -X DELETE \
  -u admin:admin_password \
  http://localhost:8080/api/questions/1
# Returns: 204 No Content (if ADMIN role assigned)
```

### 3. User Management

For production, configure user authentication:

#### Option A: In-Memory Users (Development Only)
```java
@Bean
public UserDetailsService userDetailsService() {
    UserDetails admin = User.builder()
        .username("admin")
        .password(passwordEncoder().encode("secure_password"))
        .roles("ADMIN")
        .build();
    
    UserDetails user = User.builder()
        .username("user")
        .password(passwordEncoder().encode("secure_password"))
        .roles("USER")
        .build();
    
    return new InMemoryUserDetailsManager(admin, user);
}
```

#### Option B: Database Users (Recommended for Production)
Implement UserDetailsService with database queries:
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String username) {
        // Query database for user and roles
        // Build UserDetails with granted authorities
    }
}
```

#### Option C: LDAP Authentication
```yaml
spring:
  ldap:
    urls: ldap://your-ldap-server:389
    base: dc=example,dc=com
```

### 4. Credentials Management

**Never Hardcode Secrets:**

❌ **Bad** (Don't do this)
```yaml
spring:
  datasource:
    password: "supersecret"  # Exposed in version control!
```

✅ **Good** (Use environment variables)
```yaml
spring:
  datasource:
    password: ${DB_PASSWORD}  # Loaded at runtime
```

### 5. Production Checklist

- ✅ Environment variables configured before startup
- ✅ Database password is strong (12+ chars, mixed case, numbers, symbols)
- ✅ Application logs don't contain sensitive data
- ✅ HTTPS/TLS enabled for all endpoints
- ✅ API token expiration configured
- ✅ Rate limiting enabled
- ✅ Regular security audits scheduled
- ✅ Database backups encrypted and stored securely
- ✅ Access logs monitored for suspicious activity

## API Security Headers

### Recommended Headers (Configure in SecurityConfig)

```java
http.headers(headers -> headers
    .contentSecurityPolicy("default-src 'self'")
    .xssProtection()
    .frameOptions().deny()
    .httpStrictTransportSecurity()
);
```

## Database Security

### 1. Create Limited-Privilege User
```sql
-- Create user with minimal permissions
CREATE USER app_user WITH PASSWORD 'strong_password_here';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE document_ai TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;

-- Prevent direct table access to critical audit tables
REVOKE DELETE ON import_log FROM app_user;
```

### 2. Enable PostgreSQL SSL
```yaml
spring:
  datasource:
    url: jdbc:postgresql://host:5432/document_ai?sslmode=require
```

### 3. Enable Connection Pooling with SSL
```yaml
spring:
  datasource:
    hikari:
      ssl-mode: require
      connection-timeout: 30000
```

## Secrets Management

### Option 1: Environment Variables
```bash
export DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id db-password --query SecretString --output text)
java -jar app.jar
```

### Option 2: Spring Cloud Config Server
```yaml
spring:
  config:
    import: configserver:http://config-server:8888
```

### Option 3: HashiCorp Vault
```yaml
spring:
  cloud:
    vault:
      uri: http://vault:8200
      token: ${VAULT_TOKEN}
```

### Option 4: AWS Secrets Manager
```java
@Configuration
public class SecretsManagerConfig {
    @Bean
    public PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        // Load secrets from AWS Secrets Manager
        return new PropertySourcesPlaceholderConfigurer();
    }
}
```

## Audit Logging

### Enable Detailed Logging
```yaml
logging:
  level:
    org.springframework.security: DEBUG
    com.example.documentai: DEBUG
```

### Monitor Authentication Events
```java
@Component
public class SecurityAuditListener {
    @EventListener
    public void onSuccess(AuthenticationSuccessEvent event) {
        // Log successful authentication
    }
    
    @EventListener
    public void onFailure(AuthenticationFailureBadCredentialsEvent event) {
        // Log failed authentication attempts
    }
}
```

## Testing Security

### Unit Tests
```java
@SpringBootTest
class SecurityTests {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void deleteWithoutAuthShouldFail() throws Exception {
        mockMvc.perform(delete("/api/questions/1"))
            .andExpect(status().isUnauthorized());
    }
    
    @Test
    @WithMockUser(roles = "ADMIN")
    public void deleteWithAdminRoleShouldSucceed() throws Exception {
        mockMvc.perform(delete("/api/questions/1"))
            .andExpect(status().isNoContent());
    }
}
```

## Vulnerability Scanning

### Regular Security Audits
```bash
# OWASP Dependency Check
mvn org.owasp:dependency-check-maven:check

# SonarQube
mvn clean verify -Psonar
```

## Compliance Considerations

- ✅ GDPR: Implement data retention policies
- ✅ HIPAA: Encrypt data in transit and at rest
- ✅ PCI DSS: Don't store payment information
- ✅ SOC 2: Audit logging and access controls

## Security Best Practices

1. **Principle of Least Privilege**
   - Users get minimum required permissions
   - Admin role only for necessary operations

2. **Defense in Depth**
   - Multiple layers of security
   - Application + Database + Network

3. **Zero Trust**
   - Verify every request
   - Don't assume internal = safe

4. **Regular Updates**
   - Keep dependencies up-to-date
   - Monitor security advisories

5. **Monitoring & Alerting**
   - Log all authentication events
   - Alert on suspicious activity
   - Monitor resource usage

---

**Status**: ✅ Security Hardened
**Last Updated**: January 2025
**Version**: 1.0.0
