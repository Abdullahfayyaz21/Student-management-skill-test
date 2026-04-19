import * as React from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Add, InfoOutlined, Refresh } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PageContentHeader } from '@/components/page-content-header';
import { getErrorMsg } from '@/utils/helpers/get-error-message';
import { Student, StudentFilter, StudentFilterSchema } from '../types';
import { FilterStudent } from '../components/forms';
import { UserAccountBasic } from '@/components/user-account-basic';
import { useGetStudentsQuery } from '../api/student-api';

const initialState: StudentFilter = {
  class: '',
  section: '',
  name: '',
  roll: ''
};

export const ListStudents: React.FC = () => {
  const methods = useForm<StudentFilter>({
    defaultValues: initialState,
    resolver: zodResolver(StudentFilterSchema)
  });

  const [filter, setFilter] = React.useState<StudentFilter>(initialState);
  const {  apiResponse, isLoading, isError, error, refetch } = useGetStudentsQuery(filter);

  // ✅ Extract students array - handle multiple API response formats
  const students: Student[] = React.useMemo(() => {
    if (!apiResponse) return [];
    if (Array.isArray(apiResponse)) return apiResponse;
    if (apiResponse.students && Array.isArray(apiResponse.students)) return apiResponse.students;
    if (apiResponse.data && Array.isArray(apiResponse.data)) return apiResponse.data;
    return [];
  }, [apiResponse]);

  const searchStudent = (payload: StudentFilter) => {
    setFilter(payload);
  };

  // ✅ Define columns OUTSIDE JSX - simple objects only (no custom Cell renderers)
  const columns = React.useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'roll_number', header: 'Roll Number' },
    { accessorKey: 'user_name', header: 'Name' },
    { accessorKey: 'class_name', header: 'Class' },
    { accessorKey: 'section_name', header: 'Section' },
    { accessorKey: 'parent_phone', header: 'Phone' },
    { accessorKey: 'status', header: 'Status' },
  ], []);

  return (
    <>
      <Box sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button 
            size='small' 
            color='primary' 
            variant='outlined' 
            startIcon={<Refresh />} 
            onClick={() => refetch()} 
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button 
            size='small' 
            color='primary' 
            variant='contained' 
            startIcon={<Add />} 
            component={Link} 
            to='/app/students/add'
          >
            Add New Student
          </Button>
        </Box>
      </Box>
      
      <FilterStudent methods={methods} searchStudent={methods.handleSubmit(searchStudent)} />
      
      <Box sx={{ my: 2 }} />
      
      <PageContentHeader icon={<InfoOutlined sx={{ mr: 1 }} />} heading='Student Information' />
      
      {/* ✅ Pass simple columns + data to UserAccountBasic */}
      <UserAccountBasic
        data={students}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        errorMessage={getErrorMsg(error as FetchBaseQueryError | SerializedError).message}
        onRefresh={refetch}
      />
    </>
  );
};