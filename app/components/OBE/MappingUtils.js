export const CORRELATION_LEVELS = [
    { value: 0, label: 'N/A', color: 'default', description: 'No correlation' },
    { value: 1, label: '1', color: 'warning', description: 'Slight correlation' },
    { value: 2, label: '2', color: 'primary', description: 'Moderate correlation' },
    { value: 3, label: '3', color: 'success', description: 'Strong correlation' },
  ];
  
  export const COGNITIVE_LEVELS = {
    Remember: { color: 'gray', description: 'Recall or recognize information' },
    Understand: { color: 'blue', description: 'Comprehend the meaning of information' },
    Apply: { color: 'indigo', description: 'Use information in new situations' },
    Analyze: { color: 'orange', description: 'Break down information into components' },
    Evaluate: { color: 'teal', description: 'Make judgments based on criteria' },
    Create: { color: 'pink', description: 'Produce new or original work' },
    'N/A': { color: 'gray', description: 'Not applicable' },
  };
  
  export const initializeLocalMappings = (data, setLocalMappings) => {
    const mappings = {};
    data.mappings?.forEach(({ courseOutcomeId, programOutcomeId, outcomeType, correlationLevel, justification }) => {
      if (!mappings[courseOutcomeId]) mappings[courseOutcomeId] = {};
      mappings[courseOutcomeId][`${outcomeType}-${programOutcomeId}`] = {
        level: correlationLevel,
        justification: justification || '',
      };
    });
    setLocalMappings(mappings);
  };
  
  export const calculateStats = (data, setStats) => {
    if (!data) return;
    const totalMappings = data.mappings.filter((m) => m.correlationLevel > 0).length;
    const possibleMappings = data.courseOutcomes.length * (data.programOutcomes.pos.length + data.programOutcomes.psos.length);
    const byLevel = { 1: 0, 2: 0, 3: 0 };
    const byType = { PO: 0, PSO: 0 };
    const byCO = {};
    data.courseOutcomes.forEach((co) => (byCO[co.id] = 0));
    data.mappings.forEach((mapping) => {
      if (mapping.correlationLevel > 0) {
        byLevel[mapping.correlationLevel]++;
        byType[mapping.outcomeType]++;
        byCO[mapping.courseOutcomeId]++;
      }
    });
    setStats({
      total: totalMappings,
      coverage: possibleMappings > 0 ? (totalMappings / possibleMappings) * 100 : 0,
      byLevel,
      byType,
      byCO,
    });
  };
  
  export const downloadMapping = (mappingData, localMappings, subject, academicYear) => {
    if (!mappingData) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    let headers = ['Course Outcome', 'Description'];
    [...mappingData.programOutcomes.pos, ...mappingData.programOutcomes.psos].forEach((po) => {
      headers.push(`${po.type}${po.index}`);
    });
    csvContent += headers.join(',') + '\r\n';
    mappingData.courseOutcomes.forEach((co) => {
      let row = [`CO${co.index}`, `"${co.description.replace(/"/g, '""')}"`];
      [...mappingData.programOutcomes.pos, ...mappingData.programOutcomes.psos].forEach((po) => {
        const correlationLevel = localMappings[co.id]?.[`${po.type}-${po.id}`]?.level || 0;
        row.push(correlationLevel);
      });
      csvContent += row.join(',') + '\r\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CO-PO_Mapping_${subject}_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };