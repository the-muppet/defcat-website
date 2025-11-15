export function chunkMarkdown(content: string, metadata: {
  filename: string
  category: string
}) {
  const chunks: Array<{
    content: string
    metadata: typeof metadata & { heading?: string }
  }> = []

  // Split by headers
  const sections = content.split(/^(#{1,3}\s+.+)$/gm)
  
  let currentHeading = ''
  let currentContent = ''
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    
    // If it's a header
    if (/^#{1,3}\s+/.test(section)) {
      // Save previous chunk
      if (currentContent.trim()) {
        chunks.push({
          content: currentContent.trim(),
          metadata: { ...metadata, heading: currentHeading }
        })
      }
      currentHeading = section.replace(/^#+\s+/, '')
      currentContent = ''
    } else {
      currentContent += section
      
      // If chunk is getting too large (>1000 tokens ~4000 chars), split it
      if (currentContent.length > 4000) {
        chunks.push({
          content: currentContent.trim(),
          metadata: { ...metadata, heading: currentHeading }
        })
        currentContent = ''
      }
    }
  }
  
  // Save final chunk
  if (currentContent.trim()) {
    chunks.push({
      content: currentContent.trim(),
      metadata: { ...metadata, heading: currentHeading }
    })
  }
  
  return chunks
}