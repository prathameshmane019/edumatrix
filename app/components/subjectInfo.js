// components/SubjectInfo.jsx
import React from 'react'

export default function SubjectInfo({ subject }) {

  return (
    <div className="my-4 p-4 bg-gray-100 rounded-md">
      <h2 className="text-lg font-bold mb-2">Subject Information</h2>
      <p>Department: {subject.department}</p>
      <p>Name: {subject.name}</p>
      <p>Code: {subject.id}</p>
      <p>Class: {subject.class.id}</p>
      <p>Faculty: {subject.teacher.name}</p>
      <p>Type: {subject.subType}</p>
      {subject.subType === 'practical' && subject.batch && (
        <p>Batches: {subject.batch.join(', ')}</p>
      )}
    </div>
  )
}