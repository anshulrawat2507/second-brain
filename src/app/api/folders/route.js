import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateId } from '@/lib/utils';

// GET all folders for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's folders
    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching folders:', error);
      return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
    }

    return NextResponse.json({ data: folders, success: true });
  } catch (error) {
    console.error('Error in GET /api/folders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new folder
export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, parent_folder_id = null, color = null, icon = null } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // Get the next sort order
    const { data: existingFolders } = await supabase
      .from('folders')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextSortOrder = existingFolders && existingFolders.length > 0 
      ? existingFolders[0].sort_order + 1 
      : 0;

    const newFolder = {
      id: generateId(),
      user_id: user.id,
      name: name.trim(),
      parent_folder_id,
      color,
      icon,
      sort_order: nextSortOrder,
    };

    const { data: folder, error } = await supabase
      .from('folders')
      .insert(newFolder)
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }

    return NextResponse.json({ data: folder, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/folders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
