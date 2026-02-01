'use server';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch all todos for user
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'completed', 'archived'
    const priority = searchParams.get('priority');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .is('parent_id', null); // Only get top-level todos

    // Filter by status
    if (status === 'active') {
      query = query.eq('completed', false).eq('is_archived', false);
    } else if (status === 'completed') {
      query = query.eq('completed', true).eq('is_archived', false);
    } else if (status === 'archived') {
      query = query.eq('is_archived', true);
    } else {
      query = query.eq('is_archived', false);
    }

    // Filter by priority
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: todos, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Fetch sub-tasks for each todo
    const todoIds = todos.map(t => t.id);
    const { data: subtasks } = await supabase
      .from('todos')
      .select('*')
      .in('parent_id', todoIds)
      .order('sort_order', { ascending: true });

    // Attach subtasks to their parents
    const todosWithSubtasks = todos.map(todo => ({
      ...todo,
      subtasks: subtasks?.filter(s => s.parent_id === todo.id) || []
    }));

    return NextResponse.json({ success: true, data: todosWithSubtasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create a new todo
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      task, 
      priority = 'medium', 
      due_date, 
      recurring = 'none', 
      tags = [], 
      note_id,
      parent_id,
      sort_order = 0
    } = body;

    if (!task || task.trim() === '') {
      return NextResponse.json({ success: false, error: 'Task is required' }, { status: 400 });
    }

    const { data: todo, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        task: task.trim(),
        priority,
        due_date,
        recurring,
        tags,
        note_id,
        parent_id,
        sort_order,
        completed: false,
        is_archived: false
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { ...todo, subtasks: [] } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
