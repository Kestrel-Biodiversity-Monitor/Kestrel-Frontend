"use client";

/**
 * Configuration for a single column in the DataTable.
 * @template T Type of the row data.
 */
interface Column<T> {
    /** The key in the row data, or a unique string if using a custom render. */
    key: keyof T | string;
    /** The display text for the column header. */
    label: string;
    /** Optional custom render function for the cell contents. */
    render?: (row: T) => React.ReactNode;
    /** Optional CSS width for the column (e.g., "100px", "20%"). */
    width?: string;
}

/**
 * Props for the DataTable component.
 * @template T Type of the row data (must include an `_id` string).
 */
interface Props<T> {
    /** Array of column configurations. */
    columns: Column<T>[];
    /** Array of row data. */
    data: T[];
    /** Message to display when there is no data. Default is "No records found." */
    emptyMessage?: string;
    /** Whether the table is in a loading state. Disables rendering of data and shows a spinner. Default is false. */
    loading?: boolean;
}

export default function DataTable<T extends { _id: string }>({
    columns, data, emptyMessage = "No records found.", loading = false,
}: Props<T>) {
    if (loading) {
        return (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
                <div className="spinner" style={{ width: 28, height: 28, borderColor: "rgba(26,71,49,0.2)", borderTopColor: "#1a4731" }} />
                <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 10 }}>Loading data...</p>
            </div>
        );
    }
    return (
        <div style={{ overflowX: "auto" }}>
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={String(col.key)} style={col.width ? { width: col.width } : undefined}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr key={row._id}>
                                {columns.map((col) => (
                                    <td key={String(col.key)}>
                                        {col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
