package cms

import (
	"bytes"
	"strings"
	"github.com/yuin/goldmark"
)

func parseFullContent(content []byte) (map[string]string, string) {
	parts := strings.Split(string(content), "+++")
	var rawMeta, rawBody string
	if len(parts) >= 3 {
		rawMeta = parts[1]
		rawBody = parts[2]
	} else {
		rawBody = string(content)
	}
	return parseMetadata(rawMeta), mdxToHTML(rawBody)
}

func parseMetadata(rawBlock string) map[string]string {
	metadata := make(map[string]string)
	for _, line := range strings.Split(rawBlock, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || !strings.Contains(line, "=") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		metadata[strings.TrimSpace(parts[0])] = strings.Trim(strings.TrimSpace(parts[1]), "\"")
	}
	return metadata
}

func mdxToHTML(rawBody string) string {
	var buf bytes.Buffer
	if err := goldmark.Convert([]byte(rawBody), &buf); err != nil {
		return "<p>Error brewing markdown</p>"
	}
	return buf.String()
}