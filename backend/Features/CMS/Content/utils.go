package content

import (
	"os/user"
	"path/filepath"
)

// GetContentPath returns the absolute path to the content directory
func GetContentPath() string {
	usr, _ := user.Current()
	return filepath.Join(usr.HomeDir, "Documents/Projects/matcha-cms/content")
}
