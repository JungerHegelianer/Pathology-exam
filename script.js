console.log('Script started');

fetch('tumors.json')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load tumors.json: ' + response.status);
        return response.json();
    })
    .then(data => {
        console.log('JSON loaded:', data);
        const tumors = data.tumors;
        console.log('Number of tumors:', tumors.length);
        console.log('Tumor list:', tumors.map(t => t.diagnosis));
        let currentTumor, currentImageIndex, overlayImageIndex, correctAnswers = 0;

        const imagesContainer = document.getElementById('tumorImages');
        const checkButton = document.getElementById('checkButton');
        const nextImageButton = document.getElementById('nextImageButton');
        const resultElement = document.getElementById('result');
        const nextTumorButton = document.getElementById('nextTumorButton');
        const userAnswerInput = document.getElementById('userAnswer');
        const scoreElement = document.getElementById('score');

        if (!checkButton || !nextImageButton || !nextTumorButton || !imagesContainer || !resultElement || !userAnswerInput || !scoreElement) {
            console.error('Error: One or more elements not found');
            return;
        }

        const tumorLinks = {
            "Lipoblastoma": "https://www.pathologyoutlines.com/topic/softtissuelipoblastoma.html",
            "Myxoid Liposarcoma": "https://www.pathologyoutlines.com/topic/softtissuemyxoidliposarcoma.html",
            "Angiolipoma": "https://www.pathologyoutlines.com/topic/softtissueangiolipoma.html"
        };

        function loadNewTumor() {
            const randomTumorIndex = Math.floor(Math.random() * tumors.length);
            currentTumor = tumors[randomTumorIndex];
            currentImageIndex = 0;
            imagesContainer.innerHTML = '';
            showImage();
            nextImageButton.style.display = currentTumor.images.length > 1 ? 'inline' : 'none';
            resultElement.innerHTML = '';
            nextTumorButton.style.display = 'none';
            userAnswerInput.value = '';
            console.log('Loaded new tumor:', currentTumor.diagnosis);
        }

        function showImage() {
            imagesContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = currentTumor.images[currentImageIndex];
            img.className = 'tumor-image';
            img.alt = 'Microphotograph';
            img.onerror = () => {
                img.alt = 'Image not available';
                console.error('Failed to load image:', img.src);
            };
            img.addEventListener('click', () => showOverlay(currentImageIndex));
            imagesContainer.appendChild(img);
            console.log('Shown image:', img.src);
            nextImageButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'inline' : 'none';
        }

        function showOverlay(index) {
            overlayImageIndex = index;
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
                    if (overlayImageIndex > 0) {
                        overlayImageIndex--;
                        updateOverlayImage();
                    }
                });

                document.getElementById('nextImage').addEventListener('click', () => {
                    if (overlayImageIndex < currentTumor.images.length - 1) {
                        overlayImageIndex++;
                        updateOverlayImage();
                    }
                });
            }
            overlay.style.display = 'flex';
            updateOverlayImage();
        }

        function updateOverlayImage() {
            const overlayImg = document.querySelector('.overlay img');
            overlayImg.src = currentTumor.images[overlayImageIndex];
            console.log('Overlay image:', overlayImg.src);
            const prevButton = document.getElementById('prevImage');
            const nextButton = document.getElementById('nextImage');
            prevButton.style.display = overlayImageIndex > 0 ? 'block' : 'none';
            nextButton.style.display = overlayImageIndex < currentTumor.images.length - 1 ? 'block' : 'none';
        }

        function showSelfAssessmentModal() {
            let modal = document.querySelector('.modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = `
                    <p>Did you get it right?</p>
                    <button id="selfCorrect">I got it right</button>
                    <button id="selfIncorrect">I got it wrong</button>
                `;
                document.body.appendChild(modal);

                document.getElementById('selfCorrect').addEventListener('click', () => {
                    correctAnswers++;
                    scoreElement.textContent = `Correct answers: ${correctAnswers}`;
                    modal.style.display = 'none';
                    nextTumorButton.style.display = 'inline';
                });

                document.getElementById('selfIncorrect').addEventListener('click', () => {
                    scoreElement.textContent = `Correct answers: ${correctAnswers}`;
                    modal.style.display = 'none';
                    nextTumorButton.style.display = 'inline';
                });
            }
            modal.style.display = 'block';
        }

        checkButton.addEventListener('click', () => {
            if (currentTumor) {
                const link = tumorLinks[currentTumor.diagnosis] ? 
                    `<a href="${tumorLinks[currentTumor.diagnosis]}" target="_blank">Read more</a>` : 
                    'No article link available';
                resultElement.innerHTML = `Diagnosis: ${currentTumor.diagnosis}<br>${link}`;
                nextImageButton.style.display = 'none';
                showSelfAssessmentModal();
            } else {
                resultElement.textContent = 'Error: No tumor loaded';
            }
        });

        nextImageButton.addEventListener('click', () => {
            if (currentImageIndex < currentTumor.images.length - 1) {
                currentImageIndex++;
                showImage();
            }
        });

        nextTumorButton.addEventListener('click', loadNewTumor);

        loadNewTumor();
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('result') && (document.getElementById('result').textContent = 'Error loading data');
    });