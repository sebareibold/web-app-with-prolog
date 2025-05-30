% Modulos necesarios para el servidor
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_unix_daemon)).
:- use_module(library(http/html_write)).


% Este es el bucle del servidor principal, http_daemon es una común de iniciar el servidor (En el tutorial decian 2 formas diferentes)
servidor(Port) :-
	http_daemon([port(Port), fork(false)]).% Ejemplo de inicio de demonio en un hilo [1, 2]
% Definimos el Ruteo a travez de los handlers

 :- http_handler(/, inicio_handler, []).
:- http_handler('/reglas-del-puente', reglas_handler, []).
:- http_handler('/simulacion-interactiva', simulacion_handler, []).
:- http_handler('/conceptos-aprendidos', aprendizaje_handler, []).

% Codigo de la seccion de inicio            
inicio_handler(_Request) :-
	reply_html_page([title('Explicacion: Ejercicio Toy Story')],
		[
			body(style = 'background:#e0e0e0;display: flex;
							justify-content: center;
						align-items: center; gap: 8px;',
				[
					 div(style = '
						background:#e0e0e0; width: 90% ; 
						height: 80vh; margin-top:4%; 
			
						box-shadow:  20px 20px 60px #bebebe,
						            -20px -20px 60px #ffffff; border-radius: 50px; alig',
						[
							h1(style = 'color : black', ['Problema']),
							% arity 1
							p(class = bodytext, 'TExto'),
							% arity 2
							p([class = bodytext, style = 'font - size : 120%'], 
							  % --- Aquí se agrega el enlace/botón ---
                            a([href='/reglas-del-puente',
                               style='display: inline-block; padding: 10px 20px; background-color:rgb(240, 10, 10); color: white; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;'],
                              'Ir a Reglas del Puente')
                            % --------------------------------------
							)])
							])]).

% Codigo de la seccion de reglas y restriccion            
reglas_handler(_Request) :-
	reply_html_page([title('seccion de reglas y restriccion')],
		[
			body(style = 'background:#e0e0e0;display: flex;
							justify-content: center;
						align-items: center; gap: 8px;',
				[
					 div(style = '
						background:#e0e0e0; width: 90% ; 
						height: 80vh; margin-top:4%; 
			
						box-shadow:  20px 20px 60px #bebebe,
						            -20px -20px 60px #ffffff; border-radius: 50px; alig',
						[
							h1(style = 'color : black', ['Problema']),
							% arity 1
							p(class = bodytext, 'TExto'),
							% arity 2
							p([class = bodytext, style = 'font - size : 120%'], [
							  % --- Aquí se agrega el enlace/botón ---
                            a([href='/',
                               style='display: inline-block; padding: 10px 20px; background-color:rgb(245, 3, 3); color: white; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;'],
                              'Ir al Inicio'),
							  a([href='/simulacion-interactiva',
                               style='display: inline-block; padding: 10px 20px; background-color:rgb(56, 192, 39); color: white; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;'],
                              'Ir a la Simulacion')]
                            % --------------------------------------
							)])
							])]).

% Codigo de la seccion de simulacion iteractiva       
simulacion_handler(_Request) :-
	reply_html_page([title('seccion de simulacion iteractiva  ')],
		[
			body(style = 'background:#e0e0e0;display: flex;
							justify-content: center;
						align-items: center; gap: 8px;',
				[
					 div(style = '
						background:#e0e0e0; width: 90% ; 
						height: 80vh; margin-top:4%; 
			
						box-shadow:  20px 20px 60px #bebebe,
						            -20px -20px 60px #ffffff; border-radius: 50px; alig',
						[
							h1(style = 'color : black', ['Problema']),
							% arity 1
							p(class = bodytext, 'TExto'),
							% arity 2
							p([class = bodytext, style = 'font - size : 120%'], [
							  % --- Aquí se agrega el enlace/botón ---
                            a([href='/reglas-del-puente',
                               style='display: inline-block; padding: 10px 20px; background-color:rgb(255, 0, 0); color: white; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;'],
                              'Ir a las Reglas'),
							  a([href='/conceptos-aprendidos',
                               style='display: inline-block; padding: 10px 20px; background-color:rgb(56, 192, 39); color: white; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;'],
                              'Ver Logos')]
                            % --------------------------------------
							)])
							])]).

% Codigo de la seccion que aprendimos
aprendizaje_handler(_Request) :-
	reply_html_page([title('seccion que aprendimos')],
		[
			body(style = 'background:#e0e0e0;display: flex;
							justify-content: center;
						align-items: center; gap: 8px;',
				[
					 div(style = '
						background:#e0e0e0; width: 90% ; 
						height: 80vh; margin-top:4%; 
			
						box-shadow:  20px 20px 60px #bebebe,
						            -20px -20px 60px #ffffff; border-radius: 50px; alig',
						[
							h1(style = 'color : black', ['Problema']),
							% arity 1
							p(class = bodytext, 'TExto'),
							% arity 2
							p([class = bodytext, style = 'font - size : 120%'], 
							  % --- Aquí se agrega el enlace/botón ---
                            a([href='/simulacion-interactiva',
                               style='display: inline-block; padding: 10px 20px; background-color:rgb(255, 11, 11); color: white; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;'],
                              'Volver a la Simulacion')
                            % --------------------------------------
							)])
							])]).




% Para iniciar el servidor: ?- servidor(8080). en la consola de SWI-Prolog