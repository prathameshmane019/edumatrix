import React from 'react';
import { TableBody } from '@nextui-org/react';
import { TableRow } from '@nextui-org/react';
import { TableCell } from '@nextui-org/react';
import { Checkbox } from '@nextui-org/react';

const MyComponent = ({ subjectDetails, selectedBatch, selectedContentIds, handleContentSelection }) => {
  if (!subjectDetails) {
    return <div>Loading...</div>;
  }

  return (
    <table>
      <TableBody>
        {subjectDetails && subjectDetails.content ? (
          subjectDetails.content.map((content) => {
            const batchStatus = subjectDetails.subType === 'practical'
              ? content.batchStatus?.find(b => b.batchId === selectedBatch)
              : null;
            const isCovered = subjectDetails.subType === 'practical'
              ? batchStatus?.status === 'covered'
              : content.status === 'covered';

            return (
              <TableRow key={content._id}>
                <TableCell>
                  <Checkbox
                    isSelected={selectedContentIds.includes(content._id)}
                    onChange={() => handleContentSelection(content._id)}
                    isDisabled={isCovered}
                  />
                </TableCell>
                <TableCell>{content.title}</TableCell>
                <TableCell>{content.description}</TableCell>
                <TableCell>
                  {subjectDetails.subType === 'practical'
                    ? batchStatus?.status || 'not_covered'
                    : content.status}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={4}>No content available</TableCell>
          </TableRow>
        )}
      </TableBody>
    </table>
  );
};

export default MyComponent;

