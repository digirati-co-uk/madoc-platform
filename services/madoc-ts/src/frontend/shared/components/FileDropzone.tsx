import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { MetadataDropzone } from '../atoms/MetadataConfiguration';
import { useApi } from '../hooks/use-api';

export const FileDropzone: React.FC = () => {
  const api = useApi();
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];

      api.media.createMedia(file).then(media => {
        navigate(`/media/${media.id}`);
      });
    },
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <MetadataDropzone $active={isDragActive}>
        {isDragActive ? <p>Drop image here ...</p> : <p>Drag & drop an image, or click to select an image</p>}
      </MetadataDropzone>
    </div>
  );
};
