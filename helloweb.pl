% Modulos necesarios para el servidor
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_unix_daemon)).
:- use_module(library(http/html_write)).

% Este es el bucle del servidor principal, http_daemon es una común de iniciar el servidor (En el tutorial decian 2 formas diferentes)
servidor(Port) :-
    http_daemon([port(Port), fork(false)]). % Ejemplo de inicio de demonio en un hilo [1, 2]

% Tenemos un solo manejador que maneja la ruta de la raíz /
% Esta declaración dice manejar la raíz del árbol consultando se ejecuta el metodo html_handler
:- http_handler(/, html_handler, []). 

:- use_module(library(http/html_write)). 

html_handler(_Request) :-
    reply_html_page(
        title('Grupo Nro 3'), % El titulo de la pagina
        % El cuerpo de la pagina usando el DSL de HTML
        [ 
          h1('Trabajo Practico Obligatorio'),
          p('La explicacion del ejercicio se basa en: ')
        ]
    ).

% Para iniciar el servidor: ?- servidor(8080). en la consola de SWI-Prolog