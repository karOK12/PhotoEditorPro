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
