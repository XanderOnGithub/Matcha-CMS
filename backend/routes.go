package main

import (
    "net/http"
    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
    "matcha-cms/internal/features/cms" 
)

func RegisterRoutes(r *chi.Mux) {
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Matcha is steeped and ready."))
    })

    r.Route("/api/pages", func(r chi.Router) {
        // Most specific route first!
        r.Get("/", cms.HandleListPages) 
        
        // Create page
		r.Post("/", cms.HandleCreatePage)

        // Wildcard route last
        r.Get("/*", cms.HandleGetPage) 
        r.Put("/*", cms.HandleEditPage)
        r.Delete("/*", cms.HandleDeletePage)
    })
}