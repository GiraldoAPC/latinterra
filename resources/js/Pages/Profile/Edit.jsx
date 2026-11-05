import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { PageHeader, Surface } from '@/Components/Shared/PageDesign';
import { UserRound } from 'lucide-react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader className="mb-0" icon={UserRound} title="Mi cuenta" description="Actualiza tus datos de acceso y la seguridad de tu cuenta." />}
        >
            <Head title="Mi cuenta" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Surface className="p-5 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </Surface>

                    <Surface className="p-5 sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </Surface>

                    <Surface className="p-5 sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </Surface>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
