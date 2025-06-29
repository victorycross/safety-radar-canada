
export async function runCorrelationAnalysis(supabaseClient: any) {
  try {
    console.log('Running correlation analysis...');
    
    // Get recent incidents for correlation (last 24 hours)
    const { data: recentIncidents, error } = await supabaseClient
      .from('incidents')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });
    
    if (error || !recentIncidents?.length) {
      console.log('No recent incidents for correlation analysis');
      return;
    }
    
    // Simple correlation logic - find incidents with similar titles or descriptions
    const correlations: any[] = [];
    
    for (let i = 0; i < recentIncidents.length; i++) {
      for (let j = i + 1; j < recentIncidents.length; j++) {
        const incident1 = recentIncidents[i];
        const incident2 = recentIncidents[j];
        
        const similarity = calculateSimilarity(incident1, incident2);
        
        if (similarity > 0.7) {
          correlations.push({
            primary_incident_id: incident1.id,
            related_incident_id: incident2.id,
            correlation_type: 'semantic',
            confidence_score: similarity
          });
        }
      }
    }
    
    if (correlations.length > 0) {
      await supabaseClient
        .from('alert_correlations')
        .upsert(correlations, { onConflict: 'primary_incident_id,related_incident_id' });
      
      console.log(`Created ${correlations.length} correlations`);
    }
    
  } catch (error) {
    console.error('Correlation analysis error:', error);
  }
}

function calculateSimilarity(incident1: any, incident2: any): number {
  // Simple similarity calculation based on title and description overlap
  const title1 = incident1.title.toLowerCase();
  const title2 = incident2.title.toLowerCase();
  const desc1 = incident1.description.toLowerCase();
  const desc2 = incident2.description.toLowerCase();
  
  // Calculate word overlap
  const words1 = new Set([...title1.split(' '), ...desc1.split(' ')]);
  const words2 = new Set([...title2.split(' '), ...desc2.split(' ')]);
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
