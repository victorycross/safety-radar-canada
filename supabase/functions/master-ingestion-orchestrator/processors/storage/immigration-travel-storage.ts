
import { AlertSource } from '../../types.ts';
import { mapImmigrationTravelAnnouncements } from './immigration-travel-mappers.ts';

export async function storeImmigrationTravelAnnouncements(supabaseClient: any, processedAnnouncements: any[], source: AlertSource): Promise<number> {
  console.log(`🏛️ [Immigration Travel Storage] Starting storage process for ${source.name}`);
  console.log(`🏛️ [Immigration Travel Storage] Input announcements count: ${processedAnnouncements.length}`);
  
  if (processedAnnouncements.length === 0) {
    console.log(`🏛️ [Immigration Travel Storage] No announcements to process - returning 0`);
    return 0;
  }

  try {
    console.log(`🏛️ [Immigration Travel Storage] Mapping ${processedAnnouncements.length} announcements for source: ${source.name}`);
    console.log(`🏛️ [Immigration Travel Storage] Sample raw announcement:`, JSON.stringify(processedAnnouncements[0], null, 2));
    
    const mappedAnnouncements = mapImmigrationTravelAnnouncements(processedAnnouncements, source);
    
    console.log(`🏛️ [Immigration Travel Storage] Mapped ${mappedAnnouncements.length} announcements`);
    console.log(`🏛️ [Immigration Travel Storage] Sample mapped announcement:`, JSON.stringify(mappedAnnouncements[0], null, 2));

    console.log(`🏛️ [Immigration Travel Storage] Attempting database upsert...`);
    const { data: insertedAnnouncements, error: insertError } = await supabaseClient
      .from('immigration_travel_announcements')
      .upsert(mappedAnnouncements, { onConflict: 'id' })
      .select();

    if (insertError) {
      console.error(`🏛️ [Immigration Travel Storage] Database error for ${source.name}:`, insertError);
      console.error(`🏛️ [Immigration Travel Storage] Error details:`, JSON.stringify(insertError, null, 2));
      return 0;
    }

    const storedCount = insertedAnnouncements?.length || 0;
    console.log(`🏛️ [Immigration Travel Storage] Successfully stored ${storedCount} announcements for ${source.name}`);
    
    if (storedCount !== mappedAnnouncements.length) {
      console.warn(`🏛️ [Immigration Travel Storage] Warning: Mapped ${mappedAnnouncements.length} announcements but stored ${storedCount}`);
    }
    
    return storedCount;
  } catch (error) {
    console.error(`🏛️ [Immigration Travel Storage] Unexpected error in storeImmigrationTravelAnnouncements:`, error);
    console.error(`🏛️ [Immigration Travel Storage] Error stack:`, error.stack);
    return 0;
  }
}
