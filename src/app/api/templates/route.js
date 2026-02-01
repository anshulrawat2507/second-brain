import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Built-in templates (cannot be deleted)
const builtInTemplates = [
  {
    id: 'blank',
    name: 'Blank Note',
    icon: '📝',
    content: '# Untitled\n\nStart writing...',
    is_builtin: true,
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    icon: '📋',
    content: `# Meeting Notes

**Date:** {{date}}
**Attendees:** 

---

## Agenda
- 

## Discussion
- 

## Action Items
- [ ] 

## Next Steps
- 
`,
    is_builtin: true,
  },
  {
    id: 'journal',
    name: 'Daily Journal',
    icon: '📔',
    content: `# Journal - {{date}}

## Morning Thoughts


## Today's Goals
- [ ] 
- [ ] 
- [ ] 

## Gratitude
1. 
2. 
3. 

## Reflections


## Tomorrow's Focus

`,
    is_builtin: true,
  },
  {
    id: 'project',
    name: 'Project Brief',
    icon: '🚀',
    content: `# Project: [Name]

## Overview


## Goals
- 

## Requirements
- 

## Timeline
| Phase | Date | Status |
|-------|------|--------|
| Planning | | ⏳ |
| Development | | ⏳ |
| Testing | | ⏳ |
| Launch | | ⏳ |

## Resources
- 

## Notes

`,
    is_builtin: true,
  },
  {
    id: 'todo',
    name: 'Todo List',
    icon: '✅',
    content: `# Todo List

## High Priority
- [ ] 

## Medium Priority
- [ ] 

## Low Priority
- [ ] 

## Done
- [x] 
`,
    is_builtin: true,
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming',
    icon: '💡',
    content: `# Brainstorming: [Topic]

## Main Idea


## Related Ideas
- 
- 
- 

## Pros
+ 

## Cons
- 

## Questions
? 

## Next Steps

`,
    is_builtin: true,
  },
  {
    id: 'weekly',
    name: 'Weekly Review',
    icon: '📅',
    content: `# Weekly Review - Week of {{date}}

## Accomplishments
- 

## Challenges
- 

## Lessons Learned
- 

## Next Week's Goals
- [ ] 
- [ ] 
- [ ] 

## Notes

`,
    is_builtin: true,
  },
  {
    id: 'reading',
    name: 'Reading Notes',
    icon: '📚',
    content: `# Book: [Title]

**Author:** 
**Started:** {{date}}
**Finished:** 

## Summary


## Key Takeaways
1. 
2. 
3. 

## Favorite Quotes
> 

## How This Applies To Me


## Rating: /5
`,
    is_builtin: true,
  },
];

// Process template variables
function processTemplateContent(content) {
  const now = new Date();
  return content
    .replace(/\{\{date\}\}/g, now.toLocaleDateString())
    .replace(/\{\{time\}\}/g, now.toLocaleTimeString())
    .replace(/\{\{datetime\}\}/g, now.toLocaleString())
    .replace(/\{\{year\}\}/g, now.getFullYear().toString())
    .replace(/\{\{month\}\}/g, (now.getMonth() + 1).toString().padStart(2, '0'))
    .replace(/\{\{day\}\}/g, now.getDate().toString().padStart(2, '0'));
}

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get custom templates if user is authenticated
    let customTemplates = [];
    if (user) {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        customTemplates = data.map(t => ({ ...t, is_builtin: false }));
      }
    }

    // Combine built-in and custom templates
    const allTemplates = [...builtInTemplates, ...customTemplates].map(t => ({
      ...t,
      content: processTemplateContent(t.content)
    }));

    return NextResponse.json({ success: true, data: allTemplates });
  } catch (error) {
    console.error('Templates error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, content } = body;

    if (!name || !content) {
      return NextResponse.json({ success: false, error: 'Name and content are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name,
        icon: icon || '📄',
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Create template error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Templates error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create template' }, { status: 500 });
  }
}
