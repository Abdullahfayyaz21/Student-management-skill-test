import * as React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';

type UserAccountBasicProps = {
    data?: any[];
    columns?: MRT_ColumnDef<any>[];
    isLoading?: boolean;
    isError?: boolean;
    errorMessage?: string;
};

export const UserAccountBasic: React.FC<UserAccountBasicProps> = ({
    data = [],
    columns = [],
    isLoading = false,
    isError = false,
    errorMessage = ''
}) => {
    if (isLoading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading...</Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                <Typography>{errorMessage || 'Error loading data'}</Typography>
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No records to display</Typography>
            </Box>
        );
    }

    // ✅ Use Material React Table with SAFE columns (no custom Cell renderers)
    return (
        <Box sx={{ overflow: 'auto' }}>
            <MaterialReactTable
                columns={columns}
                data={data}
                enableColumnActions={false}
                enableSorting={false}
                enablePagination={false}
                enableDensityToggle={false}
                enableFullScreenToggle={false}
                enableColumnFilters={false}
                enableHiding={false}
                muiTableProps={{
                    sx: {
                        '& .MuiTableCell-root': {
                            py: 1,
                            px: 2
                        }
                    }
                }}
            />
        </Box>
    );
};