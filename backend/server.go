package main

import (
	cms "matcha-cms/Features/CMS"

	"github.com/gin-gonic/gin"
)

// startServer initializes and starts the Gin web server
func startServer() {

	// Start Gin Server
	router := gin.Default()

	// Disable Trusted Proxies
	router.SetTrustedProxies(nil)

	// Build application routes
	buildRoutes(router)

	// Log server start
	println("Backend: Starting server on port 8080")

	// Run the server
	err := router.Run(":8080")

	// Handle potential errors
	if err != nil {
		println("Server failed to start:", err.Error())
	}
}

// buildRoutes sets up the application routes
func buildRoutes(router *gin.Engine) {

	if router == nil {
		println("Router is null")
		return
	}

	// Import and register routes from different modules (placeholders for actual imports)
	cms.RegisterCMSRoutes(router)

}
