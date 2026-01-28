package main

import (
	"net/http"
	"github.com/go-chi/chi/v5"
)

func main() {
	r := createRouter()

	println("Server starting on http://localhost:8080")
	http.ListenAndServe(":8080", r)
}

func createRouter() *chi.Mux {
	r := chi.NewRouter()

	// Define routes here

	r.Get("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		// We send a JSON object back
		w.Write([]byte(`{"message": "Matcha API is working!"}`))
	})

	// The {slug} is a wildcard. It could be "home", "about", etc.
	r.Get("/api/pages/{slug}", func(w http.ResponseWriter, r *http.Request) {
		slug := chi.URLParam(r, "slug")
		
		// We look specifically in the /pages folder
		filePath := fmt.Sprintf("content/pages/%s.mdx", slug)
		
		content, err := os.ReadFile(filePath)
		if err != nil {
			http.Error(w, "Page not found", 404)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		// For now, we just send the raw string
		w.Write([]byte(fmt.Sprintf(`{"slug": "%s", "raw": %q}`, slug, string(content))))
	})
	
	return r
}