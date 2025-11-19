/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import AddEditUserForm from '../add-user-form';
import { fetchUserByIdAsync } from '@/services/admin/asyncThunk';
import { User } from '@/types/user';

export default function EditUserPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { id } = router.query;

    const [userId, setUserId] = useState<string | null>(null);
    const [initialUser, setInitialUser] = useState<User | undefined>();

    useEffect(() => {
        if (!router.isReady || typeof id !== 'string') return;

        setUserId(id);

        const loadUser = async () => {
            try {
                const response = await dispatch(fetchUserByIdAsync(id)).unwrap();
                const userData = response;
                setInitialUser(userData);
            } catch (err: any) {
                console.error('Failed to fetch user', err);

            } finally {
            }
        };

        loadUser();
    }, [router.isReady, id, dispatch, router]);


    if (!userId || !initialUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#EEEEEE]">
                <div className="text-center">
                    <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                        User not found
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AddEditUserForm
            mode="edit"
            userId={userId}
            initialUser={initialUser}
        />
    );
}