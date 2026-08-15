import { Request, Response } from 'express';

interface PerformanceMetrics {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}

class MonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  // Record performance metrics
  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log slow requests
    if (metric.duration > 1000) {
      console.warn('🐌 Slow request detected:', {
        method: metric.method,
        url: metric.url,
        duration: `${metric.duration}ms`,
        statusCode: metric.statusCode
      });
    }
    
    // Log errors
    if (metric.statusCode >= 400) {
      console.error('❌ Error request:', {
        method: metric.method,
        url: metric.url,
        statusCode: metric.statusCode,
        duration: `${metric.duration}ms`
      });
    }
  }

  // Get performance statistics
  getStats() {
    if (this.metrics.length === 0) return null;

    const durations = this.metrics.map(m => m.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    const errorCount = this.metrics.filter(m => m.statusCode >= 400).length;
    const slowCount = this.metrics.filter(m => m.duration > 1000).length;

    return {
      totalRequests: this.metrics.length,
      avgDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      errorRate: (errorCount / this.metrics.length) * 100,
      slowRequestRate: (slowCount / this.metrics.length) * 100,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  // Health check endpoint
  getHealthStatus() {
    const stats = this.getStats();
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        percentage: Math.round(memoryUsagePercent * 100) / 100
      },
      performance: stats,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }
}

export const monitoringService = new MonitoringService();

// Middleware to collect metrics
export const monitoringMiddleware = (req: Request, res: Response, next: Function) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  const startCpu = process.cpuUsage();

  res.on('finish', () => {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const endCpu = process.cpuUsage(startCpu);

    monitoringService.recordMetric({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: endTime - startTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      memoryUsage: endMemory,
      cpuUsage: endCpu
    });
  });

  next();
};
