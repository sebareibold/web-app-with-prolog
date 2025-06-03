% Modulos necesarios para el servidor
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/html_write)).
:- use_module(library(http/http_files)). % Modulo para servir archivos estaticos

% Este es el bucle del servidor principal, http_daemon es una común de iniciar el servidor (En el tutorial decian 2 formas diferentes)
server(Port) :-  http_server(http_dispatch, [port(Port)]).

% Para iniciar el servidor o detenerlo
server_on(Port) :- server(Port).
server_off(Port) :-  http_stop_server(Port, []).


% Definimos el Ruteo a travez de los handlers
:- http_handler(/, inicio_handler, []).
:- http_handler('/reglas-del-puente', reglas_handler, []).
:- http_handler('/simulacion-interactiva', simulacion_handler, []).
:- http_handler('/conceptos-aprendidos', aprendizaje_handler, []).

% Este manejador sirve para servirnos con todos los archivos que hay en la carpetas assets
:- http_handler('/assets/', serve_files, [prefix]).
serve_files(Request) :-  http_reply_from_files('assets', [], Request).

:- http_handler(root(.), http_reply_from_files('.', []), [prefix]).

% Codigo de la seccion de inicio
inicio_handler(_Request) :-
	reply_html_page([title('Explicacion: Ejercicio Toy Story - ¡La Gran Escape de Zurg!')], 
		[
			% --- Estilo del BODY con imagen de fondo ---
			body(style = 'background: url(\'/assets/fondo_nubes.png\') no-repeat center center fixed; background-size: cover; 
				display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px;', 
				[
					 % --- Contenedor principal del contenido ---
					 div(style = '
						background: rgba(255, 255, 255, 0.9);  
						width: 90%;  
						max-width: 900px;  
						padding: 30px; 
						box-shadow:  0 10px 20px rgba(0,0,0,0.2);  
						border-radius: 20px; 
						text-align: center;  
						margin: auto;  
					 ',
						[
							% --- Titulo Grande y Atractivo ---
							h1(style = 'color: #e74c3c; margin-bottom: 20px; font-size: 2.5em;', ['¡La Gran Escape de Zurg!']), 

							% --- Explicación del problema ---
							p(style = 'margin-bottom: 30px; color: #555; line-height: 1.6;',
							  ['¡Alerta, juguetes! El malvado Emperador Zurg se acerca, ¡y necesitamos cruzar el puente antes de que sea tarde! ', br([]),
							   'Pero hay un problema: el puente es viejo y solo puede soportar el peso de dos juguetes a la vez. ', br([]),
							   'Además, necesitan una linterna para ver, y solo tenemos una linterna que deben llevar consigo en cada cruce. ', br([]),
							   'Para complicar las cosas, el tiempo que tarda el grupo en cruzar es el tiempo del juguete más lento de ese grupo.', br([]),
							   '¡Debemos encontrar la forma más rápida de cruzar a todos!'
							  ]),

							% --- Titulo para la seccion de personajes ---
							h2(style = 'color: #3498db; margin-top: 30px; margin-bottom: 20px; font-size: 1.8em;', ['Nuestros Héroes y sus Velocidades:']),

							% --- Contenedor para las tarjetas de personajes (usando Flexbox) ---
							div(style = 'display: flex; justify-content: center; gap: 25px; flex-wrap: wrap;',
								[
									% --- Tarjeta de Buzz ---
									div(style = '
										background: #fff;
										padding: 15px;
										border-radius: 15px;
										box-shadow: 0 4px 10px rgba(0,0,0,0.1);
										width: 160px; /* Ancho fijo */
										text-align: center;
										display: flex;
										flex-direction: column;
										align-items: center;
										transition: transform 0.3s ease; /* Animacion al pasar el mouse */
									', [
										h3(style = 'color: #3498db; margin-bottom: 8px;', ['Buzz']), % Nombre de Buzz
										img([src='/assets/buzz.png', alt='Buzz Lightyear', style='width: 100px; height: auto; margin-bottom: 10px;']), 
										p(style = 'font-size: 0.95em; color: #666;', ['¡Es súper rápido!', br([]), strong([], '5 minutos')]) 
									]),

									% --- Tarjeta de Woody ---
									div(style = '
										background: #fff;
										padding: 15px;
										border-radius: 15px;
										box-shadow: 0 4px 10px rgba(0,0,0,0.1);
										width: 160px;
										text-align: center;
										display: flex;
										flex-direction: column;
										align-items: center;
										transition: transform 0.3s ease;
									', [
										h3(style = 'color: #f1c40f; margin-bottom: 8px;', ['Woody']),
										img([src='/assets/woody.png', alt='Sheriff Woody', style='width: 100px; height: auto; margin-bottom: 10px;']),
										p(style = 'font-size: 0.95em; color: #666;', ['Es rápido, pero no tanto.', br([]), strong([], '10 minutos')]) 
									]),

									% --- Tarjeta de Rex ---
									div(style = '
										background: #fff;
										padding: 15px;
										border-radius: 15px;
										box-shadow: 0 4px 10px rgba(0,0,0,0.1);
										width: 160px;
										text-align: center;
										display: flex;
										flex-direction: column;
										align-items: center;
										transition: transform 0.3s ease;
									', [
										h3(style = 'color: #2ecc71; margin-bottom: 8px;', ['Rex']), 
										img([src='/assets/rex.png', alt='Rex the dinosaur', style='width: 100px; height: auto; margin-bottom: 10px;']), 
										p(style = 'font-size: 0.95em; color: #666;', ['¡Le cuesta un poco!', br([]), strong([], '20 minutos')]) 
									]),

									% --- Tarjeta de Hamm ---
									div(style = '
										background: #fff;
										padding: 15px;
										border-radius: 15px;
										box-shadow: 0 4px 10px rgba(0,0,0,0.1);
										width: 160px;
										text-align: center;
										display: flex;
										flex-direction: column;
										align-items: center;
										transition: transform 0.3s ease;
									', [
										h3(style = 'color: #e67e22; margin-bottom: 8px;', ['Hamm']), 
										img([src='/assets/hamm.png', alt='Hamm the pig', style='width: 100px; height: auto; margin-bottom: 10px;']), 
										p(style = 'font-size: 0.95em; color: #666;', ['¡Es el más lento!', br([]), strong([], '25 minutos')])
									])
								]
							),

							% --- Sección del Boton ---
							div(style = 'margin-top: 40px;',
								[
									% --- Boton para ir a Reglas ---
									a([href='/reglas-del-puente',
									   style='display: inline-block; padding: 15px 30px; background-color: #e74c3c;
									    color: white; text-align: center; text-decoration: none; border-radius: 8px; font-size: 1.1em; 
										transition: background-color 0.3s ease, transform 0.1s ease;'
									  ],
									  '¡Ver Reglas del Puente!')
								]
							)
						])
				])
		]).

	


% Codigo de la seccion de reglas y restriccion            
reglas_handler(_Request) :-
	reply_html_page([title('seccion de reglas y restriccion')],
		[
			body(style = 'background: url(\'/assets/fondo_nubes.png\') no-repeat center center fixed; background-size: cover; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px;', % Añadido min-height y padding

				[
					 div(style = '
						background: rgba(255, 255, 255, 0.9);  
						width: 90%;  
						max-width: 900px;  
						padding: 30px; 
						box-shadow:  0 10px 20px rgba(0,0,0,0.2);  
						border-radius: 20px; 
						text-align: center;  
						margin: auto;  
					 ',
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
							  a([href='/simulacion.html',
                               style='display: inline-block; padding: 10px 20px; background-color:rgb(56, 192, 39); color: white; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;'],
                              'Ir a la Simulacion')]
                            % --------------------------------------
							)])
							])]).



% Codigo de la seccion que aprendimos
aprendizaje_handler(_Request) :-
	reply_html_page([title('seccion que aprendimos')],
		[
				body(style = 'background: url(\'/assets/fondo_nubes.png\') no-repeat center center fixed; background-size: cover; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px;', % Añadido min-height y padding

				[
					 div(style = '
						background: rgba(255, 255, 255, 0.9);  
						width: 90%;  
						max-width: 900px;  
						padding: 30px; 
						box-shadow:  0 10px 20px rgba(0,0,0,0.2);  
						border-radius: 20px; 
						text-align: center;  
						margin: auto;  
					 ',
						[
							h1(style = 'color : black', ['Problema']),
							% arity 1
							p(class = bodytext, 'TExto'),
							% arity 2
							p([class = bodytext, style = 'font - size : 120%'], 
							  % --- Aquí se agrega el enlace/botón ---
                            a([href='/simulacion.html',
                               style='display: inline-block; padding: 10px 20px; background-color:rgb(255, 11, 11); color: white; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;'],
                              'Volver a la Simulacion')
                            % --------------------------------------
							)])
							])]).




% Para iniciar el servidor: ?- servidor(8080). en la consola de SWI-Prolog