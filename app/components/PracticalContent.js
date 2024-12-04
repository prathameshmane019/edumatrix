'use client'
import React, { useState, useEffect } from 'react'
import { Input, Textarea, Checkbox, Button, Card, CardBody, Divider } from "@nextui-org/react"
import {  Trash2 } from 'lucide-react'
import { formatDateForPicker, formatDateForDisplay, parseFlexibleDate } from '@/app/utils/dateFormater'

export default function PracticalContent({ content, subject, isEditing, isLoading, onSubmit, onCancel }) {
  const [localContent, setLocalContent] = useState(content || [])
  const [error, setError] = useState('')
  const batches = subject?.batch || []
  useEffect(() => {
    // Format dates when content changes
    if (content) {
      const formattedContent = content.map(item => ({
        ...item,
        batchStatus: item.batchStatus?.map(batch => ({
          ...batch,
          proposedDate: batch.proposedDate ? formatDateForPicker(batch.proposedDate) : '',
          completedDate: batch.completedDate ? formatDateForPicker(batch.completedDate) : ''
        }))
      }))
      setLocalContent(formattedContent)
    } else {
      setLocalContent([])
    }
  }, [content])

  const handleContentChange = (index, field, value) => {
    const newContent = [...localContent]
    newContent[index][field] = value
    setLocalContent(newContent)
  }

  const handleBatchStatusChange = (index, batchId, field, value) => {
    const newContent = [...localContent]
    if (!newContent[index].batchStatus) {
      newContent[index].batchStatus = []
    }

    const batchStatusIndex = newContent[index].batchStatus.findIndex(bs => bs.batchId === batchId)

    if (batchStatusIndex === -1) {
      newContent[index].batchStatus.push({
        batchId,
        status: field === 'status' ? (value ? 'covered' : 'not_covered') : 'not_covered',
        proposedDate: field === 'proposedDate' ? value : '',
        completedDate: field === 'completedDate' ? value : ''
      })
    } else {
      if (field === 'status') {
        newContent[index].batchStatus[batchStatusIndex].status = value ? 'covered' : 'not_covered'
      } else if (field === 'proposedDate') {
        newContent[index].batchStatus[batchStatusIndex].proposedDate = value
      } else if (field === 'completedDate') {
        newContent[index].batchStatus[batchStatusIndex].completedDate = value
      }
    }

    setLocalContent(newContent)
  }
 
  const handleAddContent = () => {
    setLocalContent([...localContent, {
      title: '',
      description: '',
      references: '',
      courseOutcomes: '',
      programOutcomes: '',
      batchStatus: batches.map(batchId => ({
        batchId,
        status: 'not_covered',
        proposedDate: '',
        completedDate: ''
      }))
    }])
  }
 
  const handleRemoveContent = (index) => {
    const newContent = [...localContent]
    newContent.splice(index, 1)
    setLocalContent(newContent)
  }

  const getBatchStatus = (item, batchId) => {
    return item.batchStatus?.find(bs => bs.batchId === batchId) || {
      batchId,
      status: 'not_covered',
      proposedDate: '',
      completedDate: ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!localContent.length) {
      setError('Please add content before submitting.')
      return
    }

    const formattedContent = localContent.map(item => ({
      ...item,
      batchStatus: item.batchStatus?.map(batch => ({
        ...batch,
        proposedDate: batch.proposedDate ? formatDateForStorage(parseFlexibleDate(batch.proposedDate)) : '',
        completedDate: batch.completedDate ? formatDateForStorage(parseFlexibleDate(batch.completedDate)) : ''
      }))
    }))
    
    setError('')
    onSubmit(formattedContent)
  
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading...</div>
  }

  
  if (!isEditing) {
    return (
      <div className="space-y-4">
        {localContent.map((item, index) => (
          <Card key={index} className="p-6">
            <CardBody>
              <h3 className="text-lg font-semibold mb-2">Content {index + 1}</h3>
              <p><strong>Title:</strong> {item.title}</p>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>References:</strong> {item.references}</p>
              <p><strong>Course Outcomes:</strong> {item.courseOutcomes}</p>
              <p><strong>Program Outcomes:</strong> {item.programOutcomes}</p>
              <Divider className="my-2" />
              <h4 className="font-semibold mb-2">Batch Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {batches.map((batchId) => {
                  const batchStatus = getBatchStatus(item, batchId)
                  return (
                    <div key={batchId} className="border rounded p-2">
                      <h5 className="font-medium">Batch {batchId}</h5>
                      <p>Status: {batchStatus.status === 'covered' ? 'Covered' : 'Not Covered'}</p>
                      <p>Proposed Date: {batchStatus.proposedDate || 'Not set'}</p>
                      <p>Completed Date: {batchStatus.completedDate || 'Not set'}</p>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {localContent.map((item, index) => (
        <Card key={index} className="p-6">
          <CardBody className="space-y-6">
            <h3 className="text-lg font-semibold">Content {index + 1}</h3>

            <Input
              variant='bordered'
              label="Title"
              value={item.title}
              onChange={(e) => handleContentChange(index, 'title', e.target.value)}
              isDisabled={isLoading}
              isRequired
              className="mb-4"
            />

            <Textarea
              variant='bordered'
              label="Description"
              value={item.description}
              onChange={(e) => handleContentChange(index, 'description', e.target.value)}
              isDisabled={isLoading}
              isRequired
              className="mb-4"
            />

            <Input
              variant='bordered'
              label="References"
              value={item.references}
              onChange={(e) => handleContentChange(index, 'references', e.target.value)}
              isDisabled={isLoading}
              className="mb-4"
            />

            <Input
              variant='bordered'
              label="Course Outcomes"
              value={item.courseOutcomes}
              onChange={(e) => handleContentChange(index, 'courseOutcomes', e.target.value)}
              isDisabled={isLoading}
              className="mb-4"
            />

            <Input
              variant='bordered'
              label="Program Outcomes"
              value={item.programOutcomes}
              onChange={(e) => handleContentChange(index, 'programOutcomes', e.target.value)}
              isDisabled={isLoading}
              className="mb-4"
            />

            <Divider />

            <h4 className="font-semibold">Batch Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {batches.map((batchId) => {
                const batchStatus = getBatchStatus(item, batchId)
                return (
                  <Card key={batchId} className="p-4">
                    <h5 className="font-medium mb-4">Batch {batchId}</h5>

                    <Checkbox
                      isSelected={batchStatus.status === 'covered'}
                      onValueChange={(checked) =>
                        handleBatchStatusChange(index, batchId, 'status', checked)
                      }
                      isDisabled={isLoading}
                      className="mb-4"
                    >
                      Covered
                    </Checkbox>

                    <Input
                      type="date"
                      label="Proposed Date"
                      variant='bordered'

                      value={batchStatus.proposedDate}
                      onChange={(e) =>
                        handleBatchStatusChange(index, batchId, 'proposedDate', e.target.value)
                      }
                      className="mb-4"
                      isDisabled={isLoading}
                    />

                    <Input
                      type="date"
                      label="Completed Date"
                      variant='bordered'

                      value={batchStatus.completedDate}
                      onChange={(e) =>
                        handleBatchStatusChange(index, batchId, 'completedDate', e.target.value)
                      }
                      isDisabled={isLoading}
                    />
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-end">
              <Button
                color="danger"
                onClick={() => handleRemoveContent(index)}
                isDisabled={isLoading}
                variant='flat'
                startContent={<Trash2/>}
              >
                Remove Content
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}

      <div className="flex justify-between mt-6">
        <Button
          color="primary"
          variant="flat"
          onClick={handleAddContent}
          isDisabled={isLoading}
        >
          Add Content
        </Button>

        <div className="space-x-2">
          <Button
            color="primary"
            type="submit"
            isDisabled={isLoading}
          >
            Save
          </Button>
          <Button
            color="secondary"
            variant="flat"
            onClick={onCancel}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}
    </form>
  )
}