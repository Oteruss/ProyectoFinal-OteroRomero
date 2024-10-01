document.querySelector('.chips').addEventListener('click', function (event) {
    if (event.target.classList.contains('chip')) {
        const characterType = event.target.getAttribute('data-character');
        loadCharacters(characterType);
    }
});

function loadCharacters(characterType) {
    fetch(`https://rickandmortyapi.com/api/character/?type=${characterType}`)
        .then(response => response.json())
        .then(data => {
            displayCharacters(data.results);
        })
        .catch(error => console.error('No encontramos los personajes :(', error));
}

function displayCharacters(characters) {
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = '';

    characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';

        const characterImage = document.createElement('img');
        characterImage.src = character.image;
        characterImage.alt = character.name;
        characterImage.className = 'character-image';

        const characterInfo = document.createElement('div');
        characterInfo.innerHTML = `<strong>${character.name}</strong><br>Género: ${character.gender}`;

        const saveButton = document.createElement('button');
        saveButton.innerText = 'Añadir al carrito';
        saveButton.onclick = () => saveToLocalStorage(character);

        characterCard.appendChild(characterImage);
        characterCard.appendChild(characterInfo);
        characterCard.appendChild(saveButton);

        characterList.appendChild(characterCard);
    });
}

function saveToLocalStorage(character) {
    const savedCharacters = JSON.parse(localStorage.getItem('savedCharacters')) || [];
    savedCharacters.push({
        name: character.name,
        image: character.image,
        gender: character.gender
    });
    localStorage.setItem('savedCharacters', JSON.stringify(savedCharacters));
    showToast(`¡${character.name} añadido al carrito!`);
}

function showToast(message) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'green'
    }).showToast();
}

document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const characterCards = document.querySelectorAll('.character-card');

    characterCards.forEach(card => {
        const characterName = card.querySelector('strong').innerText.toLowerCase();
        card.style.display = characterName.includes(searchTerm) ? 'flex' : 'none';
    });
});

document.getElementById('viewCartButton').addEventListener('click', function () {
    viewCart();
});

function viewCart() {
    const savedCharacters = JSON.parse(localStorage.getItem('savedCharacters')) || [];
    
    if (savedCharacters.length > 0) {
        const cartContent = savedCharacters.map((character, index) => {
            return `<section>
                        <img src="${character.image}" alt="${character.name}" style="max-width: 100px; max-height: 100px;">
                        <div>
                            <p><strong>${character.name}</strong></p>
                            <p>Género: ${character.gender}</p>
                            <button onclick="deleteFromCart(${index})">Borrar</button>
                        </div>
                    </section>`;
        }).join('');

        Swal.fire({
            icon: 'info',
            title: 'Personajes en el carrito',
            html: cartContent,
            showConfirmButton: true,
            confirmButtonText: 'Pagar ahora',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                showPayModal(savedCharacters);
            }
        });
    } else {
        showToast('Carrito vacío, añade personajes a tus favoritos.');
    }
}

function deleteFromCart(index) {
    const savedCharacters = JSON.parse(localStorage.getItem('savedCharacters')) || [];
    if (index >= 0 && index < savedCharacters.length) {
        savedCharacters.splice(index, 1);
        localStorage.setItem('savedCharacters', JSON.stringify(savedCharacters));
        showToast('Personaje eliminado del carrito.');
        viewCart();
    }
}

document.getElementById('clearCartButton').addEventListener('click', function () {
    localStorage.removeItem('savedCharacters');
    showToast('Carrito vaciado.');
});

function showPayModal(savedCharacters) {
    Swal.fire({
        title: 'Confirmación de pago',
        text: '¿Quieres continuar con el pago?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, ¡pagar!',
        cancelButtonText: 'No, no',
    }).then((result) => {
        if (result.isConfirmed) {
            pay(savedCharacters); 
        }
    });
}

function pay(savedCharacters) {
    Swal.fire({
        icon: 'success',
        title: '¡Son tuyos!',
        text: 'Gracias por tu compra.',
        showConfirmButton: false,
    });

    localStorage.removeItem('savedCharacters');
    showToast('Carrito vaciado tras la compra.');
}
