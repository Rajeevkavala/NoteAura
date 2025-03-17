"use client";
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'
import WorkSpaceHeader from "../_components/WorkspaceHeader";
import PdfViewer from '../_components/PdfViewer';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import TextEditor from '../_components/TextEditor';

const Workspace = () => {
    const {fileId} = useParams();
    const fileInfo =useQuery(api.fileStorage.GetFileRecord,{
        fileId:fileId
    })

    // useEffect(()=>{
    //     console.log(fileInfo);
    // },[fileInfo])

    // if (!fileInfo) return <div>Loading...</div>;

return (
    <div>
        <WorkSpaceHeader fileName={fileInfo?.fileName}/>    
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
            <div className='w-full'>
                {/* For Text Editor */}
                <TextEditor fileId={fileId}/>
            </div>
            <div className='mt-4 lg:mt-0'>
                {/* For PDF Viewer */}
                <PdfViewer fileUrl={fileInfo?.fileUrl} />
            </div>
        </div>
    </div>
    )
}

export default Workspace;