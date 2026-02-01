import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notes/[id]/export - Export a note in various formats
export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'markdown';
    
    const supabase = await createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    let content;
    let contentType;
    let filename;

    switch (format) {
      case 'json':
        content = JSON.stringify({
          title: note.title,
          content: note.content,
          tags: note.tags,
          created_at: note.created_at,
          updated_at: note.updated_at,
        }, null, 2);
        contentType = 'application/json';
        filename = `${note.title || 'note'}.json`;
        break;
      
      case 'html':
        content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${note.title || 'Note'}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; }
    code { background: #f4f4f4; padding: 0.2rem 0.4rem; }
  </style>
</head>
<body>
  <h1>${note.title || 'Untitled'}</h1>
  <div class="meta">
    <p>Created: ${new Date(note.created_at).toLocaleDateString()}</p>
    ${note.tags?.length ? `<p>Tags: ${note.tags.map((t) => `#${t}`).join(' ')}</p>` : ''}
  </div>
  <hr>
  <div class="content">
    ${note.content.replace(/\n/g, '<br>')}
  </div>
</body>
</html>`;
        contentType = 'text/html';
        filename = `${note.title || 'note'}.html`;
        break;
      
      case 'txt':
        content = `${note.title || 'Untitled'}\n${'='.repeat(50)}\n\n${note.content}\n\n---\nTags: ${note.tags?.join(', ') || 'None'}\nCreated: ${new Date(note.created_at).toLocaleDateString()}`;
        contentType = 'text/plain';
        filename = `${note.title || 'note'}.txt`;
        break;
      
      default: // markdown
        content = note.content;
        contentType = 'text/markdown';
        filename = `${note.title || 'note'}.md`;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting note:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
