package cms

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type CreatePageRequest struct {
	Title  string `json:"title"`
	Parent string `json:"parent"` // e.g., "root" or "work" or "projects/web"
}

func HandleCreatePage(w http.ResponseWriter, r *http.Request) {
	var req CreatePageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", 400)
		return
	}

	// 1. Determine the directory
	targetDir := contentRoot
	if req.Parent != "root" && req.Parent != "" {
		targetDir = filepath.Join(contentRoot, req.Parent)
	}

	// 2. Create the directory if it doesn't exist (MkdirAll is recursive)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		http.Error(w, "Failed to create folder structure", 500)
		return
	}

	// 3. Generate slug and path
	slug := strings.ToLower(strings.ReplaceAll(req.Title, " ", "-"))
	fullPath := filepath.Join(targetDir, slug+".mdx")

	// 4. Check for existence
	if _, err := os.Stat(fullPath); err == nil {
		http.Error(w, "Page already exists here", 409)
		return
	}

	// 5. Write the file
	content := fmt.Sprintf("+++\ntitle = %q\n+++\n\n#", req.Title,)
	os.WriteFile(fullPath, []byte(content), 0644)

	// Return the relative slug for the frontend to navigate
	relSlug := slug
	if req.Parent != "root" && req.Parent != "" {
		relSlug = filepath.Join(req.Parent, slug)
	}
	
	renderJSON(w, map[string]string{"slug": relSlug})
}