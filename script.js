document.addEventListener('DOMContentLoaded', () => {
    // --- CONSTANTES Y DATOS INICIALES ---

    // Tiempo máximo en minutos que los personajes tienen para cruzar el puente.
    const MAX_TIME = 60;

    // Un arreglo de objetos, donde cada objeto representa a un personaje del juego.
    // Incluye su 'id' (un identificador único), 'name' (nombre para mostrar),
    // 'time' (el tiempo que tarda en cruzar) y 'imageSrc' (la ruta a su imagen).
    const characterData = [
        { id: 'buzz', name: 'Buzz', time: 5, imageSrc: 'assets/buzz.png' }, 
        { id: 'woody', name: 'Woody', time: 10, imageSrc: 'assets/woody.png' },
        { id: 'rex', name: 'Rex', time: 20, imageSrc: 'assets/rex.png' },
        { id: 'hamm', name: 'Hamm', time: 25, imageSrc: 'assets/hamm.png' }
    ];

    // --- PROGRAMA PROLOG ---

    const prologProgram = `
        % Carga la librería 'lists' que nos da acceso a predicados útiles para manejar listas,
        % como 'select/3', que usaremos para sacar personajes de la lista de una costa.
        :- use_module(library(lists)).

        % Este es el predicado principal que llamaremos desde JavaScript.
        % Busca una solución (una secuencia de pasos 'Resultado') y el 'TiempoTotal' que toma.
        ejercicio4(Resultado, TiempoTotal) :-
            % Define el estado inicial: todos los personajes en la primera costa (lista 1),
            % nadie en la segunda costa (lista 2), y el tiempo transcurrido es 0.
            EstadoInicial = state([buzz,woody,rex,hamm], [], 0),
            % 'phrase/2' es un predicado de Prolog para procesar gramáticas (DCG).
            % Aquí, lo usamos para encontrar una secuencia de 'cruzar_ida' que, partiendo
            % del 'EstadoInicial', nos lleve a un estado final, devolviendo los pasos en 'Resultado'.
            phrase(cruzar_ida(EstadoInicial, TiempoTotal), Resultado).

        % Hechos que definen el tiempo de cruce para cada personaje.
        tiempo(buzz, 5).
        tiempo(woody, 10).
        tiempo(rex, 20).
        tiempo(hamm, 25).

        % --- LÓGICA DE LOS MOVIMIENTOS (GRAMÁTICA DCG) ---

        % Regla para el cruce de ida (de costa 1 a costa 2).
        % state(Costa1, Costa2, TiempoActual) es el estado antes del cruce.
        cruzar_ida(state(Costa1, Costa2, TiempoActual), TiempoFinal) -->
            {
                % Este bloque es código Prolog puro que se ejecuta dentro de la regla DCG.
                % Selecciona dos personajes (P1 y P2) de la costa 1.
                select(P1, Costa1, CostaTemp1),
                select(P2, CostaTemp1, CostaResult),
                P1 @< P2, % Condición para no generar soluciones duplicadas (ej: woody,buzz y buzz,woody).
                
                % Calcula el tiempo que toma este cruce.
                tiempo(P1, T1),
                tiempo(P2, T2),
                TiempoPaso is max(T1, T2), % El tiempo de cruce es el del más lento.
                
                % Actualiza el tiempo total y comprueba que no exceda el límite.
                NuevoTiempo is TiempoActual + TiempoPaso,
                NuevoTiempo =< 60
            },
            % Este es el paso que se añade a la lista de resultados.
            % 'cruza_de_ida' es un término que representa este movimiento.
            [cruza_de_ida(P1, P2, TiempoPaso)],
            % Llamada recursiva: ahora intenta un cruce de vuelta desde el nuevo estado.
            cruzar_vuelta(state(CostaResult, [P1, P2|Costa2], NuevoTiempo), TiempoFinal).

        % Condición de parada para el cruce de vuelta: si todos están en la costa 2 (la costa 1 está vacía),
        % el juego ha terminado. El '!' (corte) detiene la búsqueda de más soluciones por esta vía.
        cruzar_vuelta(state([], _, TiempoFinal), TiempoFinal) --> !.
        
        % Regla para el cruce de vuelta (de costa 2 a costa 1).
        cruzar_vuelta(state(Costa1, Costa2, TiempoActual), TiempoFinal) -->
            {
                % Selecciona un personaje (P1) de la costa 2 para que regrese con la linterna.
                select(P1, Costa2, CostaResult),
                
                % Calcula y actualiza el tiempo.
                tiempo(P1, T1),
                NuevoTiempo is TiempoActual + T1,
                NuevoTiempo =< 60
            },
            % Añade el paso de vuelta a la lista de resultados.
            [cruza_de_vuelta(P1, T1)],
            % Llamada recursiva: intenta un nuevo cruce de ida desde el nuevo estado.
            cruzar_ida(state([P1|Costa1], CostaResult, NuevoTiempo), TiempoFinal).
    `;

    // --- ELEMENTOS DEL DOM ---

    // Guardamos en variables las referencias a los elementos HTML con los que vamos a interactuar.
    // Esto es más eficiente que buscarlos en el documento cada vez que los necesitemos.
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

    // Variables que definen el estado actual del juego. Serán modificadas durante la partida.
    let characters = []; // Lista de personajes con su estado (ej: ubicación).
    let currentTime = 0; // Tiempo transcurrido en el juego manual.
    let flashlightLocation = 'costa1'; // Ubicación actual de la linterna.
    let selectedCharacters = []; // Personajes seleccionados para el próximo cruce.
    let moveHistory = []; // Historial de movimientos del jugador.
    let gameOver = false; // Bandera para saber si el juego ha terminado.

    // --- CONFIGURACIÓN DE TAU PROLOG ---

    // Variable para guardar nuestra sesión de Prolog.
    let prologSession;
    try {
        // Creamos una nueva sesión de Prolog. Esto nos da un intérprete listo para usar.
        prologSession = pl.create();
        // Consultamos (cargamos) nuestro programa Prolog en la sesión.
        prologSession.consult(prologProgram, {
            // Callback que se ejecuta si el programa se carga correctamente.
            success: function() { console.log("Prolog program loaded."); },
            // Callback que se ejecuta si hay un error al cargar el programa.
            error: function(err) { console.error("Error loading Prolog program:", prologSession.format_answer(err)); }
        });
    } catch (e) {
        // Si la librería Tau Prolog no se cargó en la página, esto fallará.
        console.error("Failed to initialize Tau Prolog:", e);
        // Deshabilitamos el botón de resolver con Prolog para que el usuario no pueda usarlo.
        prologSolveButton.disabled = true;
        prologSolveButton.title = "Tau Prolog no pudo inicializarse.";
    }

    // --- FUNCIONES PRINCIPALES DEL JUEGO ---

    /**
     * Inicializa o resetea el juego a su estado original.
     */
    function initGame() {
        // Creamos una copia profunda de los datos de los personajes para no modificar el original.
        characters = JSON.parse(JSON.stringify(characterData));
        // A cada personaje le asignamos su ubicación inicial.
        characters.forEach(c => c.location = 'costa1');
        
        // Reseteamos todas las variables de estado del juego.
        currentTime = 0;
        flashlightLocation = 'costa1';
        selectedCharacters = [];
        moveHistory = [];
        gameOver = false;
        
        // Limpiamos los mensajes y la solución de Prolog anterior.
        messageArea.textContent = '';
        messageArea.className = 'messages';
        prologSolutionList.innerHTML = '';
        
        // Llamamos a render() para que la interfaz gráfica se actualice y muestre el estado inicial.
        render();
    }

    /**
     * Actualiza la interfaz de usuario (UI) para reflejar el estado actual del juego.
     */
    function render() {
        // Limpiamos las costas para volver a dibujar los personajes.
        costa1Div.innerHTML = '';
        costa2Div.innerHTML = '';

        // Actualizamos la posición del emoji de la linterna.
        const costa1Emoji = document.querySelector('#costa1 .flashlight-emoji');
        const costa2Emoji = document.querySelector('#costa2 .flashlight-emoji');
        if (costa1Emoji && costa2Emoji) {
            costa1Emoji.textContent = flashlightLocation === 'costa1' ? '🔦' : '';
            costa2Emoji.textContent = flashlightLocation === 'costa2' ? '🔦' : '';
            costa1Emoji.className = `flashlight-emoji ${flashlightLocation === 'costa1' ? 'active' : ''}`;
            costa2Emoji.className = `flashlight-emoji ${flashlightLocation === 'costa2' ? 'active' : ''}`;
        }

        // Recorremos la lista de personajes y creamos un elemento HTML para cada uno.
        characters.forEach(char => {
            const charElement = document.createElement('div');
            charElement.classList.add('character');
            charElement.dataset.id = char.id; // Guardamos el id en el elemento.

            // Creamos y añadimos la imagen y el nombre del personaje.
            const img = document.createElement('img');
            img.src = char.imageSrc;
            img.alt = char.name;
            charElement.appendChild(img);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${char.name} (${char.time} min)`;
            charElement.appendChild(nameSpan);

            // Si el personaje está seleccionado, le añadimos una clase CSS para resaltarlo.
            if (selectedCharacters.includes(char.id)) {
                charElement.classList.add('selected');
            }

            // Un personaje no se puede seleccionar si el juego terminó o la linterna está en la otra costa.
            if (char.location !== flashlightLocation || gameOver) {
                charElement.classList.add('disabled');
            } else {
                // Si se puede seleccionar, le añadimos un evento de clic.
                charElement.addEventListener('click', () => handleCharacterClick(char.id));
            }

            // Añadimos el elemento del personaje a la costa correspondiente.
            if (char.location === 'costa1') {
                costa1Div.appendChild(charElement);
            } else {
                costa2Div.appendChild(charElement);
            }
        });

        // Actualizamos el texto del tiempo y la ubicación de la linterna.
        timeDisplay.textContent = `Tiempo: ${currentTime} minutos`;
        flashlightDisplay.textContent = `Linterna en: ${flashlightLocation === 'costa1' ? 'Costa 1' : 'Costa 2'}`;
        
        // El botón de cruzar solo se activa si no ha terminado el juego y hay alguien seleccionado.
        crossButton.disabled = gameOver || selectedCharacters.length === 0;

        // Actualizamos la lista del historial de movimientos.
        moveHistoryList.innerHTML = '';
        moveHistory.forEach(move => {
            const li = document.createElement('li');
            li.textContent = move;
            moveHistoryList.appendChild(li);
        });

        // Comprobamos si el jugador ha ganado.
        checkWinCondition();
    }

    /**
     * Maneja la lógica cuando el usuario hace clic en un personaje para seleccionarlo o deseleccionarlo.
     */
    function handleCharacterClick(characterId) {
        // Si el juego ha terminado, no hacemos nada.
        if (gameOver) return;

        // Solo se pueden seleccionar personajes del lado de la linterna.
        const char = characters.find(c => c.id === characterId);
        if (char.location !== flashlightLocation) return;

        const index = selectedCharacters.indexOf(characterId);
        if (index > -1) {
            // Si el personaje ya estaba seleccionado, lo deseleccionamos.
            selectedCharacters.splice(index, 1);
        } else {
            // Si no estaba seleccionado, lo añadimos a la selección.
            const isReturning = flashlightLocation === 'costa2';

            if (isReturning) {
                // Si es un viaje de vuelta, solo puede seleccionarse una persona.
                if (selectedCharacters.length < 1) {
                    selectedCharacters.push(characterId);
                } else { 
                    // Si ya hay uno seleccionado, lo reemplazamos.
                    selectedCharacters = [characterId];
                }
            } else { 
                // Si es un viaje de ida, se pueden seleccionar hasta dos personas.
                if (selectedCharacters.length < 2) {
                    selectedCharacters.push(characterId);
                }
            }
        }
        // Volvemos a renderizar para que la UI refleje la nueva selección.
        render();
    }

    /**
     * Ejecuta la acción de cruzar el puente con los personajes seleccionados.
     */
    function handleCrossBridge() {
        if (gameOver || selectedCharacters.length === 0) return;

        // Filtramos los personajes que se van a mover.
        const movingChars = characters.filter(c => selectedCharacters.includes(c.id));
        let crossingTime = 0;
        let moveDescription = '';

        if (flashlightLocation === 'costa1') { // Movimiento de ida.
            if (movingChars.length === 0 || movingChars.length > 2) {
                showMessage("Debes seleccionar 1 o 2 personajes para cruzar.", "error");
                return;
            }
            // El tiempo de cruce es el máximo de los tiempos de los que cruzan.
            crossingTime = Math.max(...movingChars.map(c => c.time));
            moveDescription = `Cruzaron a Costa 2: ${movingChars.map(c => c.name).join(' y ')}. Tiempo: ${crossingTime} min.`;
        } else { // Movimiento de vuelta.
            if (movingChars.length !== 1) {
                showMessage("Debe regresar 1 personaje con la linterna.", "error");
                return;
            }
            crossingTime = movingChars[0].time;
            moveDescription = `Regresó a Costa 1: ${movingChars[0].name}. Tiempo: ${crossingTime} min.`;
        }

        // Actualizamos el tiempo total.
        currentTime += crossingTime;
        if (currentTime > MAX_TIME) {
            // Si se excede el tiempo, el juego termina.
            showMessage(`¡Tiempo excedido! (${currentTime} min). Has perdido.`, "lose");
            gameOver = true;
            render();
            return;
        }

        // Cambiamos la ubicación de los personajes que se movieron y de la linterna.
        movingChars.forEach(char => {
            char.location = (flashlightLocation === 'costa1' ? 'costa2' : 'costa1');
        });
        flashlightLocation = (flashlightLocation === 'costa1' ? 'costa2' : 'costa1');
        
        // Añadimos el movimiento al historial y limpiamos la selección.
        moveHistory.push(`${moveHistory.length + 1}. ${moveDescription} (Total: ${currentTime} min)`);
        selectedCharacters = [];
        showMessage(''); // Limpiamos mensajes de error.
        
        // Actualizamos la UI.
        render();
    }

    /**
     * Comprueba si todos los personajes han llegado a la costa 2.
     */
    function checkWinCondition() {
        // 'every' devuelve true si todos los elementos del array cumplen la condición.
        const allOnCosta2 = characters.every(c => c.location === 'costa2');
        if (allOnCosta2 && !gameOver) {
            showMessage(`¡Felicidades! Todos cruzaron en ${currentTime} minutos.`, "win");
            gameOver = true;
            crossButton.disabled = true; // Deshabilitamos el botón al ganar.
        }
    }
    
    /**
     * Muestra un mensaje al usuario en el área designada.
     * @param {string} msg - El mensaje a mostrar.
     * @param {string} type - El tipo de mensaje ('win', 'lose', 'error') para aplicarle un estilo CSS.
     */
    function showMessage(msg, type = '') {
        messageArea.textContent = msg;
        messageArea.className = `messages ${type}`;
    }

    /**
     * Pide a Prolog una solución al problema y la muestra en la UI.
     */
    async function handleGetPrologSolution() {
        if (!prologSession) {
            showMessage("Prolog no está disponible.", "error");
            return;
        }
        showMessage("Calculando solución con Prolog...", "");
        prologSolutionList.innerHTML = ''; // Limpiamos la solución anterior.

        // Definimos la consulta a Prolog. Queremos que nos devuelva los pasos y el tiempo total.
        const query = `ejercicio4(Resultado, TiempoTotal).`;
        // Enviamos la consulta a la sesión de Prolog.
        prologSession.query(query, {
            success: function() { 
                console.log("Consulta enviada a Prolog.");
            },
            error: function(err) {
                showMessage("Error en la consulta Prolog: " + prologSession.format_answer(err), "error");
                console.error("Prolog query error:", prologSession.format_answer(err));
            }
        });
        
        let solutionFound = false;

        // Pedimos la primera (y en este caso, única) respuesta a la consulta.
        // El proceso de respuesta en Tau Prolog es asíncrono.
        prologSession.answer({
            success: function(answer) {
                // Verificamos si la respuesta es una 'sustitución', que es como Prolog nos da los valores de las variables.
                if (pl.type.is_substitution(answer) && answer.links.Resultado) {
                    // Obtenemos los valores de las variables 'Resultado' y 'TiempoTotal'.
                    const resultadoTerm = answer.lookup("Resultado");
                    const tiempoTotalTerm = answer.lookup("TiempoTotal");
                    const totalTimeProlog = pl.type.is_number(tiempoTotalTerm) ? tiempoTotalTerm.value : 0;
                    
                    // La solución ('Resultado') viene como una lista de Prolog.
                    // Necesitamos recorrerla para extraer cada paso.
                    const steps = [];
                    let currentTerm = resultadoTerm;
                    while (pl.type.is_term(currentTerm) && currentTerm.indicator === "./2") {
                        const head = currentTerm.args[0]; // La cabeza de la lista (el paso actual).
                        const tail = currentTerm.args[1]; // La cola (el resto de la lista).
                        steps.push(head);
                        currentTerm = tail;
                    }

                    if (steps.length > 0) {
                        solutionFound = true;
                        prologSolutionList.innerHTML = '';
                        
                        // Creamos un mapa de ID a Nombre para buscar nombres de personajes fácilmente.
                        const characterNames = {};
                        characterData.forEach(c => {
                            characterNames[c.id] = c.name;
                        });

                        // Ahora que tenemos los pasos, los formateamos en texto legible.
                        steps.forEach((stepTerm, index) => {
                            let formattedStep = '';
                            // Analizamos cada paso (que es un término de Prolog) y construimos el string.
                            if (stepTerm.id === 'cruza_de_ida' && stepTerm.args.length === 3) {
                                const p1 = stepTerm.args[0].id;
                                const p2 = stepTerm.args[1].id;
                                const time = stepTerm.args[2].value;
                                const n1 = characterNames[p1] || p1;
                                const n2 = characterNames[p2] || p2;
                                formattedStep = `Cruzan de ida: ${n1} y ${n2}. (Tiempo: ${time} min)`;
                            } else if (stepTerm.id === 'cruza_de_vuelta' && stepTerm.args.length === 2) {
                                const p1 = stepTerm.args[0].id;
                                const time = stepTerm.args[1].value;
                                const n1 = characterNames[p1] || p1;
                                formattedStep = `Regresa: ${n1}. (Tiempo: ${time} min)`;
                            } else {
                                formattedStep = stepTerm.toString(); // Si no lo reconocemos, mostramos el término Prolog.
                            }
                
                            // Creamos un elemento <li> y lo añadimos a la lista de la solución.
                            const li = document.createElement('li');
                            li.textContent = `${index + 1}. ${formattedStep}`;
                            prologSolutionList.appendChild(li);
                        });
                
                        // Finalmente, añadimos el tiempo total.
                        const liTotal = document.createElement('li');
                        liTotal.textContent = `Tiempo total de la solución: ${totalTimeProlog} minutos.`;
                        liTotal.style.fontWeight = "bold";
                        prologSolutionList.appendChild(liTotal);
                        showMessage("Solución de Prolog encontrada.", "win");

                    } else {
                        showMessage("Prolog no encontró una solución o el formato es inesperado.", "error");
                    }
                } else if (answer === false) { // 'false' significa que la consulta no tuvo éxito.
                    if (!solutionFound) {
                         showMessage("Prolog no encontró una solución.", "error");
                    }
                } else {
                     showMessage("Respuesta de Prolog no reconocida.", "error");
                }
            },
            // Callbacks para otros posibles resultados de la consulta.
            error: function(err) {
                showMessage("Error obteniendo respuesta de Prolog: " + prologSession.format_answer(err), "error");
                console.error("Prolog answer error:", prologSession.format_answer(err));
            },
            fail: function() {
                if (!solutionFound) {
                    showMessage("Prolog no pudo encontrar una solución (fail).", "error");
                }
            },
            limit: function() {
                showMessage("Límite de cómputo de Prolog alcanzado.", "error");
            }
        });
    }

    // --- EVENT LISTENERS ---

    // Asignamos las funciones a los eventos de clic de los botones.
    crossButton.addEventListener('click', handleCrossBridge);
    resetButton.addEventListener('click', initGame);
    prologSolveButton.addEventListener('click', handleGetPrologSolution);

    // --- INICIALIZACIÓN ---
    
    // Al cargar la página, llamamos a initGame() para empezar el juego por primera vez.
    initGame();
});