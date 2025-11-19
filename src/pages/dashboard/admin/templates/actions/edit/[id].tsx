// pages/dashboard/admin/templates/[id]/edit.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/hooks';
import { fetchTemplateByIdAsync } from '@/services/template/asyncThunk';
import AddTemplateForm from '../add-template-form';
import { Template } from '@/types/templates';

export default function EditTemplatePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { id } = router.query;
    console.log("id", id)
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [initialTemplate, setInitialTemplate] = useState<Template | null>(null);
    console.log("initial", initialTemplate)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!router.isReady || typeof id !== 'string') return;

        setTemplateId(id);

        const loadTemplate = async () => {
            try {
                const data = await dispatch(fetchTemplateByIdAsync(id)).unwrap();
                console.log("data", data)
                setInitialTemplate(data as Template);
            } catch (err) {
                console.error('Failed to fetch template', err);
            } finally {
                setLoading(false);
            }
        };

        loadTemplate();
    }, [router.isReady, id, dispatch]);

    
    if (!templateId || loading) return <div>Loading...</div>;

    return (
        <AddTemplateForm
            mode="edit"
            templateId={templateId}
            initialTemplate={initialTemplate}
        />
    );
}
