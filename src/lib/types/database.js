// Database constants for Second Brain
// Note: Types removed - this is JavaScript

// Default user settings
export const defaultUserSettings = {
  theme: 'purple-noir',
  font_size: 16,
  font_family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  line_height: 1.6,
  editor_width: 'medium',
  auto_save_interval: 2000,
  show_line_numbers: true,
  show_word_count: true,
  crt_effects: false,
  scanline_intensity: 30,
  sidebar_position: 'left',
  default_editor_mode: 'edit',
};

// Default note
export const defaultNote = {
  id: '',
  user_id: '',
  title: 'Untitled',
  content: '',
  file_path: '',
  folder_id: null,
  tags: [],
  is_favorite: false,
  is_quick_note: false,
  is_deleted: false,
  color: null,
  created_at: '',
  updated_at: '',
  word_count: 0,
  character_count: 0,
};

// Default folder
export const defaultFolder = {
  id: '',
  user_id: '',
  name: '',
  parent_folder_id: null,
  color: null,
  icon: null,
  is_expanded: true,
  order_index: 0,
  created_at: '',
  updated_at: '',
};

// Note version
export const defaultNoteVersion = {
  id: '',
  note_id: '',
  title: '',
  content: '',
  version_number: 1,
  created_at: '',
};

// Template
export const defaultTemplate = {
  id: '',
  user_id: '',
  name: '',
  description: '',
  content: '',
  category: '',
  icon: '',
  is_default: false,
  created_at: '',
  updated_at: '',
};

// Available templates
export const templates = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Template for meeting notes with agenda and action items',
    content: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:**\n\n## Agenda\n\n1. \n2. \n3. \n\n## Discussion\n\n\n## Action Items\n\n- [ ] \n- [ ] \n\n## Next Steps\n\n`,
    category: 'work',
    icon: '📋',
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Daily reflection and gratitude journal',
    content: `# Journal - ${new Date().toLocaleDateString()}\n\n## Morning Thoughts\n\n\n## Today I am grateful for\n\n1. \n2. \n3. \n\n## Goals for Today\n\n- [ ] \n- [ ] \n- [ ] \n\n## Evening Reflection\n\n`,
    category: 'personal',
    icon: '📓',
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Project planning template with milestones',
    content: `# Project: [Name]\n\n## Overview\n\n\n## Goals\n\n- \n- \n\n## Timeline\n\n| Phase | Start | End | Status |\n|-------|-------|-----|--------|\n| Planning | | | |\n| Development | | | |\n| Testing | | | |\n| Launch | | | |\n\n## Resources\n\n\n## Risks\n\n`,
    category: 'work',
    icon: '📊',
  },
  {
    id: 'learning-notes',
    name: 'Learning Notes',
    description: 'Notes for learning a new topic or skill',
    content: `# Learning: [Topic]\n\n## Key Concepts\n\n\n## Notes\n\n\n## Questions\n\n- \n\n## Resources\n\n- \n\n## Summary\n\n`,
    category: 'learning',
    icon: '📚',
  },
  {
    id: 'blank',
    name: 'Blank Note',
    description: 'Start with a clean slate',
    content: '# ',
    category: 'general',
    icon: '📝',
  },
];
