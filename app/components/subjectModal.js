// // // import React, { useState, useEffect } from 'react';
// // // import axios from 'axios';
// // // import {
// // //   Modal,
// // //   ModalContent,
// // //   ModalHeader,
// // //   ModalBody,
// // //   Button,
// // //   Input,
// // //   Select,
// // //   SelectItem,
// // // } from '@nextui-org/react';
// // // import { departmentOptions } from '../utils/department';

// // // export default function SubjectModal({ isOpen, onClose, mode, subjectData, onSubmit, classes, teachers }) {
// // //   const [subjectId, setSubjectId] = useState('');
// // //   const [name, setName] = useState('');
// // //   const [classId, setClassId] = useState('');
// // //   const [teacherId, setTeacherId] = useState('');
// // //   const [selectedDepartment, setSelectedDepartment] = useState("");
// // //   const [subjectType, setSubjectType] = useState('');
// // //   const [batchIds, setBatchIds] = useState([]);
// // //   const [profile, setProfile] = useState(null);
// // //   const [batches, setBatches] = useState([]);

// // //   useEffect(() => {
// // //     const storedProfile = sessionStorage.getItem('userProfile');
// // //     if (storedProfile) {
// // //       setProfile(JSON.parse(storedProfile));
// // //     }
// // //   }, []);

// // //   useEffect(() => {
// // //     if (profile && profile.department) { 
// // //       setSelectedDepartment(profile.department)
// // //       console.log(selectedDepartment);
// // //     }
// // //   }, [profile?.department]); 
// // //   useEffect(() => {
// // //     if (subjectData) {
// // //       setSubjectId(subjectData._id);
// // //       setName(subjectData.name);
// // //       setClassId(subjectData.class);
// // //       setTeacherId(subjectData.teacher);
// // //       setSelectedDepartment(subjectData.department);
// // //       setSubjectType(subjectData.subType);
// // //       setBatchIds(subjectData.batchIds || []);
// // //     } else {
// // //       resetForm();
// // //     }
// // //   }, [subjectData]);

// // //   useEffect(() => {
// // //     if (classId && subjectType === 'practical'||'tg') {
// // //       const selectedClass = classes.find(cls => cls._id === classId);
// // //       setBatches(selectedClass ? selectedClass.batches : []);
// // //     } else {
// // //       setBatches([]);
// // //     }
// // //   }, [classId, subjectType, classes]);

// // //   const handleSelectionChange = (selectedKeys) => {
// // //     setBatchIds(Array.from(selectedKeys)); // Convert Set to Array
// // //   };

// // //   const resetForm = () => {
// // //     setSubjectId('');
// // //     setName('');
// // //     setClassId('');
// // //     setTeacherId('');
// // //     if (profile?.role === "superadmin") {
// // //       setSelectedDepartment('');
// // //     }
// // //     setSubjectType('');
// // //     setBatchIds([]);
// // //   };

// // //   const handleSelectChange = (value) => {
// // //     setSelectedDepartment(value);
// // //   };

// // //   const handleCancel = () => {
// // //     onClose();
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     const formData = {
// // //       _id: subjectId,
// // //       name,
// // //       class: classId,
// // //       teacher: teacherId,
// // //       department: profile.department,
// // //       type: subjectType,
// // //       batch: batchIds?  batchIds : undefined,
// // //     };

// // //     try {
// // //       if (mode === 'add') {
// // //         await axios.post('/api/subject', formData);
// // //       } else {
// // //         await axios.put(`/api/subject?_id=${subjectId}`, formData);
// // //       }
// // //       onSubmit();
// // //       onClose();
// // //     } catch (error) {
// // //       console.error('Error submitting subject:', error);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!isOpen) {
// // //       resetForm();
// // //     }
// // //   }, [isOpen]);

// // //   return (
// // //     <Modal
// // //       isOpen={isOpen}
// // //       onClose={onClose}
// // //       placement="top-center"
// // //       className="max-w-[40vw] max-h-[80vh] overflow-y-auto"
// // //     >
// // //       <ModalContent>
// // //         <ModalHeader>{mode === 'add' ? 'Add New Subject' : 'Edit Subject'}</ModalHeader>
// // //         <ModalBody>
// // //           <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-2 gap-4">
// // //             <Input
// // //               type="text"
// // //               variant="bordered"
// // //               size='sm'
// // //               label="Subject ID"
// // //               value={subjectId}
// // //               onChange={(e) => setSubjectId(e.target.value)}
// // //               required
// // //               disabled={mode !== 'add'}
// // //               placeholder="Course ID-Year"
// // //               className="col-span-1 w-full"
// // //             />
// // //             <Input
// // //               type="text"
// // //               variant="bordered"
// // //               size='sm'
// // //               label="Name"
// // //               value={name}
// // //               onChange={(e) => setName(e.target.value)}
// // //               required
// // //               className="col-span-1 w-full"
// // //             />
// // //             {profile?.role === "superadmin" && (
// // //               <Select
// // //                 label="Department"
// // //                 placeholder="Select department"
// // //                 name="department"
// // //                 selectedKeys={[selectedDepartment]}
// // //                 onSelectionChange={(value) => handleSelectChange(value.currentKey)}
// // //                 variant="bordered"
// // //                 size="sm"
// // //               >
// // //                 {departmentOptions.map((department) => (
// // //                   <SelectItem key={department.key} textValue={department.label}>
// // //                     {department.label}
// // //                   </SelectItem>
// // //                 ))}
// // //               </Select>
// // //             )}
// // //             <Select
// // //               label="Class"
// // //               placeholder="Select Class"
// // //               className="col-span-1 w-full"
// // //               selectedKeys={[classId]}
// // //               onChange={(e) => setClassId(e.target.value)}
// // //               required
// // //               variant="bordered"
// // //               size='sm'
// // //             >
// // //              {Array.isArray(classes) && classes.length > 0 ? (
// // //               classes.map((classItem) => (
// // //                 <SelectItem key={classItem._id} value={classItem._id}>
// // //                   {classItem._id}
// // //                 </SelectItem>
// // //               ))
// // //             ) : (
// // //               <SelectItem value="no-classes">No classes available</SelectItem>
// // //             )}
// // //             </Select>

// // //             <Select
// // //               label="Subject Teacher"
// // //               placeholder="Select Subject Teacher"
// // //               className="col-span-1 w-full"
// // //               selectedKeys={[teacherId]}
// // //               onSelectionChange={(keys) => setTeacherId(keys.currentKey)}
// // //               required
// // //               variant="bordered"
// // //               size='sm'
// // //             >
// // //               {teachers && teachers.map((teacher) => (
// // //                 <SelectItem key={teacher._id} value={teacher._id}>
// // //                   {teacher.name}
// // //                 </SelectItem>
// // //               ))}
// // //             </Select>
// // //             <Select
// // //               label="Subject Type"
// // //               placeholder="Select Subject Type"
// // //               className="col-span-1 w-full"
// // //               selectedKeys={[subjectType]}
// // //               onSelectionChange={(keys) => setSubjectType(keys.currentKey)}
// // //               required
// // //               variant="bordered"
// // //               size='sm'
// // //             >
// // //               <SelectItem key="theory" textValue='theory'>Theory</SelectItem>
// // //               <SelectItem key="practical" value="practical">Practical</SelectItem>
// // //               <SelectItem key="tg" value="tg">Teacher Guardian</SelectItem>
// // //             </Select>
// // //             {(subjectType === 'practical'||subjectType === 'tg') && (
// // //                   <Select
// // //                   label="Batches"
// // //                   placeholder="Select Batches"
// // //                   className="col-span-1 w-full"
// // //                   selectedKeys={batchIds}
// // //                   onSelectionChange={handleSelectionChange}
// // //                   required
// // //                   variant="bordered"
// // //                   size='sm'
// // //                   selectionMode="multiple"
// // //                 >
// // //                   {batches && batches.map((batch) => (
// // //                     <SelectItem key={batch._id} value={batch._id}>
// // //                       {batch._id}
// // //                     </SelectItem>
// // //                   ))}
// // //                 </Select>
// // //             )}
// // //             <div className="col-span-2 flex justify-end gap-4">
// // //               <Button
// // //                 variant="ghost"
// // //                 size="sm"
// // //                 onClick={handleCancel}
// // //                 className="w-fit px-3 font-normal bg-gray-200 text-gray-600"
// // //               >
// // //                 Cancel
// // //               </Button>
// // //               <Button
// // //                 type="submit"
// // //                 variant="flat"
// // //                 size="sm"
// // //                 color="primary"
// // //                 className="w-fit px-3 font-normal"
// // //               >
// // //                 {mode === 'add' ? 'Add Subject' : 'Update Subject'}
// // //               </Button>
// // //             </div>
// // //           </form>
// // //         </ModalBody>
// // //       </ModalContent>
// // //     </Modal>
// // //   );
// // // }
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   Button,
//   Input,
//   Select,
//   SelectItem,
// } from '@nextui-org/react';
// import { FacultyDropdown } from './faculty/FacultyDropdown';
// import { Calendar } from 'lucide-react';
// import { ClassDropdown } from './Class/ClassDropdown';
// import { DepartmentDropdown } from './department/DepartmentDropDowns';
// import { getAcademicYears } from './profile';
// export default function SubjectModal({ isOpen, onClose, department, mode, subjectData, onSubmit, classes, instituteId, teachers }) {
//   const [subjectId, setSubjectId] = useState('');
//   const [name, setName] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [teacherId, setTeacherId] = useState('');
//   const [subjectType, setSubjectType] = useState('');
//   const [batchIds, setBatchIds] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const [batches, setBatches] = useState([]);
//   const [semester, setSemester] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [academicYear, setAcademicYear] = useState('');

//   const handleClassSelect = (value) => {
//     setSelectedClass(value)
//   }
//   useEffect(() => {
//     console.log(subjectData);
    
//     if (subjectData) {
//       setSubjectId(subjectData.id);
//       setName(subjectData.name);
//       setSelectedClass(subjectData.class?._id);
//       setTeacherId(subjectData.teacher._id);
//       setSelectedDepartment(subjectData.department);
//       setSubjectType(subjectData.subType);
//       setBatchIds(subjectData.batch || []);
//       setSemester(subjectData.sem);
//       setAcademicYear(subjectData.academicYear);
//     } else {
//       resetForm();
//     }
//   }, [subjectData]);

//   useEffect(() => {
//     if (selectedClass && (subjectType === 'practical' || subjectType === 'tg')) {
//       const selectedClass = classes.find(cls => cls._id === selectedClass);
//       setBatches(selectedClass ? selectedClass.batches : []);
//     } else {
//       setBatches([]);
//     }
//   }, [selectedClass, subjectType, classes]);

//   const handleSelectionChange = (selectedKeys) => {
//     setBatchIds(Array.from(selectedKeys));
//   };

//   const handleFacultySelect = (value) => {
//     console.log(value);
    
//     setTeacherId(value)
// }

//   const resetForm = () => {
//     setSubjectId('');
//     setName('');
//     setSelectedClass('');
//     setTeacherId('');
//     if (profile?.role === "superadmin") {
//       setSelectedDepartment('');
//     }
//     setSubjectType('');
//     setBatchIds([]);
//     setSemester('');
//     setAcademicYear('');
//   };

//   const handleSelectChange = (value) => {
//     setSelectedDepartment(value);
//   };

//   const handleCancel = () => {
//     onClose();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = {
//       id: subjectId,
//       name,
//       classId: selectedClass,
//       teacher: teacherId,
//       department: department,
//       subType: subjectType,
//       batch: batchIds.length > 0 ? batchIds : undefined,
//       sem: semester,
//       academicYear,
//       institute:instituteId
//     };

//     try {
//       console.log(formData);
      
//       if (mode === 'add') {
//         await axios.post('/api/v2/subject', formData);
//       } else {
//         await axios.put(`/api/v2/subject?_id=${subjectId}`, formData);
//       }
//       onSubmit();
//       onClose();
//     } catch (error) {
//       console.error('Error submitting subject:', error);
//     }
//   };

//   useEffect(() => {
//     if (!isOpen) {
//       resetForm();
//     }
//   }, [isOpen]);

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       placement="top-center"
//       className="max-w-[40vw] max-h-[80vh] overflow-y-auto"
//     >
//       <ModalContent>
//         <ModalHeader>{mode === 'add' ? 'Add New Subject' : 'Edit Subject'}</ModalHeader>
//         <ModalBody>
//           <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-2 gap-4">
//             <Input
//               type="text"
//               variant="bordered"
//               size='sm'
//               label="Subject ID"
//               value={subjectId}
//               onChange={(e) => setSubjectId(e.target.value)}
//               required
//               disabled={mode !== 'add'}
//               placeholder="Course ID-Year"
//               className="col-span-1 w-full"
//             />
//             <Input
//               type="text"
//               variant="bordered"
//               size='sm'
//               label="Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="col-span-1 w-full"
//             />
//             <Select
//               placeholder="Select Year"
//               selectedKeys={academicYear ? [academicYear] : []}
//               onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
//               startContent={<Calendar className="w-4 h-4 text-default-400" />}
//               variant="bordered"
//               size="sm"
//               className="max-w-52"
//             >
//               {getAcademicYears(10).map((year) => (
//                 <SelectItem key={year.value} value={year.value}>
//                   {year.label}
//                 </SelectItem>
//               ))}
//             </Select>
//             <ClassDropdown
//               id="class-select"
//               instituteId={instituteId}
//               onSelect={handleClassSelect}
//               selectedClass={selectedClass}
//               acadmicYear={academicYear}
//               selectedDepartment={department}
//             />

//             <FacultyDropdown
//               id="faculty-select"
//               instituteId={instituteId}
//               // departmentId={selectedDepartment}
//               onSelect={handleFacultySelect}
//               selectedFaculty={teacherId}
//               className="w-full"
//             />
//             <Select
//               label="Subject Type"
//               placeholder="Select Subject Type"
//               className="col-span-1 w-full"
//               selectedKeys={[subjectType]}
//               onSelectionChange={(keys) => setSubjectType(keys.currentKey)}
//               required
//               variant="bordered"
//               size='sm'
//             >
//               <SelectItem key="theory" value="theory">Theory</SelectItem>
//               <SelectItem key="practical" value="practical">Practical</SelectItem>
//               <SelectItem key="tg" value="tg">Teacher Guardian</SelectItem>
//             </Select>
//             {(subjectType === 'practical' || subjectType === 'tg') && (
//               <Select
//                 label="Batches"
//                 placeholder="Select Batches"
//                 className="col-span-1 w-full"
//                 selectedKeys={batchIds}
//                 onSelectionChange={handleSelectionChange}
//                 required
//                 variant="bordered"
//                 size='sm'
//                 selectionMode="multiple"
//               >
//                 {batches && batches.map((batch) => (
//                   <SelectItem key={batch._id} value={batch._id}>
//                     {batch._id}
//                   </SelectItem>
//                 ))}
//               </Select>
//             )}
//             <Select
//               label="Semester"
//               placeholder="Select Semester"
//               className="col-span-1 w-full"
//               selectedKeys={[semester]}
//               onSelectionChange={(keys) => setSemester(keys.currentKey)}
//               required
//               variant="bordered"
//               size='sm'
//             >
//               <SelectItem key="sem1" value="sem1">Semester 1</SelectItem>
//               <SelectItem key="sem2" value="sem2">Semester 2</SelectItem>
//             </Select>

//             <div className="col-span-2 flex justify-end gap-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={handleCancel}
//                 className="w-fit px-3 font-normal bg-gray-200 text-gray-600"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 variant="flat"
//                 size="sm"
//                 color="primary"
//                 className="w-fit px-3 font-normal"
//               >
//                 {mode === 'add' ? 'Add Subject' : 'Update Subject'}
//               </Button>
//             </div>
//           </form>
//         </ModalBody>
//       </ModalContent>
//     </Modal>
//   );
// }
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { FacultyDropdown } from './faculty/FacultyDropdown';
import { Calendar } from 'lucide-react';
import { ClassDropdown } from './Class/ClassDropdown';
import { DepartmentDropdown } from './department/DepartmentDropDowns';
import { getAcademicYears } from './profile';

export default function SubjectModal({ isOpen, onClose, department, mode, subjectData, onSubmit, classes, instituteId, teachers }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    class: '',
    teacher: '',
    subType: '',
    batch: [],
    sem: '',
    academicYear: '',
  });

  const [batches, setBatches] = useState([]);

  useEffect(() => {
    if (subjectData) {
      setFormData({
        id: subjectData.id || '',
        name: subjectData.name || '',
        class: subjectData.class?._id || '',
        teacher: subjectData.teacher?._id || '',
        subType: subjectData.subType || '',
        batch: subjectData.batch || [],
        sem: subjectData.sem || '',
        academicYear: subjectData.academicYear || '',
      });
    } else {
      resetForm();
    }
  }, [subjectData]);

  useEffect(() => {
    if (formData.class && (formData.subType === 'practical' || formData.subType === 'tg')) {
      const selectedClass = classes.find(cls => cls._id === formData.class);
      setBatches(selectedClass ? selectedClass.batches : []);
    } else {
      setBatches([]);
    }
  }, [formData.class, formData.subType, classes]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      class: '',
      teacher: '',
      subType: '',
      batch: [],
      sem: '',
      academicYear: '',
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        department,
        institute: instituteId,
      };

      if (mode === 'add') {
        await axios.post('/api/v2/subject', payload);
      } else {
        await axios.put(`/api/v2/subject?_id=${subjectData._id}`, payload);
      }
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting subject:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top-center"
      className="max-w-[40vw] max-h-[80vh] overflow-y-auto"
    >
      <ModalContent>
        <ModalHeader>{mode === 'add' ? 'Add New Subject' : 'Edit Subject'}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="w-full bg-white p-2 grid grid-cols-2 gap-4">
            <Input
              type="text"
              variant="bordered"
              size="sm"
              label="Subject ID"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              required
              disabled={mode !== 'add'}
              placeholder="Course ID-Year"
              className="col-span-1 w-full"
            />
            <Input
              type="text"
              variant="bordered"
              size="sm"
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="col-span-1 w-full"
            />
            <Select
              placeholder="Select Year"
              selectedKeys={formData.academicYear ? [formData.academicYear] : []}
              onSelectionChange={(keys) => handleInputChange('academicYear', Array.from(keys)[0])}
              startContent={<Calendar className="w-4 h-4 text-default-400" />}
              variant="bordered"
              size="sm"
              className="max-w-52"
            >
              {getAcademicYears(10).map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>
            <ClassDropdown
              id="class-select"
              instituteId={instituteId}
              onSelect={(value) => handleInputChange('class', value)}
              selectedClass={formData.class}
              acadmicYear={formData.academicYear}
              selectedDepartment={department}
            />
            <FacultyDropdown
              id="faculty-select"
              instituteId={instituteId}
              onSelect={(value) => handleInputChange('teacher', value)}
              selectedFaculty={formData.teacher}
              className="w-full"
            />
            <Select
              label="Subject Type"
              placeholder="Select Subject Type"
              className="col-span-1 w-full"
              selectedKeys={[formData.subType]}
              onSelectionChange={(keys) => handleInputChange('subType', keys.currentKey)}
              required
              variant="bordered"
              size="sm"
            >
              <SelectItem key="theory" value="theory">Theory</SelectItem>
              <SelectItem key="practical" value="practical">Practical</SelectItem>
              <SelectItem key="tg" value="tg">Teacher Guardian</SelectItem>
            </Select>
            {(formData.subType === 'practical' || formData.subType === 'tg') && (
              <Select
                label="Batches"
                placeholder="Select Batches"
                className="col-span-1 w-full"
                selectedKeys={formData.batch}
                onSelectionChange={(keys) => handleInputChange('batch', Array.from(keys))}
                required
                variant="bordered"
                size="sm"
                selectionMode="multiple"
              >
                {batches.map((batch) => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch._id}
                  </SelectItem>
                ))}
              </Select>
            )}
            <Select
              label="Semester"
              placeholder="Select Semester"
              className="col-span-1 w-full"
              selectedKeys={[formData.sem]}
              onSelectionChange={(keys) => handleInputChange('sem', keys.currentKey)}
              required
              variant="bordered"
              size="sm"
            >
              <SelectItem key="sem1" value="sem1">Semester 1</SelectItem>
              <SelectItem key="sem2" value="sem2">Semester 2</SelectItem>
            </Select>

            <div className="col-span-2 flex justify-end gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-fit px-3 font-normal bg-gray-200 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="flat"
                size="sm"
                color="primary"
                className="w-fit px-3 font-normal"
              >
                {mode === 'add' ? 'Add Subject' : 'Update Subject'}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

