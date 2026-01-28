package cms

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

const contentRoot = "../content/pages"

func findFile(slug string) (string, error) {
	path := fmt.Sprintf("%s/%s.mdx", contentRoot, slug)
	if _, err := os.Stat(path); err != nil {
		path = fmt.Sprintf("%s/%s/index.mdx", contentRoot, slug)
	}
	return path, nil
}

func walkPages() ([]string, error) {
	var pages []string
	err := filepath.WalkDir(contentRoot, func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		if filepath.Ext(path) == ".mdx" {
			rel, _ := filepath.Rel(contentRoot, path)
			slug := strings.TrimSuffix(rel, ".mdx")
			slug = strings.TrimSuffix(slug, "/index")
			pages = append(pages, slug)
		}
		return nil
	})
	return pages, err
}