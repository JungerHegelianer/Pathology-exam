fetch('tumors.json')
    .then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить tumors.json: ' + response.status);
        return response.json();
    })
    .then(data => {
        console.log('JSON успешно загружен:', data);
        const tumors = data.tumors;
        let currentTumor;

        const imagesContainer = document.getElementById('tumorImages');
        const checkButton = document.getElementById('checkButton');
        const resultElement = document.getElementById('result');
        const nextButton = document.getElementById('nextButton');

        function loadRandomTumor() {
            const randomTumorIndex = Math.floor(Math.random() * tumors.length);
            currentTumor = tumors[randomTumorIndex];
            imagesContainer.innerHTML = ''; // Очищаем предыдущие изображения

            // Создаём изображения для текущей опухоли
            currentTumor.images.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'tumor-image';
                img.alt = 'Микрофотография опухоли';
                img.onerror = () => {
                    img.alt = 'Изображение не доступно';
                    console.error('Не удалось загрузить: ' + imageUrl);
                };
                img.addEventListener('click', () => showOverlay(imageUrl)); // Увеличение по клику
                imagesContainer.appendChild(img);
                console.log('Добавлено изображение: ' + imageUrl);
            });

            resultElement.textContent = '';
            nextButton.style.display = 'none';
        }

        // Функция для показа увеличенного изображения
        function showOverlay(imageUrl) {
            let overlay = document.querySelector('.overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'overlay';
                document.body.appendChild(overlay);
            }
            overlay.innerHTML = `<img src="${imageUrl}" alt="Увеличенное изображение">`;
            overlay.style.display = 'flex';
            overlay.addEventListener('click', () => {
                overlay.style.display = 'none';
            });
        }

        checkButton.addEventListener('click', () => {
            resultElement.textContent = `Правильный ответ: ${currentTumor.diagnosis}`;
            nextButton.style.display = 'inline';
        });

        nextButton.addEventListener('click', loadRandomTumor);

        loadRandomTumor(); // Загружаем первую опухоль
    })
    .catch(error => {
        console.error('Ошибка:', error);
        document.getElementById('result').textContent = 'Ошибка загрузки данных';
    });