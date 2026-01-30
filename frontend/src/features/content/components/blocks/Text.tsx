interface TextProps {
    tag: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    content: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export function Text({ tag, content, align = 'left', className = '' }: TextProps) {
    const Tag = tag;
    const alignmentClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    return (
        <Tag className={`${alignmentClass} ${className}`}>
            {content}
        </Tag>
    );
}