package cms

import (
	"encoding/json"
	"net/http"
)

type Page struct {
	Slug     string            `json:"slug"`
	Metadata map[string]string `json:"metadata"`
	Body     string            `json:"body"`
	Raw      string            `json:"raw"`  
}

// Every page_ action uses this, so it lives here in the shared types file
func renderJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}