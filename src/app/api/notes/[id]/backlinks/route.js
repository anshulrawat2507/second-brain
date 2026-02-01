import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notes/[id]/backlinks - Get all notes that link to this note
export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current note to find its title
    const { data: currentNote, error: noteError } = await supabase
      .from('notes')
      .select('id, title')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (noteError || !currentNote) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Find all notes that contain [[title]] or [[id]] links to this note
    const { data: backlinks, error } = await supabase
      .from('notes')
      .select('id, title, content, updated_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .neq('id', id)
      .or(`content.ilike.%[[${currentNote.title}]]%,content.ilike.%[[${id}]]%`);

    if (error) {
      console.error('Error fetching backlinks:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch backlinks' }, { status: 500 });
    }

    // Extract the specific linking context for each backlink
    const backlinksWithContext = (backlinks || []).map(note => {
      const linkPattern = new RegExp(`\\[\\[(${currentNote.title}|${id})\\]\\]`, 'gi');
      const matches = note.content.match(linkPattern) || [];
      
      // Find surrounding context for the first match
      let context = '';
      const firstMatchIndex = note.content.search(linkPattern);
      if (firstMatchIndex !== -1) {
        const start = Math.max(0, firstMatchIndex - 50);
        const end = Math.min(note.content.length, firstMatchIndex + 100);
        context = note.content.substring(start, end);
        if (start > 0) context = '...' + context;
        if (end < note.content.length) context = context + '...';
      }

      return {
        id: note.id,
        title: note.title,
        updated_at: note.updated_at,
        link_count: matches.length,
        context,
      };
    });

    return NextResponse.json({ success: true, data: backlinksWithContext });
  } catch (error) {
    console.error('Error in backlinks GET:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
