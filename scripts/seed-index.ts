// scripts/seed-docs.ts
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'
import { chunkMarkdown } from '@/lib/data/chunker'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const openai = new OpenAI()

async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // Cheaper than ada-002
    input: text,
    encoding_format: 'base64'
  })
  return response.data[0].embedding
}

async function seedDocs() {
  const docsDir = path.join(process.cwd(), 'docs')
  
  // Process main docs
  const mainFiles = ['ADMIN_GUIDE.md', 'API.md', 'CONFIGURATION.md', 'SCHEMA_REFERENCE.md']
  for (const file of mainFiles) {
    const content = await fs.readFile(path.join(docsDir, file), 'utf-8')
    const chunks = chunkMarkdown(content, { filename: file, category: 'main' })
    
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content)
      
      await supabase.from('doc_chunks').insert({
        filename: chunk.metadata.filename,
        category: chunk.metadata.category,
        heading: chunk.metadata.heading,
        content: chunk.content,
        embedding,
        token_count: Math.ceil(chunk.content.length / 4)
      })
    }
    
    console.log(`Processed ${file}: ${chunks.length} chunks`)
  }
  
  // Process diagrams
  const diagramsDir = path.join(docsDir, 'diagrams')
  const diagramFiles = await fs.readdir(diagramsDir)
  
  for (const file of diagramFiles.filter(f => f.endsWith('.md'))) {
    const content = await fs.readFile(path.join(diagramsDir, file), 'utf-8')
    const chunks = chunkMarkdown(content, { filename: file, category: 'diagram' })
    
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content)
      
      await supabase.from('doc_chunks').insert({
        filename: chunk.metadata.filename,
        category: chunk.metadata.category,
        heading: chunk.metadata.heading,
        content: chunk.content,
        embedding,
        token_count: Math.ceil(chunk.content.length / 4)
      })
    }
    
    console.log(`Processed ${file}: ${chunks.length} chunks`)
  }
}

seedDocs()