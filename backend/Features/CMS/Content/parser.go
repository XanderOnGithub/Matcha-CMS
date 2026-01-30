package content

import (
	"strings"
)

// MDXFile represents a parsed MDX file with frontmatter and content
type MDXFile struct {
	Frontmatter map[string]interface{}
	Content     string
}

// ParseMDX parses the MDX file content into frontmatter and content
func ParseMDX(fileContent string) MDXFile {
	// Check if file starts with frontmatter delimiter
	if !strings.HasPrefix(fileContent, "---") {
		return MDXFile{
			Frontmatter: make(map[string]interface{}),
			Content:     fileContent,
		}
	}

	// Remove leading --- and split by the next ---
	parts := strings.SplitN(fileContent[3:], "---", 2)

	if len(parts) < 2 {
		// No closing delimiter found
		return MDXFile{
			Frontmatter: make(map[string]interface{}),
			Content:     fileContent,
		}
	}

	frontmatter := parseFrontmatter(parts[0])

	return MDXFile{
		Frontmatter: frontmatter,
		Content:     strings.TrimSpace(parts[1]),
	}
}

func parseFrontmatter(fm string) map[string]interface{} {
	result := make(map[string]interface{})
	lines := strings.Split(strings.TrimSpace(fm), "\n")

	for _, line := range lines {
		if strings.Contains(line, ":") {
			parts := strings.SplitN(line, ":", 2)
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])

			// If value contains commas, split into array
			if strings.Contains(value, ",") {
				items := strings.Split(value, ",")
				for i, item := range items {
					items[i] = strings.TrimSpace(item)
				}
				result[key] = items
			} else {
				result[key] = value
			}
		}
	}

	return result
}
