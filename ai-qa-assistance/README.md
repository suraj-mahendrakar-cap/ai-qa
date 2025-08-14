# AI QA Assistance

A comprehensive dashboard for managing API testing and quality assurance workflows.

## Features

### Postman Collections Management

- **Upload Postman Collections**: Drag-and-drop or file browser upload for JSON Postman collection files
- **Collection Validation**: Automatic validation of Postman collection format and structure
- **Collection Management**: View, search, download, and delete uploaded collections
- **Real-time Updates**: Collections list updates automatically after uploads
- **File Size Limits**: 10MB maximum file size with proper error handling

### Upload Functionality

- **Drag & Drop Support**: Intuitive drag-and-drop interface for file uploads
- **File Validation**:
  - JSON format validation
  - Postman collection structure validation
  - File size validation (max 10MB)
- **Progress Tracking**: Visual upload progress indicator
- **Error Handling**: Comprehensive error messages and validation feedback
- **Responsive Design**: Works on desktop and mobile devices

### Collection Features

- **Metadata Extraction**: Automatically extracts collection name, description, schema, and request count
- **Search & Filter**: Search collections by name or description
- **Download Collections**: Download collections with proper filenames
- **Delete Collections**: Remove collections with confirmation
- **Collection Statistics**: Display request count, schema version, and upload date

## API Endpoints

### Upload Collection

- `POST /api/upload-collection`
  - Accepts multipart form data with JSON file
  - Validates file format and Postman collection structure
  - Returns collection metadata on success

### List Collections

- `GET /api/upload-collection`
  - Returns list of all uploaded collections
  - Includes metadata for each collection

### Download Collection

- `GET /api/upload-collection/[id]/download`
  - Downloads specific collection by ID
  - Returns JSON file with proper filename

### Delete Collection

- `DELETE /api/upload-collection/[id]`
  - Deletes specific collection by ID
  - Removes file from storage

## File Storage

Collections are stored in the `uploads/collections/` directory with the following structure:

- Files are named with timestamp prefix: `[timestamp]_[original-filename].json`
- Automatic directory creation if it doesn't exist
- Proper file permissions and error handling

## Usage

1. **Navigate to Postman Collections**: Go to `/postman-collections` route
2. **Upload Collection**: Click "Upload Collection" button or drag JSON file to upload area
3. **View Collections**: Browse uploaded collections with search and filter options
4. **Manage Collections**: Download, delete, or run collections as needed

## Technical Details

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Client-side file validation
- Real-time state management

### Backend

- Next.js API routes
- File system storage
- JSON validation and parsing
- Error handling and logging

### File Validation

- JSON format validation
- Postman collection schema validation
- File size limits (10MB)
- Malicious file protection

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── upload-collection/
│   │       ├── route.ts                    # Main upload/list API
│   │       └── [id]/
│   │           ├── route.ts                # Delete/GET by ID
│   │           └── download/
│   │               └── route.ts            # Download endpoint
│   └── postman-collections/
│       └── page.tsx                        # Collections page
├── components/
│   ├── upload-collection.tsx               # Upload component
│   └── ui/                                 # UI components
└── lib/
    └── utils.ts                            # Utility functions
```

## Security Considerations

- File type validation (JSON only)
- File size limits
- Path traversal protection
- Input sanitization
- Error message sanitization

## Future Enhancements

- Collection versioning
- Environment variable management
- Collection sharing and collaboration
- API testing execution
- Test result tracking
- Integration with external Postman API
