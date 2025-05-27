console.log('Script started');

let tumors = [];
let usedTumors = [];
let currentTumor, currentImageIndex = 0, correctAnswers = 0, totalTumors = 0;
let isSelfAssessed = false;

const imagesContainer = document.getElementById('tumorImages');
const clinicalInfoElement = document.getElementById('clinicalInfo');
const checkButton = document.getElementById('checkButton');
const nextImageButton = document.getElementById('nextImageButton');
const showAllImagesButton = document.getElementById('showAllImagesButton');
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
            showAllImagesButton.style.display = 'inline';
        })
        .catch(error => {
            console.error('Error:', error);
            resultElement.textContent = `Error loading ${section} data. Check if ${section}.json exists.`;
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
    isSelfAssessed = false;

    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    imagesContainer.innerHTML = '';
    clinicalInfoElement.textContent = currentTumor.clinicalInfo || '';
    clinicalInfoElement.style.fontStyle = 'italic';
    clinicalInfoElement.style.textAlign = 'center';
    clinicalInfoElement.style.marginBottom = '10px';
    showInitialImage();
    nextImageButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'inline' : 'none';
    showAllImagesButton.style.display = currentTumor.images.length > 1 ? 'inline' : 'none';
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
    imagesContainer.innerHTML = '';
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
    nextImageButton.style.display = 'none';
    showAllImagesButton.style.display = 'none';
}

function showOverlay(index) {
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <button id="prevImage"><</button>
                <img id="overlayImg" src="" alt="Enlarged image">
                <button id="nextImage">></button>
                <button id="closeOverlay">×</button>
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

        document.getElementById('closeOverlay').addEventListener('click', () => {
            overlay.style.display = 'none';
        });

        const overlayImg = document.getElementById('overlayImg');
        overlayImg.addEventListener('click', (e) => {
            const rect = overlayImg.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const imgWidth = rect.width;
            if (clickX < imgWidth / 2 && currentImageIndex > 0) {
                currentImageIndex--;
                updateOverlayImage();
            } else if (clickX >= imgWidth / 2 && currentImageIndex < currentTumor.images.length - 1) {
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
            <div class="modal-content">
                <span class="close">×</span>
                <p id="diagnosis">Correct diagnosis: ${currentTumor.diagnosis}</p>
                <p id="articleLink">${linkHtml}</p>
                <button id="selfCorrect">I was right</button>
                <button id="selfIncorrect">I was wrong</button>
                <p id="modalScore">Score: ${correctAnswers}/${totalTumors}</p>
            </div>
        `;
        document.body.appendChild(modal);

        const closeButton = modal.querySelector('.close');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            if (!isSelfAssessed) checkButton.disabled = false;
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (!isSelfAssessed) checkButton.disabled = false;
            }
        });

        const selfCorrectButton = modal.querySelector('#selfCorrect');
        const selfIncorrectButton = modal.querySelector('#selfIncorrect');

        selfCorrectButton.addEventListener('click', () => {
            if (!isSelfAssessed) {
                correctAnswers++;
                totalTumors++;
                isSelfAssessed = true;
                scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
                modal.querySelector('#modalScore').textContent = `Score: ${correctAnswers}/${totalTumors}`;
                selfCorrectButton.style.display = 'none';
                selfIncorrectButton.style.display = 'none';
                nextCaseButton.style.display = 'inline';
            }
            modal.style.display = 'none';
            checkButton.disabled = false;
        });

        selfIncorrectButton.addEventListener('click', () => {
            if (!isSelfAssessed) {
                totalTumors++;
                isSelfAssessed = true;
                scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
                modal.querySelector('#modalScore').textContent = `Score: ${correctAnswers}/${totalTumors}`;
                selfCorrectButton.style.display = 'none';
                selfIncorrectButton.style.display = 'none';
                nextCaseButton.style.display = 'inline';
            }
            modal.style.display = 'none';
            checkButton.disabled = false;
        });
    } else {
        const diagnosisElement = modal.querySelector('#diagnosis');
        const articleLinkElement = modal.querySelector('#articleLink');
        const scoreElement = modal.querySelector('#modalScore');
        const selfCorrectButton = modal.querySelector('#selfCorrect');
        const selfIncorrectButton = modal.querySelector('#selfIncorrect');

        if (diagnosisElement) {
            diagnosisElement.textContent = `Correct diagnosis: ${currentTumor.diagnosis}`;
        }
        if (articleLinkElement) {
            articleLinkElement.innerHTML = linkHtml;
        }
        if (scoreElement) {
            scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
        }
        if (selfCorrectButton && selfIncorrectButton) {
            selfCorrectButton.style.display = isSelfAssessed ? 'none' : 'inline';
            selfIncorrectButton.style.display = isSelfAssessed ? 'none' : 'inline';
        }
    }
    modal.style.display = 'block';
}

checkButton.addEventListener('click', () => {
    if (currentTumor) {
        resultElement.textContent = `Diagnosis: ${currentTumor.diagnosis}`;
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

showAllImagesButton.addEventListener('click', showAllImages);

nextCaseButton.addEventListener('click', loadNewCase);

sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const section = button.dataset.section;
        loadSection(section);
    });
});

loadSection('skin');