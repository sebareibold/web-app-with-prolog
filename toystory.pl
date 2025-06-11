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