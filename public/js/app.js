const imageEditorButton = document.getElementById('imageEditorButton');

imageEditorButton.addEventListener('click', () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (!file) return;

        console.log('تم اختيار الصورة:', file.name);

        alert(`تم اختيار الصورة بنجاح:\n${file.name}`);
    });

    input.click();
});

const sidebarButton = document.getElementById('sidebarButton');
const sidebar = document.getElementById('sidebar');

if (sidebarButton && sidebar) {
    sidebarButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

document.addEventListener('click', (event) => {
    if (!sidebarButton || !sidebar) return;

    const target = event.target;

    if (
        sidebar.classList.contains('open') &&
        !sidebar.contains(target) &&
        !sidebarButton.contains(target)
    ) {
        sidebar.classList.remove('open');
    }
});

async function loadSidebarUser() {
    const userName = document.getElementById('sidebarUserName');
    const profileImage = document.getElementById('sidebarProfileImage');

    // تحميل صورة البروفايل التي اختارها المستخدم من صفحة /profile
    const savedProfileImage = localStorage.getItem('profileImage');

    if (profileImage && savedProfileImage) {
        profileImage.src = savedProfileImage;
    }

    if (!userName) return;

    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.success && data.authenticated && data.user) {
            userName.textContent = data.user.fullName || data.user.email || 'المستخدم';
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
    }
}

loadSidebarUser();
