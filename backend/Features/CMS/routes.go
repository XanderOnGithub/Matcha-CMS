package cms

import (
	content "matcha-cms/Features/CMS/Content"

	"github.com/gin-gonic/gin"
)

func RegisterCMSRoutes(router *gin.Engine) {
	println("[CMS]: Registering CMS routes")

	// [Content] --> Content Routes
	router.GET("/api/content/:collection", content.GetContentFilesHandler)            // Get all files in collection
	router.GET("/api/content/:collection/*file", content.GetContentFileHandler)       // Get a single file by filename (supports nested paths)
	router.POST("/api/content/:collection", content.CreateContentFileHandler)         // Create new file
	router.PUT("/api/content/:collection/:file", content.UpdateContentFileHandler)    // Update file
	router.DELETE("/api/content/:collection/:file", content.DeleteContentFileHandler) // Delete file
}
