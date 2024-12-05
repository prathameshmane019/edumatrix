import * as XLSX from 'xlsx';
import { 
  formatDateForDisplay, 
  formatDateForStorage, 
  parseFlexibleDate 
} from './dateFormater';

export const handleExcelUpload = async (file, subject) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
console.log(subject);

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1, 
    raw: false, 
    dateNF: 'dd/MM/yyyy' 
  });

  const contentData = jsonData.slice(1).filter(row => row.some(cell => cell));

  switch (subject) {
    case 'practical':
      return contentData.map(row => ({
        title: row[0] || '',
        description: row[1] || '',
        references: row[2] || '',
        courseOutcomes: row[3] || '',
        programOutcomes: row[4] || '',
        batchStatus: parseBatchStatus(row.slice(5), jsonData[0].slice(5))
      }));
    case 'theory':
      return contentData.map(row => ({
        title: row[0] || '',
        description: row[1] || '',
        references: row[2] || '',
        proposedDate: parseFlexibleDate(row[3]) ? formatDateForStorage(row[3]) : null,
        completedDate: parseFlexibleDate(row[4]) ? formatDateForStorage(row[4]) : null
      }));
    case 'tg':
      return contentData.map(row => ({
        date: parseFlexibleDate(row[0]) ? formatDateForStorage(row[0]) : null,
        pointsDiscussed: row[1] || ''
      }));
    default:
      throw new Error('Invalid subject type');
  }
};

const parseBatchStatus = (rowData, headerRow) => {
  const batchStatuses = [];

  for (let i = 0; i < rowData.length; i += 3) {
    const batchHeader = headerRow[i];
    const batchId = batchHeader.match(/Batch\s*(\w+)/i)?.[1];

    if (batchId) {
      batchStatuses.push({
        batchId,
        proposedDate: rowData[i]?.trim()
          ? formatDateForStorage(parseFlexibleDate(rowData[i]))
          : undefined,
        status: rowData[i + 1]?.toLowerCase().includes('covered') ? 'covered' : 'not_covered',
        completedDate: rowData[i + 2]?.trim()
          ? formatDateForStorage(parseFlexibleDate(rowData[i + 2]))
          : undefined
      });
    }
  }

  return batchStatuses;
};

export const handleExcelDownload = (content, subject) => {
  let dataToExport = [];

  switch (subject) {
    case 'practical':
      dataToExport = content.map(item => {
        const { separateColumns } = formatBatchStatus(item.batchStatus || []);
        return {
          'Title': item.title || '',
          'Description': item.description || '',
          'References': item.references || '',
          'Course Outcomes': item.courseOutcomes || '',
          'Program Outcomes': item.programOutcomes || '',
          ...separateColumns
        };
      });
      break;
    case 'theory':
      dataToExport = content.map(item => ({
        'Title': item.title || '',
        'Description': item.description || '',
        'References': item.references || '',
        'Proposed Date': formatDateForDisplay(item.proposedDate),
        'Completed Date': formatDateForDisplay(item.completedDate)
      }));
      break;
    case 'tg':
      dataToExport = content.map(item => ({
        'Date': formatDateForDisplay(item.date),
        'Points Discussed': item.pointsDiscussed || ''
      }));
      break;
    default:
      throw new Error('Invalid subject type');
  }

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Course Content');
  XLSX.writeFile(workbook, `${subject}_course_content.xlsx`);
};

const formatBatchStatus = (batchStatuses) => {
  const separateColumns = {};
  const batchStatusString = batchStatuses.map(batch => {
    const proposedDate = batch.proposedDate 
      ? formatDateForDisplay(batch.proposedDate) 
      : 'N/A';
    const status = batch.completedDate ? 'Covered' : 'Not Covered';
    const completedDate = batch.completedDate 
      ? formatDateForDisplay(batch.completedDate) 
      : 'N/A';

    // Prepare separate columns
    separateColumns[`Batch ${batch.batchId} Proposed Date`] = proposedDate;
    separateColumns[`Batch ${batch.batchId} Status`] = status;
    separateColumns[`Batch ${batch.batchId} Completed Date`] = completedDate;

    return `Batch ${batch.batchId}: Proposed Date: ${proposedDate}, Status: ${status}, Completed Date: ${completedDate}`;
  }).join('\n');

  return { batchStatusString, separateColumns };
};

export const downloadSampleExcel = (subjectType, batches = ['A', 'B', 'C']) => {
  let headers = [];
  let sampleData = [];

  const currentDate = new Date();

  switch (subjectType) {
    case 'practical':
      headers = [
        'Title', 'Description', 'References', 'Course Outcomes', 
        'Program Outcomes',
        ...batches.flatMap(batch => [
          `Batch ${batch} Proposed Date`,
          `Batch ${batch} Status`, 
          `Batch ${batch} Completed Date`
        ])
      ];
      sampleData = [
        [
          'React Component Creation', 
          'Create a functional React component', 
          'React documentation', 
          'CO1, CO2', 
          'PO1, PO2',
          ...batches.flatMap(() => [
            formatDateForDisplay(currentDate),
            'Not Covered', 
            formatDateForDisplay(currentDate)
          ])
        ]
      ];
      break;
    case 'theory':
      headers = ['Title', 'Description', 'References', 'Proposed Date', 'Completed Date'];
      sampleData = [
        [
          'Introduction to React', 
          'Learn React fundamentals', 
          'React official docs', 
          formatDateForDisplay(currentDate), 
          formatDateForDisplay(currentDate)
        ]
      ];
      break;
    case 'tg':
      headers = ['Date', 'Points Discussed'];
      sampleData = [
        [
          formatDateForDisplay(currentDate), 
          'Discuss project progress'
        ]
      ];
      break;
    default:
      throw new Error('Invalid subject type');
  }

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
  XLSX.writeFile(workbook, `sample_${subjectType}_content.xlsx`);
};