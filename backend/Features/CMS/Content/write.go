package content

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// CreateContentFileHandler creates a new MDX file
func CreateContentFileHandler(ctx *gin.Context) {
	collection := ctx.Param("collection")

	var body struct {
		Filename string                 `json:"filename"`
		Meta     map[string]interface{} `json:"meta"`
		Content  string                 `json:"content"`
	}

	if err := ctx.BindJSON(&body); err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	// Build file path
	filePath := contentPath + "/" + collection + "/" + body.Filename
	println("Creating file at:", filePath)

	// Check if file already exists
	if _, err := os.Stat(filePath); err == nil {
		ctx.JSON(409, gin.H{"error": "File already exists"})
		return
	}

	// Create directory if it doesn't exist
	dir := filepath.Dir(filePath)
	os.MkdirAll(dir, 0755)

	// Convert meta to frontmatter string
	frontmatter := metaToFrontmatter(body.Meta)

	// Create MDX content (frontmatter + content)
	mdxContent := fmt.Sprintf("---\n%s\n---\n%s", frontmatter, body.Content)

	// Write file
	if err := os.WriteFile(filePath, []byte(mdxContent), 0644); err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to create file"})
		println("Error creating file:", err.Error())
		return
	}

	ctx.JSON(201, gin.H{"message": "File created successfully"})
}

// UpdateContentFileHandler updates an existing MDX file (supports renaming)
func UpdateContentFileHandler(ctx *gin.Context) {
	collection := ctx.Param("collection")
	filename := ctx.Param("file")

	var body struct {
		NewFilename string                 `json:"newFilename"` // For renaming
		Meta        map[string]interface{} `json:"meta"`
		Content     string                 `json:"content"`
	}

	if err := ctx.BindJSON(&body); err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	// Build file path
	filePath := contentPath + "/" + collection + "/" + filename
	println("Updating file at:", filePath)

	// Check if file exists
	if _, err := os.Stat(filePath); err != nil {
		ctx.JSON(404, gin.H{"error": "File not found"})
		return
	}

	// Handle renaming if newFilename is provided
	if body.NewFilename != "" && body.NewFilename != filename {
		newFilePath := contentPath + "/" + collection + "/" + body.NewFilename

		// Create new directory structure if needed
		newDir := filepath.Dir(newFilePath)
		os.MkdirAll(newDir, 0755)

		// Move old file to new location
		if err := os.Rename(filePath, newFilePath); err != nil {
			ctx.JSON(500, gin.H{"error": "Failed to rename file"})
			println("Error renaming file:", err.Error())
			return
		}

		// Handle renaming associated folder
		// e.g., discovery.mdx → explore.mdx, also rename discovery/ → explore/
		oldName := strings.TrimSuffix(filename, filepath.Ext(filename))
		newName := strings.TrimSuffix(body.NewFilename, filepath.Ext(body.NewFilename))

		oldFolderPath := contentPath + "/" + collection + "/" + oldName
		newFolderPath := contentPath + "/" + collection + "/" + newName

		if _, err := os.Stat(oldFolderPath); err == nil {
			// Folder exists, rename it too
			os.Rename(oldFolderPath, newFolderPath)
		}

		filePath = newFilePath
	}

	// Convert meta to frontmatter string
	frontmatter := metaToFrontmatter(body.Meta)

	// Create MDX content (frontmatter + content)
	mdxContent := fmt.Sprintf("---\n%s\n---\n%s", frontmatter, body.Content)

	// Write file
	if err := os.WriteFile(filePath, []byte(mdxContent), 0644); err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to update file"})
		println("Error updating file:", err.Error())
		return
	}

	ctx.JSON(200, gin.H{"message": "File updated successfully"})
}

// DeleteContentFileHandler deletes an MDX file and moves children up one level
func DeleteContentFileHandler(ctx *gin.Context) {
	collection := ctx.Param("collection")
	filename := ctx.Param("file")

	// Build file path
	filePath := contentPath + "/" + collection + "/" + filename
	println("Deleting file at:", filePath)

	// Check if file exists
	if _, err := os.Stat(filePath); err != nil {
		ctx.JSON(404, gin.H{"error": "File not found"})
		return
	}

	// Get the folder name that corresponds to this file
	// e.g., discovery.mdx → discovery/
	fileNameWithoutExt := strings.TrimSuffix(filename, filepath.Ext(filename))
	folderPath := contentPath + "/" + collection + "/" + fileNameWithoutExt

	// If there's a matching folder with children, move them up
	if entries, err := os.ReadDir(folderPath); err == nil && len(entries) > 0 {
		// Move all children up one level
		for _, entry := range entries {
			oldPath := filepath.Join(folderPath, entry.Name())
			newPath := contentPath + "/" + collection + "/" + entry.Name()

			if err := os.Rename(oldPath, newPath); err != nil {
				println("Error moving child:", err.Error())
			}
		}
	}

	// Delete the file
	if err := os.Remove(filePath); err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to delete file"})
		println("Error deleting file:", err.Error())
		return
	}

	// Clean up the now-empty folder
	if err := os.Remove(folderPath); err == nil {
		println("Removed empty folder:", folderPath)
	}

	ctx.JSON(200, gin.H{"message": "File deleted successfully, children moved up"})
}

// metaToFrontmatter converts a meta map to YAML frontmatter string
func metaToFrontmatter(meta map[string]interface{}) string {
	var lines []string
	for key, value := range meta {
		lines = append(lines, fmt.Sprintf("%s: %v", key, value))
	}
	return strings.Join(lines, "\n")
}

// cleanupEmptyDirs removes empty directories up to the collection root
func cleanupEmptyDirs(dir string, collectionRoot string) {
	for dir != collectionRoot && dir != filepath.Dir(dir) {
		entries, err := os.ReadDir(dir)
		if err != nil {
			break
		}

		if len(entries) == 0 {
			os.Remove(dir)
			dir = filepath.Dir(dir)
		} else {
			break
		}
	}
}
