console.log('Script started');

fetch('tumors.json')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load tumors.json: ' + response.status);
        return response.json();
    })
    .then(data => {
        console.log('JSON loaded:', data);
        let tumors = [...data.tumors]; // Копия массива для рандомизации
        let usedTumors = []; // Массив использованных опухолей
        let currentTumor, currentImageIndex = 0, correctAnswers = 0, totalTumors = 0;

        const imagesContainer = document.getElementById('tumorImages');
        const checkButton = document.getElementById('checkButton');
        const nextImageButton = document.getElementById('nextImageButton');
        const resultElement = document.getElementById('result');
        const nextTumorButton = document.getElementById('nextTumorButton');
        const scoreElement = document.getElementById('score');

        if (!checkButton || !nextImageButton || !nextTumorButton || !imagesContainer || !resultElement || !scoreElement) {
            console.error('Error: One or more elements not found');
            return;
        }

        function loadNewTumor() {
            if (tumors.length === 0) {
                resultElement.textContent = 'No more tumors available!';
                checkButton.style.display = 'none';
                nextImageButton.style.display = 'none';
                nextTumorButton.style.display = 'none';
                return;
            }

            const randomIndex = Math.floor(Math.random() * tumors.length);
            currentTumor = tumors[randomIndex];
            usedTumors.push(currentTumor);
            tumors.splice(randomIndex, 1); // Удаляем использованную опухоль
            currentImageIndex = 0;

            imagesContainer.innerHTML = ''; // Очищаем предыдущие изображения
            showImage();
            nextImageButton.style.display = currentTumor.images.length > 1 ? 'inline' : 'none';
            resultElement.innerHTML = '';
            nextTumorButton.style.display = 'none';
            checkButton.disabled = false;
        }

        function showImage() {
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
            nextImageButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'inline' : 'none';
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
            if (!modal) {
                modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = `
                    <p>Correct diagnosis: ${currentTumor.diagnosis}</p>
                    <button id="selfCorrect">I was right</button>
                    <button id="selfIncorrect">I was wrong</button>
                `;
                document.body.appendChild(modal);

                document.getElementById('selfCorrect').addEventListener('click', () => {
                    correctAnswers++;
                    totalTumors++;
                    scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
                    modal.style.display = 'none';
                    nextTumorButton.style.display = 'inline';
                });

                document.getElementById('selfIncorrect').addEventListener('click', () => {
                    totalTumors++;
                    scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
                    modal.style.display = 'none';
                    nextTumorButton.style.display = 'inline';
                });
            } else {
                modal.querySelector('p').textContent = `Correct diagnosis: ${currentTumor.diagnosis}`;
            }
            modal.style.display = 'block';
        }

        checkButton.addEventListener('click', () => {
            if (currentTumor) {
                resultElement.textContent = `Diagnosis: ${currentTumor.diagnosis}`;
                nextImageButton.style.display = 'none';
                checkButton.disabled = true;
                showSelfAssessmentModal();
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
        const result = document.getElementById('result');
        if (result) result.textContent = 'Error loading data';
    });