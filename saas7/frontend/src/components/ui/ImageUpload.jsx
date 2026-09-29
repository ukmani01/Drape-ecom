import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadSingle } from '../../api/upload';
import toast from 'react-hot-toast';
import Button from './Button';
import clsx from 'clsx';

const ImageUpload = ({ onUpload, folder, existingImage, className }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingImage || null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadSingle(file, folder);
      setPreview(data.data.url);
      onUpload(data.data);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [folder, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className={clsx('w-full', className)}>
      <div
        {...getRootProps()}
        className={clsx(
          'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-primary-400',
          preview ? 'pt-0' : ''
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Uploaded" className="max-h-48 rounded-lg object-contain mx-auto" />
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setPreview(null); }}>Change</Button>
            </div>
          </div>
        ) : (
          <div>
            {uploading ? (
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            ) : (
              <p className="text-secondary-500">Drag & drop an image here, or click to select</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
