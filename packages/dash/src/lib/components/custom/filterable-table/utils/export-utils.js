/**
 * Export utility functions for table data
 * Handles CSV, JSON, and Excel export formats
 */

/**
 * Converts table data to CSV format
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {Array} visibleColumns - IDs of visible columns
 * @returns {string} CSV string
 */
export function dataToCSV(data, columns, visibleColumns) {
	if (!data || data.length === 0) {
		return '';
	}

	// Filter columns based on visibility
	const columnsToExport = columns.filter((col) => visibleColumns.includes(col.id));

	// Create header row
	const headers = columnsToExport.map((col) => escapeCSVValue(col.name));
	const csvRows = [headers.join(',')];

	// Create data rows
	data.forEach((row) => {
		const values = columnsToExport.map((col) => {
			let value = row[col.id];

			// Handle custom accessors if defined
			if (col.accessor && typeof col.accessor === 'function') {
				value = col.accessor(row);
			}

			// Handle different value types
			if (value === null || value === undefined) {
				return '';
			}
			if (typeof value === 'object') {
				value = JSON.stringify(value);
			}

			return escapeCSVValue(String(value));
		});
		csvRows.push(values.join(','));
	});

	return csvRows.join('\n');
}

/**
 * Escapes special characters in CSV values and prevents CSV injection
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCSVValue(value) {
	if (value === null || value === undefined) {
		return '';
	}

	let stringValue = String(value);

	// Prevent CSV injection by prefixing formula-triggering characters with a single quote
	// These characters can trigger formula execution in spreadsheet applications
	if (/^[=+\-@\t\r]/.test(stringValue)) {
		stringValue = "'" + stringValue;
	}

	// If value contains comma, newline, or quote, wrap in quotes
	if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
		return `"${stringValue.replace(/"/g, '""')}"`;
	}

	return stringValue;
}

/**
 * Converts table data to JSON format
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {Array} visibleColumns - IDs of visible columns
 * @returns {string} JSON string
 */
export function dataToJSON(data, columns, visibleColumns) {
	if (!data || data.length === 0) {
		return '[]';
	}

	// Filter columns based on visibility
	const columnsToExport = columns.filter((col) => visibleColumns.includes(col.id));

	// Create array of objects with only visible columns
	const exportData = data.map((row) => {
		const exportRow = {};
		columnsToExport.forEach((col) => {
			let value = row[col.id];

			// Handle custom accessors if defined
			if (col.accessor && typeof col.accessor === 'function') {
				value = col.accessor(row);
			}

			exportRow[col.name] = value;
		});
		return exportRow;
	});

	return JSON.stringify(exportData, null, 2);
}

/**
 * Converts table data to true Excel (.xlsx) format
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {Array} visibleColumns - IDs of visible columns
 * @returns {Promise<Blob>} Excel file blob
 */
export async function dataToExcel(data, columns, visibleColumns) {
	if (!data || data.length === 0) {
		throw new Error('No data to export');
	}

	// Import xlsx library dynamically
	const XLSX = await import('xlsx');

	// Filter columns based on visibility
	const columnsToExport = columns.filter((col) => visibleColumns.includes(col.id));

	// Create array of objects with column names as keys
	const exportData = data.map((row) => {
		const exportRow = {};
		columnsToExport.forEach((col) => {
			let value = row[col.id];

			// Handle custom accessors if defined
			if (col.accessor && typeof col.accessor === 'function') {
				value = col.accessor(row);
			}

			// Handle objects and arrays
			if (value !== null && value !== undefined && typeof value === 'object') {
				value = JSON.stringify(value);
			}

			exportRow[col.name] = value;
		});
		return exportRow;
	});

	// Create worksheet from array of objects
	const worksheet = XLSX.utils.json_to_sheet(exportData);

	// Auto-size columns based on content
	const maxWidths = {};
	columnsToExport.forEach((col) => {
		maxWidths[col.name] = col.name.length;
	});

	exportData.forEach((row) => {
		columnsToExport.forEach((col) => {
			const value = row[col.name];
			const length = value ? String(value).length : 0;
			if (length > maxWidths[col.name]) {
				maxWidths[col.name] = length;
			}
		});
	});

	worksheet['!cols'] = columnsToExport.map((col) => ({
		wch: Math.min(maxWidths[col.name] + 2, 50) // Add padding, max 50 chars
	}));

	// Create workbook and add the worksheet
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

	// Generate Excel file
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

	// Create blob
	return new Blob([excelBuffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
}

/**
 * Downloads data as a file
 * @param {string|Blob} data - File content or blob
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 */
export function downloadFile(data, filename, mimeType) {
	let blob;

	if (data instanceof Blob) {
		blob = data;
	} else {
		blob = new Blob([data], { type: mimeType });
	}

	// Create download link
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();

	// Cleanup
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Exports table data in the specified format
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {Array} visibleColumns - IDs of visible columns
 * @param {string} format - Export format ('csv', 'json', or 'excel')
 * @param {string} filename - Base filename (without extension)
 */
export async function exportTableData(data, columns, visibleColumns, format, filename = 'export') {
	try {
		switch (format) {
			case 'csv': {
				const csvData = dataToCSV(data, columns, visibleColumns);
				downloadFile(csvData, `${filename}.csv`, 'text/csv');
				break;
			}
			case 'json': {
				const jsonData = dataToJSON(data, columns, visibleColumns);
				downloadFile(jsonData, `${filename}.json`, 'application/json');
				break;
			}
			case 'excel': {
				const excelBlob = await dataToExcel(data, columns, visibleColumns);
				downloadFile(excelBlob, `${filename}.xlsx`);
				break;
			}
			default:
				throw new Error(`Unsupported export format: ${format}`);
		}
	} catch (error) {
		console.error('Export error:', error);
		throw error;
	}
}
