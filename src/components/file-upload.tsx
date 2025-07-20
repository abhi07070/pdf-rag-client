'use client'
import React from 'react'
import { UploadSimple } from "@phosphor-icons/react";

const FileUpload: React.FC = () => {

  const handleFileUploadButtonClick = () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", ".pdf");
    el.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        console.log("File selected:", file);
      }
    });
    document.body.appendChild(el);
    el.click();
    console.log("File upload button clicked");
  };

  return (
    <div className="bg-slate-900 text-white shadow-2xl flex items-center justify-center p-4 rounded-lg border-white border-2">
      <div onClick={handleFileUploadButtonClick} className="flex flex-col items-center justify-center">
        <h3>Upload PDF File</h3>
        <UploadSimple size={32} />
      </div>
    </div>
  )
}

export default FileUpload;
