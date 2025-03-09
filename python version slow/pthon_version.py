import os
import sys
import time
import subprocess
import smtplib
import logging
from email.message import EmailMessage
from datetime import datetime
from pathlib import Path
import win32serviceutil  # Requires pywin32 package

# Configuration
SPOOLER_DIR = r"C:\Windows\System32\spool\PRINTERS"
LOG_FILE = r"C:\SpoolerCheck.log"
PERSISTENT_JOBS_FILE = r"C:\PersistentJobs.txt"
CHECK_INTERVAL = 300  # 5 minutes in seconds

# Email settings
SMTP_SERVER = "smtp.company.com"
SMTP_PORT = 25
FROM_EMAIL = "printserver@company.com"
TO_EMAIL = "admin@company.com"

# Set up logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("PrintSpoolerMonitor")

def check_admin_privileges():
    """Check if script is running with admin privileges"""
    try:
        is_admin = os.getuid() == 0
    except AttributeError:
        # Windows approach
        import ctypes
        is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
    
    if not is_admin:
        logger.error("This script requires administrator privileges")
        print("This script requires administrator privileges. Please run as administrator.")
        sys.exit(1)

def is_spooler_running():
    """Check if the Print Spooler service is running"""
    try:
        status = win32serviceutil.QueryServiceStatus('Spooler')
        # 4 is the code for "running"
        return status[1] == 4
    except Exception as e:
        logger.error(f"Error checking spooler status: {e}")
        return False

def start_spooler():
    """Attempt to start the Print Spooler service"""
    try:
        logger.info("Attempting to start Print Spooler")
        win32serviceutil.StartService('Spooler')
        time.sleep(3)  # Give it time to start
        if is_spooler_running():
            logger.info("Print Spooler started successfully")
            return True
        else:
            logger.error("Failed to start Print Spooler")
            return False
    except Exception as e:
        logger.error(f"Error starting Print Spooler: {e}")
        return False

def stop_spooler():
    """Stop the Print Spooler service"""
    try:
        logger.info("Stopping Print Spooler")
        win32serviceutil.StopService('Spooler')
        time.sleep(3)  # Give it time to stop
        return True
    except Exception as e:
        logger.error(f"Error stopping Print Spooler: {e}")
        return False

def get_current_jobs():
    """Get a list of current print jobs in the spooler directory"""
    try:
        return [f for f in os.listdir(SPOOLER_DIR) if os.path.isfile(os.path.join(SPOOLER_DIR, f))]
    except Exception as e:
        logger.error(f"Error accessing spooler directory: {e}")
        return []

def read_persistent_jobs():
    """Read the list of previously detected jobs"""
    if not os.path.exists(PERSISTENT_JOBS_FILE):
        return []
    
    try:
        with open(PERSISTENT_JOBS_FILE, 'r') as f:
            return [line.strip() for line in f if line.strip()]
    except Exception as e:
        logger.error(f"Error reading persistent jobs file: {e}")
        return []

def write_persistent_jobs(jobs):
    """Write the list of current jobs to the persistent jobs file"""
    try:
        with open(PERSISTENT_JOBS_FILE, 'w') as f:
            for job in jobs:
                f.write(f"{job}\n")
    except Exception as e:
        logger.error(f"Error writing to persistent jobs file: {e}")

def send_email_alert(job_name):
    """Send an email alert about a persistent print job"""
    try:
        msg = EmailMessage()
        msg.set_content(f"Print job '{job_name}' has been stuck in the queue for multiple checks.")
        
        msg['Subject'] = "ALERT: Stuck Print Job Detected"
        msg['From'] = FROM_EMAIL
        msg['To'] = TO_EMAIL
        
        s = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        s.send_message(msg)
        s.quit()
        
        logger.info(f"Email alert sent for stuck job: {job_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email alert: {e}")
        return False

def clear_stuck_job(job_name):
    """Clear a specific stuck print job"""
    try:
        job_path = os.path.join(SPOOLER_DIR, job_name)
        if stop_spooler():
            if os.path.exists(job_path):
                os.remove(job_path)
                logger.info(f"Removed stuck job file: {job_name}")
            start_spooler()
            return True
        return False
    except Exception as e:
        logger.error(f"Error clearing stuck job {job_name}: {e}")
        start_spooler()  # Make sure to restart spooler even if error occurs
        return False

def check_rotate_log():
    """Rotate log file if it gets too large"""
    try:
        log_path = Path(LOG_FILE)
        if log_path.exists() and log_path.stat().st_size > 1048576:  # 1MB
            backup = f"{LOG_FILE}.old"
            if os.path.exists(backup):
                os.remove(backup)
            os.rename(LOG_FILE, backup)
            logger.info("Log file rotated")
    except Exception as e:
        print(f"Error rotating log file: {e}")

def main_check():
    """Main checking function for print spooler monitoring"""
    logger.info("Starting print spooler check")
    
    # Check if spooler is running
    if not is_spooler_running():
        logger.warning("Print Spooler is NOT running")
        if start_spooler():
            logger.info("Print Spooler started successfully")
        else:
            logger.error("Failed to start Print Spooler")
        return
    
    # Spooler is running, check for print jobs
    current_jobs = get_current_jobs()
    
    if current_jobs:
        logger.info(f"Found {len(current_jobs)} print jobs in queue")
        
        # Check for persistent jobs
        previous_jobs = read_persistent_jobs()
        
        if previous_jobs:
            # Find jobs that exist in both lists (persistent jobs)
            persistent_jobs = [job for job in current_jobs if job in previous_jobs]
            
            for stuck_job in persistent_jobs:
                logger.warning(f"PERSISTENT JOB DETECTED: {stuck_job}")
                send_email_alert(stuck_job)
                clear_stuck_job(stuck_job)
        
        # Save current jobs for next check
        write_persistent_jobs(current_jobs)
    else:
        logger.info("No print jobs in queue")
        # Clear persistent jobs file if queue is empty
        if os.path.exists(PERSISTENT_JOBS_FILE):
            os.remove(PERSISTENT_JOBS_FILE)

def setup_scheduled_task():
    """Set up a Windows scheduled task to run this script"""
    script_path = os.path.abspath(__file__)
    task_name = "PythonPrintSpoolerMonitor"
    
    try:
        # Check if task exists
        check_task = subprocess.run(
            ['schtasks', '/query', '/tn', task_name], 
            capture_output=True, 
            text=True
        )
        
        # Delete if exists
        if check_task.returncode == 0:
            subprocess.run(['schtasks', '/delete', '/tn', task_name, '/f'])
        
        # Create new task
        create_task = subprocess.run([
            'schtasks', '/create', '/tn', task_name,
            '/tr', f'python "{script_path}"',
            '/sc', 'minute', '/mo', '5',
            '/ru', 'SYSTEM',
            '/rl', 'HIGHEST'
        ])
        
        if create_task.returncode == 0:
            print(f"Scheduled task '{task_name}' created successfully")
            return True
        else:
            print("Failed to create scheduled task")
            return False
            
    except Exception as e:
        print(f"Error setting up scheduled task: {e}")
        return False

if __name__ == "__main__":
    # Check if we need to set up the scheduled task
    if len(sys.argv) > 1 and sys.argv[1] == "--setup":
        check_admin_privileges()
        setup_scheduled_task()
        sys.exit(0)
    
    # Otherwise, run the check
    check_admin_privileges()
    check_rotate_log()
    main_check()