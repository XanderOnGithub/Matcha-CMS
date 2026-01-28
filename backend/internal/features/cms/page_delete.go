package cms

import (
	"net/http"
	"os"
	"path/filepath"
	"github.com/go-chi/chi/v5"
)

func HandleDeletePage(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "*")
	if slug == "" || slug == "home" {
		http.Error(w, "Cannot delete protected page", 400)
		return
	}

	path, err := findFile(slug)
	if err != nil {
		http.Error(w, "File not found", 404)
		return
	}

	// 1. Delete the file
	if err := os.Remove(path); err != nil {
		http.Error(w, "Failed to delete file", 500)
		return
	}

	// 2. Clean up empty parent directories (Optional but "Pro")
	parentDir := filepath.Dir(path)
	// We check if the directory is empty. If it is, remove it.
	// os.Remove will fail if the directory is NOT empty, which is exactly what we want.
	os.Remove(parentDir) 

	renderJSON(w, map[string]string{"status": "success"})
}