:- use_module(library(clpfd)).

%El predicado para realizar el ejercicio lo hacemos con unna DCG para facilitar la forma en la que se muestran los resultados.
%Realizamos el predicado del ejercicio utilizando en su cuerpo el predicado phrase, esto para utilizar la dcg
ejercicio4(Resultado) :- phrase(cruzar_ida(state([buzz,woody,rex,hamm], [], 0)), Resultado).

%Definimos hechos con los tiempos de cada personaje
tiempo(buzz,5).
tiempo(woody,10).
tiempo(rex,20).
tiempo(hamm,25).

%Definimos el predicado cruzar_ida, que contiene un state con una lista de los personajes que estan la Costa1, es decir, todavía no cruzaron, y los personajes que estan en la Costa2, es decir, los que ya cruzaron, también contiene el tiempo que llevan transcurrido hasta ahora
cruzar_ida(state(Costa1, Costa2, Tiempo)) -->
    {
        %Comineza seleccionando dos personajes de la lista Costa1, dando como resultado la lista CostaResul que sería Costa1 sin los personajes elegidos
    select(P1, Costa1, CostaTemp1), % Eligmos el personaje 1
    select(P2, CostaTemp1, CostaResul), % Eligmos el personaje 2

    %Con esta relacion se evitan duplicados, es decir, daría true con P1=buzz y P2=woody pero false a la inversa
    P1 @< P2,

    %Luego verificamos que la suma de los tiempos no sea mayor a 60 minutos
    tiempo(P1,T1),
    tiempo(P2,T2),
    T #= Tiempo + max(T1,T2),
    T #=< 60 },

    %Agregamos a la lista el cruce
    [cruza_de_ida(P1, P2)],

    %Llamamos al predicado para cruzar de vuelta con las listas CostaResult y Costa2, agregandole los dos personajes que cruzaron, y el tiempo que fue transcurrido hasta ahora
    cruzar_vuelta(state(CostaResul, [P1, P2|Costa2], T)).

%Caso base del predicado cruzar_vuelta, este es cuando la lista Costa1 esta vacia, es decir, todos cruzaron
cruzar_vuelta(state([], _, _)) --> 
    [].

cruzar_vuelta(state(Costa1, Costa2, Tiempo)) -->
    %El predicado cruzar de vuelta funciona exactamente de la misma manera que al cruzar de ida, con la unica diferencia de que en este unicamente vuelve un personaje, por lo tanto solo se selecciona uno y se verifican los tiempos de uno de los personajes
    { select(P1, Costa2, CostaResul),
    tiempo(P1,T1),
    T #= Tiempo + T1,
    T #=< 60 },
    [cruza_de_vuelta(P1)],
    cruzar_ida(state([P1|Costa1], CostaResul, T)).