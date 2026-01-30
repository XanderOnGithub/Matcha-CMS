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

	// Walk through content directory and get all files (recursive)
	err := filepath.WalkDir(collectionPath, func(path string, d os.DirEntry, walkErr error) error {
		if walkErr != nil {
			println("Error reading path:", walkErr.Error())
			return nil
		}

		if d.IsDir() {
			return nil
		}

		if filepath.Ext(d.Name()) != ".mdx" {
			return nil
		}

		content, err := os.ReadFile(path)
		if err != nil {
			println("Error reading file:", err.Error())
			return nil
		}

		rel, err := filepath.Rel(collectionPath, path)
		if err != nil {
			println("Error building relative path:", err.Error())
			return nil
		}

		rel = filepath.ToSlash(rel)

		mdxFile := ParseMDX(string(content))
		files[rel] = ContentFile{
			Filename: rel,
			Meta:     mdxFile.Frontmatter,
			Content:  mdxFile.Content,
		}

		return nil
	})
	if err != nil {
		println("Error walking content directory:", err.Error())
		return files
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
	if len(file) > 0 && file[0] == '/' {
		file = file[1:]
	}
	contentFile := GetContentFile(collection, file)
	ctx.JSON(200, contentFile)
}
