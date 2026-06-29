// Elementos del DOM
const searchInput = document.getElementById('search-input');
const btnSearch = document.getElementById('btn-search');
const btnClear = document.getElementById('btn-clear');
const resultsContainer = document.getElementById('results-container');

// URL del archivo JSON local
const jsonUrl = 'travel_recommendation_api.json';

/**
 * Función principal para buscar y mostrar recomendaciones basadas en la palabra clave
 */
function searchRecommendations() {
    const keyword = searchInput.value.toLowerCase().trim();
    resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

    if (keyword === '') {
        alert('Please enter a keyword to search.');
        return;
    }

    // Petición HTTP usando la API Fetch
    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Requerimiento: Mostrar los datos en consola para verificar acceso continuo
            console.log('Data successfully fetched from JSON:', data);

            let recommendations = [];

            // Filtrar y normalizar palabras clave
            if (keyword === 'beach' || keyword === 'beaches') {
                recommendations = data.beaches;
            } else if (keyword === 'temple' || keyword === 'temples') {
                recommendations = data.temples;
            } else if (keyword === 'country' || keyword === 'countries') {
                data.countries.forEach(country => {
                    recommendations = recommendations.concat(country.cities);
                });
            } else {
                // Búsqueda flexible por si escriben un país o ciudad específica directamente
                data.countries.forEach(country => {
                    if (country.name.toLowerCase().includes(keyword)) {
                        recommendations = recommendations.concat(country.cities);
                    }
                });
                
                // Si aún no hay nada, busca coincidencias en nombres individuales de playas o templos
                if (recommendations.length === 0) {
                    const allItems = [...data.beaches, ...data.temples];
                    recommendations = allItems.filter(item => item.name.toLowerCase().includes(keyword));
                }
            }

            // Desplegar resultados si se encontraron elementos
            if (recommendations.length > 0) {
                displayResults(recommendations);
            } else {
                resultsContainer.innerHTML = `<p class="no-results">No results found for "${keyword}". Try beach, temple, or country.</p>`;
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            resultsContainer.innerHTML = '<p class="no-results">Error loading recommendations.</p>';
        });
}

/**
 * Función encargada de renderizar las tarjetas HTML en el contenedor de resultados
 */
function displayResults(places) {
    // Limpiamos el contenedor por seguridad antes de agregar elementos
    resultsContainer.innerHTML = '';

    // Se crea la envoltura de las tarjetas con la clase asignada a la cuadrícula CSS
    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'cards-wrapper';

    // Generamos cada una de las tarjetas usando las propiedades correctas de tu JSON (imageUrl)
    places.forEach(place => {
        const card = document.createElement('div');
        card.className = 'result-card';

        card.innerHTML = `
            <img src="${place.imageUrl}" alt="${place.name}" class="card-image">
            <div class="card-body">
                <h3 class="card-title">${place.name}</h3>
                <p class="card-text">${place.description}</p>
            </div>
        `;
        cardsWrapper.appendChild(card);
    });

    // Añadimos la envoltura directamente al contenedor dinámico
    resultsContainer.appendChild(cardsWrapper);
}

/**
 * Función para resetear el buscador y limpiar la pantalla
 */
function clearSearch() {
    searchInput.value = '';
    resultsContainer.innerHTML = '';
    console.log('Search cleared.');
}

// Listeners de Eventos para interactuar con la interfaz
btnSearch.addEventListener('click', searchRecommendations);
btnClear.addEventListener('click', clearSearch);

// Permitir presionar "Enter" en el teclado para ejecutar la búsqueda
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchRecommendations();
    }
});
