package main

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/mgr"
)

// Configuration
const (
	spoolerDir        = `C:\Windows\System32\spool\PRINTERS`
	logFile           = `C:\SpoolerCheck.log`
	persistentJobsFile = `C:\PersistentJobs.txt`
	
	// Email settings
	smtpServer = "smtp.company.com"
	smtpPort   = 25
	fromEmail  = "printserver@company.com"
	toEmail    = "admin@company.com"
)

var logger *log.Logger

func init() {
	// Set up logging
	logOutput, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Error opening log file: %v\n", err)
		os.Exit(1)
	}
	
	logger = log.New(logOutput, "", log.LstdFlags)
	
	// Check log size and rotate if needed
	checkRotateLog()
}

func checkAdminPrivileges() bool {
	// A simple way to check for admin rights in Windows
	// is to try to open the SCM with required privileges
	m, err := mgr.Connect()
	if err != nil {
		return false
	}
	defer m.Disconnect()
	return true
}

func isSpoolerRunning() bool {
	m, err := mgr.Connect()
	if err != nil {
		logger.Printf("Error connecting to service manager: %v", err)
		return false
	}
	defer m.Disconnect()
	
	s, err := m.OpenService("Spooler")
	if err != nil {
		logger.Printf("Error opening spooler service: %v", err)
		return false
	}
	defer s.Close()
	
	status, err := s.Query()
	if err != nil {
		logger.Printf("Error querying spooler status: %v", err)
		return false
	}
	
	return status.State == svc.Running
}

func startSpooler() bool {
	logger.Println("Attempting to start Print Spooler")
	
	cmd := exec.Command("net", "start", "Spooler")
	err := cmd.Run()
	if err != nil {
		logger.Printf("Error starting spooler: %v", err)
		return false
	}
	
	// Give it time to start
	time.Sleep(3 * time.Second)
	
	if isSpoolerRunning() {
		logger.Println("Print Spooler started successfully")
		return true
	} else {
		logger.Println("Failed to start Print Spooler")
		return false
	}
}

func stopSpooler() bool {
	logger.Println("Stopping Print Spooler")
	
	cmd := exec.Command("net", "stop", "Spooler")
	err := cmd.Run()
	if err != nil {
		logger.Printf("Error stopping spooler: %v", err)
		return false
	}
	
	// Give it time to stop
	time.Sleep(3 * time.Second)
	return true
}

func getCurrentJobs() []string {
	files, err := os.ReadDir(spoolerDir)
	if err != nil {
		logger.Printf("Error accessing spooler directory: %v", err)
		return []string{}
	}
	
	var jobs []string
	for _, file := range files {
		if !file.IsDir() {
			jobs = append(jobs, file.Name())
		}
	}
	
	return jobs
}

func readPersistentJobs() []string {
	data, err := os.ReadFile(persistentJobsFile)
	if err != nil {
		if !os.IsNotExist(err) {
			logger.Printf("Error reading persistent jobs file: %v", err)
		}
		return []string{}
	}
	
	return strings.Split(strings.TrimSpace(string(data)), "\n")
}

func writePersistentJobs(jobs []string) {
	data := strings.Join(jobs, "\n")
	err := os.WriteFile(persistentJobsFile, []byte(data), 0644)
	if err != nil {
		logger.Printf("Error writing to persistent jobs file: %v", err)
	}
}

func sendEmailAlert(jobName string) bool {
	msg := fmt.Sprintf("From: %s\r\n"+
		"To: %s\r\n"+
		"Subject: ALERT: Stuck Print Job Detected\r\n\r\n"+
		"Print job '%s' has been stuck in the queue for multiple checks.",
		fromEmail, toEmail, jobName)
	
	err := smtp.SendMail(
		fmt.Sprintf("%s:%d", smtpServer, smtpPort),
		nil, // no auth
		fromEmail,
		[]string{toEmail},
		[]byte(msg),
	)
	
	if err != nil {
		logger.Printf("Failed to send email alert: %v", err)
		return false
	}
	
	logger.Printf("Email alert sent for stuck job: %s", jobName)
	return true
}

func clearStuckJob(jobName string) bool {
	jobPath := filepath.Join(spoolerDir, jobName)
	
	if stopSpooler() {
		_, err := os.Stat(jobPath)
		if err == nil {
			err = os.Remove(jobPath)
			if err != nil {
				logger.Printf("Error removing stuck job file %s: %v", jobName, err)
			} else {
				logger.Printf("Removed stuck job file: %s", jobName)
			}
		}
		
		startSpooler()
		return err == nil
	}
	
	return false
}

func checkRotateLog() {
	info, err := os.Stat(logFile)
	if err == nil && info.Size() > 1048576 { // 1MB
		// Rotate log
		backupFile := logFile + ".old"
		os.Remove(backupFile) // Remove old backup if exists
		os.Rename(logFile, backupFile)
		
		// Open new log file
		logOutput, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY, 0644)
		if err == nil {
			logger = log.New(logOutput, "", log.LstdFlags)
			logger.Println("Log file rotated")
		}
	}
}

func mainCheck() {
	logger.Println("Starting print spooler check")
	
	// Check if spooler is running
	if !isSpoolerRunning() {
		logger.Println("Print Spooler is NOT running")
		if startSpooler() {
			logger.Println("Print Spooler started successfully")
		} else {
			logger.Println("Failed to start Print Spooler")
		}
		return
	}
	
	// Spooler is running, check for print jobs
	currentJobs := getCurrentJobs()
	
	if len(currentJobs) > 0 {
		logger.Printf("Found %d print jobs in queue", len(currentJobs))
		
		// Check for persistent jobs
		previousJobs := readPersistentJobs()
		
		if len(previousJobs) > 0 {
			// Find jobs that exist in both lists (persistent jobs)
			for _, job := range currentJobs {
				for _, prevJob := range previousJobs {
					if job == prevJob {
						logger.Printf("PERSISTENT JOB DETECTED: %s", job)
						sendEmailAlert(job)
						clearStuckJob(job)
						break
					}
				}
			}
		}
		
		// Save current jobs for next check
		writePersistentJobs(currentJobs)
	} else {
		logger.Println("No print jobs in queue")
		// Clear persistent jobs file if queue is empty
		os.Remove(persistentJobsFile)
	}
}

func setupScheduledTask() bool {
	exePath, err := os.Executable()
	if err != nil {
		fmt.Printf("Error getting executable path: %v\n", err)
		return false
	}
	
	taskName := "GoPrintSpoolerMonitor"
	
	// Check if task exists
	checkCmd := exec.Command("schtasks", "/query", "/tn", taskName)
	if err := checkCmd.Run(); err == nil {
		// Task exists, delete it
		deleteCmd := exec.Command("schtasks", "/delete", "/tn", taskName, "/f")
		deleteCmd.Run()
	}
	
	// Create new task
	createCmd := exec.Command(
		"schtasks", "/create", "/tn", taskName,
		"/tr", exePath,
		"/sc", "minute", "/mo", "5",
		"/ru", "SYSTEM",
		"/rl", "HIGHEST",
	)
	
	err = createCmd.Run()
	if err != nil {
		fmt.Printf("Failed to create scheduled task: %v\n", err)
		return false
	}
	
	fmt.Printf("Scheduled task '%s' created successfully\n", taskName)
	return true
}

func main() {
	// Check for admin privileges
	if !checkAdminPrivileges() {
		fmt.Println("This program requires administrator privileges. Please run as administrator.")
		os.Exit(1)
	}
	
	// Check if setup flag is provided
	if len(os.Args) > 1 && os.Args[1] == "--setup" {
		setupScheduledTask()
		return
	}
	
	// Run the main check
	mainCheck()
}