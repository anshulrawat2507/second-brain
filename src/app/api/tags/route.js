import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET all tags for the user
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get unique tags from all notes
    const { data: notes, error } = await supabase
      .from('notes')
      .select('tags')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Aggregate and count tags
    const tagCounts = {};
    notes?.forEach((note) => {
      note.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    console.error('Tags error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new tag (optional - for tag management)
export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Tag name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id: user.id,
        name: name.toLowerCase().trim(),
        color: color || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'Tag already exists' }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
