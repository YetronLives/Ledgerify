# File Storage Setup for Journal Entry Attachments

## Overview
This guide will help you set up Supabase Storage to handle file uploads for journal entry attachments.

## Step 1: Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Create a bucket with these settings:
   - **Name**: `ledgerify-files`
   - **Public bucket**: ✅ Check this box (so files are publicly accessible via URL)
   - Click **"Create bucket"**

## Step 2: Set Up Storage Policies (Optional but Recommended)

If you want more control over who can upload/access files, you can set up Row Level Security (RLS) policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ledgerify-files');

-- Allow public access to read files
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ledgerify-files');

-- Allow users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ledgerify-files');
```

## Step 3: Test the Setup

After creating the bucket, your file upload system is ready to use!

### How It Works:

1. **User selects files** in the Journal Entry form
2. **Frontend uploads files** to `/upload-files` endpoint
3. **Backend (multer)** receives files in memory
4. **Supabase Storage** stores files in `ledgerify-files/journal-attachments/` folder
5. **Backend returns URLs** for the uploaded files
6. **Journal entry created** with file URLs stored in `journal_lines` table
7. **Users can download** files by clicking the attachment links

### File Storage Structure:
```
ledgerify-files/
└── journal-attachments/
    ├── 1730000000_0_invoice.pdf
    ├── 1730000000_1_receipt.jpg
    └── 1730000000_2_report.xlsx
```

### Supported File Types:
- PDF (`.pdf`)
- Word Documents (`.doc`, `.docx`)
- Excel Spreadsheets (`.xls`, `.xlsx`)
- CSV Files (`.csv`)
- Images (`.jpg`, `.jpeg`, `.png`)

### File Size Limit:
- Maximum 10MB per file
- Maximum 10 files per journal entry

## Troubleshooting

### "Bucket not found" Error
- Make sure the bucket name is exactly `ledgerify-files`
- Ensure the bucket is created in the correct Supabase project

### "Permission denied" Error
- Make sure the bucket is set to **public**
- Check that your Supabase API key has storage permissions

### Files not showing in journal entries
- Verify that files were uploaded successfully (check Supabase Storage dashboard)
- Ensure the URLs are being saved correctly in the `journal_lines` table
- Check browser console for any error messages

## Database Schema

The file information is stored in the `journal_lines` table with these columns:
- `file_name`: Original filename
- `file_url`: Public URL to download the file
- `file_type`: MIME type (e.g., `application/pdf`, `image/jpeg`)

## Security Notes

1. **Public Access**: Files are publicly accessible via URL (anyone with the URL can download)
2. **File Validation**: Only allowed file types can be uploaded (enforced by multer)
3. **Size Limits**: Files are limited to 10MB to prevent abuse
4. **Unique Filenames**: Files are renamed with timestamps to prevent conflicts

## Next Steps

After setup is complete:
1. Restart your backend server
2. Test uploading a file in a journal entry
3. Verify the file appears in Supabase Storage
4. Click the attachment link to verify download works

