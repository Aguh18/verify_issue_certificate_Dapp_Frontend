import SidebarButton from "./sidebar/button";

function Sidebar() {
    return (
        <aside className=" w-full flex flex-col  px-[20%]  gap-[5%]  h-full bg-yellow-50">
            <SidebarButton
                props={{
                    text: 'Dashboard',
                    icon: 'home',
                    link: '/dashboard',
                }}
            />
            <SidebarButton
                props={{
                    text: 'Kelola Sertifikat',
                    icon: 'certificate',
                    link: '/certificates',
                }}
            />
            <SidebarButton
                props={{
                    text: 'Terbitkan Sertifikat',
                    icon: 'plus-circle',
                    link: '/issue-certificate',
                }}
            />
            <SidebarButton
                props={{
                    text: 'Template',
                    icon: 'upload',
                    link: '/upload-template',
                }}
            />
            <SidebarButton
                props={{
                    text: 'Verifikasi Sertifikat',
                    icon: 'check-circle',
                    link: '/verify-certificate',
                }}
            />
            <SidebarButton
                props={{
                    text: 'Riwayat Aktivitas',
                    icon: 'clock',
                    link: '/activity-log',
                }}
            />
            <SidebarButton
                props={{
                    text: 'Pengaturan',
                    icon: 'gear',
                    link: '/settings',
                }}
            />
        </aside>
    );
}
export default Sidebar;