'use server';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST - Check for broken links
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('id, url, title')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Check each bookmark
    const results = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const status = await checkUrl(bookmark.url);
        return {
          id: bookmark.id,
          url: bookmark.url,
          title: bookmark.title,
          ...status
        };
      })
    );

    const brokenLinks = results.filter(r => !r.isValid);

    return NextResponse.json({ 
      success: true, 
      data: {
        total: bookmarks.length,
        checked: results.length,
        broken: brokenLinks.length,
        brokenLinks
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SecondBrain/1.0)'
      }
    });
    clearTimeout(timeoutId);

    return {
      isValid: response.ok,
      statusCode: response.status,
      error: response.ok ? null : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      isValid: false,
      statusCode: null,
      error: error.name === 'AbortError' ? 'Timeout' : error.message
    };
  }
}
