#!/usr/bin/env python3
"""
SBS n8n Ecosystem Health Check Script
=====================================
Cross-platform monitoring tool for the complete SBS ecosystem
Supports Windows and Linux environments

Features:
- Docker service health monitoring
- Database connectivity and schema validation
- n8n API and workflow status checks
- Webhook endpoint testing
- External API validation (OpenAI, Telegram)
- pg-listener service monitoring
- Performance metrics collection
- Detailed reporting with color-coded output

Usage:
    python health_check.py [options]
    
Options:
    --quick         : Run basic checks only
    --full          : Run comprehensive checks (default)
    --api-only      : Check APIs and webhooks only
    --docker-only   : Check Docker services only
    --export-json   : Export results to JSON file
    --silent        : Suppress console output
    --config FILE   : Use custom config file

Requirements:
    pip install requests psycopg2-binary python-dotenv colorama docker

Author: SBS Ecosystem Team
Version: 1.0.0
Last Updated: October 29, 2025
"""

import os
import sys
import json
import time
import requests
import psycopg2
import platform
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

try:
    import docker
    DOCKER_AVAILABLE = True
except ImportError:
    DOCKER_AVAILABLE = False
    print("⚠️  Docker library not available. Install with: pip install docker")

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False
    print("⚠️  python-dotenv not available. Install with: pip install python-dotenv")

try:
    from colorama import init, Fore, Back, Style
    init(autoreset=True)
    COLORS_AVAILABLE = True
except ImportError:
    COLORS_AVAILABLE = False
    # Fallback color definitions
    class Fore:
        RED = GREEN = YELLOW = BLUE = MAGENTA = CYAN = WHITE = RESET = ""
    class Back:
        RED = GREEN = YELLOW = BLUE = MAGENTA = CYAN = WHITE = RESET = ""
    class Style:
        BRIGHT = DIM = NORMAL = RESET_ALL = ""

# Configuration
@dataclass
class HealthCheckConfig:
    """Configuration for health checks"""
    # Environment
    env_file: str = ".env"
    
    # Timeouts (seconds)
    http_timeout: int = 10
    db_timeout: int = 5
    docker_timeout: int = 30
    
    # n8n Configuration
    n8n_base_url: str = "http://localhost:5678"
    n8n_webhook_path: str = "/webhook"
    
    # Expected Docker Services
    required_services: List[str] = None
    
    # Database Configuration
    db_required_tables: List[str] = None
    
    # API Endpoints to Test
    test_endpoints: List[str] = None
    
    def __post_init__(self):
        if self.required_services is None:
            self.required_services = ["postgres", "n8n", "pg-listener"]
        
        if self.db_required_tables is None:
            self.db_required_tables = [
                "users", "characters", "skills", "habits", "systems", 
                "routines", "system_logs", "projects", "tasks"
            ]
        
        if self.test_endpoints is None:
            self.test_endpoints = [
                "/healthz", "/metrics", "/webhook/health-check"
            ]

@dataclass
class CheckResult:
    """Result of a health check operation"""
    name: str
    status: str  # "pass", "fail", "warning", "skip"
    message: str
    details: Dict[str, Any] = None
    duration_ms: int = 0
    timestamp: str = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
        if self.details is None:
            self.details = {}

class HealthChecker:
    """Main health check orchestrator"""
    
    def __init__(self, config: HealthCheckConfig = None):
        self.config = config or HealthCheckConfig()
        self.results: List[CheckResult] = []
        self.env_vars = {}
        self.docker_client = None
        
        # Load environment variables
        self._load_environment()
        
        # Initialize Docker client if available
        if DOCKER_AVAILABLE:
            try:
                self.docker_client = docker.from_env()
            except Exception as e:
                self._add_result("docker_init", "warning", f"Docker client initialization failed: {e}")

    def _load_environment(self):
        """Load environment variables from .env file"""
        env_file_path = Path(self.config.env_file)
        
        if DOTENV_AVAILABLE and env_file_path.exists():
            load_dotenv(env_file_path)
            self._add_result("env_load", "pass", f"Environment loaded from {env_file_path}")
        elif env_file_path.exists():
            # Manual .env parsing
            with open(env_file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
            self._add_result("env_load", "pass", f"Environment loaded manually from {env_file_path}")
        else:
            self._add_result("env_load", "warning", f"No .env file found at {env_file_path}")
        
        # Store commonly used environment variables
        self.env_vars = {
            'DB_HOST': os.getenv('DB_HOST', 'localhost'),
            'DB_PORT': os.getenv('DB_PORT', '5432'),
            'DB_NAME': os.getenv('DB_NAME', 'lifeos_db'),
            'DB_USER': os.getenv('DB_USER', 'lifeos_app'),
            'DB_PASSWORD': os.getenv('DB_PASSWORD'),
            'N8N_WEBHOOK_BASE_URL': os.getenv('N8N_WEBHOOK_BASE_URL', 'http://localhost:5678'),
            'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY'),
            'TELEGRAM_BOT_TOKEN': os.getenv('TELEGRAM_BOT_TOKEN'),
        }

    def _add_result(self, name: str, status: str, message: str, details: Dict = None, duration_ms: int = 0):
        """Add a check result"""
        result = CheckResult(
            name=name,
            status=status,
            message=message,
            details=details or {},
            duration_ms=duration_ms
        )
        self.results.append(result)

    def _time_check(self, func, *args, **kwargs) -> Tuple[Any, int]:
        """Time a function execution and return result + duration in ms"""
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            duration_ms = int((time.time() - start_time) * 1000)
            return result, duration_ms
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            raise

    def check_docker_services(self) -> List[CheckResult]:
        """Check Docker service health"""
        if not DOCKER_AVAILABLE or not self.docker_client:
            self._add_result("docker_services", "skip", "Docker not available")
            return

        try:
            # Check if Docker daemon is running
            self.docker_client.ping()
            self._add_result("docker_daemon", "pass", "Docker daemon is running")
        except Exception as e:
            self._add_result("docker_daemon", "fail", f"Docker daemon not accessible: {e}")
            return

        # Check each required service
        for service_name in self.config.required_services:
            try:
                containers = self.docker_client.containers.list(
                    filters={"name": service_name, "status": "running"}
                )
                
                if containers:
                    container = containers[0]
                    
                    # Get container health if available
                    health_status = "unknown"
                    if hasattr(container, 'attrs') and 'State' in container.attrs:
                        if 'Health' in container.attrs['State']:
                            health_status = container.attrs['State']['Health']['Status']
                        else:
                            health_status = "running (no health check)"
                    
                    details = {
                        "container_id": container.id[:12],
                        "image": container.image.tags[0] if container.image.tags else "unknown",
                        "status": container.status,
                        "health": health_status,
                        "ports": [p for p in container.ports.keys()] if container.ports else []
                    }
                    
                    if health_status in ["healthy", "running (no health check)"]:
                        self._add_result(f"docker_{service_name}", "pass", 
                                       f"{service_name} container is running and healthy", details)
                    else:
                        self._add_result(f"docker_{service_name}", "warning", 
                                       f"{service_name} container running but health: {health_status}", details)
                else:
                    self._add_result(f"docker_{service_name}", "fail", 
                                   f"{service_name} container not found or not running")
                    
            except Exception as e:
                self._add_result(f"docker_{service_name}", "fail", 
                               f"Error checking {service_name}: {e}")

    def check_database_connectivity(self) -> CheckResult:
        """Check PostgreSQL database connectivity and basic schema"""
        if not self.env_vars['DB_PASSWORD']:
            self._add_result("database", "skip", "Database password not configured")
            return

        try:
            # Test database connection
            conn_start = time.time()
            connection = psycopg2.connect(
                host=self.env_vars['DB_HOST'],
                port=self.env_vars['DB_PORT'],
                database=self.env_vars['DB_NAME'],
                user=self.env_vars['DB_USER'],
                password=self.env_vars['DB_PASSWORD'],
                connect_timeout=self.config.db_timeout
            )
            conn_duration = int((time.time() - conn_start) * 1000)
            
            cursor = connection.cursor()
            
            # Check PostgreSQL version
            cursor.execute("SELECT version();")
            pg_version = cursor.fetchone()[0].split()[1]
            
            # Check required tables
            missing_tables = []
            for table in self.config.db_required_tables:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' AND table_name = %s
                    );
                """, (table,))
                
                if not cursor.fetchone()[0]:
                    missing_tables.append(table)
            
            # Check database size and connection count
            cursor.execute("""
                SELECT 
                    pg_size_pretty(pg_database_size(current_database())) as db_size,
                    (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as connections
            """)
            db_stats = cursor.fetchone()
            
            # Check for database triggers (pg-listener integration)
            cursor.execute("""
                SELECT count(*) FROM pg_trigger 
                WHERE tgname LIKE '%notify%'
            """)
            trigger_count = cursor.fetchone()[0]
            
            details = {
                "postgresql_version": pg_version,
                "connection_time_ms": conn_duration,
                "database_size": db_stats[0],
                "active_connections": db_stats[1],
                "missing_tables": missing_tables,
                "notify_triggers": trigger_count,
                "required_tables_found": len(self.config.db_required_tables) - len(missing_tables),
                "total_required_tables": len(self.config.db_required_tables)
            }
            
            cursor.close()
            connection.close()
            
            if missing_tables:
                self._add_result("database", "warning", 
                               f"Database connected but missing tables: {', '.join(missing_tables)}", 
                               details, conn_duration)
            else:
                self._add_result("database", "pass", 
                               f"Database healthy - PostgreSQL {pg_version}", 
                               details, conn_duration)
                
        except psycopg2.OperationalError as e:
            self._add_result("database", "fail", f"Database connection failed: {e}")
        except Exception as e:
            self._add_result("database", "fail", f"Database check error: {e}")

    def check_n8n_api(self) -> CheckResult:
        """Check n8n API and workflow status"""
        base_url = self.env_vars['N8N_WEBHOOK_BASE_URL'] or self.config.n8n_base_url
        
        # Test basic n8n health endpoint
        try:
            response, duration = self._time_check(
                requests.get, 
                f"{base_url}/healthz", 
                timeout=self.config.http_timeout
            )
            
            if response.status_code == 200:
                self._add_result("n8n_health", "pass", "n8n health endpoint responding", 
                               {"status_code": response.status_code, "response_time_ms": duration}, duration)
            else:
                self._add_result("n8n_health", "warning", 
                               f"n8n health endpoint returned {response.status_code}", 
                               {"status_code": response.status_code}, duration)
                
        except requests.exceptions.ConnectionError:
            self._add_result("n8n_health", "fail", f"Cannot connect to n8n at {base_url}")
        except requests.exceptions.Timeout:
            self._add_result("n8n_health", "fail", f"n8n health check timed out")
        except Exception as e:
            self._add_result("n8n_health", "fail", f"n8n health check error: {e}")

        # Test webhook endpoints
        for endpoint in self.config.test_endpoints:
            if endpoint == "/healthz":
                continue  # Already tested above
                
            try:
                test_url = f"{base_url}{endpoint}"
                response, duration = self._time_check(
                    requests.post, 
                    test_url,
                    json={"test": True, "timestamp": datetime.now().isoformat()},
                    timeout=self.config.http_timeout
                )
                
                # Most webhook endpoints will return 404 if no workflow is listening
                # This is actually expected behavior
                if response.status_code in [200, 404]:
                    status = "pass" if response.status_code == 200 else "warning"
                    message = f"Webhook {endpoint} accessible" if response.status_code == 200 else f"Webhook {endpoint} not configured (404 expected)"
                    self._add_result(f"webhook_{endpoint.replace('/', '_')}", status, message,
                                   {"status_code": response.status_code, "url": test_url}, duration)
                else:
                    self._add_result(f"webhook_{endpoint.replace('/', '_')}", "fail",
                                   f"Webhook {endpoint} returned {response.status_code}",
                                   {"status_code": response.status_code, "url": test_url}, duration)
                    
            except Exception as e:
                self._add_result(f"webhook_{endpoint.replace('/', '_')}", "fail", 
                               f"Webhook {endpoint} error: {e}")

    def check_external_apis(self) -> CheckResult:
        """Check external API connectivity"""
        
        # OpenAI API Check
        if self.env_vars['OPENAI_API_KEY']:
            try:
                headers = {
                    "Authorization": f"Bearer {self.env_vars['OPENAI_API_KEY']}",
                    "Content-Type": "application/json"
                }
                
                response, duration = self._time_check(
                    requests.get,
                    "https://api.openai.com/v1/models",
                    headers=headers,
                    timeout=self.config.http_timeout
                )
                
                if response.status_code == 200:
                    models = response.json()
                    model_count = len(models.get('data', []))
                    self._add_result("openai_api", "pass", f"OpenAI API accessible - {model_count} models available",
                                   {"model_count": model_count, "status_code": response.status_code}, duration)
                else:
                    self._add_result("openai_api", "fail", f"OpenAI API returned {response.status_code}",
                                   {"status_code": response.status_code}, duration)
                    
            except Exception as e:
                self._add_result("openai_api", "fail", f"OpenAI API error: {e}")
        else:
            self._add_result("openai_api", "skip", "OpenAI API key not configured")

        # Telegram Bot API Check
        if self.env_vars['TELEGRAM_BOT_TOKEN']:
            try:
                response, duration = self._time_check(
                    requests.get,
                    f"https://api.telegram.org/bot{self.env_vars['TELEGRAM_BOT_TOKEN']}/getMe",
                    timeout=self.config.http_timeout
                )
                
                if response.status_code == 200:
                    bot_info = response.json()
                    if bot_info.get('ok'):
                        bot_name = bot_info['result']['username']
                        self._add_result("telegram_api", "pass", f"Telegram Bot API accessible - @{bot_name}",
                                       {"bot_username": bot_name, "bot_id": bot_info['result']['id']}, duration)
                    else:
                        self._add_result("telegram_api", "fail", "Telegram API returned error in response")
                else:
                    self._add_result("telegram_api", "fail", f"Telegram API returned {response.status_code}")
                    
            except Exception as e:
                self._add_result("telegram_api", "fail", f"Telegram API error: {e}")
        else:
            self._add_result("telegram_api", "skip", "Telegram bot token not configured")

    def check_pg_listener(self) -> CheckResult:
        """Check pg-listener service status"""
        # This is primarily done through Docker check, but we can also verify the webhook endpoint
        webhook_url = f"{self.env_vars['N8N_WEBHOOK_BASE_URL']}/webhook/pg-notify"
        
        try:
            # Send a test notification to the pg-notify webhook
            test_payload = {
                "channel": "health_check",
                "payload": {
                    "test": True,
                    "timestamp": datetime.now().isoformat(),
                    "source": "health_check_script"
                }
            }
            
            response, duration = self._time_check(
                requests.post,
                webhook_url,
                json=test_payload,
                timeout=self.config.http_timeout
            )
            
            # 404 is expected if no workflow is listening to pg-notify webhook
            if response.status_code in [200, 404]:
                status = "pass" if response.status_code == 200 else "warning"
                message = "pg-listener webhook accessible" if response.status_code == 200 else "pg-listener webhook endpoint exists but no workflow configured"
                self._add_result("pg_listener_webhook", status, message,
                               {"webhook_url": webhook_url, "status_code": response.status_code}, duration)
            else:
                self._add_result("pg_listener_webhook", "fail", 
                               f"pg-listener webhook returned {response.status_code}",
                               {"webhook_url": webhook_url, "status_code": response.status_code}, duration)
                
        except Exception as e:
            self._add_result("pg_listener_webhook", "fail", f"pg-listener webhook error: {e}")

    def check_system_resources(self) -> CheckResult:
        """Check system resources and performance"""
        try:
            import psutil
            
            # CPU and Memory
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            details = {
                "cpu_percent": cpu_percent,
                "memory_total_gb": round(memory.total / (1024**3), 2),
                "memory_available_gb": round(memory.available / (1024**3), 2),
                "memory_percent": memory.percent,
                "disk_total_gb": round(disk.total / (1024**3), 2),
                "disk_free_gb": round(disk.free / (1024**3), 2),
                "disk_percent": round((disk.used / disk.total) * 100, 1),
                "platform": platform.system(),
                "python_version": platform.python_version()
            }
            
            # Determine status based on resource usage
            issues = []
            if cpu_percent > 90:
                issues.append(f"High CPU usage: {cpu_percent}%")
            if memory.percent > 90:
                issues.append(f"High memory usage: {memory.percent}%")
            if disk.percent > 90:
                issues.append(f"High disk usage: {disk.percent}%")
            
            if issues:
                self._add_result("system_resources", "warning", 
                               f"Resource constraints detected: {'; '.join(issues)}", details)
            else:
                self._add_result("system_resources", "pass", "System resources healthy", details)
                
        except ImportError:
            self._add_result("system_resources", "skip", "psutil not available (pip install psutil)")
        except Exception as e:
            self._add_result("system_resources", "fail", f"System resource check error: {e}")

    def run_all_checks(self, check_types: List[str] = None) -> List[CheckResult]:
        """Run all health checks"""
        if check_types is None:
            check_types = ["docker", "database", "n8n", "apis", "pg_listener", "resources"]
        
        print(f"{Fore.CYAN}🔍 Starting SBS n8n Ecosystem Health Check{Style.RESET_ALL}")
        print(f"{Fore.BLUE}Platform: {platform.system()} {platform.release()}{Style.RESET_ALL}")
        print(f"{Fore.BLUE}Python: {platform.python_version()}{Style.RESET_ALL}")
        print(f"{Fore.BLUE}Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}\n")
        
        if "docker" in check_types:
            print(f"{Fore.YELLOW}🐳 Checking Docker services...{Style.RESET_ALL}")
            self.check_docker_services()
        
        if "database" in check_types:
            print(f"{Fore.YELLOW}🗄️  Checking database connectivity...{Style.RESET_ALL}")
            self.check_database_connectivity()
        
        if "n8n" in check_types:
            print(f"{Fore.YELLOW}⚡ Checking n8n API and webhooks...{Style.RESET_ALL}")
            self.check_n8n_api()
        
        if "apis" in check_types:
            print(f"{Fore.YELLOW}🌐 Checking external APIs...{Style.RESET_ALL}")
            self.check_external_apis()
        
        if "pg_listener" in check_types:
            print(f"{Fore.YELLOW}📡 Checking pg-listener integration...{Style.RESET_ALL}")
            self.check_pg_listener()
        
        if "resources" in check_types:
            print(f"{Fore.YELLOW}💻 Checking system resources...{Style.RESET_ALL}")
            self.check_system_resources()
        
        return self.results

    def print_results(self, detailed: bool = True):
        """Print formatted results"""
        print(f"\n{Fore.CYAN}{'='*60}")
        print(f"🎯 SBS n8n Ecosystem Health Check Results")
        print(f"{'='*60}{Style.RESET_ALL}\n")
        
        # Summary statistics
        total_checks = len(self.results)
        passed = len([r for r in self.results if r.status == "pass"])
        failed = len([r for r in self.results if r.status == "fail"])
        warnings = len([r for r in self.results if r.status == "warning"])
        skipped = len([r for r in self.results if r.status == "skip"])
        
        print(f"{Fore.WHITE}📊 Summary:{Style.RESET_ALL}")
        print(f"  {Fore.GREEN}✅ Passed: {passed}{Style.RESET_ALL}")
        print(f"  {Fore.RED}❌ Failed: {failed}{Style.RESET_ALL}")
        print(f"  {Fore.YELLOW}⚠️  Warnings: {warnings}{Style.RESET_ALL}")
        print(f"  {Fore.BLUE}⏭️  Skipped: {skipped}{Style.RESET_ALL}")
        print(f"  {Fore.WHITE}📈 Total: {total_checks}{Style.RESET_ALL}\n")
        
        # Detailed results
        if detailed:
            for result in self.results:
                status_icon = {
                    "pass": f"{Fore.GREEN}✅",
                    "fail": f"{Fore.RED}❌",
                    "warning": f"{Fore.YELLOW}⚠️ ",
                    "skip": f"{Fore.BLUE}⏭️ "
                }.get(result.status, "❓")
                
                duration_str = f" ({result.duration_ms}ms)" if result.duration_ms > 0 else ""
                print(f"{status_icon} {result.name}: {result.message}{duration_str}{Style.RESET_ALL}")
                
                if result.details and detailed:
                    for key, value in result.details.items():
                        print(f"     {Fore.CYAN}{key}: {value}{Style.RESET_ALL}")
                    print()
        
        # Overall health status
        if failed > 0:
            print(f"{Fore.RED}🚨 ECOSYSTEM STATUS: UNHEALTHY - {failed} critical issues detected{Style.RESET_ALL}")
        elif warnings > 0:
            print(f"{Fore.YELLOW}⚠️  ECOSYSTEM STATUS: DEGRADED - {warnings} warnings detected{Style.RESET_ALL}")
        else:
            print(f"{Fore.GREEN}🎉 ECOSYSTEM STATUS: HEALTHY - All systems operational{Style.RESET_ALL}")

    def export_results(self, filename: str = None) -> str:
        """Export results to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"sbs_health_check_{timestamp}.json"
        
        export_data = {
            "timestamp": datetime.now().isoformat(),
            "platform": {
                "system": platform.system(),
                "release": platform.release(),
                "python_version": platform.python_version()
            },
            "summary": {
                "total_checks": len(self.results),
                "passed": len([r for r in self.results if r.status == "pass"]),
                "failed": len([r for r in self.results if r.status == "fail"]),
                "warnings": len([r for r in self.results if r.status == "warning"]),
                "skipped": len([r for r in self.results if r.status == "skip"])
            },
            "results": [asdict(result) for result in self.results],
            "config": asdict(self.config)
        }
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        print(f"{Fore.GREEN}📄 Results exported to: {filename}{Style.RESET_ALL}")
        return filename

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="SBS n8n Ecosystem Health Check",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python health_check.py                    # Run all checks
    python health_check.py --quick            # Run basic checks only
    python health_check.py --docker-only      # Check Docker services only
    python health_check.py --api-only         # Check APIs and webhooks only
    python health_check.py --export-json      # Export results to JSON
    python health_check.py --config custom.env # Use custom environment file
        """
    )
    
    parser.add_argument("--quick", action="store_true", 
                       help="Run basic checks only (docker, database, n8n)")
    parser.add_argument("--full", action="store_true", default=True,
                       help="Run comprehensive checks (default)")
    parser.add_argument("--docker-only", action="store_true",
                       help="Check Docker services only")
    parser.add_argument("--api-only", action="store_true",
                       help="Check APIs and webhooks only")
    parser.add_argument("--export-json", action="store_true",
                       help="Export results to JSON file")
    parser.add_argument("--silent", action="store_true",
                       help="Suppress console output")
    parser.add_argument("--config", type=str, default=".env",
                       help="Path to environment configuration file")
    parser.add_argument("--timeout", type=int, default=10,
                       help="HTTP timeout in seconds (default: 10)")
    
    args = parser.parse_args()
    
    # Determine check types
    if args.quick:
        check_types = ["docker", "database", "n8n"]
    elif args.docker_only:
        check_types = ["docker"]
    elif args.api_only:
        check_types = ["n8n", "apis"]
    else:
        check_types = ["docker", "database", "n8n", "apis", "pg_listener", "resources"]
    
    # Configure health checker
    config = HealthCheckConfig(
        env_file=args.config,
        http_timeout=args.timeout
    )
    
    checker = HealthChecker(config)
    
    try:
        # Run checks
        results = checker.run_all_checks(check_types)
        
        # Print results unless silent
        if not args.silent:
            checker.print_results(detailed=True)
        
        # Export if requested
        if args.export_json:
            checker.export_results()
        
        # Exit with appropriate code
        failed_count = len([r for r in results if r.status == "fail"])
        sys.exit(1 if failed_count > 0 else 0)
        
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}⏹️  Health check interrupted by user{Style.RESET_ALL}")
        sys.exit(130)
    except Exception as e:
        print(f"{Fore.RED}💥 Health check failed with error: {e}{Style.RESET_ALL}")
        sys.exit(1)

if __name__ == "__main__":
    main()