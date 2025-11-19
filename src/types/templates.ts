export interface Template {
    id: string;
    title: string;
    type: 'residential' | 'commercial';
    category: string;
    canvaUrl: string;
    previewImageUrl?: string;
}