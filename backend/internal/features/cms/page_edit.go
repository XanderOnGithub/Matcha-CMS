package cms

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"

	"github.com/go-chi/chi/v5"
)

type EditPageRequest struct {
	Body     string            `json:"body"`
	Metadata map[string]string `json:"metadata"`
}

func HandleEditPage(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "*")
	if slug == "" {
		http.Error(w, "Slug is required", 400)
		return
	}

	var req EditPageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", 400)
		return
	}

	path, err := findFile(slug)
	if err != nil {
		http.Error(w, "File not found", 404)
		return
	}

	// 1. Read existing file to capture the metadata block
	oldBytes, err := os.ReadFile(path)
	if err != nil {
		http.Error(w, "Error reading file", 500)
		return
	}

	// 2. Split existing file to inspect metadata
	parts := strings.Split(string(oldBytes), "+++")
	var newFileContent string

	// If the client provided a metadata map, reconstruct the metadata block
	if req.Metadata != nil && len(req.Metadata) > 0 {
		// Deterministic ordering: sort keys for stable output
		var keys []string
		for k := range req.Metadata {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		var metaLines []string
		for _, k := range keys {
			metaLines = append(metaLines, fmt.Sprintf("%s = %q", k, req.Metadata[k]))
		}
		metaBlock := strings.Join(metaLines, "\n")
		newFileContent = fmt.Sprintf("+++\n%s\n+++\n\n%s", metaBlock, strings.TrimSpace(req.Body))

	} else if len(parts) >= 3 {
		// Preserve the existing metadata block if no metadata was supplied
		metadata := strings.TrimSpace(parts[1])
		newFileContent = fmt.Sprintf("+++\n%s\n+++\n\n%s", metadata, strings.TrimSpace(req.Body))

	} else {
		// No metadata anywhere; save only the body
		newFileContent = strings.TrimSpace(req.Body)
	}

	// 3. Write back to disk
	if err := os.WriteFile(path, []byte(newFileContent), 0644); err != nil {
		http.Error(w, "Error writing to disk", 500)
		return
	}

	renderJSON(w, map[string]string{"status": "success", "message": "Page updated"})
}