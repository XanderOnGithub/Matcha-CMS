package content

import (
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// Get content path
var contentPath = GetContentPath()

func GetContentFiles(collection string) map[string]ContentFile {

	// Build collection path
	collectionPath := contentPath + "/" + collection
	println("Collection path is:", collectionPath)

	files := make(map[string]ContentFile)

	// Walk through content directory and get all files
	entries, err := os.ReadDir(collectionPath)
	if err != nil {
		println("Error reading content directory:", err.Error())
		return files
	}

	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".mdx" {
			filePath := filepath.Join(collectionPath, entry.Name())
			content, err := os.ReadFile(filePath)
			if err != nil {
				println("Error reading file:", err.Error())
				continue
			}

			mdxFile := ParseMDX(string(content))
			files[entry.Name()] = ContentFile{
				Filename: entry.Name(),
				Meta:     mdxFile.Frontmatter,
				Content:  mdxFile.Content,
			}
		}
	}

	return files
}

func GetContentFile(collection string, filename string) ContentFile {

	// Build file path
	filePath := contentPath + "/" + collection + "/" + filename
	println("File path is:", filePath)

	content, err := os.ReadFile(filePath)
	if err != nil {
		println("Error reading file:", err.Error())
		return ContentFile{}
	}

	mdxFile := ParseMDX(string(content))
	return ContentFile{
		Filename: filename,
		Meta:     mdxFile.Frontmatter,
		Content:  mdxFile.Content,
	}
}

func GetContentFilesHandler(ctx *gin.Context) {
	collection := ctx.Param("collection")
	files := GetContentFiles(collection)
	ctx.JSON(200, files)
}

func GetContentFileHandler(ctx *gin.Context) {
	collection := ctx.Param("collection")
	file := ctx.Param("file")
	contentFile := GetContentFile(collection, file)
	ctx.JSON(200, contentFile)
}
