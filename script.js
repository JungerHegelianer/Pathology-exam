console.log('Script started');

fetch('tumors.json')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load tumors.json: ' + response.status);
        return response.json();
    })
    .then(data => {
        console.log('JSON loaded:', data);
        let tumors = [...data.tumors];
        let usedTumors = [];
        let currentTumor, currentImageIndex = 0, correctAnswers = 0, totalTumors = 0;

        const imagesContainer = document.getElementById('tumorImages');
        const clinicalInfoElement = document.getElementById('clinicalInfo');
        const checkButton = document.getElementById('checkButton');
        const nextImageButton = document.getElementById('nextImageButton');
        const resultElement = document.getElementById('result');
        const nextTumorButton = document.getElementById('nextTumorButton');
        const scoreElement = document.getElementById('score');

        // Проверка наличия всех необходимых элементов DOM
        if (!checkButton || !nextImageButton || !nextTumorButton || !imagesContainer || !resultElement || !scoreElement || !clinicalInfoElement) {
            console.error('Error: One or more elements not found');
            return;
        }

        // Функция загрузки новой опухоли
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
            tumors.splice(randomIndex, 1);
            currentImageIndex = 0;

            imagesContainer.innerHTML = '';
            clinicalInfoElement.textContent = currentTumor.clinicalInfo || '';
            clinicalInfoElement.style.fontStyle = 'italic';
            clinicalInfoElement.style.textAlign = 'center';
            clinicalInfoElement.style.marginBottom = '10px';
            showInitialImage();
            nextImageButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'inline' : 'none';
            resultElement.innerHTML = '';
            nextTumorButton.style.display = 'none';
            checkButton.disabled = false;
        }

        // Функция отображения первой картинки
        function showInitialImage() {
            const img = document.createElement('img');
            img.src = currentTumor.images[currentImageIndex];
            img.className = 'tumor-image';
            img.alt = 'Microphotograph';
            img.onerror = () => {
                img.alt = 'Image not available';
                console.error('Failed to load image:', img.src);
            };
            img.dataset.index = currentImageIndex; // Сохраняем индекс в dataset
            img.addEventListener('click', (e) => showOverlay(parseInt(e.target.dataset.index)));
            img.style.display = 'inline-block';
            img.style.margin = '5px';
            imagesContainer.appendChild(img);
        }

        // Функция добавления следующей картинки
        function addNextImage() {
            const img = document.createElement('img');
            img.src = currentTumor.images[currentImageIndex];
            img.className = 'tumor-image';
            img.alt = 'Microphotograph';
            img.onerror = () => {
                img.alt = 'Image not available';
                console.error('Failed to load image:', img.src);
            };
            img.dataset.index = currentImageIndex; // Сохраняем индекс в dataset
            img.addEventListener('click', (e) => showOverlay(parseInt(e.target.dataset.index)));
            img.style.display = 'inline-block';
            img.style.margin = '5px';
            imagesContainer.appendChild(img);
        }

        // Функция показа увеличенного изображения в оверлее
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
            currentImageIndex = index; // Устанавливаем индекс кликнутой картинки
            updateOverlayImage();
        }

        // Функция обновления изображения в оверлее
        function updateOverlayImage() {
            const overlayImg = document.querySelector('.overlay img');
            overlayImg.src = currentTumor.images[currentImageIndex];
            const prevButton = document.getElementById('prevImage');
            const nextButton = document.getElementById('nextImage');
            prevButton.style.display = currentImageIndex > 0 ? 'block' : 'none';
            nextButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'block' : 'none';
        }

        // Функция показа модального окна с оценкой
        function showSelfAssessmentModal() {
            let modal = document.querySelector('.modal');
            const linkHtml = currentTumor.articleLink ? 
                `<a href="${currentTumor.articleLink}" target="_blank">Read more on Pathology Outlines</a>` : 
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
                    nextTumorButton.style.display = 'inline';
                });

                document.getElementById('selfIncorrect').addEventListener('click', () => {
                    totalTumors++;
                    scoreElement.textContent = `Score: ${correctAnswers}/${totalTumors}`;
                    modal.querySelector('#modalScore').textContent = `Score: ${correctAnswers}/${totalTumors}`;
                    modal.style.display = 'none';
                    nextTumorButton.style.display = 'inline';
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
                nextImageButton.style.display = 'none';
                checkButton.disabled = true;
                showSelfAssessmentModal();
            }
        });

        nextImageButton.addEventListener('click', () => {
            if (currentImageIndex < currentTumor.images.length - 1) {
                currentImageIndex++;
                addNextImage();
                nextImageButton.style.display = currentImageIndex < currentTumor.images.length - 1 ? 'inline' : 'none';
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