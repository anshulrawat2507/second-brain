import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notes/[id]/versions - Get all versions of a note
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

    // First verify the note belongs to the user
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Get all versions
    const { data: versions, error } = await supabase
      .from('note_versions')
      .select('*')
      .eq('note_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch versions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error('Error in versions GET:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notes/[id]/versions - Create a new version snapshot
export async function POST(
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

    const body = await request.json();
    const { content, snapshot_type = 'auto' } = body;

    // Verify the note belongs to the user and get current content
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id, content')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Create version with provided content or current note content
    const { data: version, error } = await supabase
      .from('note_versions')
      .insert({
        note_id: id,
        content: content || note.content,
        snapshot_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating version:', error);
      return NextResponse.json({ success: false, error: 'Failed to create version' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: version });
  } catch (error) {
    console.error('Error in versions POST:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
