import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/notes/[id]/pin - Toggle pin status
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

    // Get current note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('is_pinned')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    // Toggle pin
    const { data, error } = await supabase
      .from('notes')
      .update({ is_pinned: !note.is_pinned })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling pin:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: data.is_pinned ? 'Pinned to top' : 'Unpinned'
    });
  } catch (error) {
    console.error('Error in pin toggle:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
