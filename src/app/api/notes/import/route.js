import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/notes/import - Import notes from various formats
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notes: importData, format = 'json' } = body;

    if (!importData) {
      return NextResponse.json({ success: false, error: 'No data provided' }, { status: 400 });
    }

    const importedNotes = [];
    const errors = [];

    // Handle different formats
    if (format === 'json') {
      const notesArray = Array.isArray(importData) ? importData : [importData];
      
      for (const noteData of notesArray) {
        try {
          const { data, error } = await supabase
            .from('notes')
            .insert({
              user_id: user.id,
              title: noteData.title || 'Imported Note',
              content: noteData.content || '',
              tags: noteData.tags || [],
              is_favorite: noteData.is_favorite || false,
              is_pinned: noteData.is_pinned || false,
            })
            .select()
            .single();

          if (error) {
            errors.push({ note: noteData.title, error: error.message });
          } else {
            importedNotes.push(data);
          }
        } catch (err) {
          errors.push({ note: noteData.title, error: 'Failed to import' });
        }
      }
    } else if (format === 'markdown') {
      // Import single markdown content
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: importData.title || 'Imported Note',
          content: importData.content,
          tags: importData.tags || [],
        })
        .select()
        .single();

      if (error) {
        errors.push({ note: importData.title, error: error.message });
      } else {
        importedNotes.push(data);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: importedNotes.length,
        failed: errors.length,
        notes: importedNotes,
        errors,
      },
      message: `Imported ${importedNotes.length} note(s)${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
    });
  } catch (error) {
    console.error('Error importing notes:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
