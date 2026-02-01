'use server';

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch all bookmarks
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id);

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter by tag
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,url.ilike.%${search}%`);
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: bookmarks, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get all unique categories and tags for filters
    const categories = [...new Set(bookmarks.map(b => b.category).filter(Boolean))];
    const allTags = [...new Set(bookmarks.flatMap(b => b.tags || []))];

    return NextResponse.json({ 
      success: true, 
      data: bookmarks,
      meta: { categories, tags: allTags }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create a new bookmark
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      url, 
      title, 
      description = '',
      favicon_url,
      preview_image_url,
      category = '',
      tags = []
    } = body;

    if (!url || !url.trim()) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    // Auto-fetch metadata if title not provided
    let finalTitle = title;
    let finalFavicon = favicon_url;
    let finalPreview = preview_image_url;
    let finalDescription = description;

    if (!title) {
      const metadata = await fetchUrlMetadata(url);
      finalTitle = metadata.title || new URL(url).hostname;
      finalFavicon = metadata.favicon || finalFavicon;
      finalPreview = metadata.image || finalPreview;
      finalDescription = metadata.description || finalDescription;
    }

    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        url: url.trim(),
        title: finalTitle,
        description: finalDescription,
        favicon_url: finalFavicon,
        preview_image_url: finalPreview,
        category,
        tags,
        click_count: 0
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: bookmark });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper function to fetch URL metadata
async function fetchUrlMetadata(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SecondBrain/1.0)'
      }
    });
    clearTimeout(timeoutId);

    const html = await response.text();
    
    // Parse title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    
    // Parse description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    
    // Parse image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    
    // Parse favicon
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
    
    const baseUrl = new URL(url);
    let favicon = faviconMatch?.[1];
    if (favicon && !favicon.startsWith('http')) {
      favicon = favicon.startsWith('/') 
        ? `${baseUrl.origin}${favicon}`
        : `${baseUrl.origin}/${favicon}`;
    }
    if (!favicon) {
      favicon = `${baseUrl.origin}/favicon.ico`;
    }

    return {
      title: ogTitleMatch?.[1] || titleMatch?.[1] || '',
      description: ogDescMatch?.[1] || descMatch?.[1] || '',
      image: ogImageMatch?.[1] || '',
      favicon
    };
  } catch (error) {
    return { title: '', description: '', image: '', favicon: '' };
  }
}
