'use server';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST - Export bookmarks
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { format = 'json' } = body;

    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (format === 'html') {
      // Export as HTML bookmarks file
      const html = generateHtmlBookmarks(bookmarks);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': 'attachment; filename="bookmarks.html"'
        }
      });
    } else {
      // Export as JSON
      return NextResponse.json({ 
        success: true, 
        data: bookmarks,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateHtmlBookmarks(bookmarks) {
  const grouped = {};
  
  bookmarks.forEach(b => {
    const cat = b.category || 'Uncategorized';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(b);
  });

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  for (const [category, items] of Object.entries(grouped)) {
    html += `    <DT><H3>${escapeHtml(category)}</H3>\n    <DL><p>\n`;
    
    for (const bookmark of items) {
      const addDate = Math.floor(new Date(bookmark.created_at).getTime() / 1000);
      html += `        <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${addDate}"${bookmark.favicon_url ? ` ICON="${escapeHtml(bookmark.favicon_url)}"` : ''}>${escapeHtml(bookmark.title)}</A>\n`;
      if (bookmark.description) {
        html += `        <DD>${escapeHtml(bookmark.description)}\n`;
      }
    }
    
    html += `    </DL><p>\n`;
  }

  html += `</DL><p>`;
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
