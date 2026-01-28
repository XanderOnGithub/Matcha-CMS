package main

import (
	"net/http"
	"github.com/go-chi/chi/v5"
)

func main() {
	r := chi.NewRouter()

	// Import routes from our routes.go file
	RegisterRoutes(r)

	println("Matcha Backend starting on :8080")
	http.ListenAndServe(":8080", r)
}