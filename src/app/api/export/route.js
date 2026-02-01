import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    const noteId = searchParams.get('noteId');

    // Export single note or all notes
    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (noteId) {
      query = query.eq('id', noteId);
    }

    const { data: notes, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Also get folders for full export
    const { data: folders } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id);

    if (format === 'json') {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        notes: notes?.map((note) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          tags: note.tags,
          folder_id: note.folder_id,
          is_favorite: note.is_favorite,
          created_at: note.created_at,
          updated_at: note.updated_at,
        })),
        folders: folders?.map((folder) => ({
          id: folder.id,
          name: folder.name,
          parent_folder_id: folder.parent_folder_id,
          color: folder.color,
        })),
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="second-brain-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    if (format === 'markdown') {
      // Single note markdown export
      if (noteId && notes?.length === 1) {
        const note = notes[0];
        const markdown = `# ${note.title}\n\n${note.content}`;
        
        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${note.title.replace(/[^a-z0-9]/gi, '-')}.md"`,
          },
        });
      }

      // Multiple notes - create a combined markdown
      let markdown = '# Second Brain Export\n\n';
      markdown += `Exported: ${new Date().toLocaleString()}\n\n---\n\n`;

      notes?.forEach((note) => {
        markdown += `## ${note.title}\n\n`;
        markdown += `*Created: ${new Date(note.created_at).toLocaleDateString()}*\n\n`;
        markdown += `${note.content}\n\n---\n\n`;
      });

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="second-brain-export-${new Date().toISOString().split('T')[0]}.md"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
