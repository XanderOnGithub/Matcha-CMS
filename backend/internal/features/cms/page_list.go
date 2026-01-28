package cms

import "net/http"

func HandleListPages(w http.ResponseWriter, r *http.Request) {
	pages, err := walkPages()
	if err != nil {
		http.Error(w, "Failed to scan content", 500)
		return
	}
	renderJSON(w, pages)
}