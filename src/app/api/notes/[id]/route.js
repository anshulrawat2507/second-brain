import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { countWords, countCharacters, extractTitle, extractTags } from '@/lib/utils';

// GET a single note by ID
export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ data: note, success: true });
  } catch (error) {
    console.error('Error in GET /api/notes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update a note
export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if note exists and belongs to user
    const { data: existingNote, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, folder_id, is_favorite, is_deleted, color, tags: providedTags } = body;

    // Auto-extract tags from content if not provided
    const tags = providedTags !== undefined ? providedTags : (content ? extractTags(content) : existingNote.tags);

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title || extractTitle(content || existingNote.content);
    if (content !== undefined) {
      updates.content = content;
      updates.word_count = countWords(content);
      updates.character_count = countCharacters(content);
    }
    if (folder_id !== undefined) updates.folder_id = folder_id;
    if (is_favorite !== undefined) updates.is_favorite = is_favorite;
    if (is_deleted !== undefined) updates.is_deleted = is_deleted;
    if (color !== undefined) updates.color = color;
    if (tags !== undefined) updates.tags = tags;

    const { data: note, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }

    return NextResponse.json({ data: note, success: true });
  } catch (error) {
    console.error('Error in PUT /api/notes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a note (soft delete)
export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for permanent delete flag
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // Permanently delete the note
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error permanently deleting note:', error);
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
      }
    } else {
      // Soft delete - move to trash
      const { error } = await supabase
        .from('notes')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error soft deleting note:', error);
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/notes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
