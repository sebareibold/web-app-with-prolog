document.addEventListener('DOMContentLoaded', () => {
    // --- CONSTANTES Y DATOS INICIALES ---
    const MAX_TIME = 60;
    const characterData = [
        { id: 'buzz', name: 'Buzz', time: 5, imageSrc: 'assets/buzz.png' },
        { id: 'woody', name: 'Woody', time: 10, imageSrc: 'assets/woody.png' },
        { id: 'rex', name: 'Rex', time: 20, imageSrc: 'assets/rex.png' },
        { id: 'hamm', name: 'Hamm', time: 25, imageSrc: 'assets/hamm.png' }
    ];
    // Un mapa para buscar datos de personajes por ID de forma más eficiente
    const characterMap = new Map(characterData.map(c => [c.id, c]));

    // --- ELEMENTOS DEL DOM ---
    const costa1Div = document.getElementById('characters-costa1');
    const costa2Div = document.getElementById('characters-costa2');
    const timeDisplay = document.getElementById('time-display');
    const flashlightDisplay = document.getElementById('flashlight-location');
    const crossButton = document.getElementById('cross-button');
    const resetButton = document.getElementById('reset-button');
    const prologSolveButton = document.getElementById('prolog-solve-button');
    const messageArea = document.getElementById('message-area');
    const moveHistoryList = document.getElementById('move-history-list');
    const prologSolutionList = document.getElementById('prolog-solution-list');

    // --- ESTADO DEL JUEGO ---
    // Creamos el objeto gameState para mantener el estado del juego
    let gameState = {};
    let flashlightLocation = 'costa1';
    let selectedCharacters = [];
    let moveHistory = [];
    let gameOver = false;
    let prologSession;

    // --- FUNCIONES AUXILIARES ---

    //Definimos la función auxiliar para convertir listas devueltas en Tau-Prolog a arreglos y así almacenarlos
    function prologListToArray(listTerm) {
        const arr = [];
        let current = listTerm;
        while (current && current.id === '.' && current.args) {
            if (current.args[0] && current.args[0].id) {
                arr.push(current.args[0].id);
            }
            current = current.args[1];
        }
        return arr;
    }

    // --- FUNCIONES PRINCIPALES DEL JUEGO ---

    //Inicializa o resetea el juego a su estado inicial
    async function initGame() {
        // Inicializa la nueva estructura de gameState.
        gameState = {
            costa1: characterData.map(c => c.id),
            costa2: [],
            tiempo: 0
        };

        flashlightLocation = 'costa1';
        selectedCharacters = [];
        moveHistory = [];
        gameOver = false;

        try {
            prologSession = pl.create();
            const result = await fetch('./toystory.pl');
            if (!result.ok) {
                console.error("Error loading toystory.pl");
            }
            const prologProgram = await result.text();
            prologSession.consult(prologProgram, {
                success: () => console.log("Prolog program loaded."),
                error: (err) => console.error("Error loading Prolog program:", prologSession.format_answer(err))
            });
        } catch (e) {
            console.error("Failed to initialize Tau Prolog:", e);
            prologSolveButton.disabled = true;
            prologSolveButton.title = "Tau Prolog no pudo inicializarse.";
        }

        messageArea.textContent = '';
        messageArea.className = 'messages';
        prologSolutionList.innerHTML = '';
        render();
    }

    
    //Actualiza la interfaz de usuario (UI) para reflejar el estado actual del juego
    function render() {
        costa1Div.innerHTML = '';
        costa2Div.innerHTML = '';

        //Funcion que renderiza los personajes en la costa correspondiente
        const renderCharacter = (charId, container) => {
            const char = characterMap.get(charId);
            if (!char) return;

            const charElement = document.createElement('div');
            charElement.classList.add('character');
            charElement.dataset.id = char.id;

            const img = document.createElement('img');
            img.src = char.imageSrc;
            img.alt = char.name;
            charElement.appendChild(img);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${char.name} (${char.time} min)`;
            charElement.appendChild(nameSpan);

            if (selectedCharacters.includes(char.id)) {
                charElement.classList.add('selected');
            }

            const isClickable = (container === costa1Div && flashlightLocation === 'costa1') || (container === costa2Div && flashlightLocation === 'costa2');
            if (!isClickable || gameOver) {
                charElement.classList.add('disabled');
            } else {
                charElement.addEventListener('click', () => handleCharacterClick(char.id));
            }

            container.appendChild(charElement);
        };

        gameState.costa1.forEach(id => renderCharacter(id, costa1Div));
        gameState.costa2.forEach(id => renderCharacter(id, costa2Div));

        const costa1Emoji = document.querySelector('#costa1 .flashlight-emoji');
        const costa2Emoji = document.querySelector('#costa2 .flashlight-emoji');
        if (costa1Emoji && costa2Emoji) {
            costa1Emoji.textContent = flashlightLocation === 'costa1' ? '🔦' : '';
            costa2Emoji.textContent = flashlightLocation === 'costa2' ? '🔦' : '';
            costa1Emoji.className = `flashlight-emoji ${flashlightLocation === 'costa1' ? 'active' : ''}`;
            costa2Emoji.className = `flashlight-emoji ${flashlightLocation === 'costa2' ? 'active' : ''}`;
        }

        timeDisplay.textContent = `Tiempo: ${gameState.tiempo} minutos`;
        flashlightDisplay.textContent = `Linterna en: ${flashlightLocation === 'costa1' ? 'Costa 1' : 'Costa 2'}`;
        crossButton.disabled = gameOver || selectedCharacters.length === 0;

        moveHistoryList.innerHTML = '';
        moveHistory.forEach(move => {
            const li = document.createElement('li');
            li.textContent = move;
            moveHistoryList.appendChild(li);
        });

        checkWinCondition();
    }

    //Maneja la lógica cuando el usuario hace clic en un personaje
    function handleCharacterClick(characterId) {
        if (gameOver) return;

        const index = selectedCharacters.indexOf(characterId);
        if (index > -1) {
            selectedCharacters.splice(index, 1);
        } else {
            const isReturning = flashlightLocation === 'costa2';
            if (isReturning && selectedCharacters.length < 1) {
                selectedCharacters.push(characterId);
            } else if (!isReturning && selectedCharacters.length < 2) {
                selectedCharacters.push(characterId);
            }
        }
        render();
    }

    //Ejecuta la acción de cruzar el puente delegando la lógica a Prolog
    function handleCrossBridge() {
        if (gameOver || selectedCharacters.length === 0) return;

        // Validaciones previas en la UI antes de consultar a Prolog.
        const direction = flashlightLocation === 'costa1' ? 'ida' : 'vuelta';
        if (direction === 'ida' && (selectedCharacters.length !== 2)) {
            showMessage("Debes seleccionar 2 personajes para cruzar.", "error");
            return;
        }
        if (direction === 'vuelta' && selectedCharacters.length !== 1) {
            showMessage("Debe regresar 1 personaje con la linterna.", "error");
            return;
        }

        //Preparamos los datos para la consulta a Prolog
        const personajesProlog = `[${selectedCharacters.sort().join(',')}]`; //Agregamos la función sort para que compute correctamente P1 @< P2
        const estadoPrologString = `state([${gameState.costa1.join(',')}],[${gameState.costa2.join(',')}],${gameState.tiempo})`;
        const consulta = `verificar_cruce(${personajesProlog}, ${estadoPrologString}, ${direction}, SiguienteEstado).`;

        console.log("Enviando a Prolog:", consulta);
        prologSession.query(consulta);

        //Definimos qué hacer con la respuesta de Prolog
        prologSession.answer(answer => {
            //Si el movimiento es inválido entonces el juego finaliza, ya que en el único caso que se puede dar es cuando no hay más tiempo
            if (answer === false) {
                showMessage(`¡Tiempo excedido! Has perdido.`, "lose");
                gameOver = true;
                render();
                return;
            }

            //El movimiento es válido, actualiza los estados del juego
            const nuevoEstadoProlog = answer.lookup("SiguienteEstado");
            if (!nuevoEstadoProlog || !nuevoEstadoProlog.args) {
                console.error("Error Lógico en Prolog: La variable SiguienteEstado no fue asignada.", nuevoEstadoProlog);
                return;
            }

            //Actualizamos el estado de JavaScript con la respuesta de Prolog
            const nuevaCosta1Term = nuevoEstadoProlog.args[0];
            const nuevaCosta2Term = nuevoEstadoProlog.args[1];
            const nuevoTiempoTerm = nuevoEstadoProlog.args[2];

            const tiempoAnterior = gameState.tiempo;

            gameState = {
                costa1: prologListToArray(nuevaCosta1Term),
                costa2: prologListToArray(nuevaCosta2Term),
                tiempo: nuevoTiempoTerm.value
            };

            //Actualizamos el resto de la UI y el estado secundario
            flashlightLocation = (direction === 'ida' ? 'costa2' : 'costa1');
            const tiempoPaso = gameState.tiempo - tiempoAnterior;
            const movingNames = selectedCharacters.map(id => characterMap.get(id).name).join(' y ');

            const moveDescription = direction === 'ida'
                ? `Cruzaron a Costa 2: ${movingNames}. (Paso: ${tiempoPaso} min)`
                : `Regresó a Costa 1: ${movingNames}. (Paso: ${tiempoPaso} min)`;

            moveHistory.push(`${moveHistory.length + 1}. ${moveDescription} (Total: ${gameState.tiempo} min)`);
            selectedCharacters = [];
            showMessage(''); // Limpiamos mensajes de error.

            //Renderizamos la interfaz con el nuevo estado.
            render();
        });
    }

    //Comprueba si todos los personajes han llegado a la costa 2.
    function checkWinCondition() {
        if (gameState.costa1 && gameState.costa1.length === 0 && !gameOver) {
            showMessage(`¡Felicidades! Todos cruzaron en ${gameState.tiempo} minutos.`, "win");
            gameOver = true;
            crossButton.disabled = true;
        }
    }

    function showMessage(msg, type = '') {
        messageArea.textContent = msg;
        messageArea.className = `messages ${type}`;
    }

    async function handleGetPrologSolution() {
        if (!prologSession) {
            showMessage("Prolog no está disponible.", "error");
            return;
        }
        showMessage("Calculando solución con Prolog...", "");
        prologSolutionList.innerHTML = '';
        const query = `ejercicio4(Resultado, TiempoTotal).`;
        prologSession.query(query);
        let solutionFound = false;

        prologSession.answer(answer => {
            if (pl.type.is_substitution(answer) && answer.links.Resultado) {
                const resultadoTerm = answer.lookup("Resultado");
                const tiempoTotalTerm = answer.lookup("TiempoTotal");
                const totalTimeProlog = pl.type.is_number(tiempoTotalTerm) ? tiempoTotalTerm.value : 0;

                const steps = [];
                let currentTerm = resultadoTerm;
                while (pl.type.is_term(currentTerm) && currentTerm.indicator === "./2") {
                    steps.push(currentTerm.args[0]);
                    currentTerm = currentTerm.args[1];
                }

                if (steps.length > 0) {
                    solutionFound = true;
                    prologSolutionList.innerHTML = '';
                    steps.forEach((stepTerm, index) => {
                        let formattedStep = '';
                        if (stepTerm.id === 'cruza_de_ida' && stepTerm.args.length === 3) {
                            const p1 = characterMap.get(stepTerm.args[0].id).name;
                            const p2 = characterMap.get(stepTerm.args[1].id).name;
                            const time = stepTerm.args[2].value;
                            formattedStep = `Cruzan de ida: ${p1} y ${p2}. (Tiempo: ${time} min)`;
                        } else if (stepTerm.id === 'cruza_de_vuelta' && stepTerm.args.length === 2) {
                            const p1 = characterMap.get(stepTerm.args[0].id).name;
                            const time = stepTerm.args[1].value;
                            formattedStep = `Regresa: ${p1}. (Tiempo: ${time} min)`;
                        } else {
                            formattedStep = stepTerm.toString();
                        }
                        const li = document.createElement('li');
                        li.textContent = `${index + 1}. ${formattedStep}`;
                        prologSolutionList.appendChild(li);
                    });

                    const liTotal = document.createElement('li');
                    liTotal.textContent = `Tiempo total de la solución: ${totalTimeProlog} minutos.`;
                    liTotal.style.fontWeight = "bold";
                    prologSolutionList.appendChild(liTotal);
                    showMessage("Solución de Prolog encontrada.", "win");
                }
            } else if (answer === false && !solutionFound) {
                showMessage("Prolog no encontró una solución.", "error");
            }
        });
    }

    // --- EVENT LISTENERS ---
    crossButton.addEventListener('click', handleCrossBridge);
    resetButton.addEventListener('click', initGame);
    prologSolveButton.addEventListener('click', handleGetPrologSolution);

    // --- INICIALIZACIÓN ---
    initGame();
});