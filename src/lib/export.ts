import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export interface ExportData {
    title: string;
    content: string;
    references: string;
}

export const exportToMarkdown = (data: ExportData) => {
    const blob = new Blob([`# ${data.title}\n\n${data.content}\n\n${data.references}`], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${data.title.toLowerCase().replace(/\s+/g, '_')}_draft.md`);
};

export const exportToBibtex = (data: ExportData) => {
    // Simple bibtex export - in a real app we'd get full bibtex from the API
    // For now, we'll suggest using MD export if full BIB isn't ready
    const blob = new Blob([data.references], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${data.title.toLowerCase().replace(/\s+/g, '_')}_references.bib`);
};

export const exportToDocx = async (data: ExportData) => {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: data.title,
                        heading: HeadingLevel.HEADING_1,
                    }),
                    ...data.content.split('\n').map(line =>
                        new Paragraph({
                            children: [new TextRun(line)],
                            spacing: { after: 200 }
                        })
                    ),
                    new Paragraph({
                        text: "References",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400 }
                    }),
                    ...data.references.split('\n').map(line =>
                        new Paragraph({
                            children: [new TextRun(line)],
                            spacing: { after: 100 }
                        })
                    ),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${data.title.toLowerCase().replace(/\s+/g, '_')}_draft.docx`);
};
