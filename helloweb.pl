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
			body(style='background: #212121' ,[  
					h1(style = 'color: white',['Explicacion: Ejercicio Toy Story']),
					% arity 1
					p(class = bodytext, 'With some text'),
					% arity 2
					p([class = bodytext, style = 'font - size : 120%'], ['Bigger text', b('some bold')])
					])]).

% Para iniciar el servidor: ?- servidor(8080). en la consola de SWI-Prolog