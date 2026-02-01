import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Parse advanced search query with operators
function parseSearchQuery(query) {
  const operators = {
    title: [],      // title:keyword
    tag: [],        // tag:tagname
    content: [],    // content:keyword
    exact: [],      // "exact phrase"
    exclude: [],    // -keyword
    or: [],         // keyword1 OR keyword2
    general: []     // regular search terms
  };

  if (!query) return operators;

  // Extract quoted exact phrases first
  const exactPhraseRegex = /"([^"]+)"/g;
  let match;
  while ((match = exactPhraseRegex.exec(query)) !== null) {
    operators.exact.push(match[1]);
  }
  query = query.replace(exactPhraseRegex, '');

  // Extract operators
  const parts = query.split(/\s+/).filter(Boolean);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.startsWith('title:')) {
      operators.title.push(part.slice(6));
    } else if (part.startsWith('tag:')) {
      operators.tag.push(part.slice(4));
    } else if (part.startsWith('content:')) {
      operators.content.push(part.slice(8));
    } else if (part.startsWith('-')) {
      operators.exclude.push(part.slice(1));
    } else if (part === 'OR' && i > 0 && i < parts.length - 1) {
      // Handle OR operator
      const prev = operators.general.pop();
      if (prev) {
        operators.or.push([prev, parts[i + 1]]);
        i++; // Skip next term
      }
    } else {
      operators.general.push(part);
    }
  }

  return operators;
}

export async function GET(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const tag = searchParams.get('tag');
    const folderId = searchParams.get('folder');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const caseSensitive = searchParams.get('caseSensitive') === 'true';
    const useRegex = searchParams.get('regex') === 'true';

    if (!query && !tag) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    // Parse the advanced query
    const operators = parseSearchQuery(query);

    let dbQuery = supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    // Build title filters
    if (operators.title.length > 0) {
      for (const term of operators.title) {
        dbQuery = dbQuery.ilike('title', `%${term}%`);
      }
    }

    // Build content filters
    if (operators.content.length > 0) {
      for (const term of operators.content) {
        dbQuery = dbQuery.ilike('content', `%${term}%`);
      }
    }

    // Build tag filters
    if (operators.tag.length > 0 || tag) {
      const allTags = [...operators.tag];
      if (tag) allTags.push(tag);
      for (const t of allTags) {
        dbQuery = dbQuery.contains('tags', [t]);
      }
    }

    // Build exact phrase filters
    if (operators.exact.length > 0) {
      for (const phrase of operators.exact) {
        dbQuery = dbQuery.or(`title.ilike.%${phrase}%,content.ilike.%${phrase}%`);
      }
    }

    // Build general search (searches both title and content)
    if (operators.general.length > 0) {
      for (const term of operators.general) {
        dbQuery = dbQuery.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
      }
    }

    // Build OR filters
    if (operators.or.length > 0) {
      for (const [term1, term2] of operators.or) {
        dbQuery = dbQuery.or(
          `title.ilike.%${term1}%,content.ilike.%${term1}%,title.ilike.%${term2}%,content.ilike.%${term2}%`
        );
      }
    }

    // Date range filters
    if (dateFrom) {
      dbQuery = dbQuery.gte('created_at', dateFrom);
    }
    if (dateTo) {
      dbQuery = dbQuery.lte('created_at', dateTo);
    }

    // Filter by folder
    if (folderId) {
      dbQuery = dbQuery.eq('folder_id', folderId);
    }

    // Order by relevance (updated_at as proxy)
    dbQuery = dbQuery.order('updated_at', { ascending: false }).limit(100);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Post-process: exclude terms (can't do NOT in Supabase easily)
    let results = data || [];
    if (operators.exclude.length > 0) {
      results = results.filter(note => {
        const text = `${note.title} ${note.content}`.toLowerCase();
        return !operators.exclude.some(term => text.includes(term.toLowerCase()));
      });
    }

    // Post-process: regex matching (if enabled)
    if (useRegex && operators.general.length > 0) {
      try {
        const regex = new RegExp(operators.general.join('|'), caseSensitive ? '' : 'i');
        results = results.filter(note => 
          regex.test(note.title) || regex.test(note.content)
        );
      } catch (e) {
        // Invalid regex, ignore
      }
    }

    // Add match highlights/context
    const resultsWithContext = results.map(note => {
      let matchContext = '';
      const searchTerms = [...operators.general, ...operators.exact];
      
      if (searchTerms.length > 0 && note.content) {
        for (const term of searchTerms) {
          const index = note.content.toLowerCase().indexOf(term.toLowerCase());
          if (index !== -1) {
            const start = Math.max(0, index - 50);
            const end = Math.min(note.content.length, index + term.length + 50);
            matchContext = note.content.slice(start, end);
            if (start > 0) matchContext = '...' + matchContext;
            if (end < note.content.length) matchContext = matchContext + '...';
            break;
          }
        }
      }

      return {
        ...note,
        matchContext
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: resultsWithContext,
      count: resultsWithContext.length,
      totalCount: count
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
