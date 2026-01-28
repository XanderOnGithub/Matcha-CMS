package cms

import (
	"net/http"
	"os"
	"strings" // Added this to fix the "undefined: strings" error

	"github.com/go-chi/chi/v5"
)

func HandleGetPage(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "*")
	if slug == "" {
		slug = "home"
	}

	path, _ := findFile(slug)
	content, err := os.ReadFile(path)
	if err != nil {
		http.Error(w, "Page not found", 404)
		return
	}

	// We need to split the content here so we can access 'parts'
	parts := strings.Split(string(content), "+++")
	
	var rawMeta, rawBody string
	if len(parts) >= 3 {
		rawMeta = parts[1]
		rawBody = parts[2]
	} else {
		rawBody = string(content)
	}

	renderJSON(w, Page{
		Slug:     slug,
		Metadata: parseMetadata(rawMeta),
		Body:     mdxToHTML(rawBody),
		Raw:      strings.TrimSpace(rawBody), // The raw markdown for the editor
	})
}