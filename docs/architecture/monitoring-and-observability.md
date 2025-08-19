# Monitoring and Observability

## Metrics Collection

**Application Metrics:**
- Request count and response times
- Error rates and types
- Database query performance
- Memory and CPU usage
- Custom business metrics

**Key Performance Indicators:**
```go
type Metrics struct {
    RequestCount    int64
    ErrorCount      int64
    ResponseTime    time.Duration
    ActiveUsers     int64
    DatabaseQueries int64
}

func recordMetrics(metrics *Metrics) {
    // Send to monitoring service
    prometheus.Counter("requests_total").Inc()
    prometheus.Histogram("response_time_seconds").Observe(metrics.ResponseTime.Seconds())
}
```

## Health Checks

**Comprehensive Health Check:**
```go
type HealthStatus struct {
    Status    string            `json:"status"`
    Timestamp time.Time         `json:"timestamp"`
    Services  map[string]string `json:"services"`
    Metrics   map[string]int64  `json:"metrics"`
}

func healthCheck() HealthStatus {
    status := HealthStatus{
        Status:    "healthy",
        Timestamp: time.Now(),
        Services:  make(map[string]string),
        Metrics:   make(map[string]int64),
    }
    
    // Check database
    if err := db.Ping(); err != nil {
        status.Status = "unhealthy"
        status.Services["database"] = "error"
    } else {
        status.Services["database"] = "ok"
    }
    
    // Check external services
    if err := checkAIService(); err != nil {
        status.Services["ai_service"] = "error"
    } else {
        status.Services["ai_service"] = "ok"
    }
    
    return status
}
```

## Alerting Strategy

**Alert Rules:**
- High error rate (> 5% for 5 minutes)
- High response time (> 2 seconds average)
- Database connection failures
- Disk space low (< 10% free)
- Memory usage high (> 80%)

**Alert Channels:**
- Email notifications
- Slack/Teams integration
- PagerDuty for critical alerts
- SMS for emergency situations

## Logging Strategy

**Log Levels:**
- **DEBUG**: Detailed debugging information
- **INFO**: General application information
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **FATAL**: Critical errors causing shutdown

**Structured Logging:**
```go
func logRequest(ctx context.Context, r *http.Request, statusCode int, duration time.Duration) {
    logEntry := map[string]interface{}{
        "level":       "info",
        "message":     "HTTP request",
        "method":      r.Method,
        "path":        r.URL.Path,
        "status_code": statusCode,
        "duration_ms": duration.Milliseconds(),
        "user_agent":  r.UserAgent(),
        "ip":          r.RemoteAddr,
    }
    
    if requestID := ctx.Value("request_id"); requestID != nil {
        logEntry["request_id"] = requestID
    }
    
    logJSON, _ := json.Marshal(logEntry)
    log.Println(string(logJSON))
}
```

## Dashboard and Visualization

**Key Dashboards:**
1. **Application Overview**: Request rates, error rates, response times
2. **Database Performance**: Query times, connection pool usage
3. **User Activity**: Active users, feature usage
4. **System Resources**: CPU, memory, disk usage
5. **Business Metrics**: Coffee logs created, user engagement

**Monitoring Tools:**
- **Application Monitoring**: Prometheus + Grafana
- **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Error Tracking**: Sentry or similar
- **Uptime Monitoring**: Pingdom or UptimeRobot

---