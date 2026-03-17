import React from 'react';
import { render, screen } from '@testing-library/react';
import DataTable from '../DataTable';

describe('DataTable', () => {
    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
    ];

    const data = [
        { _id: '1', id: '1', name: 'Alice', role: 'Admin' },
        { _id: '2', id: '2', name: 'Bob', role: 'User' },
    ];

    it('renders loading state correctly', () => {
        render(<DataTable columns={columns} data={[]} loading={true} />);
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('renders empty message when data is empty', () => {
        render(<DataTable columns={columns} data={[]} emptyMessage="No users found" />);
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('renders table rows and headers correctly', () => {
        render(<DataTable columns={columns} data={data} />);
        
        // Assert Headers
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();

        // Assert Row Cells
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('renders custom cell using render prop', () => {
        const customColumns = [
            ...columns,
            {
                key: 'actions',
                label: 'Actions',
                render: (row: any) => <button>Edit {row.name}</button>,
            }
        ];

        render(<DataTable columns={customColumns} data={data} />);
        expect(screen.getByText('Edit Alice')).toBeInTheDocument();
        expect(screen.getByText('Edit Bob')).toBeInTheDocument();
    });
});
