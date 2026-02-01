import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateId, generateFilePath, countWords, countCharacters, extractTitle, extractTags } from '@/lib/utils';

// GET all notes for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's notes
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({ data: notes, success: true });
  } catch (error) {
    console.error('Error in GET /api/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new note
export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content = '', folder_id = null, is_quick_note = false } = body;

    const noteId = generateId();
    const noteTitle = title || extractTitle(content) || 'Untitled';
    const filePath = generateFilePath(user.id, noteTitle, is_quick_note);
    const tags = extractTags(content);

    const newNote = {
      id: noteId,
      user_id: user.id,
      title: noteTitle,
      content,
      file_path: filePath,
      folder_id,
      tags,
      is_favorite: false,
      is_quick_note,
      is_deleted: false,
      color: null,
      word_count: countWords(content),
      character_count: countCharacters(content),
    };

    const { data: note, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json({ data: note, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
