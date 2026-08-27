const selectImageButton = document.getElementById('selectImageButton');
const emptyEditor = document.getElementById('emptyEditor');
const imageWorkspace = document.getElementById('imageWorkspace');
const editorImage = document.getElementById('editorImage');
const exportButton = document.getElementById('exportButton');

let selectedImageUrl = null;

selectImageButton.addEventListener('click', () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';

    input.addEventListener('change', () => {
        const file = input.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('الملف المحدد ليس صورة.');
            return;
        }

        if (selectedImageUrl) {
            URL.revokeObjectURL(selectedImageUrl);
        }

        selectedImageUrl = URL.createObjectURL(file);

        editorImage.src = selectedImageUrl;

        emptyEditor.hidden = true;
        imageWorkspace.hidden = false;
        exportButton.disabled = false;
    });

    input.click();
});

window.addEventListener('beforeunload', () => {
    if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
    }
});
