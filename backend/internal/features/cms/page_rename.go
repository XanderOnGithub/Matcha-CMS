package cms

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type RenameRequest struct {
	OldSlug string `json:"old_slug"`
	NewSlug string `json:"new_slug"`
}

func HandleRenamePage(w http.ResponseWriter, r *http.Request) {
	var req RenameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", 400)
		return
	}

	oldSlug := filepath.Clean(req.OldSlug)
	newSlug := filepath.Clean(req.NewSlug)

	oldPath := filepath.Join(contentRoot, oldSlug+".mdx")
	newPath := filepath.Join(contentRoot, newSlug+".mdx")

	// Prevent path traversal outside contentRoot
	if rel, err := filepath.Rel(contentRoot, oldPath); err != nil || strings.HasPrefix(rel, "..") {
		http.Error(w, "Invalid source path", 400)
		return
	}
	if rel, err := filepath.Rel(contentRoot, newPath); err != nil || strings.HasPrefix(rel, "..") {
		http.Error(w, "Invalid target path", 400)
		return
	}

	// Ensure source exists
	if _, err := os.Stat(oldPath); os.IsNotExist(err) {
		http.Error(w, "Source file does not exist", 404)
		return
	} else if err != nil {
		http.Error(w, "Failed to access source file", 500)
		return
	}

	// Ensure destination doesn't already exist
	if _, err := os.Stat(newPath); err == nil {
		http.Error(w, "Target name already exists", 409)
		return
	} else if !os.IsNotExist(err) {
		http.Error(w, "Failed to access target path", 500)
		return
	}

	// Ensure the NEW directory exists
	newDir := filepath.Dir(newPath)
	if err := os.MkdirAll(newDir, 0755); err != nil {
		http.Error(w, "Failed to create destination directory", 500)
		return
	}

	if err := os.Rename(oldPath, newPath); err != nil {
		http.Error(w, "Failed to rename file", 500)
		return
	}

	renderJSON(w, map[string]string{"new_slug": req.NewSlug})
}