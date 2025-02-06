'use client'
import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import axios from 'axios'
import { Button, Select, SelectItem, Spinner } from '@nextui-org/react'
import TheoryContent from './TheoryContent'
import PracticalContent from './PracticalContent'
import TGContent from './TGContent'
import SubjectInfo from './subjectInfo'
import { handleExcelUpload, handleExcelDownload } from '@/app/utils/excelHandlers'
import CourseContentManager from './CourseContentManager'
import { Pencil, PencilIcon } from 'lucide-react'
import { SubjectDropdown } from './subject/SubjectDropdown'


export default function TeachingPlanPage() {
  const [subjectId, setSubjectId] = useState('');
  const [subject, setSubject] = useState(null);
  const [content, setContent] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);



  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
      const userSubjectIds = storedProfile?.subjects || [];
      if (userSubjectIds.length === 1) {
        setSubjectId(userSubjectIds[0]);
        fetchSubjectInfo(userSubjectIds[0]);
      }
    }
  }, []);

  const fetchSubjectInfo = async (id) => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/v2/subjectData?_id=${id}`);
      console.log(response.data);
      
      const subjectData = response.data.subjects[0];
      setSubject(subjectData);
      if (subjectData.subType === 'tg') {
        setContent(subjectData.tgSessions || []);
      } else {
        setContent(subjectData.content || []);
      }
    } catch (error) {
      console.error('Error fetching subject info:', error);
      toast.error('Failed to fetch subject information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectChange = (id) => {
    setSubjectId(id);
    setContent([]);
    setIsEditing(false);
    fetchSubjectInfo(id);
  };

  const handleSubmit = async (updatedContent) => {
    if (!subjectId || !subject) {
      toast.error('Please select a subject');
      return;
    }

    setIsLoading(true);
    try {
      let payload = {};

      if (subject.subType === 'tg') {
        payload = {
          tgSessions: updatedContent.map(session => ({
            date: session.date,
            pointsDiscussed: Array.isArray(session.pointsDiscussed) ?
              session.pointsDiscussed :
              [session.pointsDiscussed]
          }))
        };
      } else {
        payload = {
          content: updatedContent
        };
      }

      const response = await axios.put(`/api/v2/teaching-plan?_id=${subjectId}`, payload)

      if (response.status === 200) {
        toast.success('Content updated successfully');
        if (subject.subType === 'tg') {
          setContent(updatedContent);
          setSubject(prev => ({ ...prev, tgSessions: updatedContent }));
        } else {
          setContent(updatedContent);
          setSubject(prev => ({ ...prev, content: updatedContent }));
        }
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setIsLoading(false);
    }
  }


  const renderContent = () => {
    if (!subject?.subType) return null

    const contentProps = {
      content,
      isEditing,
      isLoading,
      onSubmit: handleSubmit,
      onCancel: () => setIsEditing(false)
    }

    switch (subject.subType) {
      case 'theory':
        return <TheoryContent {...contentProps} />
      case 'practical':
        return <PracticalContent {...contentProps} subject={subject} />
      case 'tg':
        return <TGContent {...contentProps} tg={subject.tgSessions} />
      default:
        return null
    }
  }
  const handleContentUpdate = async (newContent) => {
    try {
      const payload = subject.subType === 'tg'
        ? { tgSessions: newContent }
        : { content: newContent };

      const response = await axios.put(`/api/v2/teaching-plan?_id=${subjectId}`, payload);

      setContent(newContent);
      setSubject(prev => ({
        ...prev,
        [subject.subType === 'tg' ? 'tgSessions' : 'content']: newContent
      }));

      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Teaching Plan</h1>

      <div className="mb-4">
        <SubjectDropdown
          facultyId={profile?._id}
          instituteId={profile?.institute._id}
          onSelect={handleSubjectChange}
          selectedSubject={subjectId}

        />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center my-4">
          <Spinner />
          <p className="mt-2 text-gray-500">Loading, please wait...</p>
        </div>
      )}
      {subject && <SubjectInfo subject={subject} />}
      {subjectId && !isEditing && !isLoading && (
        <div className="mt-4">
          <Button
            startContent={<PencilIcon className="h-5" />}
            color="primary"
            onClick={() => setIsEditing(true)}
            className="mb-4"
          >
            Edit Content
          </Button>
        </div>
      )}

      {renderContent()}

      {subjectId && !isLoading && (
        // <div className="flex gap-4 mt-4">
        //   <div>
        //     <input
        //       type="file"
        //       accept=".xlsx, .xls"
        //       onChange={handleFileUpload}
        //       className="hidden"
        //       ref={fileInputRef}
        //     />
        //     <Button
        //       color="secondary"
        //       onClick={() => fileInputRef.current.click()}
        //     >
        //       Upload Content (Excel)
        //     </Button>
        //   </div>

        //   <Button
        //     color="primary"
        //     onClick={handleFileDownload}
        //     isDisabled={!content || content.length === 0}
        //   >
        //     Download Content (Excel)
        //   </Button>
        // </div>
        <CourseContentManager
          subjectType={subject?.subType}
          content={content}
          onContentUpdate={handleContentUpdate}
          availableBatches={subject.batch}
        />
      )}
    </div>
  )
}
