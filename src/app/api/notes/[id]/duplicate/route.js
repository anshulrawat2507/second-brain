import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/notes/[id]/duplicate - Duplicate a note
export async function POST(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get original note
    const { data: originalNote, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !originalNote) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Create duplicate
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: `${originalNote.title} (Copy)`,
        content: originalNote.content,
        folder_id: originalNote.folder_id,
        tags: originalNote.tags,
        is_favorite: false,
        is_pinned: false,
        is_quick_note: originalNote.is_quick_note,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating note:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Note duplicated'
    });
  } catch (error) {
    console.error('Error in duplicate:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
