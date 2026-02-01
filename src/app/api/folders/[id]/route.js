import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET a single folder by ID
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

    const { data: folder, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ data: folder, success: true });
  } catch (error) {
    console.error('Error in GET /api/folders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update a folder
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

    // Check if folder exists and belongs to user
    const { data: existingFolder, error: fetchError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, parent_folder_id, color, icon, sort_order } = body;

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (parent_folder_id !== undefined) updates.parent_folder_id = parent_folder_id;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data: folder, error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating folder:', error);
      return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
    }

    return NextResponse.json({ data: folder, success: true });
  } catch (error) {
    console.error('Error in PUT /api/folders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a folder
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

    // First, move all notes in this folder to no folder
    await supabase
      .from('notes')
      .update({ folder_id: null })
      .eq('folder_id', id)
      .eq('user_id', user.id);

    // Move all child folders to no parent
    await supabase
      .from('folders')
      .update({ parent_folder_id: null })
      .eq('parent_folder_id', id)
      .eq('user_id', user.id);

    // Delete the folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting folder:', error);
      return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/folders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
