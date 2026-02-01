import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/notes/[id]/versions/[versionId]/restore - Restore a note to a previous version
export async function POST(
  request,
  { params }
) {
  try {
    const { id, versionId } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the note belongs to the user
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id, content')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('note_versions')
      .select('content')
      .eq('id', versionId)
      .eq('note_id', id)
      .single();

    if (versionError || !version) {
      return NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 });
    }

    // Save current content as a new version before restoring
    await supabase
      .from('note_versions')
      .insert({
        note_id: id,
        content: note.content,
        snapshot_type: 'auto',
      });

    // Update the note with the restored content
    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update({ content: version.content })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error restoring version:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to restore version' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error('Error in version restore:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
