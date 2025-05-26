% Modulos necesarios para el servidor
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_unix_daemon)).
:- use_module(library(http/html_write)).

% Este es el bucle del servidor principal, http_daemon es una común de iniciar el servidor (En el tutorial decian 2 formas diferentes)
servidor(Port) :-
	http_daemon([port(Port), fork(false)]).% Ejemplo de inicio de demonio en un hilo [1, 2]
% Tenemos un solo manejador que maneja la ruta de la raíz /
% Esta declaración dice manejar la raíz del árbol consultando se ejecuta el metodo html_handler
  :- http_handler(/, generador_html, []). 

:- use_module(library(http/html_write)). 
            
generador_html(_Request) :-
	reply_html_page([title('Explicacion: Ejercicio Toy Story')],
		[
			body(style = 'background: #e0e0e0;   display: flex;   justify-content: center;   align-items: center;',
				[
					 div(style = 'background:#e0e0e0; width: 80% ; height: 80vh; margin-top:4%; box-shadow:  20px 20px 60px #bebebe,
             -20px -20px 60px #ffffff; border-radius: 50px; alig',
						[
							h1(style = 'color : black', ['Explicacion : EjercicioToyStory']),
							% arity 1
							p(class = bodytext, 'Withsometext'),
							% arity 2
							p([class = bodytext, style = 'font - size : 120%'], ['Bigger text', b('some bold')])])
							])]).

% Para iniciar el servidor: ?- servidor(8080). en la consola de SWI-Prolog