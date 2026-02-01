import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/graph - Get graph data for all notes and their connections
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all non-deleted notes
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, content, tags, is_favorite, updated_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (error) {
      console.error('Error fetching notes for graph:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
    }

    // Create nodes
    const nodes = (notes || []).map(note => ({
      id: note.id,
      title: note.title,
      tags: note.tags || [],
      is_favorite: note.is_favorite,
      updated_at: note.updated_at,
    }));

    // Create a map of titles to IDs for quick lookup
    const titleToId = new Map();
    notes?.forEach(note => {
      titleToId.set(note.title.toLowerCase(), note.id);
    });

    // Find links between notes using [[wiki-link]] syntax
    const links = [];
    const linkPattern = /\[\[([^\]]+)\]\]/g;

    notes?.forEach(note => {
      const matches = note.content.matchAll(linkPattern);
      for (const match of matches) {
        const linkedTitle = match[1].toLowerCase();
        const targetId = titleToId.get(linkedTitle);
        
        if (targetId && targetId !== note.id) {
          // Avoid duplicate links
          const linkExists = links.some(
            l => (l.source === note.id && l.target === targetId) ||
                 (l.source === targetId && l.target === note.id)
          );
          
          if (!linkExists) {
            links.push({
              source: note.id,
              target: targetId,
            });
          }
        }
      }
    });

    // Also create links based on shared tags
    const tagToNotes = new Map();
    notes?.forEach(note => {
      (note.tags || []).forEach((tag) => {
        if (!tagToNotes.has(tag)) {
          tagToNotes.set(tag, []);
        }
        tagToNotes.get(tag).push(note.id);
      });
    });

    // Add weak links for notes sharing tags (optional - can be filtered by client)
    const tagLinks = [];
    tagToNotes.forEach((noteIds) => {
      if (noteIds.length > 1) {
        for (let i = 0; i < noteIds.length - 1; i++) {
          for (let j = i + 1; j < noteIds.length; j++) {
            const linkExists = links.some(
              l => (l.source === noteIds[i] && l.target === noteIds[j]) ||
                   (l.source === noteIds[j] && l.target === noteIds[i])
            ) || tagLinks.some(
              l => (l.source === noteIds[i] && l.target === noteIds[j]) ||
                   (l.source === noteIds[j] && l.target === noteIds[i])
            );
            
            if (!linkExists) {
              tagLinks.push({
                source: noteIds[i],
                target: noteIds[j],
              });
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        links,        // Direct [[wiki-link]] connections
        tagLinks,     // Connections via shared tags
      },
    });
  } catch (error) {
    console.error('Error in graph GET:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
