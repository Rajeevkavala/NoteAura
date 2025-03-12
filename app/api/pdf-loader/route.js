import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";


// const pdfUrl = "https://rapid-crow-228.convex.cloud/api/storage/de93f04d-6881-46b2-a0b6-641db6825430";

export async function GET(req) {
    
    const reqUrl = req.url;
    const {searchParams} = new URL(reqUrl);
    const pdfUrl=searchParams.get('pdfUrl');

    console.log(pdfUrl);
    

    // 1. Load the PDF File
    const pdf = await fetch(pdfUrl);
    const data = await pdf.blob();
    const loader = new WebPDFLoader(data);
    const docs = await loader.load();

    let pdfTextContent = "";
    docs.forEach((doc) => {
        pdfTextContent = pdfTextContent + doc.pageContent;
    });

    //2.Split the text content into smaller chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const output = await splitter.createDocuments([pdfTextContent]);

    let splitterList = [];
    output.forEach((doc) => {
        splitterList.push(doc.pageContent);
    });


    return NextResponse.json({result:splitterList});
}