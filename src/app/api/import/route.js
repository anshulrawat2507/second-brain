import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateId, extractTitle, extractTags, countWords, countCharacters } from '@/lib/utils';

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { format, data } = body;

    if (!format || !data) {
      return NextResponse.json({ success: false, error: 'Format and data are required' }, { status: 400 });
    }

    const importedNotes = [];
    const importedFolders = [];

    if (format === 'json') {
      // Import from JSON backup
      const importData = typeof data === 'string' ? JSON.parse(data) : data;

      // Import folders first (to maintain references)
      if (importData.folders?.length > 0) {
        const folderIdMap = {};

        for (const folder of importData.folders) {
          const { data: newFolder, error } = await supabase
            .from('folders')
            .insert({
              user_id: user.id,
              name: folder.name,
              color: folder.color,
              // parent_folder_id will be updated after all folders are created
            })
            .select()
            .single();

          if (!error && newFolder) {
            folderIdMap[folder.id] = newFolder.id;
            importedFolders.push(newFolder);
          }
        }

        // Update parent folder references
        for (const folder of importData.folders) {
          if (folder.parent_folder_id && folderIdMap[folder.parent_folder_id]) {
            await supabase
              .from('folders')
              .update({ parent_folder_id: folderIdMap[folder.parent_folder_id] })
              .eq('id', folderIdMap[folder.id]);
          }
        }
      }

      // Import notes
      if (importData.notes?.length > 0) {
        for (const note of importData.notes) {
          const { data: newNote, error } = await supabase
            .from('notes')
            .insert({
              user_id: user.id,
              title: note.title || 'Imported Note',
              content: note.content || '',
              file_path: `/${generateId()}.md`,
              tags: note.tags || [],
              is_favorite: note.is_favorite || false,
              word_count: countWords(note.content || ''),
              character_count: countCharacters(note.content || ''),
            })
            .select()
            .single();

          if (!error && newNote) {
            importedNotes.push(newNote);
          }
        }
      }
    }

    if (format === 'markdown') {
      // Import markdown content as a single note
      const content = data;
      const title = extractTitle(content) || 'Imported Note';

      const { data: newNote, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title,
          content,
          file_path: `/${generateId()}.md`,
          tags: extractTags(content),
          word_count: countWords(content),
          character_count: countCharacters(content),
        })
        .select()
        .single();

      if (!error && newNote) {
        importedNotes.push(newNote);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        notesImported: importedNotes.length,
        foldersImported: importedFolders.length,
        notes: importedNotes,
        folders: importedFolders,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
