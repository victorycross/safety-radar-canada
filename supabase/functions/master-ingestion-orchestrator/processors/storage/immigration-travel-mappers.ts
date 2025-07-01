
import { AlertSource } from '../../types.ts';

export function mapImmigrationTravelAnnouncements(processedAnnouncements: any[], source: AlertSource): any[] {
  console.log(`🗺️ [Immigration Travel Mapper] Starting mapping for ${source.name}`);
  console.log(`🗺️ [Immigration Travel Mapper] Input announcements count: ${processedAnnouncements.length}`);
  
  const mappedAnnouncements = processedAnnouncements.map((announcement, index) => {
    console.log(`🗺️ [Immigration Travel Mapper] Mapping announcement ${index + 1}/${processedAnnouncements.length}`);
    
    // Handle both RSS and Atom feed IDs
    const announcementId = announcement.id || announcement.guid || announcement.link || `${source.source_type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Clean up HTML content from Atom feeds
    let cleanSummary = announcement.summary || announcement.description || '';
    let cleanContent = announcement.content || '';
    
    if (cleanSummary) {
      cleanSummary = cleanSummary
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA wrapper
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
        .trim();
      
      if (cleanSummary.length > 2000) {
        cleanSummary = cleanSummary.substring(0, 1997) + '...';
      }
    }
    
    if (cleanContent) {
      cleanContent = cleanContent
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/<[^>]*>/g, '')
        .replace(/&[a-zA-Z0-9#]+;/g, ' ')
        .trim();
    }
    
    // Determine announcement type based on content
    const title = announcement.title || 'Untitled Announcement';
    const titleLower = title.toLowerCase();
    const summaryLower = cleanSummary.toLowerCase();
    
    let announcementType = 'general';
    if (titleLower.includes('citizenship') || summaryLower.includes('citizenship')) {
      announcementType = 'citizenship';
    } else if (titleLower.includes('immigration') || summaryLower.includes('immigration')) {
      announcementType = 'immigration';
    } else if (titleLower.includes('refugee') || summaryLower.includes('refugee')) {
      announcementType = 'refugee';
    } else if (titleLower.includes('travel') || summaryLower.includes('travel')) {
      announcementType = 'travel';
    }
    
    const mappedAnnouncement = {
      id: announcementId,
      title: title,
      summary: cleanSummary || 'No summary available',
      content: cleanContent,
      link: announcement.url || announcement.link,
      pub_date: announcement.published || announcement.pubDate || announcement.updated || new Date().toISOString(),
      source: source.name,
      category: announcement.category || 'general',
      announcement_type: announcementType,
      location: 'Canada',
      raw_data: announcement
    };
    
    // Validate required fields
    if (!mappedAnnouncement.title || mappedAnnouncement.title.trim() === '') {
      console.warn(`🗺️ [Immigration Travel Mapper] Warning: Announcement ${index + 1} has empty title, using fallback`);
      mappedAnnouncement.title = 'Government Announcement';
    }
    
    // Clean up title from CDATA
    if (mappedAnnouncement.title.includes('CDATA')) {
      mappedAnnouncement.title = mappedAnnouncement.title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    }
    
    if (index === 0) {
      console.log(`🗺️ [Immigration Travel Mapper] Sample mapped announcement:`, JSON.stringify(mappedAnnouncement, null, 2));
    }
    
    return mappedAnnouncement;
  });
  
  console.log(`🗺️ [Immigration Travel Mapper] Successfully mapped ${mappedAnnouncements.length} announcements`);
  return mappedAnnouncements;
}
