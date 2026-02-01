'use server';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Find orphaned notes (notes that have no backlinks and don't link to others)
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all notes
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, content, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Build a map of note titles for lookup
    const noteTitles = new Map(notes.map(n => [n.title.toLowerCase(), n.id]));

    // For each note, check if it links to other notes and if other notes link to it
    const noteStats = notes.map(note => {
      // Find outgoing links (this note links to others)
      const wikiLinkPattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
      const outgoingLinks = [];
      let match;
      
      while ((match = wikiLinkPattern.exec(note.content || '')) !== null) {
        const linkTitle = match[1].split('#')[0].trim().toLowerCase();
        if (noteTitles.has(linkTitle)) {
          outgoingLinks.push(noteTitles.get(linkTitle));
        }
      }

      return {
        id: note.id,
        title: note.title,
        outgoingLinks,
        incomingLinks: [],
        created_at: note.created_at,
        updated_at: note.updated_at
      };
    });

    // Calculate incoming links for each note
    const statsMap = new Map(noteStats.map(n => [n.id, n]));
    
    noteStats.forEach(note => {
      note.outgoingLinks.forEach(targetId => {
        const target = statsMap.get(targetId);
        if (target) {
          target.incomingLinks.push(note.id);
        }
      });
    });

    // Find orphaned notes (no incoming or outgoing links)
    const orphanedNotes = noteStats.filter(note => 
      note.incomingLinks.length === 0 && note.outgoingLinks.length === 0
    ).map(n => ({
      id: n.id,
      title: n.title,
      created_at: n.created_at,
      updated_at: n.updated_at
    }));

    // Find leaf notes (have no outgoing links, only incoming)
    const leafNotes = noteStats.filter(note => 
      note.incomingLinks.length > 0 && note.outgoingLinks.length === 0
    ).map(n => ({
      id: n.id,
      title: n.title,
      incomingCount: n.incomingLinks.length
    }));

    // Find hub notes (have many outgoing links)
    const hubNotes = noteStats
      .filter(note => note.outgoingLinks.length >= 3)
      .sort((a, b) => b.outgoingLinks.length - a.outgoingLinks.length)
      .slice(0, 10)
      .map(n => ({
        id: n.id,
        title: n.title,
        outgoingCount: n.outgoingLinks.length
      }));

    return NextResponse.json({ 
      success: true, 
      data: {
        orphaned: orphanedNotes,
        orphanedCount: orphanedNotes.length,
        leaves: leafNotes,
        hubs: hubNotes,
        totalNotes: notes.length
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
