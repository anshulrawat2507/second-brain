'use server';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch single todo with subtasks
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: todo, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    // Fetch subtasks
    const { data: subtasks } = await supabase
      .from('todos')
      .select('*')
      .eq('parent_id', id)
      .order('sort_order', { ascending: true });

    return NextResponse.json({ 
      success: true, 
      data: { ...todo, subtasks: subtasks || [] } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH - Update a todo
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Build update object
    const updates = {};
    const allowedFields = ['task', 'completed', 'priority', 'due_date', 'recurring', 'tags', 'is_archived', 'sort_order'];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // If marking as completed, set completed_at
    if (body.completed === true) {
      updates.completed_at = new Date().toISOString();
    } else if (body.completed === false) {
      updates.completed_at = null;
    }

    const { data: todo, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Handle recurring todo - create next occurrence
    if (body.completed === true && todo.recurring !== 'none') {
      const nextDueDate = calculateNextDueDate(todo.due_date, todo.recurring);
      
      await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          task: todo.task,
          priority: todo.priority,
          due_date: nextDueDate,
          recurring: todo.recurring,
          tags: todo.tags,
          note_id: todo.note_id,
          completed: false,
          is_archived: false
        });
    }

    // Fetch subtasks
    const { data: subtasks } = await supabase
      .from('todos')
      .select('*')
      .eq('parent_id', id)
      .order('sort_order', { ascending: true });

    return NextResponse.json({ 
      success: true, 
      data: { ...todo, subtasks: subtasks || [] } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a todo and its subtasks
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete subtasks first
    await supabase
      .from('todos')
      .delete()
      .eq('parent_id', id)
      .eq('user_id', user.id);

    // Delete the main todo
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper function to calculate next due date for recurring todos
function calculateNextDueDate(currentDueDate, recurring) {
  const date = new Date(currentDueDate || new Date());
  
  switch (recurring) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      break;
  }
  
  return date.toISOString();
}
