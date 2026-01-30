package content

// ContentFile represents a parsed MDX file with metadata and content
type ContentFile struct {
	Filename string                 // e.g., "about.mdx"
	Meta     map[string]interface{} // Flexible metadata from frontmatter
	Content  string                 // The MDX/markdown content
}

// Collection represents a collection schema (like TinaCMS)
type Collection struct {
	Name   string     // e.g., "pages", "blog"
	Fields []FieldDef // Field definitions
	Path   string     // Directory path for this collection
}

// FieldDef defines a field in a collection
type FieldDef struct {
	Name     string // e.g., "title", "slug"
	Type     string // e.g., "string", "number", "date"
	Required bool
}
