console.log('Script started');

let tumors = [];
let usedTumors = [];
let currentTumor, currentImageIndex = 0, correctAnswers = 0, totalTumors = 0;

const imagesContainer = document.getElementById('tumorImages');
const clinicalInfoElement = document.getElementById('clinicalInfo');
const checkButton = document.getElementById('checkButton');
const nextImageButton = document.getElementById('nextImageButton');
const showAllImagesButton = document.getElementById('showAllImagesButton'); // Новая кнопка
const resultElement = document.getElementById('result');
const nextCaseButton = document.getElementById('nextTumorButton');
const scoreElement = document.getElementById('score');
const sectionButtons = document.querySelectorAll('#sectionMenu button');

if (!checkButton || !nextImageButton || !showAllImagesButton || !nextCaseButton || !imagesContainer || !resultElement || !scoreElement || !clinicalInfoElement) {
    console.error('Error: One or more elements not found');
}

function loadSection(section) {
    fetch(`${section}.json`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${section}.json: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(`${section} JSON loaded:`, data);
            tumors = [...data.tumors];
            usedTumors = [];
            currentImageIndex = 0;
            correctAnswers = 0;
            totalTumors = 0;
            scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
            loadNewCase();
            checkButton.style.display = 'inline';
            nextImageButton.style.display = 'inline';
            showAllImagesButton.style.display = 'inline'; // Показываем новую кнопку
        })
        .catch(error => {
            console.error('Error:', error);
            resultElement.textContent = `Error loading ${section} data`;
        });
}

function loadNewCase() {
    if (tumors.length === 0) {
        resultElement.textContent = 'No more cases available!';
        checkButton.style.display = 'none';
        nextImageButton.style.display = 'none';
        showAllImagesButton.style.display = 'none';
        nextCaseButton.style.display = 'none';
        return;
    }

    const randomIndex = Math.floor(Math.random() * tumors.length);
    currentTumor = tumors[randomIndex];
    usedTumors.push(currentTumor);
    tumors.splice(randomIndex, 1);
    currentImageIndex = 0;

    imagesContainer.innerHTML = '';
    clinicalInfoElement.textContent = currentTumor.clinicalInfo || '';
    clinicalInfoElement.style.fontStyle = 'italic';
    clinicalInfoElement.style.textAlign = 'center';
    clinicalInfoElement.style.marginBottom = '10px';
    showInitialImage();
    nextImageButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'inline' : 'none';
    showAllImagesButton.style.display = currentTumor.images.length > 1 ? 'inline' : 'none'; // Показываем, если больше 1 изображения
    resultElement.innerHTML = '';
    nextCaseButton.style.display = 'none';
    checkButton.disabled = false;
}

function showInitialImage() {
    const img = document.createElement('img');
    img.src = currentTumor.images[currentImageIndex];
    img.className = 'tumor-image';
    img.alt = 'Microphotograph';
    img.onerror = () => {
        img.alt = 'Image not available';
        console.error('Failed to load image:', img.src);
    };
    img.dataset.index = currentImageIndex;
    img.addEventListener('click', (e) => showOverlay(parseInt(e.target.dataset.index)));
    img.style.display = 'inline-block';
    img.style.margin = '5px';
    imagesContainer.appendChild(img);
}

function addNextImage() {
    const img = document.createElement('img');
    img.src = currentTumor.images[currentImageIndex];
    img.className = 'tumor-image';
    img.alt = 'Microphotograph';
    img.onerror = () => {
        img.alt = 'Image not available';
        console.error('Failed to load image:', img.src);
    };
    img.dataset.index = currentImageIndex;
    img.addEventListener('click', (e) => showOverlay(parseInt(e.target.dataset.index)));
    img.style.display = 'inline-block';
    img.style.margin = '5px';
    imagesContainer.appendChild(img);
}

function showAllImages() {
    imagesContainer.innerHTML = ''; // Очищаем контейнер
    currentTumor.images.forEach((imageSrc, index) => {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.className = 'tumor-image';
        img.alt = 'Microphotograph';
        img.onerror = () => {
            img.alt = 'Image not available';
            console.error('Failed to load image:', img.src);
        };
        img.dataset.index = index;
        img.addEventListener('click', (e) => showOverlay(parseInt(e.target.dataset.index)));
        img.style.display = 'inline-block';
        img.style.margin = '5px';
        imagesContainer.appendChild(img);
    });
    nextImageButton.style.display = 'none'; // Скрываем "Next Image", так как все изображения уже показаны
    showAllImagesButton.style.display = 'none'; // Скрываем "Show All Images"
}

function showOverlay(index) {
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <button id="prevImage"><</button>
                <img src="" alt="Enlarged image">
                <button id="nextImage">></button>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });

        document.getElementById('prevImage').addEventListener('click', () => {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateOverlayImage();
            }
        });

        document.getElementById('nextImage').addEventListener('click', () => {
            if (currentImageIndex < currentTumor.images.length - 1) {
                currentImageIndex++;
                updateOverlayImage();
            }
        });
    }
    overlay.style.display = 'flex';
    currentImageIndex = index;
    updateOverlayImage();
}

function updateOverlayImage() {
    const overlayImg = document.querySelector('.overlay img');
    overlayImg.src = currentTumor.images[currentImageIndex];
    const prevButton = document.getElementById('prevImage');
    const nextButton = document.getElementById('nextImage');
    prevButton.style.display = currentImageIndex > 0 ? 'block' : 'none';
    nextButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'block' : 'none';
}

function showSelfAssessmentModal() {
    let modal = document.querySelector('.modal');
    const linkHtml = currentTumor.articleLink ? 
        `<a href="${currentTumor.articleLink}" target="_blank" rel="noopener noreferrer" class="article-link">Read more on Pathology Outlines</a>` : 
        'No article link available';
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <p>Correct diagnosis: ${currentTumor.diagnosis}</p>
            <p>${linkHtml}</p>
            <button id="selfCorrect">I was right</button>
            <button id="selfIncorrect">I was wrong</button>
            <p id="modalScore">Score: ${correctAnswers}/${totalTumors}</p>
        `;
        document.body.appendChild(modal);

        document.getElementById('selfCorrect').addEventListener('click', () => {
            correctAnswers++;
            totalTumors++;
            scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
            modal.querySelector('#modalScore').textContent = `Score: ${correctAnswers}/${totalTumors}`;
            modal.style.display = 'none';
            nextCaseButton.style.display = 'inline';
        });

        document.getElementById('selfIncorrect').addEventListener('click', () => {
            totalTumors++;
            scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
            modal.querySelector('#modalScore').textContent = `Score: ${correctAnswers}/${totalTumors}`;
            modal.style.display = 'none';
            nextCaseButton.style.display = 'inline';
        });
    } else {
        modal.querySelector('p:first-child').textContent = `Correct diagnosis: ${currentTumor.diagnosis}`;
        modal.querySelector('p:nth-child(2)').innerHTML = linkHtml;
        modal.querySelector('#modalScore').textContent = `Score: ${correctAnswers}/${totalTumors}`;
    }
    modal.style.display = 'block';
}

checkButton.addEventListener('click', () => {
    if (currentTumor) {
        resultElement.textContent = `Diagnosis: ${currentTumor.diagnosis}`;
        checkButton.disabled = true;
        showSelfAssessmentModal();
    }
});

nextImageButton.addEventListener('click', () => {
    if (currentTumor && currentImageIndex < currentTumor.images.length - 1) {
        currentImageIndex++;
        addNextImage();
        nextImageButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'inline' : 'none';
    }
});

showAllImagesButton.addEventListener('click', showAllImages); // Обработчик для новой кнопки

nextCaseButton.addEventListener('click', loadNewCase);

sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const section = button.dataset.section;
        loadSection(section);
    });
});

loadSection('softTissue');